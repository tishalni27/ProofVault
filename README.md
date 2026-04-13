# ProofVault

> *Trust meets technology* — Blockchain-Based Legal Document Preservation System

ProofVault is a full-stack SaaS platform that brings cryptographic trust to legal documents. Lawyers upload documents, which are hashed and anchored permanently on the **DCAI L3 blockchain**. Clients get controlled access, every version is tracked, and an AI checker validates completeness which are all backed by **Firebase** and **Supabase**.

---

## Usage Guide

Once all services are running, open **`http://localhost:3000`** in your browser to access ProofVault.

### 1. Create an Account

On the landing page, click **Sign Up** and register for an account. During registration, choose your role:

- **Lawyer** — full access to upload, manage, verify, and register documents on the blockchain
- **Client** — access to documents your lawyer has shared with you

---

### 2. Lawyer Flow

**Log in** to your account and you'll be taken to the dashboard.

**Overview** — Click **Overview** in the sidebar to see all your registered documents, their blockchain verification status, and quick action buttons (Verify, History, New Version, Transfer) for each one.

**Upload a document** — Click **Upload** in the sidebar. Select your PDF legal document and submit it. The document is saved and ready for review.

**Run the AI Checker** — On the uploaded document, click **AI Checker**. ProofVault will analyze the document for completeness — checking for missing sections, unsigned fields, blank placeholders, and more — and return a score out of 100 with a detailed breakdown.

**Register on blockchain** — Once you're satisfied with the document, click **Register Document**. ProofVault generates a SHA-256 hash and anchors it permanently on the DCAI L3 blockchain. A transaction ID is returned and saved as tamper-proof evidence of the document's authenticity.

**Manage clients** — Click **Clients** in the sidebar to view all clients assigned to you and manage their access to documents.

---

### 3. Client Flow

**Log in** to your account using the credentials you registered with.

**View documents** — You'll see all documents your lawyer has shared with you. Click any document to open it and check its blockchain verification status.

**Verify authenticity** — Click **Verify** on any document to confirm its hash matches the on-chain record, proving it hasn't been altered since it was registered.

---

## The Problem

Legal documents today are vulnerable and hard to trust — they can be tampered with, are difficult to verify, have no clear version history, unclear ownership, and manual checking is slow.

---

## Key Features

| Feature | Description |
|---|---|
| **Blockchain Verification** | Cryptographic proof of authenticity via DCAI L3 |
| **Ownership Transfer** | Documents move like digital assets between parties |
| **Version History** | Every change tracked and preserved with full audit trail |
| **Side-by-Side Compare** | Diff viewer to compare any two document versions |
| **AI Document Checker** | Smart completeness analysis powered by AI |
| **Role-Based Access** | Lawyers and clients only see what they're permitted to |

---

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│    Database      │────▶│  Blockchain │
│  Next.js UI │     │  Flask API  │     │ Firebase+Supabase│     │   DCAI L3   │
└─────────────┘     └─────────────┘     └──────────────────┘     └─────────────┘
```

---

## How It Works

```
01  Lawyer uploads document
        ↓
02  File is hashed (SHA-256)
        ↓
03  Hash stored on DCAI L3 blockchain → TX ID returned (~2s)
        ↓
04  Metadata saved in Firebase
        ↓
05  Client gets access (role-based)
        ↓
06  Versions tracked over time
```

No raw document content is ever stored on-chain — only its SHA-256 fingerprint. If a document is tampered with after submission, its hash will no longer match the on-chain record. Every transaction is verifiable on the **DCAI Block Explorer**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Flask (Python) + Node.js microservices |
| Database | Supabase (relational) + Firebase (auth + real-time) |
| Blockchain | DCAI L3 |


---

## Project Structure

```
├── proofvault-backend/
│   ├── app.py               # Main Flask API server
│   ├── test_ai.js           # AI analysis service
│   └── will_checker.js      # Will checker microservice
├── proofvault-frontend/
│   └── ...                  # Next.js frontend
├── test.js                  # Script to test will checker endpoint
├── test.pdf                 # Sample PDF for testing
└── README.md
```

---

## Getting Started

Follow these steps **in order**. Each service must be running before starting the next.

### Step 1 — Start the Main Backend

```bash
cd proofvault-backend
pip install -r requirements.txt   # first time only
python app.py
```

Runs at `http://127.0.0.1:5000`

### Step 2 — Start the AI Service

Open a **new terminal**:

```bash
cd proofvault-backend
node test_ai.js
```

Runs at `http://127.0.0.1:5001`

### Step 3 — Start the Will Checker

Open another **new terminal**:

```bash
cd proofvault-backend
npm install        # first time only
node will_checker.js
```

Runs at `http://127.0.0.1:5002`

### Step 4 — Start the Frontend

Open another **new terminal**:

```bash
cd proofvault-frontend
npm install        # first time only
npm run dev
```

Once running, open your browser and go to **`http://localhost:3000`** — this is the ProofVault web app. You can sign up, log in, and use the full platform from here.

---

## Testing the Will Checker

1. Make sure `will_checker.js` is running
2. Place a PDF named `test.pdf` in the project root
3. Run:

```bash
node test.js
```

Expected output:

```
starting test...
STATUS: 200
{
  score: 85,
  status: 'Likely complete with minor review needed',
  issues: [...],
  section_results: { testator_name: true, date: true, ... },
  ...
}
```

---

## AI Scoring Logic

The AI will checker scores uploaded documents out of 100 and flags issues.

| Section | Penalty if Missing |
|---|---|
| Testator name | −20 |
| Date | −15 |
| Witness section | −15 |
| Beneficiary | −15 |
| Executor | −15 |
| Signature section | −10 |
| Draft placeholders (`[...]`, `TBD`, `XXX`) | up to −24 |
| Blank fill-in lines | up to −12 |
| Unsigned signature line | −20 |
| Missing witness/testator names | −12 each |
| Blank key fields | −10 each |

**Status labels:**

- `Likely complete` — score ≥ 90
- `Likely complete with minor review needed` — score ≥ 75
- `Unsigned / incomplete` — blank signature line detected
- `Draft / placeholders unresolved` — `[...]`, `TBD`, or `XXX` found
- `Likely incomplete` — score < 75

---

