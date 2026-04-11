import requests
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import hashlib, json, os, sqlite3, uuid
from datetime import datetime, timezone
from web3.middleware import ExtraDataToPOAMiddleware
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# ── CONFIG ────────────────────────────────────────────────────────────────────
RPC_URL        = "http://139.180.188.61:8545"
CHAIN_ID       = 18441
WALLET_ADDRESS = "0x09862fe62d534A1E1E9981491cd845E7c4F86f8F"
PRIVATE_KEY    = "e00a3b1061c9eaaf923a3d03fc3e5782398bef80860b58be9cf9c6ce78dc89f7"
OPERATOR_REGISTRY = "0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9"
CACHE_FILE     = os.path.join(os.path.dirname(__file__), "proofs.json")

BASE_DIR       = os.path.dirname(__file__)
DB_FILE        = os.path.join(BASE_DIR, "proofvault.db")
UPLOAD_FOLDER  = os.path.join(BASE_DIR, "uploads")
CACHE_FILE     = os.path.join(BASE_DIR, "proofs.json")
RTDB_URL       = "https://proofvault-a11d3-default-rtdb.asia-southeast1.firebasedatabase.app/"
# ─────────────────────────────────────────────────────────────────────────────

w3 = Web3(Web3.HTTPProvider(RPC_URL))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0) 

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            document_type TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS document_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            version_number INTEGER NOT NULL,
            file_hash TEXT NOT NULL UNIQUE,
            tx_hash TEXT,
            block_number INTEGER,
            uploaded_at TEXT NOT NULL,
            filename TEXT NOT NULL,
            stored_path TEXT NOT NULL,
            uploader TEXT,
            previous_version_id INTEGER,
            is_current INTEGER NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'registered',
            FOREIGN KEY (document_id) REFERENCES documents (id),
            FOREIGN KEY (previous_version_id) REFERENCES document_versions (id)
        )
    """)

    conn.commit()
    conn.close()

# ── CACHE ─────────────────────────────────────────────────────────────────────

def _load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}

def _save_cache(cache: dict):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def _now_utc(ts: int) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def _send_proof_tx(file_hash: str, title: str, doc_type: str):
    """Embed proof JSON in tx.data and send to OperatorRegistry."""
    payload = json.dumps({
        "app":  "ProofVault",
        "hash": file_hash,
        "t":    title,
        "dt":   doc_type,
    }, separators=(",", ":")).encode()

    account = Web3.to_checksum_address(WALLET_ADDRESS)
    nonce   = w3.eth.get_transaction_count(account)

    tx = {
        "chainId":  CHAIN_ID,
        "from":     account,
        "to":       account,
        "value":    0,
        "nonce":    nonce,
        "gas":      100_000,
        "gasPrice": w3.to_wei("1", "gwei"),
        "data":     "0x" + payload.hex(),
    }

    signed  = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    return tx_hash.hex(), receipt

def _scan_chain_for_hash(file_hash: str, scan_blocks: int = 20_000) -> dict | None:
    """
    Fallback: scan recent blocks for a tx from our wallet to OperatorRegistry
    whose data embeds the given file_hash.
    """
    account      = Web3.to_checksum_address(WALLET_ADDRESS).lower()
    latest_block = w3.eth.block_number
    from_block   = max(0, latest_block - scan_blocks)

    for blk_num in range(latest_block, from_block - 1, -1):  # newest first
        try:
            blk = w3.eth.get_block(blk_num, full_transactions=True)
        except Exception:
            continue
        for tx in blk.transactions:
            if (tx.get("from", "").lower() == account and
                    tx.get("to", "").lower() == account):
                try:
                    raw = bytes.fromhex(tx["input"][2:])
                    p   = json.loads(raw.decode())
                    if p.get("hash") == file_hash:
                        return {
                            "tx_hash":      tx["hash"].hex(),
                            "block_number": blk_num,
                            "timestamp":    blk["timestamp"],
                            "title":        p.get("t", ""),
                            "doc_type":     p.get("dt", ""),
                        }
                except Exception:
                    continue
    return None

def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def _document_lookup_key(title: str, doc_type: str) -> str:
    return f"{_slugify(title)}__{_slugify(doc_type)}"


def rtdb_get(path: str):
    url = f"{RTDB_URL}/{path}.json"
    res = requests.get(url, timeout=20)
    res.raise_for_status()
    return res.json()


def rtdb_put(path: str, data):
    url = f"{RTDB_URL}/{path}.json"
    res = requests.put(url, json=data, timeout=20)
    res.raise_for_status()
    return res.json()


def rtdb_patch(path: str, data):
    url = f"{RTDB_URL}/{path}.json"
    res = requests.patch(url, json=data, timeout=20)
    res.raise_for_status()
    return res.json()


def rtdb_post(path: str, data):
    url = f"{RTDB_URL}/{path}.json"
    res = requests.post(url, json=data, timeout=20)
    res.raise_for_status()
    return res.json()


def rtdb_delete(path: str):
    url = f"{RTDB_URL}/{path}.json"
    res = requests.delete(url, timeout=20)
    res.raise_for_status()
    return res.json()

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({
        "status":            "ProofVault running",
        "chain_connected":   w3.is_connected(),
        "wallet":            WALLET_ADDRESS,
        "operator_registry": OPERATOR_REGISTRY,
        "total_proofs":      len(_load_cache()),
    })


# @app.route("/upload", methods=["POST"])
# def upload():
#     try:
#         if "file" not in request.files:
#             return jsonify({"error": "No file provided"}), 400

#         f          = request.files["file"]
#         file_bytes = f.read()
#         file_hash  = _sha256(file_bytes)
#         title      = request.form.get("title", f.filename)
#         doc_type   = request.form.get("document_type", "Document")

#         # Check if already stored
#         cache = _load_cache()
#         if file_hash in cache:
#             entry = cache[file_hash]
#             return jsonify({
#                 "success":          True,
#                 "already_existed":  True,
#                 "filename":         f.filename,
#                 "title":            entry["title"],
#                 "document_type":    entry["doc_type"],
#                 "file_hash":        file_hash,
#                 "tx_hash":          entry["tx_hash"],
#                 "block_number":     entry["block_number"],
#                 "operator_registry": OPERATOR_REGISTRY,
#             })

#         # Send on-chain proof tx
#         tx_hash, receipt = _send_proof_tx(file_hash, title, doc_type)

#         if receipt.status != 1:
#             return jsonify({"error": "Transaction failed on-chain", "tx_hash": tx_hash}), 500

#         # Get block timestamp
#         blk = w3.eth.get_block(receipt.blockNumber)
#         ts  = blk["timestamp"]

#         # Save to cache
#         cache[file_hash] = {
#             "tx_hash":      tx_hash,
#             "block_number": receipt.blockNumber,
#             "timestamp":    ts,
#             "title":        title,
#             "doc_type":     doc_type,
#             "filename":     f.filename,
#             "uploader":     WALLET_ADDRESS,
#         }
#         _save_cache(cache)

#         return jsonify({
#             "success":           True,
#             "filename":          f.filename,
#             "title":             title,
#             "document_type":     doc_type,
#             "file_hash":         file_hash,
#             "tx_hash":           tx_hash,
#             "block_number":      receipt.blockNumber,
#             "uploaded_at":       _now_utc(ts),
#             "operator_registry": OPERATOR_REGISTRY,
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        f = request.files["file"]
        file_bytes = f.read()
        file_hash = _sha256(file_bytes)

        title = request.form.get("title", f.filename)
        doc_type = request.form.get("document_type", "Document")
        filename = secure_filename(f.filename)

        # duplicate by hash
        existing_version_id = rtdb_get(f"hash_index/{file_hash}")
        if existing_version_id:
            existing = rtdb_get(f"document_versions/{existing_version_id}") or {}
            return jsonify({
                "success": True,
                "already_existed": True,
                "filename": existing.get("filename", filename),
                "title": title,
                "document_type": doc_type,
                "file_hash": file_hash,
                "tx_hash": existing.get("tx_hash", ""),
                "block_number": existing.get("block_number"),
                "uploaded_at": existing.get("uploaded_at"),
                "version": existing.get("version_number", 1),
                "document_id": existing.get("document_id")
            })

        lookup_key = _document_lookup_key(title, doc_type)
        document_id = rtdb_get(f"document_lookup/{lookup_key}")

        previous_version_id = None
        version_number = 1

        if not document_id:
            created = rtdb_post("documents", {
                "title": title,
                "document_type": doc_type,
                "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "current_version_id": None
            })
            document_id = created["name"]
            rtdb_put(f"document_lookup/{lookup_key}", document_id)
        else:
            doc = rtdb_get(f"documents/{document_id}") or {}
            previous_version_id = doc.get("current_version_id")
            if previous_version_id:
                prev = rtdb_get(f"document_versions/{previous_version_id}") or {}
                version_number = int(prev.get("version_number", 1)) + 1
                rtdb_patch(f"document_versions/{previous_version_id}", {"is_current": False})

        tx_hash, receipt = _send_proof_tx(file_hash, title, doc_type)
        if receipt.status != 1:
            return jsonify({"error": "Transaction failed"}), 500

        block_number = receipt.blockNumber
        blk = w3.eth.get_block(block_number)
        uploaded_at = _now_utc(blk["timestamp"])

        version_payload = {
            "document_id": document_id,
            "version_number": version_number,
            "file_hash": file_hash,
            "tx_hash": tx_hash,
            "block_number": block_number,
            "uploaded_at": uploaded_at,
            "filename": filename,
            "uploader": WALLET_ADDRESS,
            "previous_version_id": previous_version_id,
            "is_current": True,
            "status": "registered"
        }

        created_ver = rtdb_post("document_versions", version_payload)
        version_id = created_ver["name"]

        rtdb_put(f"document_versions_by_document/{document_id}/{version_id}", True)
        rtdb_put(f"hash_index/{file_hash}", version_id)
        rtdb_patch(f"documents/{document_id}", {"current_version_id": version_id})

        return jsonify({
            "success": True,
            "filename": filename,
            "title": title,
            "document_type": doc_type,
            "file_hash": file_hash,
            "tx_hash": tx_hash,
            "block_number": block_number,
            "uploaded_at": uploaded_at,
            "version": version_number,
            "document_id": document_id,
            "version_id": version_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/verify", methods=["POST"])
def verify():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        f = request.files["file"]
        file_bytes = f.read()
        file_hash = _sha256(file_bytes)

        version_id = rtdb_get(f"hash_index/{file_hash}")
        if not version_id:
            return jsonify({
                "filename": f.filename,
                "file_hash": file_hash,
                "exists_on_chain": False,
                "verdict": "NOT FOUND — no blockchain record for this file"
            })

        version = rtdb_get(f"document_versions/{version_id}") or {}
        document_id = version.get("document_id")
        doc = rtdb_get(f"documents/{document_id}") or {}

        return jsonify({
            "filename": f.filename,
            "file_hash": file_hash,
            "exists_on_chain": True,
            "block_number": version.get("block_number"),
            "uploaded_at": version.get("uploaded_at"),
            "uploader": version.get("uploader"),
            "document_title": doc.get("title", ""),
            "document_type": doc.get("document_type", ""),
            "tx_hash": version.get("tx_hash", ""),
            "document_id": document_id,
            "version_id": version_id,
            "verdict": "AUTHENTIC — hash matches blockchain record"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats", methods=["GET"])
def stats():
    try:
        cache   = _load_cache()
        latest  = w3.eth.block_number
        balance = w3.eth.get_balance(Web3.to_checksum_address(WALLET_ADDRESS))
        return jsonify({
            "total_proofs":      len(cache),
            "latest_block":      latest,
            "wallet_balance":    str(w3.from_wei(balance, "ether")) + " tDCAI",
            "operator_registry": OPERATOR_REGISTRY,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/proofs", methods=["GET"])
def list_proofs():
    try:
        documents = rtdb_get("documents") or {}
        proofs = []

        for document_id, doc in documents.items():
            current_version_id = doc.get("current_version_id")
            if not current_version_id:
                continue

            version = rtdb_get(f"document_versions/{current_version_id}")
            if not version:
                continue

            proofs.append({
                "document_id": document_id,
                "file_hash": version.get("file_hash"),
                "title": doc.get("title", ""),
                "doc_type": doc.get("document_type", ""),
                "filename": version.get("filename", ""),
                "uploaded_at": version.get("uploaded_at"),
                "block_number": version.get("block_number"),
                "tx_hash": version.get("tx_hash", ""),
                "version_number": version.get("version_number", 1)
            })

        proofs.sort(key=lambda x: x.get("block_number") or 0, reverse=True)

        return jsonify({"total": len(proofs), "proofs": proofs})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/history/<document_id>", methods=["GET"])
def history(document_id):
    try:
        doc = rtdb_get(f"documents/{document_id}")
        if not doc:
            return jsonify({"error": "Document not found"}), 404

        version_map = rtdb_get(f"document_versions_by_document/{document_id}") or {}
        versions = []

        for version_id in version_map.keys():
            version = rtdb_get(f"document_versions/{version_id}")
            if not version:
                continue

            versions.append({
                "version_id": version_id,
                "version_number": version.get("version_number", 1),
                "file_hash": version.get("file_hash"),
                "tx_hash": version.get("tx_hash"),
                "block_number": version.get("block_number"),
                "uploaded_at": version.get("uploaded_at"),
                "filename": version.get("filename"),
                "uploader": version.get("uploader"),
                "previous_version_id": version.get("previous_version_id"),
                "is_current": version.get("is_current", False),
                "status": version.get("status", "registered")
            })

        versions.sort(key=lambda x: x.get("version_number", 0), reverse=True)

        return jsonify({
            "document_id": document_id,
            "title": doc.get("title", ""),
            "document_type": doc.get("document_type", ""),
            "current_version_id": doc.get("current_version_id"),
            "versions": versions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print(f"Chain connected  : {w3.is_connected()}")
    print(f"Wallet           : {WALLET_ADDRESS}")
    print(f"OperatorRegistry : {OPERATOR_REGISTRY}")
    print(f"Cached proofs    : {len(_load_cache())}")
    app.run(debug=True, port=5001)