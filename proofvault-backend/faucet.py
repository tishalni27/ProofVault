
import requests

address = "0x09862fe62d534A1E1E9981491cd845E7c4F86f8F"

res = requests.post(
    "http://139.180.140.143/faucet/request",
    json={"address": address}
)

