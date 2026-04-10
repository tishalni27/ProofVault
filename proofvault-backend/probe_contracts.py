"""
Run this FIRST — it probes the pre-deployed contracts and prints their available functions.
python probe_contracts.py
"""
from web3 import Web3
import json

RPC_URL = "http://139.180.188.61:8545"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

CONTRACTS = {
    "OperatorRegistry":       "0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9",
    "MerkleRewardDistributor":"0x728f2C63b9A0ff0918F5ffB3D4C2d004107476B7",
}

print("Connected:", w3.is_connected())
print()

for name, addr in CONTRACTS.items():
    code = w3.eth.get_code(addr)
    print(f"{'='*60}")
    print(f"{name}")
    print(f"  Address    : {addr}")
    print(f"  Code length: {len(code)} bytes  {'✅ deployed' if len(code) > 2 else '❌ empty'}")

    # Try to fetch past logs to see event signatures
    try:
        logs = w3.eth.get_logs({
            "fromBlock": max(0, w3.eth.block_number - 5000),
            "toBlock":   "latest",
            "address":   addr,
        })
        print(f"  Recent logs: {len(logs)}")
        topics_seen = set()
        for log in logs[:10]:
            if log["topics"]:
                t = log["topics"][0].hex()
                if t not in topics_seen:
                    topics_seen.add(t)
                    print(f"    Event topic: {t}")
    except Exception as e:
        print(f"  Log fetch error: {e}")
    print()

# Also check a recent block to understand chain state
try:
    block = w3.eth.get_block("latest")
    print(f"Latest block : #{block['number']}")
    print(f"Block time   : {block['timestamp']}")
    print(f"Transactions : {len(block['transactions'])}")
except Exception as e:
    print(f"Block fetch error: {e}")