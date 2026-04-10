from web3 import Web3

rpc_url = "http://139.180.188.61:8545"
w3 = Web3(Web3.HTTPProvider(rpc_url))

address = Web3.to_checksum_address("0x09862fe62d534a1e1e9981491cd845e7c4f86f8f")

balance_wei = w3.eth.get_balance(address)
print("Native balance (wei):", balance_wei)
print("Native balance:", w3.from_wei(balance_wei, "ether"))