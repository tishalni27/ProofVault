


from web3 import Web3

rpc_url = "http://139.180.140.143/rpc/"
w3 = Web3(Web3.HTTPProvider(rpc_url))

print("Connected:", w3.is_connected())

#
private_key = "2b0f1023b70ae1269ab83cdb2d363a50"
account = w3.eth.account.from_key(private_key)

file_hash = file_hash  
tx = {
    "to": account.address,  
    "value": 0,
    "gas": 200000,
    "gasPrice": w3.to_wei("1", "gwei"),
    "nonce": w3.eth.get_transaction_count(account.address),
    "data": w3.to_hex(text=file_hash)
}

signed_tx = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

print("TX HASH:", tx_hash.hex())