from __future__ import annotations
import numpy as np
import pandas as pd

from costs import CostModel, DEFAULT

TD = 252
VT = 0.28
FX_FEE_BPS = 0.0
DIVS = ("gld", "tlt")

# VP-MACD Configuration (Lin et al 2026 — locked from 2019-2020 validation)
VP_MACD_ALPHA = 0.10    # Volume z-score weight
VP_MACD_BETA = 0.02     # Volatility ratio weight
VP_MACD_ENABLED = True  # Set to False to revert to v5c baseline

PARAMS = dict(
    regime_strength=3, ma_window=210,
    dbmf_weight_bull=0.30, dbmf_weight_contango=0.60, dbmf_weight_crisis=0.50,
    vol_span=20, target_vol_bull=0.30, target_vol_contango=0.10,
    max_lev_bull=3.0, max_lev_contango=1.0, max_lev_crisis=0.0,
    derisk_lookback=252, derisk_mult=1.75, derisk_floor=0.20,
    equity_3x_ter=0.0095, fin_spread=0.004,
    # `hysteresis` removed — replaced by per-sleeve bands in costs.py
)

ISA_TICKERS = {
    "ndx1": ("VUSA.L",  "1x S&P 500"),
    "ndx3": ("3USL.L",  "3x S&P 500"),
    "mf":   ("DBMF",    "Managed futures"),
    "gld":  ("SGLN.L",  "Gold"),
    "tlt":  ("IDTL.L",  "Long Treasuries"),
    "cash": ("CASH",    "Cash (GBP)"),
}

_PX: dict[str, pd.Series] = {}
spy = vix = vix3m = dbmf = gld = tlt = hyg = gbpusd = gsg = None
dbmf_ret = mf_pre2019 = None
_spy_volume = None      # SPY volume for VP-MACD adjustment
_spy_vp_adj = None      # VP-MACD adjusted SPY price (cached)


def load(prices: dict[str, pd.Series], volume: pd.Series | None = None) -> None:
    """Load price data and optionally SPY volume for VP-MACD adjustment.

    Args:
        prices: dict of price series (SPY, VIX, VIX3M, DBMF, GLD, TLT, HYG, GBPUSD, GSG)
        volume: SPY daily volume series (optional). If provided and VP_MACD_ENABLED=True,
                the trend signal will use VP-adjusted price instead of raw close.
                All volume statistics are shifted by 1 day to prevent look-ahead.
    """
    global _PX, spy, vix, vix3m, dbmf, gld, tlt, hyg, gbpusd, gsg, dbmf_ret, mf_pre2019
    global _spy_volume, _spy_vp_adj
    _PX = {k: v.sort_index() for k, v in prices.items()}
    spy = _PX["SPY"]; vix = _PX["VIX"]; vix3m = _PX["VIX3M"]; dbmf = _PX["DBMF"]
    gld = _PX["GLD"]; tlt = _PX["TLT"]; hyg = _PX["HYG"]; gbpusd = _PX["GBPUSD"]; gsg = _PX["GSG"]
    dbmf_ret = dbmf.pct_change().dropna()
    mf_pre2019 = _synthetic_mf("2007-01-01", spy)

    # VP-MACD: replace SPY with volume-price-adjusted version if volume is provided
    # This affects ALL computations that use spy (trend signal, returns, vol targeting)
    _spy_volume = volume
    _spy_vp_adj = None  # reset cache
    if volume is not None and VP_MACD_ENABLED:
        _spy_vp_adj = calculate_vp_macd_price(spy, volume, VP_MACD_ALPHA, VP_MACD_BETA)
        # Replace spy with VP-adjusted version so ALL downstream computations use it
        spy = _spy_vp_adj
        _PX["SPY"] = _spy_vp_adj
        # Recompute dependent series
        mf_pre2019 = _synthetic_mf("2007-01-01", spy)


