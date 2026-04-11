
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

        # Save file locally
        filename = secure_filename(f.filename)
        ext = os.path.splitext(filename)[1]
        stored_name = f"{file_hash}{ext}"
        stored_path = os.path.join(UPLOAD_FOLDER, stored_name)
        print("DEBUG upload path:", stored_path)

        with open(stored_path, "wb") as out:
            out.write(file_bytes)

        print("DEBUG file saved:", os.path.exists(stored_path), stored_path)

        conn = get_db()
        cur = conn.cursor()

        # Check if document already exists (by title + type)
        cur.execute(
            "SELECT * FROM documents WHERE title=? AND document_type=?",
            (title, doc_type),
        )
        doc = cur.fetchone()

        if doc:
            document_id = doc["id"]

            # Get latest version
            cur.execute(
                "SELECT * FROM document_versions WHERE document_id=? AND is_current=1",
                (document_id,),
            )
            prev = cur.fetchone()

            version_number = prev["version_number"] + 1 if prev else 1
            previous_version_id = prev["id"] if prev else None

            # mark old version as not current
            if prev:
                cur.execute(
                    "UPDATE document_versions SET is_current=0 WHERE id=?",
                    (prev["id"],),
                )

        else:
            # create new document
            cur.execute(
                "INSERT INTO documents (title, document_type, created_at) VALUES (?, ?, ?)",
                (title, doc_type, datetime.utcnow().isoformat()),
            )
            document_id = cur.lastrowid
            version_number = 1
            previous_version_id = None

        # send blockchain proof
        tx_hash, receipt = _send_proof_tx(file_hash, title, doc_type)

        if receipt.status != 1:
            return jsonify({"error": "Transaction failed"}), 500

        block_number = receipt.blockNumber
        blk = w3.eth.get_block(block_number)
        ts = blk["timestamp"]

        # insert version
        cur.execute(
            """
            INSERT INTO document_versions
            (document_id, version_number, file_hash, tx_hash, block_number,
             uploaded_at, filename, stored_path, uploader, previous_version_id, is_current)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (
                document_id,
                version_number,
                file_hash,
                tx_hash,
                block_number,
                _now_utc(ts),
                filename,
                stored_path,
                WALLET_ADDRESS,
                previous_version_id,
            ),
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "filename": filename,
            "title": title,
            "document_type": doc_type,
            "file_hash": file_hash,
            "tx_hash": tx_hash,
            "block_number": block_number,
            "uploaded_at": _now_utc(ts),
            "version": version_number,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/verify", methods=["POST"])
def verify():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        f          = request.files["file"]
        file_bytes = f.read()
        file_hash  = _sha256(file_bytes)

        # 1. Fast path: local cache
        cache = _load_cache()
        entry = cache.get(file_hash)

        # 2. Slow fallback: scan chain
        if not entry:
            entry = _scan_chain_for_hash(file_hash)

        if entry:
            ts = entry.get("timestamp", 0)
            return jsonify({
                "filename":        f.filename,
                "file_hash":       file_hash,
                "exists_on_chain": True,
                "block_number":    entry.get("block_number"),
                "timestamp":       ts,
                "uploaded_at":     _now_utc(ts) if ts else None,
                "uploader":        entry.get("uploader", WALLET_ADDRESS),
                "document_title":  entry.get("title", ""),
                "document_type":   entry.get("doc_type", ""),
                "tx_hash":         entry.get("tx_hash", ""),
                "verdict":         " AUTHENTIC — hash matches blockchain record",
            })
        else:
            return jsonify({
                "filename":        f.filename,
                "file_hash":       file_hash,
                "exists_on_chain": False,
                "verdict":         " NOT FOUND — no blockchain record for this file",
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
    """List all uploaded proofs (for demo/frontend use)."""
    try:
        cache = _load_cache()
        proofs = []
        for file_hash, entry in cache.items():
            ts = entry.get("timestamp", 0)
            proofs.append({
                "file_hash":    file_hash,
                "title":        entry.get("title", ""),
                "doc_type":     entry.get("doc_type", ""),
                "filename":     entry.get("filename", ""),
                "uploaded_at":  _now_utc(ts) if ts else None,
                "block_number": entry.get("block_number"),
                "tx_hash":      entry.get("tx_hash", ""),
            })
        # Sort newest first
        proofs.sort(key=lambda x: x.get("block_number") or 0, reverse=True)
        return jsonify({"total": len(proofs), "proofs": proofs})
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