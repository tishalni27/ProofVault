import requests

# 🔁 Replace with your wallet address
WALLET_ADDRESS = "0x09862fe62d534a1e1e9981491cd845e7c4f86f8f"

url = "http://139.180.140.143/faucet/request"

payload = {
    "address": WALLET_ADDRESS
}

try:
    res = requests.post(url, json=payload, timeout=15)

    print("STATUS:", res.status_code)

    try:
        data = res.json()
        print("RESPONSE:", data)

        if data.get("ok"):
            print("\n Faucet successful!")
            print("TX HASH:", data.get("txHash"))
        else:
            print("\n Faucet failed:", data)

    except Exception:
        print("RAW RESPONSE:", res.text)

except Exception as e:
    print("ERROR:", str(e))