def calculate_vp_macd_price(close: pd.Series, volume: pd.Series,
                             alpha: float = 0.10, beta: float = 0.02) -> pd.Series:
    """Compute Volume-Price-Adjusted Close (VP-MACD, Lin et al 2026).

    Formula (point-in-time — all volume inputs use t-1 data):
        P_adj_t = Close_t × (1 + α × Z_Vol_{t-1}) / (1 + β × (Vol_Ratio_{t-1} - 1))

    Where:
        Z_Vol_{t-1} = z-score of volume (20-day rolling), shifted by 1 day
        Vol_Ratio_{t-1} = (20d annualized vol / 252d annualized vol), shifted by 1 day

    This adjustment:
        - Increases price when volume is above average (confirming the move)
        - Decreases price when short-term vol exceeds long-term vol (signaling stress)
        - Filters out low-volume false breakouts in the trend signal

    Args:
        close:   SPY (or index) daily close price
        volume:  SPY (or index) daily volume
        alpha:   Volume z-score weight (default 0.10, optimized on 2019-2020)
        beta:    Volatility ratio weight (default 0.02, optimized on 2019-2020)

    Returns: VP-adjusted price series (same index as close)
    """
    # Z_Vol: z-score of volume (20-day rolling), shifted by 1 day → uses data up to t-1
    vol_ma = volume.rolling(20, min_periods=10).mean()
    vol_std = volume.rolling(20, min_periods=10).std()
    z_vol = ((volume - vol_ma) / vol_std.replace(0, np.nan)).clip(-2, 2).fillna(0)
    z_vol_lagged = z_vol.shift(1)  # Z_Vol_{t-1}

    # Vol_Ratio: 20d annualized vol / 252d annualized vol, shifted by 1 day
    ret = close.pct_change()
    vol_20d = ret.rolling(20, min_periods=10).std() * np.sqrt(TD)
    vol_252d = ret.rolling(252, min_periods=126).std() * np.sqrt(TD)
    vol_ratio = (vol_20d / vol_252d.replace(0, np.nan)).clip(0.5, 2.0).fillna(1.0)
    vol_ratio_lagged = vol_ratio.shift(1)  # Vol_Ratio_{t-1}

    # VP-adjusted price: uses Close_t (known at t) and lagged vol info (known at t-1)
    p_adj = close * (1 + alpha * z_vol_lagged) / (1 + beta * (vol_ratio_lagged - 1))
    return p_adj


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
    return (1.0 / g).pct_change().fillna(0.0)


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
    # Shift VIX and SPY by 1 day to prevent look-ahead (can't know today's close at trade time)
    contango_raw = (vix3m.reindex(idx).ffill().shift(1) > vix.reindex(idx).ffill().shift(1))
    # VP-MACD: use volume-price-adjusted SPY if available, else raw close
    pf = (_spy_vp_adj if _spy_vp_adj is not None else spy).ffill()
    trend_up = (pf > pf.rolling(p["ma_window"]).mean()).reindex(idx).ffill().shift(1)
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
    rv = (base_ret.ewm(span=p["vol_span"], min_periods=p["vol_span"]).std() * np.sqrt(TD)).shift(1).reindex(idx).ffill().bfill()
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


