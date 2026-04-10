"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DocumentCard from "@/components/DocumentCard";

const API = "http://127.0.0.1:5001";

type Proof = {
  file_hash: string;
  title: string;
  doc_type: string;
  filename: string;
  uploaded_at: string | null;
  block_number: number;
  tx_hash: string;
};

export default function Dashboard() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const res = await fetch(`${API}/proofs`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load proofs");
        setProofs(data.proofs || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load proofs");
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, []);

  const filteredProofs = useMemo(() => {
    return proofs.filter((proof) => {
      const matchesSearch =
        proof.filename.toLowerCase().includes(search.toLowerCase()) ||
        proof.title.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All Types" || proof.doc_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [proofs, search, typeFilter]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#22333B]">
          Your Documents
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B]"
          />

          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22333B]"
            >
              <option>All Types</option>
              <option>Document</option>
              <option>Will</option>
              <option>Contract</option>
              <option>Inheritance</option>
              <option>Property Agreement</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading documents...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && filteredProofs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">No documents found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProofs.map((proof) => (
          <DocumentCard
            key={proof.file_hash}
            name={proof.filename || proof.title}
            type={proof.doc_type}
            date={proof.uploaded_at || "Unknown date"}
            status="verified"
            historyHref={`/history/${encodeURIComponent(proof.title || proof.filename)}`}
          />
        ))}
      </div>
    </AppShell>
  );
}