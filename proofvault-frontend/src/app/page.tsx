export default function Home() {
  return (
    <main className="min-h-screen bg-[#EAE0D5] text-[#22333B]">
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#22333B]/70 mb-4">
            Blockchain-backed legal document verification
          </p>

          <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-6">
            ProofVault
          </h1>

          <p className="text-lg text-[#22333B]/80 leading-8 mb-10">
            A secure platform for registering, verifying, and tracking sensitive legal
            documents. ProofVault creates immutable blockchain proof records for wills,
            contracts, and estate documents, making tampering easier to detect and
            authenticity easier to prove.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition"
            >
              Open Dashboard
            </a>
            <a
              href="/upload"
              className="px-6 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-white/60 transition"
            >
              Upload Document
            </a>
            <a
              href="/verify"
              className="px-6 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-white/60 transition"
            >
              Verify Document
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Register Proofs</h2>
            <p className="text-sm text-gray-600 leading-6">
              Upload legal documents and register their proof on-chain with timestamped,
              immutable records.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Verify Authenticity</h2>
            <p className="text-sm text-gray-600 leading-6">
              Re-upload a file at any time to verify whether it matches a stored blockchain
              proof.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Track Records</h2>
            <p className="text-sm text-gray-600 leading-6">
              View stored proof records and transaction details through a clean legal-tech
              dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}