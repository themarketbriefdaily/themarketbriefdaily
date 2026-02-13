import json
import time
from datetime import datetime, timezone
import urllib.request
import urllib.parse
import os

API_KEY = "GUY8S89NSG15NVYH"

SYMBOLS = {
    "AGI": "AGI",
    "FSM": "FSM",
    "GAU": "GAU",
    "NFGC": "NFGC",
    "VGZ": "VGZ",
    "NEWP": "NEWP",
}

def http_get_json(params: dict) -> dict:
    url = "https://www.alphavantage.co/query?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)

def check_errors(data: dict):
    if "Note" in data:
        raise RuntimeError("Rate limited (Note)")
    if "Information" in data:
        raise RuntimeError(f"Information: {data['Information']}")
    if "Error Message" in data:
        raise RuntimeError(f"API error: {data['Error Message']}")

def fetch_global_quote(sym: str):
    data = http_get_json({
        "function": "GLOBAL_QUOTE",
        "symbol": sym,
        "apikey": API_KEY
    })
    check_errors(data)
    q = data.get("Global Quote") or {}
    px = q.get("05. price")
    day = q.get("07. latest trading day") or ""
    if not px:
        raise RuntimeError("GLOBAL_QUOTE empty")
    price = float(px)
    if price <= 0:
        raise RuntimeError("GLOBAL_QUOTE bad price")
    return price, day

def fetch_daily_adjusted(sym: str):
    data = http_get_json({
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": sym,
        "outputsize": "compact",
        "apikey": API_KEY
    })
    check_errors(data)
    series = data.get("Time Series (Daily)")
    if not series or not isinstance(series, dict):
        raise RuntimeError("DAILY_ADJUSTED empty/unsupported")
    last_day = sorted(series.keys())[-1]
    px = float(series[last_day]["4. close"])
    if px <= 0:
        raise RuntimeError("DAILY_ADJUSTED bad close")
    return px, last_day

def fetch_best(sym: str):
    try:
        return fetch_global_quote(sym)
    except Exception:
        return fetch_daily_adjusted(sym)

def main():
    out = {
        "asof_iso": datetime.now(timezone.utc).isoformat(),
        "last_trading_day": "—",
        "source": "alphavantage_free",
        "prices": {},
        "errors": {}
    }

    last = ""
    items = list(SYMBOLS.items())

    for i, (internal, avsym) in enumerate(items):
        try:
            px, day = fetch_best(avsym)
            out["prices"][internal] = px
            if day and day > last:
                last = day
        except Exception as e:
            out["errors"][internal] = str(e)

        # Free tier throttling (5/min). 15s per call is safe.
        if i < len(items) - 1:
            time.sleep(15)

    out["last_trading_day"] = last or "—"

    os.makedirs("data", exist_ok=True)
    with open("data/quotes.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

if __name__ == "__main__":
    main()
