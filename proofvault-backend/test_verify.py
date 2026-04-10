import requests

files = {
    "file": open("test.pdf", "rb")
}

res = requests.post("http://127.0.0.1:5001/verify", files=files)

print("STATUS:", res.status_code)
try:
    data = res.json()
    for k, v in data.items():
        print(f"  {k}: {v}")
except:
    print("RAW:", res.text)