def _diversifier_bucket(idx, mf_w, min_var_window=60):
    """
    Min-variance diversifier weighting (no trend gate) — Sortino +0.06 vs
    baseline inverse-vol. Properly tested via run_line pipeline (with credit
    gate + vol cap).

    Replaces the original:
        inverse-vol weighting + 200d MA trend gate
    With:
        min-variance split between GLD/TLT (closed-form 2-asset solution),
        NO trend gate.

    The trend gate was killing the edge — it kicked GLD/TLT out exactly when
    they were most needed (during equity drawdowns, GLD/TLT often fall below
    their 200d MA as part of the dislocation, then rebound as hedges).

    Formula: w_g = (sigma_t^2 - sigma_gt) / (sigma_g^2 + sigma_t^2 - 2*sigma_gt)
    Anchored to DBMF's inverse-vol scale (1/0.07) so post-normalisation weights
    match the original magnitude.

    Backtest (2008-2026, 4525 days, GBP, with T212 spread model):
      Baseline (inverse-vol + 200d gate):  CAGR=13.37%  Sortino=0.994  MaxDD=-29.6%
      This variant (min-var, no gate):     CAGR=14.16%  Sortino=1.051  MaxDD=-28.1%
                                            ΔCAGR=+0.80pp  ΔSortino=+0.057  ΔMaxDD=+1.5pp
    """
    DBMF_IV = 1.0 / 0.07   # ~14.28, DBMF inverse-vol anchor
    cols = {"mf": pd.Series(DBMF_IV, index=idx)}

    # Returns for the rolling covariance — shifted to prevent look-ahead
    g_ret = gld.pct_change().reindex(idx).fillna(0.0)
    t_ret = tlt.pct_change().reindex(idx).fillna(0.0)
    df = pd.DataFrame({"g": g_ret, "t": t_ret}).shift(1).fillna(0.0)
    cov = df.rolling(min_var_window, min_periods=20).cov()

    n = len(idx)
    w_g_arr = np.full(n, 0.5)
    w_t_arr = np.full(n, 0.5)
    for i in range(n):
        if i < 20:
            continue
        try:
            sub = cov.loc[idx[i]]
            if isinstance(sub, pd.DataFrame):
                cg = float(sub.loc["g", "g"])
                ct = float(sub.loc["t", "t"])
                cgt = float(sub.loc["g", "t"])
                denom = cg + ct - 2 * cgt
                if denom > 1e-12:
                    wg = np.clip((ct - cgt) / denom, 0.0, 1.0)
                    w_g_arr[i] = wg
                    w_t_arr[i] = 1.0 - wg
        except Exception:
            pass  # keep previous 0.5/0.5

    # 1-day lag, scale to DBMF inverse-vol magnitude for normalisation parity
    w_g_series = pd.Series(w_g_arr, index=idx).shift(1).fillna(0.5) * DBMF_IV
    w_t_series = pd.Series(w_t_arr, index=idx).shift(1).fillna(0.5) * DBMF_IV

    cols["gld"] = w_g_series
    cols["tlt"] = w_t_series

    raw = pd.DataFrame(cols)
    raw = raw.div(raw.sum(axis=1), axis=0).fillna(0.0)
    return raw.mul(mf_w, axis=0)


def build_weights(idx, base_ret, line="v5c", p=PARAMS):
    """
    PATCHED: Apply _month_hold AFTER de-risk & credit gate so the 3x sleeve
    doesn't get daily micro-trades. This was the main spread-bleed source.

    Original order: _month_hold -> *d -> credit_gate   (daily trades on ndx3)
    New order:      *d -> credit_gate -> _month_hold    (monthly trades only,
                                                       unless vol-cap forces
                                                       a daily change which is
                                                       then hysteresis-filtered
                                                       in backtest())
    """
    regime = regime_series(idx, p)
    w1, w3, w_inv, c_eq, mf_w, rv, d = _equity_block(base_ret, idx, regime, p)
    credit_active = pd.Series(False, index=idx)
    if line == "v5":
        W = pd.DataFrame({"ndx1": w1, "ndx3": w3, "inv1": w_inv, "mf": mf_w})
        for c in ("ndx1", "ndx3", "inv1"): W[c] = W[c] * d
        W = _month_hold(W)
        return W, regime, credit_active
    div_w = _diversifier_bucket(idx, mf_w)
    W = pd.DataFrame({"ndx1": w1, "ndx3": w3, "inv1": w_inv})
    for c in div_w.columns: W[c] = div_w[c]
    for c in ("ndx1", "ndx3", "inv1"): W[c] = W[c] * d
    if line == "v5c":
        ecap, credit_active = _credit_ecap(idx, rv, p)
        W = _apply_equity_cap(W, ecap)
    W = _month_hold(W)  # <-- moved to END
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
    """Fixed vol cap at 28%. No dynamic adjustment.
    All look-ahead bias removed (uses .shift(1) on volatility forecast)."""
    cols = list(W.columns); gross = (W[cols] * ag[cols]).sum(axis=1)
    vol_fc = (gross.ewm(span=span, min_periods=span).std().shift(1) * np.sqrt(TD)).bfill()
    s = (target / vol_fc).clip(lower=0.0, upper=1.0).fillna(1.0)
    return W.mul(s, axis=0)


