from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import hashlib

app = Flask(__name__)
CORS(app)

RPC_URL = "http://139.180.188.61:8545"
CHAIN_ID = 18441

WALLET_ADDRESS = "0x09862fe62d534a1e1e9981491cd845e7c4f86f8f"
PRIVATE_KEY = "0x09862fe62d534A1E1E9981491cd845E7c4F86f8F"
CONTRACT_ADDRESS = "PASTE_YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"

ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "fileHash", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": False, "internalType": "address", "name": "uploader", "type": "address"}
        ],
        "name": "HashStored",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "storeHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_fileHash", "type": "string"}],
        "name": "verifyHash",
        "outputs": [
            {"internalType": "bool", "name": "exists", "type": "bool"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "uploader", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

w3 = Web3(Web3.HTTPProvider(RPC_URL))
contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=ABI
)

@app.route("/")
def home():
    return "ProofVault backend running with DCAI"

@app.route("/upload", methods=["POST"])
def upload():
    try:
        file = request.files["file"]
        file_bytes = file.read()
        file_hash = hashlib.sha256(file_bytes).hexdigest()

        account = Web3.to_checksum_address(WALLET_ADDRESS)
        nonce = w3.eth.get_transaction_count(account)

        tx = contract.functions.storeHash(file_hash).build_transaction({
            "from": account,
            "nonce": nonce,
            "chainId": CHAIN_ID,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price
        })

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return jsonify({
            "filename": file.filename,
            "file_hash": file_hash,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "contract_address": CONTRACT_ADDRESS
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/verify", methods=["POST"])
def verify():
    try:
        file = request.files["file"]
        file_bytes = file.read()
        file_hash = hashlib.sha256(file_bytes).hexdigest()

        exists, timestamp, uploader = contract.functions.verifyHash(file_hash).call()

        return jsonify({
            "filename": file.filename,
            "file_hash": file_hash,
            "exists_on_chain": exists,
            "timestamp": timestamp,
            "uploader": uploader
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)