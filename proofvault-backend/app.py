import requests
import re
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from web3 import Web3
import hashlib, json, os, sqlite3, uuid
from datetime import datetime, timezone
from web3.middleware import ExtraDataToPOAMiddleware
from werkzeug.utils import secure_filename
import difflib
from pypdf import PdfReader
import io
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── CONFIG (loaded from .env) ─────────────────────────────────────────────────
RPC_URL           = os.getenv("RPC_URL")
CHAIN_ID          = int(os.getenv("CHAIN_ID", 18441))
WALLET_ADDRESS    = os.getenv("WALLET_ADDRESS")
PRIVATE_KEY       = os.getenv("PRIVATE_KEY")
OPERATOR_REGISTRY = os.getenv("OPERATOR_REGISTRY")
RTDB_URL          = os.getenv("RTDB_URL")
SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_KEY      = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET   = os.getenv("SUPABASE_BUCKET", "documents")

BASE_DIR      = os.path.dirname(__file__)
DB_FILE       = os.path.join(BASE_DIR, "proofvault.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
CACHE_FILE    = os.path.join(BASE_DIR, "proofs.json")
# ─────────────────────────────────────────────────────────────────────────────

w3 = Web3(Web3.HTTPProvider(RPC_URL))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


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


# ── SUPABASE STORAGE HELPERS ──────────────────────────────────────────────────

def supabase_upload(file_bytes: bytes, file_hash: str, ext: str) -> str:
    """Upload file to Supabase Storage, return public URL."""
    stored_name = f"{file_hash}{ext}"
    try:
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=stored_name,
            file=file_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
    except Exception:
        # File already exists in Supabase — that's fine
        pass

    return supabase.storage.from_(SUPABASE_BUCKET).get_public_url(stored_name)


def supabase_download(file_hash: str, ext: str) -> bytes:
    """Download file bytes from Supabase Storage."""
    stored_name = f"{file_hash}{ext}"
    return supabase.storage.from_(SUPABASE_BUCKET).download(stored_name)


def extract_pdf_text_from_bytes(file_bytes: bytes) -> str:
    """Extract text from PDF bytes (no local file needed)."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        text_parts.append(text)
    return "\n".join(text_parts)


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
        uploaded_by_uid = request.form.get("uploaded_by_uid")
        client_uid = request.form.get("client_uid")

        if not uploaded_by_uid:
            return jsonify({"error": "Missing uploaded_by_uid"}), 400

        if not client_uid:
            return jsonify({"error": "Missing client_uid"}), 400

        uploader_profile = rtdb_get(f"users/{uploaded_by_uid}") or {}
        if uploader_profile.get("role") != "lawyer":
            return jsonify({"error": "Only lawyers can upload"}), 403

        client_profile = rtdb_get(f"users/{client_uid}") or {}
        if client_profile.get("role") != "client":
            return jsonify({"error": "Selected client is invalid"}), 400
        
        filename = secure_filename(f.filename)
        ext = os.path.splitext(filename)[1].lower()

        # ── Upload file to Supabase Storage ──
        file_url = supabase_upload(file_bytes, file_hash, ext)

        # ── Duplicate check by hash ──
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
                "document_id": existing.get("document_id"),
                "file_url": existing.get("file_url", file_url)
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
                "current_version_id": None,
                "owner_lawyer_uid": uploaded_by_uid,
                "client_uid": client_uid,
                "collaborator_uids": {
                    client_uid: True
                },
                "status": "active"
            })
            document_id = created["name"]
            rtdb_put(f"document_lookup/{lookup_key}", document_id)

            # give dashboard access to lawyer + client
            rtdb_put(f"user_documents/{uploaded_by_uid}/{document_id}", True)
            rtdb_put(f"user_documents/{client_uid}/{document_id}", True)

        else:
            doc = rtdb_get(f"documents/{document_id}") or {}
            previous_version_id = doc.get("current_version_id")

            # optional safety: only current owner lawyer can upload new versions
            if doc.get("owner_lawyer_uid") != uploaded_by_uid:
                return jsonify({"error": "Only the assigned lawyer can upload new versions"}), 403

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
            "file_url": file_url,
            "file_ext": ext,
            "tx_hash": tx_hash,
            "block_number": block_number,
            "uploaded_at": uploaded_at,
            "filename": filename,
            "uploader": WALLET_ADDRESS,
            "stored_path": file_url,
            "uploaded_by_uid": uploaded_by_uid,
            "uploader_wallet": WALLET_ADDRESS,
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
            "file_url": file_url,
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
        user_uid = request.args.get("user_uid")
        if not user_uid:
            return jsonify({"error": "Missing user_uid"}), 400

        document_map = rtdb_get(f"user_documents/{user_uid}") or {}
        proofs = []

        for document_id in document_map.keys():
            doc = rtdb_get(f"documents/{document_id}")
            if not doc:
                continue

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
                "version_number": version.get("version_number", 1),
                "owner_lawyer_uid": doc.get("owner_lawyer_uid"),
                "client_uid": doc.get("client_uid")
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


@app.route("/file/<version_id>", methods=["GET"])
def get_file(version_id):
    try:
        version = rtdb_get(f"document_versions/{version_id}")
        if not version:
            return jsonify({"error": "Version not found"}), 404

        file_hash = version.get("file_hash")
        ext = version.get("file_ext", ".pdf")

        # ── Download from Supabase Storage ──
        file_bytes = supabase_download(file_hash, ext)

        return send_file(
            io.BytesIO(file_bytes),
            mimetype="application/pdf",
            as_attachment=False,
            download_name=version.get("filename", f"{file_hash}{ext}")
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
    
@app.route("/compare/<old_version_id>/<new_version_id>", methods=["GET"])
def compare_versions(old_version_id, new_version_id):
    try:
        old_v = rtdb_get(f"document_versions/{old_version_id}")
        new_v = rtdb_get(f"document_versions/{new_version_id}")

        if not old_v or not new_v:
            return jsonify({"error": "One or both versions not found"}), 404

        old_hash = old_v.get("file_hash")
        new_hash = new_v.get("file_hash")
        old_ext  = old_v.get("file_ext", ".pdf")
        new_ext  = new_v.get("file_ext", ".pdf")

        if not old_hash:
            return jsonify({"error": "Old version file hash missing"}), 404
        if not new_hash:
            return jsonify({"error": "New version file hash missing"}), 404

        # ── Download both files from Supabase ──
        old_bytes = supabase_download(old_hash, old_ext)
        new_bytes = supabase_download(new_hash, new_ext)

        old_text = extract_pdf_text_from_bytes(old_bytes)
        new_text = extract_pdf_text_from_bytes(new_bytes)

        old_lines = old_text.splitlines()
        new_lines = new_text.splitlines()

        diff = list(difflib.ndiff(old_lines, new_lines))

        old_diff = []
        new_diff = []

        for line in diff:
            if line.startswith("- "):
                old_diff.append({"type": "removed", "text": line[2:]})
            elif line.startswith("+ "):
                new_diff.append({"type": "added", "text": line[2:]})
            elif line.startswith("  "):
                old_diff.append({"type": "same", "text": line[2:]})
                new_diff.append({"type": "same", "text": line[2:]})

        return jsonify({
            "old_version_id": old_version_id,
            "new_version_id": new_version_id,
            "old_file_url": f"http://127.0.0.1:5001/file/{old_version_id}",
            "new_file_url": f"http://127.0.0.1:5001/file/{new_version_id}",
            "old_diff": old_diff,
            "new_diff": new_diff
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/users/clients", methods=["GET"])
def list_clients():
    try:
        users = rtdb_get("users") or {}
        clients = []

        for uid, user in users.items():
            if user.get("role") == "client":
                clients.append({
                    "uid": uid,
                    "full_name": user.get("full_name", ""),
                    "email": user.get("email", "")
                })

        clients.sort(key=lambda x: x["full_name"].lower())
        return jsonify({"clients": clients})

    except Exception as e:
        return jsonify({"error": str(e)}), 500 
    

@app.route("/documents/<document_id>/transfer", methods=["POST"])
def transfer_document_ownership(document_id):
    try:
        data = request.get_json()

        current_lawyer_uid = data.get("current_lawyer_uid")
        new_lawyer_uid = data.get("new_lawyer_uid")
        remove_old_lawyer_access = data.get("remove_old_lawyer_access", True)

        if not current_lawyer_uid or not new_lawyer_uid:
            return jsonify({"error": "Missing current_lawyer_uid or new_lawyer_uid"}), 400

        doc = rtdb_get(f"documents/{document_id}")
        if not doc:
            return jsonify({"error": "Document not found"}), 404

        if doc.get("owner_lawyer_uid") != current_lawyer_uid:
            return jsonify({"error": "Only the current owner lawyer can transfer ownership"}), 403

        current_profile = rtdb_get(f"users/{current_lawyer_uid}") or {}
        new_profile = rtdb_get(f"users/{new_lawyer_uid}") or {}

        if current_profile.get("role") != "lawyer":
            return jsonify({"error": "Current user is not a lawyer"}), 400

        if new_profile.get("role") != "lawyer":
            return jsonify({"error": "New owner must be a lawyer"}), 400

        if current_lawyer_uid == new_lawyer_uid:
            return jsonify({"error": "New lawyer must be different from current lawyer"}), 400

        transferred_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # update owner
        rtdb_patch(f"documents/{document_id}", {
            "owner_lawyer_uid": new_lawyer_uid
        })

        # give new lawyer access
        rtdb_put(f"user_documents/{new_lawyer_uid}/{document_id}", True)

        # optionally remove old lawyer access
        if remove_old_lawyer_access:
            rtdb_delete(f"user_documents/{current_lawyer_uid}/{document_id}")

        # audit log
        transfer_event = {
            "from_lawyer_uid": current_lawyer_uid,
            "to_lawyer_uid": new_lawyer_uid,
            "transferred_at": transferred_at
        }
        rtdb_post(f"documents/{document_id}/ownership_history", transfer_event)

        return jsonify({
            "success": True,
            "document_id": document_id,
            "old_owner_lawyer_uid": current_lawyer_uid,
            "new_owner_lawyer_uid": new_lawyer_uid,
            "transferred_at": transferred_at
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/users/lawyers", methods=["GET"])
def list_lawyers():
    try:
        users = rtdb_get("users") or {}
        lawyers = []

        for uid, user in users.items():
            if user.get("role") == "lawyer":
                lawyers.append({
                    "uid": uid,
                    "full_name": user.get("full_name", ""),
                    "email": user.get("email", "")
                })

        lawyers.sort(key=lambda x: x["full_name"].lower())
        return jsonify({"lawyers": lawyers})

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