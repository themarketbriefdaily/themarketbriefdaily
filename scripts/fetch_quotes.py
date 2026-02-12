import json
import os
import time
from datetime import datetime, timezone
import urllib.request

API_KEY = os.environ.get("ALPHAVANTAGE_KEY", "").strip()
if not API_KEY:
    raise SystemExit("Missing ALPHAVANTAGE_KEY env var")

# IMPORTANT: match your internal tickers to Alpha Vantage symbols here
# If AGI fails, try "AGI.TO" OR the US listing symbol if one exists.
SYMBOLS = {
    "AGI": "AGI",
    "FSM": "FSM",
    "GAU": "GAU",
    "NFGC": "NFGC",
    "VGZ": "VGZ",
    "NEWP": "NEWP"
}

def fetch_quote(av_symbol: str):
    url = (
        "https://www.alphavantage.co/query"
        f"?function=GLOBAL_QUOTE&symbol={av_symbol}&apikey={API_KEY}"
    )
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "Note" in data:
        raise RuntimeError(f"Rate limited: {data['Note']}")
    if "Error Message" in data:
        raise RuntimeError(f"API error: {data['Error Message']}")

    q = data.get("Global Quote", {})
    if not q or "05. price" not in q:
        raise RuntimeError("No Global Quote returned")

    price = float(q["05. price"])
    day = q.get("07. latest trading day", "")
    if price <= 0:
        raise RuntimeError("Bad price")
    return price, day

def main():
    out = {
        "asof_iso": datetime.now(timezone.utc).isoformat(),
        "last_trading_day": "—",
        "source": "alphavantage",
        "prices": {},
        "errors": {}
    }

    last_day = ""
    items = list(SYMBOLS.items())

    for i, (internal, avsym) in enumerate(items):
        try:
            price, day = fetch_quote(avsym)
            out["prices"][internal] = price
            if day and day > last_day:
                last_day = day
        except Exception as e:
            out["errors"][internal] = str(e)

        # stay under free-tier throttle (~5 req/min)
        if i < len(items) - 1:
            time.sleep(15)

    out["last_trading_day"] = last_day or "—"

    os.makedirs("data", exist_ok=True)
    with open("data/quotes.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

if __name__ == "__main__":
    main()
