import requests

files = {
    "file": open("test.pdf", "rb")
}

res = requests.post("http://127.0.0.1:5001/verify", files=files)

print("STATUS:", res.status_code)
print("RAW:", res.text)