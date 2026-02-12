import json
import os
import time
from datetime import datetime, timezone
import urllib.request
import urllib.parse

# Hardcoded (you requested this)
API_KEY = "GUY8S89NSG15NVYH"

# IMPORTANT:
# Alpha Vantage often needs exchange suffixes for non-US listings.
# If a symbol returns no data, change it here (e.g. "AGI.TO", "NFG.TO", etc).
SYMBOLS = {
    "AGI": "AGI",
    "FSM": "FSM",
    "GAU": "GAU",
    "NFGC": "NFGC",
    "VGZ": "VGZ",
    "NEWP": "NEWP",
}

INTERVAL = "5min"   # intraday cadence

def http_get_json(url: str):
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)

def fetch_latest_intraday(av_symbol: str):
    # TIME_SERIES_INTRADAY is more reliable than GLOBAL_QUOTE
    params = {
        "function": "TIME_SERIES_INTRADAY",
        "symbol": av_symbol,
        "interval": INTERVAL,
        "outputsize": "compact",
        "apikey": API_KEY,
    }
    url = "https://www.alphavantage.co/query?" + urllib.parse.urlencode(params)
    data = http_get_json(url)

    # Handle plan / throttling payloads
    if "Note" in data:
        raise RuntimeError(f"Rate limited: {data['Note']}")
    if "Information" in data:
        raise RuntimeError(f"Information: {data['Information']}")
    if "Error Message" in data:
        raise RuntimeError(f"API error: {data['Error Message']}")

    ts_key = f"Time Series ({INTERVAL})"
    series = data.get(ts_key)
    if not series or not isinstance(series, dict):
        raise RuntimeError("No intraday series returned (symbol unsupported or empty)")

    # latest timestamp key in the dict
    latest_ts = sorted(series.keys())[-1]
    bar = series[latest_ts]
    last = float(bar["4. close"])
    if last <= 0:
        raise RuntimeError("Bad close price")
    return last, latest_ts

def main():
    out = {
        "asof_iso": datetime.now(timezone.utc).isoformat(),
        "last_trading_day": "—",
        "source": "alphavantage",
        "prices": {},
        "errors": {},
    }

    # best-effort: fill what we can, never crash the whole run
    last_ts_seen = ""

    items = list(SYMBOLS.items())
    for i, (internal, avsym) in enumerate(items):
        try:
            px, last_ts = fetch_latest_intraday(avsym)
            out["prices"][internal] = px
            if last_ts and last_ts > last_ts_seen:
                last_ts_seen = last_ts
        except Exception as e:
            out["errors"][internal] = str(e)

        # Free tier is tight. Slow it down.
        if i < len(items) - 1:
            time.sleep(15)

    # AlphaVantage intraday timestamps are local-exchange time; still useful as "last update"
    out["last_trading_day"] = last_ts_seen or "—"

    os.makedirs("data", exist_ok=True)
    with open("data/quotes.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

if __name__ == "__main__":
    main()
