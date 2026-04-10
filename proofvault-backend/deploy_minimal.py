from web3 import Web3
from solcx import compile_standard, install_solc
import json

RPC_URL     = "http://139.180.188.61:8545"
CHAIN_ID    = 18441
PRIVATE_KEY = "e00a3b1061c9eaaf923a3d03fc3e5782398bef80860b58be9cf9c6ce78dc89f7"

# Absolute minimum contract — just a number stored on chain
CONTRACT_SOURCE = """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Minimal {
    uint256 public value = 42;
}
"""

def main():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    assert w3.is_connected()
    print("Connected")

    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"From: {account.address}")
    print(f"Balance: {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} tDCAI")

    install_solc("0.8.20")
    compiled = compile_standard({
        "language": "Solidity",
        "sources": {"Minimal.sol": {"content": CONTRACT_SOURCE}},
        "settings": {"outputSelection": {"*": {"*": ["abi", "evm.bytecode"]}}}
    }, solc_version="0.8.20")

    abi      = compiled["contracts"]["Minimal.sol"]["Minimal"]["abi"]
    bytecode = compiled["contracts"]["Minimal.sol"]["Minimal"]["evm"]["bytecode"]["object"]
    print(f"Bytecode size: {len(bytecode)//2} bytes")

    nonce = w3.eth.get_transaction_count(account.address)

    # Try different gas limits
    for gas in [100_000, 500_000, 1_000_000]:
        print(f"\nTrying gas={gas}...")
        tx = {
            "chainId":  CHAIN_ID,
            "from":     account.address,
            "nonce":    nonce,
            "gas":      gas,
            "gasPrice": w3.to_wei("1", "gwei"),
            "data":     "0x" + bytecode,
        }
        signed  = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        print(f"Tx: {tx_hash.hex()}")

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        print(f"Status: {receipt.status}, Gas used: {receipt.gasUsed}")

        if receipt.status == 1:
            addr = receipt.contractAddress
            code = w3.eth.get_code(addr)
            print(f"SUCCESS! Contract at: {addr}")
            print(f"Code length: {len(code)} bytes")

            with open("contract_address.txt", "w") as f:
                f.write(addr)
            with open("abi_minimal.json", "w") as f:
                json.dump(abi, f, indent=2)
            return

        nonce += 1

    print("\nAll attempts failed — chain is blocking contract deployment")
    print("Check with DCAI team if contract deployment is enabled on this RPC")

if __name__ == "__main__":
    main()