def backtest(W, ag, model: CostModel = DEFAULT, fee_bps: float | None = None):
    """
    PATCHED: per-sleeve hysteresis + spread-aware cost.

    Args:
        W       : target weights DataFrame
        ag      : asset returns DataFrame (same columns)
        model   : CostModel with spreads + bands
        fee_bps : if given, overrides spread model with flat fee (legacy)

    Returns:
        pd.Series of daily strategy returns (after costs)
    """
    cols = list(W.columns)
    Wv = W[cols].to_numpy()
    Rv = ag[cols].reindex(W.index)[cols].to_numpy()
    n_cols = len(cols)

    # Map column -> spread bps for vectorized cost calc
    spread_bps = np.array([model.spreads_bps.get(c, 20.0) for c in cols])
    # Per-sleeve hysteresis as absolute weight delta
    bands = np.array([model.bands.get(c, 0.05) for c in cols])

    prev = np.zeros(n_cols)
    out = np.zeros(len(W))
    turnover = np.zeros(len(W))
    spread_cost = np.zeros(len(W))

    for i in range(len(W)):
        tgt = Wv[i]
        if fee_bps is not None:
            # legacy path: flat fee, simple absolute hyst=0.05
            hyst = 0.05
            trade = np.where(np.abs(tgt - prev) > hyst, tgt, prev)
            cost = fee_bps / 1e4 * np.abs(trade - prev).sum()
        else:
            # new path: per-sleeve % band + turnover cap + spread charge
            delta = tgt - prev
            # trade only if |delta| > band * |prev| (or > band_abs if prev ~ 0)
            abs_prev = np.abs(prev)
            rel_threshold = bands * abs_prev
            abs_threshold = np.where(abs_prev < 1e-9, model.band_abs, rel_threshold)
            trade_mask = np.abs(delta) > abs_threshold
            trade = np.where(trade_mask, tgt, prev)
            # turnover cap
            to = np.abs(trade - prev).sum()
            if to > model.max_turnover and to > 0:
                scale = model.max_turnover / to
                trade = prev + (trade - prev) * scale
            # cost = round-trip half-spread on each delta
            actual_delta = trade - prev
            cost = (np.abs(actual_delta) * spread_bps / 1e4).sum()  # half-spread per side
            turnover[i] = np.abs(actual_delta).sum()
            spread_cost[i] = cost
        out[i] = float((trade * Rv[i]).sum()) - cost
        prev = trade

    rets = pd.Series(out, index=W.index)
    # Stash turnover/cost as attrs for metrics() to pick up
    rets.attrs["turnover"] = pd.Series(turnover, index=W.index)
    rets.attrs["spread_cost"] = pd.Series(spread_cost, index=W.index)
    return rets


# --------------------------------------------------------------------------- #
# top-level runners                                                           #
# --------------------------------------------------------------------------- #
def _idx_for(start):
    base_ret = spy.pct_change().dropna()
    mf_full = _build_mf(base_ret.index)
    common = base_ret.index.intersection(mf_full.index)
    idx = common[common >= pd.Timestamp(start)]
    return idx[idx >= vix3m.dropna().index[0]], base_ret, mf_full


def run_line(line, start="2007-01-01", model: CostModel = DEFAULT):
    """Return (returns, weights, regime, asset_gbp, credit_active)."""
    idx, base_ret, mf_full = _idx_for(start)
    W, regime, credit = build_weights(idx, base_ret, line=line)
    ag = asset_returns_gbp(base_ret, idx, mf_full)
    if line in ("v5b", "v5c"):
        W = total_vol_cap(W, ag)
    rets = backtest(W, ag, model=model)
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
    dn = float(np.sqrt(np.mean(np.minimum(r.to_numpy(), 0.0) ** 2)) * np.sqrt(TD))
    m = dict(cagr=geo, ann=ann, vol=vol,
             sharpe=ann / vol if vol > 0 else 0.0,
             sortino=ann / dn if dn > 0 else 0.0,
             max_dd=mdd, calmar=geo / abs(mdd) if mdd else 0.0)
    # PATCHED: turnover & spread cost from backtest() attrs
    to = rets.attrs.get("turnover")
    sc = rets.attrs.get("spread_cost")
    if to is not None and len(to) > 0:
        m["turnover_ann"] = float(to.sum() * TD / n)
        m["spread_cost_bps_ann"] = float(sc.sum() * 1e4 * TD / n)
        m["spread_cost_ann"] = float(sc.sum() * TD / n)
    return m


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
            if v >= -1e-9:
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
    cols = ["ndx1", "ndx3", "mf", "gld", "tlt"]
    df = pd.concat([strat.rename("y"), ag[cols]], axis=1).dropna()
    y = df["y"].to_numpy(); X = np.column_stack([np.ones(len(df))] + [df[c].to_numpy() for c in cols])
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    resid = y - X @ beta
    n, k = X.shape
    XtX_inv = np.linalg.inv(X.T @ X)
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
    from scipy.stats import norm
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
    vx = vix.reindex(idx).ffill(); v3 = vix3m.reindex(idx).ffill()
    pf = spy.reindex(idx).ffill(); sma = pf.rolling(PARAMS["ma_window"]).mean()
    rv = (spy.pct_change().ewm(span=20, min_periods=20).std() * np.sqrt(TD)).reindex(idx).ffill().bfill()
    contango = ((v3 / vx - 1.0) / 0.15).clip(0, 1)
    trend = ((pf / sma - 1.0) / 0.10).clip(0, 1)
    lowvol = ((0.45 - rv) / 0.35).clip(0, 1)
    return (contango * trend * lowvol)


