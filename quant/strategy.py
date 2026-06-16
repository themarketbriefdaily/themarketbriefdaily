"""
quant/strategy.py — single source of truth for the v5c production strategy.

A faithful pandas port of the research script v5c_regime.py (the winning "#2 credit
gate" configuration), run on SPY, in GBP, with NO Trading-212 FX fee.

Pipeline (unchanged from research):
  regime  : VIX term-structure contango (VIX3M>VIX) + 210d SMA trend, 3-month hysteresis
  diversifiers : DBMF + trend-gated(200d) GLD + trend-gated(200d) TLT, inverse-vol weighted
  credit gate  : HYG < 200d MA -> cap equity at the Contango target (10% vol, 1x)   [v5c only]
  vol cap : total-portfolio EWMA vol scaled to 0.28 (de-risk only)                   [v5b, v5c]
  de-risk : daily equity de-risk overlay (median-vol / realised-vol)

Three model lines are produced for comparison:
  v5  = baseline (single DBMF sleeve, no vol-cap, no credit gate)
  v5b = + diversifiers + vol-cap@0.28
  v5c = v5b + credit gate         <-- PRODUCTION

Everything downstream (the compute script, the website JSON) imports from here.
No module-level side effects: call load(prices) once, then the build/analytics fns.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

TD = 252
VT = 0.28                       # total-portfolio vol-cap target
FX_FEE_BPS = 0.0                # this deployment: GBP, no FX fee
DIVS = ("gld", "tlt")           # diversifier basket (DBC dropped in research)

PARAMS = dict(
    regime_strength=3, ma_window=210,
    dbmf_weight_bull=0.30, dbmf_weight_contango=0.60, dbmf_weight_crisis=0.50,
    vol_span=20, target_vol_bull=0.30, target_vol_contango=0.10,
    max_lev_bull=3.0, max_lev_contango=1.0, max_lev_crisis=0.0,
    derisk_lookback=252, derisk_mult=1.75, derisk_floor=0.20,
    equity_3x_ter=0.0095, fin_spread=0.004, hysteresis=0.05,
)

# ISA-eligible instrument mapping for the live allocation table
ISA_TICKERS = {
    "ndx1": ("EQQQ.L",  "1x equity (Nasdaq-100)"),
    "ndx3": ("QQQ3.L",  "3x equity (Nasdaq-100)"),
    "mf":   ("DBMF",    "Managed futures"),
    "gld":  ("SGLN.L",  "Gold"),
    "tlt":  ("IDTL.L",  "Long Treasuries"),
    "cash": ("CASH",    "Cash (GBP)"),
}

# ---- module state (set by load) ----
_PX: dict[str, pd.Series] = {}
spy = vix = vix3m = dbmf = gld = tlt = hyg = gbpusd = gsg = None        # type: ignore
dbmf_ret = mf_pre2019 = None                                            # type: ignore


def load(prices: dict[str, pd.Series]) -> None:
    """prices: dict of pandas Series keyed SPY,VIX,VIX3M,DBMF,GLD,TLT,HYG,GBPUSD,GSG."""
    global _PX, spy, vix, vix3m, dbmf, gld, tlt, hyg, gbpusd, gsg, dbmf_ret, mf_pre2019
    _PX = {k: v.sort_index() for k, v in prices.items()}
    spy = _PX["SPY"]; vix = _PX["VIX"]; vix3m = _PX["VIX3M"]; dbmf = _PX["DBMF"]
    gld = _PX["GLD"]; tlt = _PX["TLT"]; hyg = _PX["HYG"]; gbpusd = _PX["GBPUSD"]; gsg = _PX["GSG"]
    dbmf_ret = dbmf.pct_change().dropna()
    mf_pre2019 = _synthetic_mf("2007-01-01", spy)


# --------------------------------------------------------------------------- #
# managed-futures proxy (pre-2019) + FX                                        #
# --------------------------------------------------------------------------- #
def _synthetic_mf(start, spy_series, end="2019-05-07"):
    g = gld.loc[start:end]; t = tlt.loc[start:end]; c = gsg.loc[start:end]
    basket = pd.concat([spy_series.loc[start:end], g, t, c], axis=1).dropna()
    basket.columns = ["SPY", "GLD", "TLT", "GSG"]
    monthly = basket.resample("ME").last()
    sig = (monthly > monthly.rolling(12).mean()).astype(int)
    w = sig.div(sig.sum(axis=1), axis=0).fillna(0)
    dw = w.reindex(basket.index, method="ffill")
    return (dw.shift(1) * basket.pct_change()).sum(axis=1).dropna()


def _build_mf(idx, real_only=False):
    mf = dbmf_ret.copy() if real_only else mf_pre2019.combine_first(dbmf_ret)
    return mf.reindex(idx, method="ffill").fillna(0.0)


def _fx_gbp(idx):
    g = gbpusd.reindex(idx).ffill().bfill()
    return (1.0 / g).pct_change().fillna(0.0)         # GBP return of holding 1 USD


# --------------------------------------------------------------------------- #
# regime + weights                                                            #
# --------------------------------------------------------------------------- #
def _smooth(signal, strength):
    out = pd.Series(False, index=signal.index); state, cnt = bool(signal.iloc[0]), 0
    for t in signal.index:
        s = bool(signal.loc[t])
        if s != state:
            cnt += 1
            if cnt >= strength:
                state, cnt = s, 0
        else:
            cnt = 0
        out.loc[t] = state
    return out


def regime_series(idx, p=PARAMS):
    contango_raw = (vix3m.reindex(idx).ffill() > vix.reindex(idx).ffill())
    pf = spy.ffill()
    trend_up = (pf > pf.rolling(p["ma_window"]).mean()).reindex(idx).ffill()
    per = idx.to_period("M").to_numpy()
    me = np.empty(len(idx), dtype=bool); me[:-1] = per[:-1] != per[1:]; me[-1] = True
    c_me = contango_raw.where(me).ffill().fillna(True).astype(bool)
    t_me = trend_up.where(me).ffill().fillna(True).astype(bool)
    if p["regime_strength"] > 1:
        mi = idx[me]
        c_me = _smooth(c_me.loc[mi], p["regime_strength"]).reindex(idx).ffill().fillna(True).astype(bool)
        t_me = _smooth(t_me.loc[mi], p["regime_strength"]).reindex(idx).ffill().fillna(True).astype(bool)
    regime = pd.Series("Contango", index=idx)
    regime[c_me & t_me] = "Bull"; regime[c_me & ~t_me] = "Contango"; regime[~c_me] = "Crisis"
    return regime


def _equity_block(base_ret, idx, regime, p=PARAMS):
    mf_w = pd.Series(p["dbmf_weight_contango"], index=idx)
    mf_w[regime == "Bull"] = p["dbmf_weight_bull"]; mf_w[regime == "Crisis"] = p["dbmf_weight_crisis"]
    c_eq = 1.0 - mf_w
    rv = (base_ret.ewm(span=p["vol_span"], min_periods=p["vol_span"]).std() * np.sqrt(TD)).reindex(idx).ffill().bfill()
    def vt(tv, cap): return (tv / rv).clip(lower=0.0, upper=cap)
    te = pd.Series(0.0, index=idx)
    te[regime == "Bull"] = vt(p["target_vol_bull"], p["max_lev_bull"])[regime == "Bull"]
    te[regime == "Contango"] = vt(p["target_vol_contango"], p["max_lev_contango"])[regime == "Contango"]
    te[regime == "Crisis"] = vt(p["target_vol_contango"], p["max_lev_crisis"])[regime == "Crisis"]
    E = pd.concat([te.clip(lower=0.0), 3.0 * c_eq], axis=1).min(axis=1)
    w3 = ((E - c_eq) / 2.0).clip(lower=0.0); w1 = (E - 3.0 * w3).clip(lower=0.0)
    w_inv = pd.Series(0.0, index=idx)
    base_vol = rv.rolling(p["derisk_lookback"], min_periods=20).median()
    d = (p["derisk_mult"] * base_vol / rv).clip(lower=p["derisk_floor"], upper=1.0).fillna(1.0)
    return w1, w3, w_inv, c_eq, mf_w, rv, d


def _month_hold(W):
    mask = W.groupby(W.index.to_period("M")).transform(lambda x: x.index == x.index.max())
    return W.where(mask).ffill().fillna(0.0)


def _credit_ecap(idx, rv, p=PARAMS):
    """Daily ceiling on NET equity exposure from the credit gate (inf where inactive)."""
    contango_cap = (p["target_vol_contango"] / rv).clip(lower=0.0, upper=p["max_lev_contango"])
    hf = hyg.ffill()
    below = (hf < hf.rolling(200).mean()).reindex(idx).shift(1).fillna(False).astype(bool)
    return contango_cap.where(below, np.inf), below


def _apply_equity_cap(W, ecap):
    net = W["ndx1"] + 3.0 * W["ndx3"]
    g = pd.Series(1.0, index=W.index); nz = net > 1e-12
    g[nz] = (ecap[nz] / net[nz]).clip(upper=1.0); g = g.fillna(1.0)
    W = W.copy(); W["ndx1"] = W["ndx1"] * g; W["ndx3"] = W["ndx3"] * g
    return W


def _diversifier_bucket(idx, mf_w):
    cand = {"gld": gld, "tlt": tlt}
    cols = {"mf": pd.Series(1.0 / 0.07, index=idx)}      # DBMF always-on (~7% vol)
    for k in DIVS:
        px = cand[k].ffill(); gate = (px > px.rolling(200).mean()); r = px.pct_change()
        iv = 1.0 / (r.ewm(span=60, min_periods=20).std() * np.sqrt(TD))
        gate = gate.reindex(idx).ffill().fillna(False).astype(bool)
        iv = iv.reindex(idx).ffill().bfill()
        cols[k] = iv.where(gate, 0.0)
    raw = pd.DataFrame(cols); raw = raw.div(raw.sum(axis=1), axis=0).fillna(0.0)
    return raw.mul(mf_w, axis=0)


def build_weights(idx, base_ret, line="v5c", p=PARAMS):
    """line in {v5, v5b, v5c}. Returns (W, regime, credit_active series)."""
    regime = regime_series(idx, p)
    w1, w3, w_inv, c_eq, mf_w, rv, d = _equity_block(base_ret, idx, regime, p)
    credit_active = pd.Series(False, index=idx)
    if line == "v5":                                     # baseline: single DBMF sleeve
        W = _month_hold(pd.DataFrame({"ndx1": w1, "ndx3": w3, "inv1": w_inv, "mf": mf_w}))
        for c in ("ndx1", "ndx3", "inv1"): W[c] = W[c] * d
        return W, regime, credit_active
    # v5b / v5c: diversifier basket
    div_w = _diversifier_bucket(idx, mf_w)
    W = pd.DataFrame({"ndx1": w1, "ndx3": w3, "inv1": w_inv})
    for c in div_w.columns: W[c] = div_w[c]
    W = _month_hold(W)
    for c in ("ndx1", "ndx3", "inv1"): W[c] = W[c] * d
    if line == "v5c":                                    # credit gate
        ecap, credit_active = _credit_ecap(idx, rv, p)
        W = _apply_equity_cap(W, ecap)
    return W, regime, credit_active


# --------------------------------------------------------------------------- #
# asset returns (USD -> GBP), vol cap, engine                                 #
# --------------------------------------------------------------------------- #
def _letf(r, L, ter, fs):
    sd = fs / TD; cl = sd if L > 1 else -sd
    return L * r + (1 - L) * cl - ter / TD


def asset_returns_gbp(base_ret, idx, mf_usd, p=PARAMS):
    r = base_ret.reindex(idx).fillna(0.0); fx = _fx_gbp(idx)
    usd = {"ndx1": r, "ndx3": _letf(r, 3.0, p["equity_3x_ter"], p["fin_spread"]),
           "inv1": _letf(r, -1.0, 0.05, p["fin_spread"]), "mf": mf_usd.reindex(idx).fillna(0.0)}
    for k in DIVS:
        usd[k] = {"gld": gld, "tlt": tlt}[k].pct_change().reindex(idx).fillna(0.0)
    return pd.DataFrame({c: (1 + s) * (1 + fx) - 1 for c, s in usd.items()}, index=idx)


def total_vol_cap(W, ag, target=VT, span=20):
    cols = list(W.columns); gross = (W[cols] * ag[cols]).sum(axis=1)
    vol_fc = (gross.ewm(span=span, min_periods=span).std().shift(1) * np.sqrt(TD)).bfill()
    s = (target / vol_fc).clip(lower=0.0, upper=1.0).fillna(1.0)
    return W.mul(s, axis=0)


def backtest(W, ag, fee_bps=FX_FEE_BPS, hyst=0.05):
    cols = list(W.columns); fee = fee_bps / 1e4
    Wv = W[cols].to_numpy(); Rv = ag[cols].reindex(W.index)[cols].to_numpy()
    prev = np.zeros(len(cols)); out = np.zeros(len(W))
    for i in range(len(W)):
        w = Wv[i]; trade = np.where(np.abs(w - prev) > hyst, w, prev)
        out[i] = float((trade * Rv[i]).sum()) - fee * np.abs(trade - prev).sum(); prev = trade
    return pd.Series(out, index=W.index)


# --------------------------------------------------------------------------- #
# top-level runners                                                           #
# --------------------------------------------------------------------------- #
def _idx_for(start):
    base_ret = spy.pct_change().dropna()
    mf_full = _build_mf(base_ret.index)
    common = base_ret.index.intersection(mf_full.index)
    idx = common[common >= pd.Timestamp(start)]
    return idx[idx >= vix3m.dropna().index[0]], base_ret, mf_full


def run_line(line, start="2007-01-01"):
    """Return (returns, weights, regime, asset_gbp, credit_active) for a model line."""
    idx, base_ret, mf_full = _idx_for(start)
    W, regime, credit = build_weights(idx, base_ret, line=line)
    ag = asset_returns_gbp(base_ret, idx, mf_full)
    if line in ("v5b", "v5c"):
        W = total_vol_cap(W, ag)
    rets = backtest(W, ag)
    return rets, W, regime, ag, credit


def spy_buyhold(start="2007-01-01"):
    idx, base_ret, mf_full = _idx_for(start)
    ag = asset_returns_gbp(base_ret, idx, mf_full)
    return ag["ndx1"]


# --------------------------------------------------------------------------- #
# metrics & analytics                                                         #
# --------------------------------------------------------------------------- #
def metrics(rets):
    r = rets.dropna(); n = len(r)
    if n == 0:
        return {}
    geo = float((1 + r).prod() ** (TD / n) - 1)
    ann = float(r.mean() * TD); vol = float(r.std() * np.sqrt(TD))
    nav = (1 + r).cumprod(); mdd = float((nav / nav.cummax() - 1).min())
    dn = float(np.sqrt(np.mean(np.minimum(r.to_numpy(), 0.0) ** 2)) * np.sqrt(TD))  # target-semidev Sortino
    return dict(cagr=geo, ann=ann, vol=vol,
                sharpe=ann / vol if vol > 0 else 0.0,
                sortino=ann / dn if dn > 0 else 0.0,
                max_dd=mdd, calmar=geo / abs(mdd) if mdd else 0.0)


def drawdown_series(rets):
    nav = (1 + rets).cumprod()
    return nav / nav.cummax() - 1


def worst_drawdowns(rets, k=10):
    nav = (1 + rets).cumprod(); dd = nav / nav.cummax() - 1
    episodes = []; in_dd = False; peak_date = None; trough_date = None; trough = 0.0
    for date, v in dd.items():
        if v < -1e-9 and not in_dd:
            in_dd = True; peak_date = date; trough_date = date; trough = v
        elif in_dd:
            if v < trough:
                trough = v; trough_date = date
            if v >= -1e-9:                                  # recovered
                episodes.append((peak_date, trough_date, date, trough)); in_dd = False
    if in_dd:
        episodes.append((peak_date, trough_date, None, trough))
    episodes.sort(key=lambda e: e[3])
    out = []
    for peak, tr, rec, depth in episodes[:k]:
        out.append(dict(start=str(peak.date()), trough=str(tr.date()),
                        recovery=str(rec.date()) if rec is not None else None,
                        depth=round(float(depth), 4),
                        days=int((tr - peak).days)))
    return out


def rolling_sharpe(rets, window=756):
    m = rets.rolling(window).mean() * TD
    s = rets.rolling(window).std() * np.sqrt(TD)
    return (m / s).dropna()


def annual_returns(rets):
    return ((1 + rets).groupby(rets.index.year).prod() - 1)


def monthly_table(rets):
    m = (1 + rets).groupby([rets.index.year, rets.index.month]).prod() - 1
    out = {}
    for (y, mo), v in m.items():
        out.setdefault(int(y), {})[int(mo)] = round(float(v), 4)
    return out


def var_cvar(rets, horizons=(1, 5, 21), confs=(0.95, 0.99)):
    out = []
    arr = rets.to_numpy()
    for h in horizons:
        if h == 1:
            hr = arr
        else:
            hr = pd.Series(rets).rolling(h).apply(lambda x: np.prod(1 + x) - 1, raw=True).dropna().to_numpy()
        if hr.size == 0:
            continue
        row = {"horizon": h}
        for c in confs:
            q = np.percentile(hr, (1 - c) * 100)
            cvar = hr[hr <= q].mean() if (hr <= q).any() else q
            row[f"var{int(c*100)}"] = round(float(-q), 4)
            row[f"cvar{int(c*100)}"] = round(float(-cvar), 4)
        out.append(row)
    return out


def tail_table(rets):
    r = rets.to_numpy()
    semi = float(np.sqrt(np.mean(np.minimum(r, 0.0) ** 2)) * np.sqrt(TD))
    q95 = np.percentile(r, 5); cvar95 = r[r <= q95].mean()
    return dict(semivar=round(semi, 4), cvar95=round(float(-cvar95), 4),
                worst_day=round(float(r.min()), 4), best_day=round(float(r.max()), 4))


def regime_conditional(rets, regime):
    reg = regime.reindex(rets.index).ffill()
    out = {}
    for name in ("Bull", "Contango", "Crisis"):
        x = rets[reg == name]
        if len(x) < 5:
            out[name] = dict(days=int(len(x)), ann=0.0, vol=0.0, sharpe=0.0, sortino=0.0)
            continue
        ann = float(x.mean() * TD); vol = float(x.std() * np.sqrt(TD))
        dn = float(np.sqrt(np.mean(np.minimum(x.to_numpy(), 0.0) ** 2)) * np.sqrt(TD))
        out[name] = dict(days=int(len(x)), ann=round(ann, 4), vol=round(vol, 4),
                         sharpe=round(ann / vol, 3) if vol > 0 else 0.0,
                         sortino=round(ann / dn, 3) if dn > 0 else 0.0)
    return out


def spanning_regression(strat, ag, lags=21):
    """OLS of strat on [ndx1, ndx3, mf, gld, tlt] with Newey-West (HAC) t-stat on alpha."""
    cols = ["ndx1", "ndx3", "mf", "gld", "tlt"]
    df = pd.concat([strat.rename("y"), ag[cols]], axis=1).dropna()
    y = df["y"].to_numpy(); X = np.column_stack([np.ones(len(df))] + [df[c].to_numpy() for c in cols])
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    resid = y - X @ beta
    n, k = X.shape
    XtX_inv = np.linalg.inv(X.T @ X)
    # Newey-West HAC covariance
    S = (X * resid[:, None]).T @ (X * resid[:, None])
    for L in range(1, lags + 1):
        w = 1.0 - L / (lags + 1.0)
        u = X * resid[:, None]
        G = u[L:].T @ u[:-L]
        S += w * (G + G.T)
    cov = XtX_inv @ S @ XtX_inv
    se = np.sqrt(np.diag(cov))
    alpha_ann = float(beta[0] * TD)
    t_alpha = float(beta[0] / se[0]) if se[0] > 0 else 0.0
    ss_res = float((resid ** 2).sum()); ss_tot = float(((y - y.mean()) ** 2).sum())
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    betas = {c: round(float(b), 3) for c, b in zip(cols, beta[1:])}
    return dict(alpha_ann=round(alpha_ann, 4), t_stat=round(t_alpha, 2), r2=round(r2, 3), betas=betas)


def deflated_sharpe(rets, n_trials=1500):
    """Bailey & Lopez de Prado (2014). Trial dispersion from a small vol-cap sweep."""
    from scipy.stats import norm
    # build a quick set of trial (daily) Sharpes by varying the vol-cap target
    idx, base_ret, mf_full = _idx_for("2007-01-01")
    trials = []
    for line in ("v5", "v5b", "v5c"):
        W, regime, _ = build_weights(idx, base_ret, line=line)
        ag = asset_returns_gbp(base_ret, idx, mf_full)
        for tgt in (0.20, 0.24, 0.28, 0.32):
            Wc = total_vol_cap(W, ag, tgt) if line in ("v5b", "v5c") else W
            r = backtest(Wc, ag)
            trials.append(r.mean() / r.std())
    r = rets.to_numpy(); sr = r.mean() / r.std(); T = len(r)
    sk = pd.Series(r).skew(); ku = pd.Series(r).kurt() + 3.0
    V = np.var(np.array(trials), ddof=1); gamma = 0.5772156649
    sr0 = np.sqrt(V) * ((1 - gamma) * norm.ppf(1 - 1.0 / n_trials) + gamma * norm.ppf(1 - 1.0 / (n_trials * np.e)))
    denom = np.sqrt(1 - sk * sr + (ku - 1) / 4.0 * sr ** 2)
    dsr = float(norm.cdf((sr - sr0) * np.sqrt(T - 1) / denom))
    return dict(dsr=round(dsr, 4), sharpe_ann=round(float(sr * np.sqrt(TD)), 3),
                sr0_ann=round(float(sr0 * np.sqrt(TD)), 3), n_trials=n_trials)


# --------------------------------------------------------------------------- #
# today's live signal                                                         #
# --------------------------------------------------------------------------- #
def _conviction(idx):
    """Continuous conviction in [0,1] = contango x trend-strength x low-vol state."""
    vx = vix.reindex(idx).ffill(); v3 = vix3m.reindex(idx).ffill()
    pf = spy.reindex(idx).ffill(); sma = pf.rolling(PARAMS["ma_window"]).mean()
    rv = (spy.pct_change().ewm(span=20, min_periods=20).std() * np.sqrt(TD)).reindex(idx).ffill().bfill()
    contango = ((v3 / vx - 1.0) / 0.15).clip(0, 1)
    trend = ((pf / sma - 1.0) / 0.10).clip(0, 1)
    lowvol = ((0.45 - rv) / 0.35).clip(0, 1)
    return (contango * trend * lowvol)


def current_signal():
    """Today's regime, conviction, target weights (mapped to ISA tickers), credit gate."""
    rets, W, regime, ag, credit = run_line("v5c")
    idx = W.index
    last = idx[-1]
    conv = _conviction(idx)
    w = W.loc[last]
    # collapse to display sleeves
    equity_1x = float(w.get("ndx1", 0.0)); equity_3x = float(w.get("ndx3", 0.0))
    sleeves = {
        "ndx1": equity_1x, "ndx3": equity_3x,
        "mf": float(w.get("mf", 0.0)), "gld": float(w.get("gld", 0.0)),
        "tlt": float(w.get("tlt", 0.0)),
    }
    invested = sum(sleeves.values())
    sleeves["cash"] = max(0.0, 1.0 - invested)
    alloc = []
    for key, val in sleeves.items():
        tk, label = ISA_TICKERS[key]
        alloc.append(dict(sleeve=label, ticker=tk, weight=round(val, 4)))
    # regime duration (#months since last change) + historical avg monthly return of this regime
    reg_m = regime.resample("ME").last()
    cur = reg_m.iloc[-1]; dur = 1
    for i in range(len(reg_m) - 2, -1, -1):
        if reg_m.iloc[i] == cur:
            dur += 1
        else:
            break
    reg_daily = regime.reindex(rets.index).ffill()
    same = rets[reg_daily == cur]
    avg_ann = float(same.mean() * TD) if len(same) else 0.0
    # current prices for the ISA tickers we actually have (proxies in USD/GBP space)
    px_now = {}
    for key, ser in {"EQQQ.L": spy, "QQQ3.L": spy, "DBMF": dbmf, "SGLN.L": gld, "IDTL.L": tlt}.items():
        try:
            px_now[key] = round(float(ser.dropna().iloc[-1]), 4)
        except Exception:
            px_now[key] = None
    return dict(
        as_of=str(last.date()),
        regime=str(cur),
        conviction=round(float(conv.iloc[-1]), 3),
        credit_gate_active=bool(credit.iloc[-1]),
        regime_duration_months=int(dur),
        regime_avg_ann_return=round(avg_ann, 4),
        allocation=alloc,
        proxy_prices=px_now,
    )
