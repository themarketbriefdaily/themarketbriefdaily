#!/usr/bin/env python3
"""
quant_compute.py — compute the v5c quant dashboard data files.

Fetches daily history from the Yahoo Finance chart API (stdlib urllib, the same
source the rest of the site uses — no yfinance needed), feeds it into the single
source-of-truth strategy module quant/strategy.py, and writes the JSON the static
/quant pages render with Plotly:

    data/quant/signal.json     today's regime / conviction / target allocation
    data/quant/backtest.json   equity curves, drawdowns, rolling Sharpe, metrics
    data/quant/risk.json       VaR/CVaR, tail, regime-conditional, spanning, DSR
    data/quant/returns.csv     full daily returns series (v5c, v5b, v5, SPY)
    data/quant/meta.json       freshness + headline metrics

Prices are cached to a local Parquet file (cache/quant_prices.parquet) so repeated
local runs don't re-hit Yahoo. Designed to run locally and in GitHub Actions.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "quant"
CACHE = ROOT / "cache"
sys.path.insert(0, str(ROOT / "quant"))
import strategy as S  # noqa: E402

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

# (yahoo symbol, key, use_adjclose)  — adjclose for total-return ETFs, raw close for indices/FX
SYMBOLS = [
    ("SPY", "SPY", True), ("^VIX", "VIX", False), ("^VIX3M", "VIX3M", False),
    ("DBMF", "DBMF", True), ("GLD", "GLD", True), ("TLT", "TLT", True),
    ("HYG", "HYG", True), ("GBPUSD=X", "GBPUSD", False), ("GSG", "GSG", True),
]


def http_get(url, timeout=30, retries=4):
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.5 * (attempt + 1))
    print(f"  ! GET failed: {url} ({last})")
    return ""


def yahoo_daily(symbol, use_adj):
    """Full daily history as a pandas Series (adjusted close where available).

    NB: range=max coarsens to monthly on Yahoo's chart API; explicit
    period1/period2 epochs with interval=1d return true daily history.
    """
    p1 = 1167609600                         # 2007-01-01 UTC
    p2 = int(time.time()) + 86400
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/"
           f"{urllib.parse.quote(symbol)}?period1={p1}&period2={p2}&interval=1d")
    text = http_get(url)
    try:
        js = json.loads(text) if text else {}
        r0 = js["chart"]["result"][0]
        ts = r0["timestamp"]
        q = r0["indicators"]["quote"][0]
        closes = q.get("close") or []
        adj = None
        if use_adj:
            adjc = r0["indicators"].get("adjclose")
            if adjc:
                adj = adjc[0].get("adjclose")
        vals = adj if adj else closes
        idx, data = [], []
        for t, c in zip(ts, vals):
            if c is None:
                continue
            idx.append(pd.Timestamp(datetime.fromtimestamp(t, tz=timezone.utc).date()))
            data.append(float(c))
        s = pd.Series(data, index=pd.DatetimeIndex(idx), name=symbol)
        s = s[~s.index.duplicated(keep="last")].sort_index()
        time.sleep(0.25)
        return s
    except Exception as e:  # noqa: BLE001
        print(f"  ! parse failed {symbol}: {e}")
        return pd.Series(dtype=float)


def yahoo_daily_ccy(symbol):
    """Daily raw close + quote currency, for the live ISA tracker instruments."""
    p1 = 1167609600
    p2 = int(time.time()) + 86400
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/"
           f"{urllib.parse.quote(symbol)}?period1={p1}&period2={p2}&interval=1d")
    text = http_get(url)
    try:
        r0 = json.loads(text)["chart"]["result"][0]
        ccy = (r0.get("meta") or {}).get("currency", "USD")
        ts = r0["timestamp"]; cl = r0["indicators"]["quote"][0].get("close") or []
        idx, data = [], []
        for t, c in zip(ts, cl):
            if c is None:
                continue
            idx.append(pd.Timestamp(datetime.fromtimestamp(t, tz=timezone.utc).date())); data.append(float(c))
        s = pd.Series(data, index=pd.DatetimeIndex(idx)).sort_index()
        s = s[~s.index.duplicated(keep="last")]
        time.sleep(0.25)
        return s, ccy
    except Exception as e:  # noqa: BLE001
        print(f"  ! ISA fetch failed {symbol}: {e}")
        return pd.Series(dtype=float), "USD"


def build_isa(gbpusd):
    """Live + ~6y daily GBP prices for the ISA-eligible instruments (for the tracker)."""
    ISA = ["EQQQ.L", "QQQ3.L", "DBMF", "SGLN.L", "IDTL.L"]
    gbp_per_usd = (1.0 / gbpusd)
    live, hist = {}, {}
    cutoff = pd.Timestamp.utcnow().tz_localize(None) - pd.Timedelta(days=6 * 365)
    print("Fetching ISA instruments for the tracker ...")
    for tk in ISA:
        s, ccy = yahoo_daily_ccy(tk)
        if s.empty:
            continue
        if ccy == "USD":
            g = gbp_per_usd.reindex(s.index).ffill().bfill()
            s_gbp = s * g
        elif ccy in ("GBp", "GBX"):
            s_gbp = s / 100.0
        else:  # GBP or unknown -> treat as GBP
            s_gbp = s
        s_gbp = s_gbp.dropna()
        live[tk] = {"price": round(float(s_gbp.iloc[-1]), 4), "native_ccy": ccy,
                    "asof": str(s_gbp.index[-1].date())}
        sg = s_gbp[s_gbp.index >= cutoff]
        hist[tk] = {"dates": [str(d.date()) for d in sg.index],
                    "close": [round(float(x), 4) for x in sg.to_numpy()]}
        print(f"  + {tk:8s} {ccy}->GBP  {live[tk]['price']}  ({len(sg)} hist pts)")
    return live, hist


def fetch_prices():
    CACHE.mkdir(exist_ok=True)
    cache_fp = CACHE / "quant_prices.parquet"
    out = {}
    print("Fetching daily history from Yahoo (chart API) ...")
    for sym, key, adj in SYMBOLS:
        s = yahoo_daily(sym, adj)
        if len(s) < 200 and cache_fp.exists():
            print(f"  - {key}: short ({len(s)}), will fall back to cache")
            continue
        out[key] = s
        print(f"  + {key:7s} {len(s):5d} rows  {s.index[0].date()} -> {s.index[-1].date()}")
    # merge with parquet cache (so a transient Yahoo failure doesn't wipe a series)
    if cache_fp.exists():
        try:
            cached = pd.read_parquet(cache_fp)
            for key in [k for _, k, _ in SYMBOLS]:
                if key not in out or out[key].empty:
                    if key in cached.columns:
                        out[key] = cached[key].dropna()
                        print(f"  ~ {key}: using cached series")
        except Exception as e:  # noqa: BLE001
            print(f"  ! cache read failed: {e}")
    # write cache
    try:
        pd.DataFrame({k: v for k, v in out.items()}).to_parquet(cache_fp)
    except Exception as e:  # noqa: BLE001
        print(f"  ! parquet cache write skipped ({e}); writing pickle")
        pd.DataFrame({k: v for k, v in out.items()}).to_pickle(CACHE / "quant_prices.pkl")
    return out


def nav_list(rets):
    return [round(float(x), 5) for x in (1 + rets).cumprod().to_numpy()]


def regime_segments(regime):
    """Contiguous [start,end,regime] segments for chart shading."""
    reg = regime.dropna(); segs = []
    if reg.empty:
        return segs
    cur = reg.iloc[0]; start = reg.index[0]
    for d, v in reg.items():
        if v != cur:
            segs.append({"start": str(start.date()), "end": str(d.date()), "regime": cur})
            cur = v; start = d
    segs.append({"start": str(start.date()), "end": str(reg.index[-1].date()), "regime": cur})
    return segs


def downsample_dates(idx):
    return [str(d.date()) for d in idx]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    px = fetch_prices()
    needed = [k for _, k, _ in SYMBOLS]
    missing = [k for k in needed if k not in px or px[k].empty]
    if missing:
        print(f"FATAL: missing series {missing}")
        sys.exit(1)
    S.load(px)

    # ---- model lines ----
    r5, _, reg5, ag5, _ = S.run_line("v5")
    r5b, _, _, _, _ = S.run_line("v5b")
    r5c, W5c, reg, ag, credit = S.run_line("v5c")
    spy = S.spy_buyhold()
    # align everything to v5c index
    idx = r5c.index
    r5 = r5.reindex(idx).fillna(0.0); r5b = r5b.reindex(idx).fillna(0.0)
    spy_r = spy.reindex(idx).fillna(0.0)

    now = datetime.now(timezone.utc).isoformat()

    # ---------- ISA live + history (for the tracker) ----------
    isa_live, isa_hist = build_isa(px["GBPUSD"])

    # ---------- signal.json ----------
    sig = S.current_signal()
    sig["headline"] = {k: round(v, 4) for k, v in S.metrics(r5c).items()}
    sig["live_prices"] = isa_live
    sig["updated_utc"] = now
    (OUT / "signal.json").write_text(json.dumps(sig, indent=2))
    print("  wrote signal.json")

    # ---------- tracker_prices.json (benchmark NAV + ISA daily GBP) ----------
    bench_dates = [str(d.date()) for d in idx]
    (OUT / "tracker_prices.json").write_text(json.dumps({
        "updated_utc": now,
        "isa": isa_hist,
        "benchmark": {"dates": bench_dates, "v5c": nav_list(r5c), "spy": nav_list(spy_r)},
        "target": {a["ticker"]: a["weight"] for a in sig["allocation"]},
    }))
    print("  wrote tracker_prices.json")

    # ---------- backtest.json ----------
    dd5c = S.drawdown_series(r5c); ddspy = S.drawdown_series(spy_r)
    rs = S.rolling_sharpe(r5c)
    ann5c = S.annual_returns(r5c); annspy = S.annual_returns(spy_r)
    years = sorted(set(ann5c.index) | set(annspy.index))
    backtest = {
        "dates": downsample_dates(idx),
        "nav": {"v5c": nav_list(r5c), "v5b": nav_list(r5b), "v5": nav_list(r5), "spy": nav_list(spy_r)},
        "drawdown": {"v5c": [round(float(x), 5) for x in dd5c.to_numpy()],
                     "spy": [round(float(x), 5) for x in ddspy.to_numpy()]},
        "rolling_sharpe": {"dates": downsample_dates(rs.index),
                           "v5c": [round(float(x), 3) for x in rs.to_numpy()]},
        "regime_segments": regime_segments(reg),
        "metrics": {"v5c": {k: round(v, 4) for k, v in S.metrics(r5c).items()},
                    "v5b": {k: round(v, 4) for k, v in S.metrics(r5b).items()},
                    "v5":  {k: round(v, 4) for k, v in S.metrics(r5).items()},
                    "spy": {k: round(v, 4) for k, v in S.metrics(spy_r).items()}},
        "annual": {"years": [int(y) for y in years],
                   "v5c": [round(float(ann5c.get(y, np.nan)), 4) if y in ann5c else None for y in years],
                   "spy": [round(float(annspy.get(y, np.nan)), 4) if y in annspy else None for y in years]},
        "worst_dd": S.worst_drawdowns(r5c, 10),
        "updated_utc": now,
    }
    (OUT / "backtest.json").write_text(json.dumps(backtest))
    print("  wrote backtest.json")

    # ---------- risk.json ----------
    # shared-bin histogram of daily returns
    allv = np.concatenate([r5c.to_numpy(), r5.to_numpy(), spy_r.to_numpy()])
    lo, hi = np.percentile(allv, 0.5), np.percentile(allv, 99.5)
    bins = np.linspace(lo, hi, 61)
    centers = [round(float(x), 5) for x in (bins[:-1] + bins[1:]) / 2]
    def hist(x):
        h, _ = np.histogram(np.clip(x, lo, hi), bins=bins)
        return [int(c) for c in h]
    risk = {
        "hist": {"centers": centers, "v5c": hist(r5c.to_numpy()),
                 "v5": hist(r5.to_numpy()), "spy": hist(spy_r.to_numpy())},
        "var_cvar": S.var_cvar(r5c),
        "tail": S.tail_table(r5c),
        "regime_cond": S.regime_conditional(r5c, reg),
        "spanning": S.spanning_regression(r5c, ag),
        "dsr": S.deflated_sharpe(r5c),
        "monthly": S.monthly_table(r5c),
        "updated_utc": now,
    }
    (OUT / "risk.json").write_text(json.dumps(risk))
    print("  wrote risk.json")

    # ---------- returns.csv ----------
    df = pd.DataFrame({"date": [str(d.date()) for d in idx],
                       "v5c": r5c.to_numpy(), "v5b": r5b.to_numpy(),
                       "v5": r5.to_numpy(), "spy": spy_r.to_numpy()})
    df.to_csv(OUT / "returns.csv", index=False, float_format="%.6f")
    print("  wrote returns.csv")

    # ---------- meta.json ----------
    (OUT / "meta.json").write_text(json.dumps({
        "updated_utc": now,
        "as_of": str(idx[-1].date()),
        "headline": {k: round(v, 4) for k, v in S.metrics(r5c).items()},
        "source": "Yahoo Finance (daily, adjusted close)",
    }, indent=2))
    print("  wrote meta.json")
    print("Done.")


if __name__ == "__main__":
    main()