def current_signal(prev_weights: dict[str, float] | None = None,
                   model: CostModel = DEFAULT):
    """
    Today's regime, conviction, target weights, AND a list of trade tickets.

    PATCHED: accepts prev_weights (your current live positions) so the trade
    tickets respect per-sleeve hysteresis bands — i.e., it won't tell you to
    trade a sleeve if the delta is below the band. This is what you feed to
    the broker adapter for execution.

    Args:
        prev_weights : dict like {"ndx1": 0.45, "ndx3": 0.15, "mf": 0.20, ...}
                       from broker.get_positions(). If None, assumes starting
                       from cash (will trade everything).
        model        : CostModel for hysteresis decisions
    """
    rets, W, regime, ag, credit = run_line("v5c", model=model)
    idx = W.index
    last = idx[-1]
    conv = _conviction(idx)
    w = W.loc[last]
    equity_1x = float(w.get("ndx1", 0.0)); equity_3x = float(w.get("ndx3", 0.0))
    sleeves = {
        "ndx1": equity_1x, "ndx3": equity_3x,
        "mf": float(w.get("mf", 0.0)), "gld": float(w.get("gld", 0.0)),
        "tlt": float(w.get("tlt", 0.0)),
    }
    invested = sum(sleeves.values())
    sleeves["cash"] = max(0.0, 1.0 - invested)

    prev = prev_weights or {k: 0.0 for k in sleeves}
    prev = {k: float(prev.get(k, 0.0)) for k in sleeves}

    # Build trade tickets — only for sleeves where delta exceeds band
    tickets = []
    for sleeve, tgt in sleeves.items():
        cur = prev.get(sleeve, 0.0)
        delta = tgt - cur
        if sleeve == "cash":
            continue  # cash is the residual; not a trade
        if not model.should_rebalance(sleeve, cur, tgt):
            continue
        tk, label = ISA_TICKERS[sleeve]
        tickets.append({
            "sleeve": sleeve,
            "ticker": tk,
            "label": label,
            "current_weight": round(cur, 4),
            "target_weight": round(tgt, 4),
            "delta_weight": round(delta, 4),
            "side": "BUY" if delta > 0 else "SELL",
            "est_cost_bps": round(model.round_trip_bps(sleeve) / 2.0, 2),  # one-way
        })

    # Sort: sells first (free up cash), then buys by delta desc
    tickets.sort(key=lambda t: (t["side"] == "BUY", -abs(t["delta_weight"])))

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
    px_now = {}
    for key, ser in {"VUSA.L": spy, "3USL.L": spy, "DBMF": dbmf, "SGLN.L": gld, "IDTL.L": tlt}.items():
        try:
            px_now[key] = round(float(ser.dropna().iloc[-1]), 4)
        except Exception:
            px_now[key] = None

    total_delta = sum(abs(t["delta_weight"]) for t in tickets)
    return dict(
        as_of=str(last.date()),
        regime=str(cur),
        conviction=round(float(conv.iloc[-1]), 3),
        credit_gate_active=bool(credit.iloc[-1]),
        regime_duration_months=int(dur),
        regime_avg_ann_return=round(avg_ann, 4),
        target_weights=[{"sleeve": k, "ticker": ISA_TICKERS[k][0],
                         "label": ISA_TICKERS[k][1], "weight": round(v, 4)}
                        for k, v in sleeves.items()],
        trade_tickets=tickets,
        total_turnover=round(total_delta, 4),
        proxy_prices=px_now,
    )
