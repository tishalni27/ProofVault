from web3 import Web3
from solcx import compile_standard, install_solc
import json

# ── CONFIG ──────────────────────────────────────────────
RPC_URL     = "http://139.180.188.61:8545"
CHAIN_ID    = 18441
PRIVATE_KEY = "e00a3b1061c9eaaf923a3d03fc3e5782398bef80860b58be9cf9c6ce78dc89f7"
# ────────────────────────────────────────────────────────

# Stripped-down contract — no arrays, no structs, minimal storage
CONTRACT_SOURCE = """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofVault {
    struct Proof {
        uint256 timestamp;
        address uploader;
        string  documentTitle;
        string  documentType;
    }

    mapping(string => Proof) private proofs;
    uint256 public totalProofs;

    event HashStored(string fileHash, uint256 timestamp, address uploader);

    function storeHash(
        string memory _fileHash,
        string memory _documentTitle,
        string memory _documentType
    ) public {
        require(bytes(_fileHash).length > 0, "Empty hash");
        require(proofs[_fileHash].timestamp == 0, "Already stored");

        proofs[_fileHash] = Proof({
            timestamp:     block.timestamp,
            uploader:      msg.sender,
            documentTitle: _documentTitle,
            documentType:  _documentType
        });

        totalProofs++;
        emit HashStored(_fileHash, block.timestamp, msg.sender);
    }

    function verifyHash(string memory _fileHash)
        public view
        returns (
            bool    exists,
            uint256 timestamp,
            address uploader,
            string  memory documentTitle,
            string  memory documentType
        )
    {
        Proof memory p = proofs[_fileHash];
        if (p.timestamp == 0) {
            return (false, 0, address(0), "", "");
        }
        return (true, p.timestamp, p.uploader, p.documentTitle, p.documentType);
    }
}
"""

def main():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    assert w3.is_connected(), "Could not connect to RPC"
    print("Connected to DCAI chain")

    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"Deploying from: {account.address}")

    balance = w3.eth.get_balance(account.address)
    print(f"Balance: {w3.from_wei(balance, 'ether')} tDCAI")
    assert balance > 0, "No gas."

    print("Compiling contract...")
    install_solc("0.8.20")

    compiled = compile_standard({
        "language": "Solidity",
        "sources": {"ProofVault.sol": {"content": CONTRACT_SOURCE}},
        "settings": {
            "outputSelection": {"*": {"*": ["abi", "evm.bytecode"]}}
        }
    }, solc_version="0.8.20")

    abi      = compiled["contracts"]["ProofVault.sol"]["ProofVault"]["abi"]
    bytecode = compiled["contracts"]["ProofVault.sol"]["ProofVault"]["evm"]["bytecode"]["object"]

    print(f"Bytecode size: {len(bytecode)//2} bytes")

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce    = w3.eth.get_transaction_count(account.address)

    tx = {
        "chainId":  CHAIN_ID,
        "from":     account.address,
        "nonce":    nonce,
        "gas":      2_000_000,
        "gasPrice": w3.to_wei("1", "gwei"),
        "data":     contract.constructor().data_in_transaction,
    }

    signed  = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"Tx sent: {tx_hash.hex()}")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    print(f"Status: {receipt.status}")
    print(f"Gas used: {receipt.gasUsed}")

    if receipt.status == 0:
        print("FAILED — contract still rejected by chain")
        return

    contract_address = receipt.contractAddress
    print(f"Contract deployed at: {contract_address}")

    # verify code is there
    code = w3.eth.get_code(contract_address)
    print(f"Code length: {len(code)} bytes")

    with open("contract_address.txt", "w") as f:
        f.write(contract_address)
    with open("abi.json", "w") as f:
        json.dump(abi, f, indent=2)

    print("Saved: contract_address.txt + abi.json")
    print("Done! ProofVault is live on DCAI.")

if __name__ == "__main__":
    main()