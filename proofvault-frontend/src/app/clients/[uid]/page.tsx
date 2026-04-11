// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import AppShell from "@/components/AppShell";
// import DocumentCard from "@/components/DocumentCard";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuth } from "@/context/AuthContext";

// const API = "http://127.0.0.1:5001";

// type Client = {
//   uid: string;
//   full_name: string;
//   email: string;
// };

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

// function getInitials(name: string) {
//   return name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);
// }

// const AVATAR_COLORS = [
//   "bg-blue-100 text-blue-800",
//   "bg-purple-100 text-purple-800",
//   "bg-emerald-100 text-emerald-800",
//   "bg-amber-100 text-amber-800",
//   "bg-rose-100 text-rose-800",
//   "bg-teal-100 text-teal-800",
// ];

// function avatarColor(name: string) {
//   const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
//   return AVATAR_COLORS[idx];
// }

// export default function ClientDetailPage() {
//   const { user } = useAuth();
//   const params = useParams();
//   const uid = params?.uid as string;

//   const [client, setClient] = useState<Client | null>(null);
//   const [documents, setDocuments] = useState<Proof[]>([]);
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All Types");
//   const [loadingClient, setLoadingClient] = useState(true);
//   const [loadingDocs, setLoadingDocs] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch client info
//   useEffect(() => {
//     if (!uid) return;
//     const fetchClient = async () => {
//       try {
//         const res = await fetch(`${API}/users/clients`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load clients");
//         const found = (data.clients || []).find((c: Client) => c.uid === uid);
//         setClient(found || null);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load client");
//       } finally {
//         setLoadingClient(false);
//       }
//     };
//     fetchClient();
//   }, [uid]);

//   // Fetch documents for this client
//   useEffect(() => {
//     if (!uid) return;
//     const fetchDocs = async () => {
//       try {
//         const res = await fetch(`${API}/proofs?user_uid=${uid}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load documents");
//         setDocuments(data.proofs || []);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load documents");
//       } finally {
//         setLoadingDocs(false);
//       }
//     };
//     fetchDocs();
//   }, [uid]);

//   const filtered = documents.filter((proof) => {
//     const matchesSearch =
//       proof.filename.toLowerCase().includes(search.toLowerCase()) ||
//       proof.title.toLowerCase().includes(search.toLowerCase());
//     const matchesType =
//       typeFilter === "All Types" || proof.doc_type === typeFilter;
//     return matchesSearch && matchesType;
//   });

//   const loading = loadingClient || loadingDocs;

//   return (
//     <ProtectedRoute allowedRoles={["lawyer"]}>
//       <AppShell>
//         {/* Back link */}
//         <a
//           href="/clients"
//           className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#22333B] transition mb-6"
//         >
//           ← Back to Clients
//         </a>

//         {/* Client header */}
//         {loadingClient ? (
//           <div className="mb-8">
//             <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-2" />
//             <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
//           </div>
//         ) : client ? (
//           <div className="flex items-center gap-4 mb-8">
//             <div
//               className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 ${avatarColor(
//                 client.full_name
//               )}`}
//             >
//               {getInitials(client.full_name)}
//             </div>
//             <div>
//               <h1 className="text-2xl font-semibold text-[#22333B]">
//                 {client.full_name}
//               </h1>
//               <p className="text-sm text-gray-500">{client.email}</p>
//             </div>
//           </div>
//         ) : (
//           <p className="text-sm text-red-600 mb-8">Client not found.</p>
//         )}

//         {/* Filter bar */}
//         <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
//           <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
//             <input
//               type="text"
//               placeholder="Search documents…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B] text-sm"
//             />
//             <select
//               value={typeFilter}
//               onChange={(e) => setTypeFilter(e.target.value)}
//               className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22333B]"
//             >
//               <option>All Types</option>
//               <option>Document</option>
//               <option>Will</option>
//               <option>Contract</option>
//               <option>Inheritance</option>
//               <option>Property Agreement</option>
//             </select>
//           </div>
//         </div>

//         {/* Document count */}
//         {!loading && (
//           <p className="text-sm text-gray-500 mb-4">
//             {filtered.length} document{filtered.length !== 1 ? "s" : ""}
//             {typeFilter !== "All Types" || search ? " matching filters" : ""}
//           </p>
//         )}

//         {/* States */}
//         {error && <p className="text-sm text-red-600 mb-4">❌ {error}</p>}
//         {loadingDocs && (
//           <p className="text-sm text-gray-500">Loading documents…</p>
//         )}

//         {!loadingDocs && !error && filtered.length === 0 && (
//           <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
//             <p className="text-sm text-gray-500">No documents found.</p>
//           </div>
//         )}

//         {/* Documents grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {filtered.map((proof) => (
//             <DocumentCard
//               key={proof.file_hash}
//               name={proof.filename || proof.title}
//               type={proof.doc_type}
//               date={proof.uploaded_at || "Unknown date"}
//               status="verified"
//               historyHref={`/history/${proof.document_id}`}
//               canUploadLatest={true}
//               latestVersionHref={`/upload?documentId=${proof.document_id}`}
//               canTransfer={proof.owner_lawyer_uid === user?.uid}
//               transferHref={`/transfer/${proof.document_id}`}
//             />
//           ))}
//         </div>
//       </AppShell>
//     </ProtectedRoute>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import DocumentCard from "@/components/DocumentCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";

type Client = { uid: string; full_name: string; email: string };

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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_BG = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function avatarColor(name: string) {
  return AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length];
}

export default function ClientDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const uid = params?.uid as string;

  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Proof[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/users/clients`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const found = (data.clients || []).find((c: Client) => c.uid === uid);
        setClient(found || null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load client");
      } finally {
        setLoadingClient(false);
      }
    };
    fetch_();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/proofs?user_uid=${uid}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDocuments(data.proofs || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load documents");
      } finally {
        setLoadingDocs(false);
      }
    };
    fetch_();
  }, [uid]);

  const filtered = documents.filter((proof) => {
    const matchesSearch =
      proof.filename.toLowerCase().includes(search.toLowerCase()) ||
      proof.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || proof.doc_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        {/* Back */}
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-xs text-[#22333B]/50 hover:text-[#22333B] transition mb-6 font-medium"
        >
          ← Back to Clients
        </Link>

        {/* Client header */}
        {loadingClient ? (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ) : client ? (
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-semibold shrink-0 ${avatarColor(client.full_name)}`}>
              {getInitials(client.full_name)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#22333B]">{client.full_name}</h1>
              <p className="text-sm text-[#22333B]/50">{client.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600 mb-8">Client not found.</p>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            id="doc-search"
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-200 bg-[#EAE0D5]/40 text-sm text-[#22333B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22333B]/20"
          />
          <select
            id="type-filter"
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

        {!loadingDocs && (
          <p className="text-xs text-[#22333B]/40 mb-4 font-medium">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loadingDocs && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 h-52 animate-pulse" />
            ))}
          </div>
        )}

        {!loadingDocs && !error && filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm font-medium text-[#22333B]">No documents found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || typeFilter !== "All Types"
                ? "Try adjusting your filters"
                : "No documents registered for this client yet"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((proof) => (
            <DocumentCard
              key={proof.file_hash}
              name={proof.filename || proof.title}
              type={proof.doc_type}
              date={proof.uploaded_at || "Unknown date"}
              status="verified"
              historyHref={`/history/${proof.document_id}`}
              canUploadLatest={true}
              latestVersionHref={`/upload?documentId=${proof.document_id}`}
              canTransfer={proof.owner_lawyer_uid === user?.uid}
              transferHref={`/transfer/${proof.document_id}`}
            />
          ))}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}