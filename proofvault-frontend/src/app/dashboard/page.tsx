// "use client";

// import { useEffect, useMemo, useState } from "react";
// import AppShell from "@/components/AppShell";
// import DocumentCard from "@/components/DocumentCard";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuth } from "@/context/AuthContext";

// const API = "http://127.0.0.1:5001";

// type Proof = {
//   document_id: string;
//   file_hash: string;
//   title: string;
//   doc_type: string;
//   filename: string;
//   uploaded_at: string | null;
//   block_number: number;
//   tx_hash: string;
//   version_number?: number;
//   owner_lawyer_uid?: string;
//   client_uid?: string;
// };

// export default function Dashboard() {
//   const [proofs, setProofs] = useState<Proof[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All Types");
//   const { user, profile, loading: authLoading } = useAuth();
  
//   useEffect(() => {
//     if (authLoading) return;
//     if (!user) return;

//     const fetchProofs = async () => {
//       try {
//         const res = await fetch(`${API}/proofs?user_uid=${user.uid}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load proofs");
//         setProofs(data.proofs || []);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load proofs");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProofs();
//   }, [user, authLoading]);

//   const filteredProofs = useMemo(() => {
//     return proofs.filter((proof) => {
//       const matchesSearch =
//         proof.filename.toLowerCase().includes(search.toLowerCase()) ||
//         proof.title.toLowerCase().includes(search.toLowerCase());

//       const matchesType =
//         typeFilter === "All Types" || proof.doc_type === typeFilter;

//       return matchesSearch && matchesType;
//     });
//   }, [proofs, search, typeFilter]);

//   return (
//     <ProtectedRoute>
//       <AppShell>
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl font-semibold text-[#22333B]">
//             Your Documents
//           </h1>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
//           <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
//             <input
//               type="text"
//               placeholder="Search by file name..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B]"
//             />

//             <div className="flex gap-3">
//               <select
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value)}
//                 className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22333B]"
//               >
//                 <option>All Types</option>
//                 <option>Document</option>
//                 <option>Will</option>
//                 <option>Contract</option>
//                 <option>Inheritance</option>
//                 <option>Property Agreement</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {loading && <p className="text-sm text-gray-600">Loading documents...</p>}
//         {error && <p className="text-sm text-red-600">{error}</p>}

//         {!loading && !error && filteredProofs.length === 0 && (
//           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
//             <p className="text-sm text-gray-600">No documents found.</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {filteredProofs.map((proof) => (
//           <DocumentCard
//             key={proof.file_hash}
//             name={proof.filename || proof.title}
//             type={proof.doc_type}
//             date={proof.uploaded_at || "Unknown date"}
//             status="verified"
//             historyHref={`/history/${proof.document_id}`}
//             canUploadLatest={profile?.role === "lawyer"}
//             latestVersionHref={`/upload?documentId=${proof.document_id}`}
//             canTransfer={profile?.role === "lawyer" && proof.owner_lawyer_uid === user?.uid}
//             transferHref={`/transfer/${proof.document_id}`}
//           />
//           ))}
//         </div>
//       </AppShell>
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DocumentCard from "@/components/DocumentCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";

type Proof = {
  document_id: string;
  file_hash: string;
  title: string;
  doc_type: string;
  filename: string;
  uploaded_at: string | null;
  block_number: number;
  tx_hash: string;
  version_number?: number;
  owner_lawyer_uid?: string;
  client_uid?: string;
};

export default function Dashboard() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchProofs = async () => {
      try {
        const res = await fetch(`${API}/proofs?user_uid=${user.uid}`);
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
  }, [user, authLoading]);

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
    <ProtectedRoute>
      <AppShell>
        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-semibold text-[#22333B]">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : "Your Documents"}
          </h1>
          {!loading && (
            <p className="text-sm text-[#22333B]/50 mt-1">
              {proofs.length} document{proofs.length !== 1 ? "s" : ""} registered
            </p>
          )}
        </div>

        {/* Stats row — only for lawyers */}
        {profile?.role === "lawyer" && !loading && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Documents", value: proofs.length },
              { label: "Verified on Chain", value: proofs.length },
              {
                label: "Document Types",
                value: new Set(proofs.map((p) => p.doc_type)).size,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-200 px-5 py-4"
              >
                <p className="text-2xl font-semibold text-[#22333B]">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 px-4 py-2 rounded-xl border border-gray-200 bg-[#EAE0D5]/50 text-sm text-[#22333B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22333B]/20"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20"
          >
            <option>All Types</option>
            <option>Document</option>
            <option>Will</option>
            <option>Contract</option>
            <option>Inheritance</option>
            <option>Property Agreement</option>
          </select>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 h-52 animate-pulse"
              />
            ))}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredProofs.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-sm font-medium text-[#22333B]">No documents found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || typeFilter !== "All Types"
                ? "Try adjusting your filters"
                : "Documents registered here will appear here"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProofs.map((proof) => (
            <DocumentCard
              key={proof.file_hash}
              name={proof.filename || proof.title}
              type={proof.doc_type}
              date={proof.uploaded_at || "Unknown date"}
              status="verified"
              historyHref={`/history/${proof.document_id}`}
              canUploadLatest={profile?.role === "lawyer"}
              latestVersionHref={`/upload?documentId=${proof.document_id}`}
              canTransfer={
                profile?.role === "lawyer" &&
                proof.owner_lawyer_uid === user?.uid
              }
              transferHref={`/transfer/${proof.document_id}`}
            />
          ))}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}