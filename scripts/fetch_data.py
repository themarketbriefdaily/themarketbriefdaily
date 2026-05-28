#!/usr/bin/env python3
"""
The Market Brief Daily - live data fetcher.

Writes three JSON files the static site reads client-side:
  data/ticker.json         - home-page marquee (indices, FX, commodities, yields)
  data/macro.json          - macro indicators page (market levels + economic series)
  data/funds-history.json  - real, holdings-weighted performance series for each fund

Sources:
  Yahoo Finance chart API  - free, no key: quotes + daily/monthly price history
                             (equities, ETFs, indices, futures, FX)
  Alpha Vantage economic   - CPI, inflation, yields, etc. (needs ALPHAVANTAGE_API_KEY)

Stdlib only - no pip install required. Designed to run locally and in GitHub Actions.
If ALPHAVANTAGE_API_KEY is absent, macro economic series are skipped (market levels
from Yahoo are still written) and the rest of the pipeline runs normally.
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
FUNDS_DIR = ROOT / "funds"
AV_KEY = os.environ.get("ALPHAVANTAGE_API_KEY", "").strip()

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
_chart_cache: dict[tuple, dict] = {}


def http_get(url: str, timeout: int = 25, retries: int = 3) -> str:
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


# --------------------------------------------------------------------------- #
# Yahoo Finance chart API                                                      #
# --------------------------------------------------------------------------- #
def yahoo_chart(symbol: str, rng: str = "10y", interval: str = "1mo") -> dict:
    """Return {'dates': [YYYY-MM-DD,...], 'closes': {datestr: float}, 'meta': {...}}
    sorted ascending. Closes with null values are skipped."""
    key = (symbol, rng, interval)
    if key in _chart_cache:
        return _chart_cache[key]
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/"
           f"{urllib.parse.quote(symbol)}?range={rng}&interval={interval}")
    text = http_get(url)
    closes: dict[str, float] = {}
    meta: dict = {}
    try:
        js = json.loads(text) if text else {}
        res = js.get("chart", {}).get("result")
        if res:
            r0 = res[0]
            meta = r0.get("meta", {}) or {}
            ts = r0.get("timestamp") or []
            quote = (r0.get("indicators", {}).get("quote") or [{}])[0]
            cl = quote.get("close") or []
            for t, c in zip(ts, cl):
                if c is None:
                    continue
                d = datetime.fromtimestamp(t, tz=timezone.utc).strftime("%Y-%m-%d")
                closes[d] = float(c)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        pass
    out = {"dates": sorted(closes.keys()), "closes": closes, "meta": meta}
    _chart_cache[key] = out
    time.sleep(0.2)
    return out


def history(symbol: str) -> dict:
    """Monthly history over 10y, used for fund/benchmark performance indexing."""
    return yahoo_chart(symbol, "10y", "1mo")


def latest_two(symbol: str):
    """Return (date, last_close, prev_close) from recent daily data."""
    h = yahoo_chart(symbol, "5d", "1d")
    ds = h["dates"]
    if not ds:
        return None
    last = h["closes"][ds[-1]]
    prev = h["closes"][ds[-2]] if len(ds) > 1 else h["meta"].get("chartPreviousClose", last)
    return ds[-1], last, prev


def price_on_or_before(hist: dict, target: str):
    """Latest close on or before target date string (YYYY-MM-DD)."""
    chosen = None
    for d in hist["dates"]:
        if d <= target:
            chosen = d
        else:
            break
    return hist["closes"][chosen] if chosen else None


# --------------------------------------------------------------------------- #
# Ticker (home page marquee)                                                   #
# --------------------------------------------------------------------------- #
# label -> (yahoo symbol, kind)   kind: 'num' | 'usd' | 'fx'
TICKER = [
    ("FTSE 100", "^FTSE", "num"),
    ("S&P 500", "^GSPC", "num"),
    ("NASDAQ 100", "^NDX", "num"),
    ("DXY", "DX-Y.NYB", "num"),
    ("GBP/USD", "GBPUSD=X", "fx"),
    ("EUR/USD", "EURUSD=X", "fx"),
    ("BRENT", "BZ=F", "usd"),
    ("WTI", "CL=F", "usd"),
    ("GOLD", "GC=F", "usd"),
    ("SILVER", "SI=F", "usd"),
    ("COPPER", "HG=F", "usd"),
    ("VIX", "^VIX", "num"),
]


def fmt_value(v: float, kind: str) -> str:
    if kind == "fx":
        return f"{v:,.4f}"
    if kind == "usd":
        return f"${v:,.2f}"
    return f"{v:,.2f}" if v < 1000 else f"{v:,.1f}"


def build_ticker() -> list:
    print("Building ticker.json ...")
    items = []
    for label, sym, kind in TICKER:
        lt = latest_two(sym)
        if not lt:
            print(f"  - skip {label} ({sym}) no data")
            continue
        _, last, prev = lt
        chg = (last - prev) / prev * 100 if prev else 0.0
        items.append(
            {
                "sym": label,
                "value": fmt_value(last, kind),
                "change": f"{chg:+.2f}%",
                "dir": "pos" if chg > 0.01 else ("neg" if chg < -0.01 else "neut"),
            }
        )
        print(f"  + {label}: {fmt_value(last, kind)} ({chg:+.2f}%)")
    return items


# --------------------------------------------------------------------------- #
# Fund performance history (holdings-weighted, real prices)                    #
# --------------------------------------------------------------------------- #
SYMBOL_MAP = {           # overrides for tickers whose Yahoo symbol differs
    "LVMH": "LVMUY",     # Paris-listed; use the USD ADR for a USD-consistent index
    "CASH": None,        # excluded from the index
}

FUND_FILES = {
    "classic": "classic.html",
    "classic_esg": "classic-esg.html",
    "equities": "equities.html",
    "tracker": "tracker.html",
    "fixed_income": "fixed-income.html",
    "commodities": "commodities.html",
    "rotational": "rotational.html",
}

FUND_CFG = {
    "classic":      {"bench": "URTH", "bench_label": "MSCI World",             "periods": ["5y", "3y", "1y"], "inception": "2019-01-01"},
    "classic_esg":  {"bench": "URTH", "bench_label": "MSCI World ESG Leaders", "periods": ["5y", "3y", "1y"], "inception": "2019-01-01"},
    "equities":     {"bench": "URTH", "bench_label": "MSCI World",             "periods": ["5y", "3y", "1y"], "inception": "2019-01-01"},
    "tracker":      {"bench": "ACWI", "bench_label": "MSCI ACWI",              "periods": ["5y", "3y", "1y"], "inception": "2019-01-01"},
    "fixed_income": {"bench": "AGG",  "bench_label": "Bloomberg Global Agg",   "periods": ["3y", "1y"],       "inception": "2022-01-01"},
    "commodities":  {"bench": "DBC",  "bench_label": "Bloomberg Commodity",    "periods": ["3y", "1y"],       "inception": "2022-01-01"},
    "rotational":   {"bench": "URTH", "bench_label": "MSCI World",             "periods": ["si", "1y"],       "inception": "2023-01-01"},
}


def yahoo_symbol(ticker: str):
    if ticker in SYMBOL_MAP:
        return SYMBOL_MAP[ticker]
    return ticker


def parse_holdings(fund_id: str):
    path = FUNDS_DIR / FUND_FILES[fund_id]
    text = path.read_text(encoding="utf-8")
    m = re.search(r"const holdings = \[(.*?)\];", text, re.S)
    if not m:
        return []
    pairs = re.findall(r"ticker:'([^']+)'[^}]*?\bw:\s*([0-9]+)", m.group(1))
    holdings = []
    for tk, w in pairs:
        sym = yahoo_symbol(tk)
        if sym:
            holdings.append({"sym": sym, "w": float(w)})
    return holdings


def sample_dates(period: str, inception: str) -> list:
    today = date.today()
    if period == "1y":
        start = today.replace(year=today.year - 1)
        n = 12
    elif period == "3y":
        start = today.replace(year=today.year - 3)
        n = 18
    elif period == "5y":
        start = today.replace(year=today.year - 5)
        n = 20
    else:  # 'si'
        start = datetime.strptime(inception, "%Y-%m-%d").date()
        months = max(6, (today.year - start.year) * 12 + (today.month - start.month))
        n = min(24, months)
    span = (today - start).days
    return [(start.toordinal() + round(span * i / (n - 1))) for i in range(n)]


def index_series(holdings: list, ords: list):
    """Weighted buy-and-hold index normalised to 100 at the first point.
    Weights renormalise across holdings that have data at both base and target."""
    hists = {h["sym"]: history(h["sym"]) for h in holdings}
    base_str = date.fromordinal(ords[0]).isoformat()
    base_px = {}
    for h in holdings:
        p = price_on_or_before(hists[h["sym"]], base_str)
        if p:
            base_px[h["sym"]] = p
    series = []
    for o in ords:
        tgt = date.fromordinal(o).isoformat()
        num = wsum = 0.0
        for h in holdings:
            s = h["sym"]
            if s not in base_px:
                continue
            p = price_on_or_before(hists[s], tgt)
            if not p:
                continue
            num += h["w"] * (p / base_px[s])
            wsum += h["w"]
        series.append(round(100.0 * num / wsum, 2) if wsum else None)
    return series


def bench_series(sym: str, ords: list):
    h = history(sym)
    base = price_on_or_before(h, date.fromordinal(ords[0]).isoformat())
    if not base:
        return [None] * len(ords)
    out = []
    for o in ords:
        p = price_on_or_before(h, date.fromordinal(o).isoformat())
        out.append(round(100.0 * p / base, 2) if p else None)
    return out


def label_for(o: int) -> str:
    return date.fromordinal(o).strftime("%b %y")


def build_funds_history(existing: dict) -> dict:
    print("Building funds-history.json ...")
    funds = existing.get("funds", {}) if existing else {}
    for fid, cfg in FUND_CFG.items():
        holdings = parse_holdings(fid)
        if not holdings:
            print(f"  - {fid}: no holdings parsed, leaving existing data")
            continue
        entry = funds.get(fid, {})
        entry["fundLabel"] = entry.get("fundLabel") or fid.replace("_", " ").title()
        entry["benchmarkLabel"] = cfg["bench_label"]
        tf = {}
        for period in cfg["periods"]:
            ords = sample_dates(period, cfg["inception"])
            fund = index_series(holdings, ords)
            bench = bench_series(cfg["bench"], ords)
            tf[period] = {
                "labels": [label_for(o) for o in ords],
                "fund": fund,
                "benchmark": bench,
            }
        entry["timeframes"] = tf
        funds[fid] = entry
        ok = sum(1 for v in next(iter(tf.values()))["fund"] if v is not None)
        pts = len(next(iter(tf.values()))["labels"]) if tf else 0
        print(f"  + {fid}: {len(holdings)} holdings, periods {list(tf)} ({ok}/{pts} pts)")
    return {"asOf": datetime.now(timezone.utc).isoformat(), "source": "yahoo", "funds": funds}


# --------------------------------------------------------------------------- #
# Macro (Alpha Vantage economic + Yahoo market levels)                         #
# --------------------------------------------------------------------------- #
def av_get(function: str, **params) -> dict:
    if not AV_KEY:
        return {}
    qs = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://www.alphavantage.co/query?function={function}&{qs}&apikey={AV_KEY}"
    text = http_get(url)
    time.sleep(13)  # free tier: 5 requests/minute
    try:
        return json.loads(text) if text else {}
    except json.JSONDecodeError:
        return {}


def av_latest(function: str, **params):
    js = av_get(function, **params)
    data = js.get("data") if isinstance(js, dict) else None
    if not data:
        return None
    vals = [d for d in data if d.get("value") not in (".", "", None)]
    if not vals:
        return None
    latest = vals[0]
    prev = vals[1] if len(vals) > 1 else None
    out = {
        "date": latest["date"],
        "value": float(latest["value"]),
        "unit": js.get("unit", ""),
    }
    if prev:
        out["prev"] = float(prev["value"])
        out["change"] = round(out["value"] - out["prev"], 2)
    return out


def cpi_yoy():
    """Compute headline CPI YoY % from the monthly CPI index series."""
    js = av_get("CPI", interval="monthly")
    data = js.get("data") if isinstance(js, dict) else None
    if not data or len(data) < 13:
        return None
    try:
        latest = float(data[0]["value"])
        year_ago = float(data[12]["value"])
        prev = float(data[1]["value"])
        prev_year_ago = float(data[13]["value"]) if len(data) > 13 else year_ago
        yoy = (latest / year_ago - 1) * 100
        prev_yoy = (prev / prev_year_ago - 1) * 100
        return {"date": data[0]["date"], "value": round(yoy, 1), "unit": "% YoY",
                "prev": round(prev_yoy, 1), "change": round(yoy - prev_yoy, 1)}
    except (ValueError, ZeroDivisionError, KeyError):
        return None


def build_macro() -> dict:
    print("Building macro.json ...")
    markets = {}
    market_syms = [
        ("sp500", "S&P 500", "^GSPC", "num"),
        ("ftse100", "FTSE 100", "^FTSE", "num"),
        ("dxy", "US Dollar Index", "DX-Y.NYB", "num"),
        ("gold", "Gold", "GC=F", "usd"),
        ("silver", "Silver", "SI=F", "usd"),
        ("brent", "Brent Crude", "BZ=F", "usd"),
        ("wti", "WTI Crude", "CL=F", "usd"),
        ("copper", "Copper", "HG=F", "usd"),
        ("gbpusd", "GBP/USD", "GBPUSD=X", "fx"),
    ]
    for key, label, sym, kind in market_syms:
        lt = latest_two(sym)
        if not lt:
            continue
        d, last, prev = lt
        chg = (last - prev) / prev * 100 if prev else 0.0
        markets[key] = {"label": label, "value": fmt_value(last, kind),
                        "raw": round(last, 4), "change_pct": round(chg, 2), "date": d}
        print(f"  + market {label}: {fmt_value(last, kind)} ({chg:+.2f}%)")

    economic = {}
    if AV_KEY:
        print("  fetching Alpha Vantage economic series (rate-limited) ...")
        jobs = {
            "cpi_yoy": cpi_yoy,
            "inflation": lambda: av_latest("INFLATION"),
            "fed_funds": lambda: av_latest("FEDERAL_FUNDS_RATE", interval="monthly"),
            "unemployment": lambda: av_latest("UNEMPLOYMENT"),
            "nonfarm_payroll": lambda: av_latest("NONFARM_PAYROLL"),
            "retail_sales": lambda: av_latest("RETAIL_SALES"),
            "real_gdp": lambda: av_latest("REAL_GDP", interval="quarterly"),
            "ust_3m": lambda: av_latest("TREASURY_YIELD", interval="monthly", maturity="3month"),
            "ust_2y": lambda: av_latest("TREASURY_YIELD", interval="monthly", maturity="2year"),
            "ust_10y": lambda: av_latest("TREASURY_YIELD", interval="monthly", maturity="10year"),
            "ust_30y": lambda: av_latest("TREASURY_YIELD", interval="monthly", maturity="30year"),
        }
        for key, fn in jobs.items():
            try:
                v = fn()
            except Exception as e:  # noqa: BLE001
                v = None
                print(f"  ! {key} failed: {e}")
            if v:
                economic[key] = v
                print(f"  + {key}: {v['value']} {v.get('unit','')}")
            else:
                print(f"  - {key}: no data")
    else:
        print("  (no ALPHAVANTAGE_API_KEY - skipping economic series)")

    return {
        "asOf": datetime.now(timezone.utc).isoformat(),
        "source": "yahoo + alphavantage" if AV_KEY else "yahoo",
        "markets": markets,
        "economic": economic,
    }


# --------------------------------------------------------------------------- #
def write_json(path: Path, obj):
    path.write_text(json.dumps(obj, indent=2), encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


def main():
    DATA.mkdir(exist_ok=True)
    targets = sys.argv[1:] or ["ticker", "funds", "macro"]

    if "ticker" in targets:
        write_json(DATA / "ticker.json",
                   {"asOf": datetime.now(timezone.utc).isoformat(),
                    "source": "yahoo", "items": build_ticker()})

    if "funds" in targets:
        existing = {}
        fpath = DATA / "funds-history.json"
        if fpath.exists():
            try:
                existing = json.loads(fpath.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                existing = {}
        write_json(fpath, build_funds_history(existing))

    if "macro" in targets:
        write_json(DATA / "macro.json", build_macro())

    print("Done.")


if __name__ == "__main__":
    main()
