import json
import os
import time
from datetime import datetime, timezone
import urllib.request

API_KEY = os.environ.get("ALPHAVANTAGE_KEY", "").strip()
if not API_KEY:
    raise SystemExit("Missing ALPHAVANTAGE_KEY env var")

TICKERS = ["AGI", "FSM", "GAU", "NFGC", "VGZ", "NEWP"]

def fetch_quote(symbol: str):
    url = (
        "https://www.alphavantage.co/query"
        f"?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
    )
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "Note" in data:
        raise RuntimeError(f"Rate limited: {data['Note']}")
    if "Error Message" in data:
        raise RuntimeError(f"API error for {symbol}: {data['Error Message']}")

    q = data.get("Global Quote", {})
    price = float(q.get("05. price", "nan"))
    day = q.get("07. latest trading day", "")
    if price != price:  # NaN check
        raise RuntimeError(f"Bad price for {symbol}: {q}")
    return price, day

def main():
    out = {
        "asof_iso": datetime.now(timezone.utc).isoformat(),
        "last_trading_day": "",
        "source": "alphavantage",
        "prices": {}
    }

    last_day = ""
    for i, sym in enumerate(TICKERS):
        price, day = fetch_quote(sym)
        out["prices"][sym] = price
        if day and day > last_day:
            last_day = day

        # Alpha Vantage free tier: stay under ~5 requests/min
        if i < len(TICKERS) - 1:
            time.sleep(15)

    out["last_trading_day"] = last_day or "—"

    os.makedirs("data", exist_ok=True)
    with open("data/quotes.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

if __name__ == "__main__":
    main()
