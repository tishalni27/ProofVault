import os
from dotenv import load_dotenv
from web3 import Web3
from solcx import compile_source, install_solc

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")
CHAIN_ID = int(os.getenv("CHAIN_ID", "18441"))

install_solc("0.8.20")

with open("ProofVault.sol", "r", encoding="utf-8") as f:
    contract_source = f.read()

compiled_sol = compile_source(
    contract_source,
    output_values=["abi", "bin"],
    solc_version="0.8.20"
)

contract_id, contract_interface = compiled_sol.popitem()
abi = contract_interface["abi"]
bytecode = contract_interface["bin"]

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise Exception("Could not connect to DCAI RPC")

account = Web3.to_checksum_address(WALLET_ADDRESS)
nonce = w3.eth.get_transaction_count(account)

ProofVault = w3.eth.contract(abi=abi, bytecode=bytecode)

tx = ProofVault.constructor().build_transaction({
    "from": account,
    "nonce": nonce,
    "chainId": CHAIN_ID,
    "gas": 3000000,
    "gasPrice": w3.eth.gas_price
})

signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print("Contract deployed!")
print("Contract address:", receipt.contractAddress)
print("Tx hash:", tx_hash.hex())

with open("contract_abi.py", "w", encoding="utf-8") as f:
    f.write(f"ABI = {abi}\n")
    f.write(f'CONTRACT_ADDRESS = "{receipt.contractAddress}"\n')