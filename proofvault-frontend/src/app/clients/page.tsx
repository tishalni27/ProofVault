// "use client";

// import { useEffect, useState } from "react";
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

// export default function ClientsPage() {
//   const { user } = useAuth();

//   const [clients, setClients] = useState<Client[]>([]);
//   const [selectedClient, setSelectedClient] = useState<Client | null>(null);
//   const [documents, setDocuments] = useState<Proof[]>([]);
//   const [loadingClients, setLoadingClients] = useState(true);
//   const [loadingDocs, setLoadingDocs] = useState(false);
//   const [clientsError, setClientsError] = useState("");
//   const [docsError, setDocsError] = useState("");

//   // Fetch all clients on mount
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const res = await fetch(`${API}/users/clients`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load clients");
//         setClients(data.clients || []);
//       } catch (e: unknown) {
//         setClientsError(e instanceof Error ? e.message : "Failed to load clients");
//       } finally {
//         setLoadingClients(false);
//       }
//     };

//     fetchClients();
//   }, []);

//   // Fetch documents for selected client
//   const handleSelectClient = async (client: Client) => {
//     if (selectedClient?.uid === client.uid) {
//       setSelectedClient(null);
//       setDocuments([]);
//       return;
//     }

//     setSelectedClient(client);
//     setDocuments([]);
//     setDocsError("");
//     setLoadingDocs(true);

//     try {
//       const res = await fetch(`${API}/proofs?user_uid=${client.uid}`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to load documents");
//       setDocuments(data.proofs || []);
//     } catch (e: unknown) {
//       setDocsError(e instanceof Error ? e.message : "Failed to load documents");
//     } finally {
//       setLoadingDocs(false);
//     }
//   };

//   return (
//     <ProtectedRoute allowedRoles={["lawyer"]}>
//       <AppShell>
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold text-[#22333B]">Clients</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Select a client to view their registered documents.
//           </p>
//         </div>

//         <div className="flex gap-6 items-start">
//           {/* ── Client List ── */}
//           <div className="w-80 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <p className="text-sm font-semibold text-[#22333B]">
//                 All Clients
//               </p>
//             </div>

//             {loadingClients && (
//               <p className="text-sm text-gray-500 px-5 py-4">Loading clients…</p>
//             )}

//             {clientsError && (
//               <p className="text-sm text-red-600 px-5 py-4">❌ {clientsError}</p>
//             )}

//             {!loadingClients && !clientsError && clients.length === 0 && (
//               <p className="text-sm text-gray-500 px-5 py-4">No clients found.</p>
//             )}

//             <ul className="divide-y divide-gray-100">
//               {clients.map((client) => {
//                 const isSelected = selectedClient?.uid === client.uid;
//                 return (
//                   <li key={client.uid}>
//                     <button
//                       onClick={() => handleSelectClient(client)}
//                       className={`w-full text-left px-5 py-4 transition hover:bg-[#f5f0eb] ${
//                         isSelected ? "bg-[#22333B] hover:bg-[#22333B]" : ""
//                       }`}
//                     >
//                       <p
//                         className={`text-sm font-semibold ${
//                           isSelected ? "text-[#EAE0D5]" : "text-[#22333B]"
//                         }`}
//                       >
//                         {client.full_name}
//                       </p>
//                       <p
//                         className={`text-xs mt-0.5 truncate ${
//                           isSelected ? "text-[#EAE0D5]/70" : "text-gray-500"
//                         }`}
//                       >
//                         {client.email}
//                       </p>
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>

//           {/* ── Documents Panel ── */}
//           <div className="flex-1">
//             {!selectedClient && (
//               <div className="flex items-center justify-center h-64 bg-white border border-dashed border-gray-300 rounded-xl">
//                 <p className="text-sm text-gray-400">
//                   ← Select a client to view their documents
//                 </p>
//               </div>
//             )}

//             {selectedClient && (
//               <>
//                 <div className="mb-5 flex items-center justify-between">
//                   <div>
//                     <h2 className="text-lg font-semibold text-[#22333B]">
//                       {selectedClient.full_name}
//                     </h2>
//                     <p className="text-sm text-gray-500">{selectedClient.email}</p>
//                   </div>
//                   {!loadingDocs && (
//                     <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
//                       {documents.length} document{documents.length !== 1 ? "s" : ""}
//                     </span>
//                   )}
//                 </div>

//                 {loadingDocs && (
//                   <p className="text-sm text-gray-500">Loading documents…</p>
//                 )}

//                 {docsError && (
//                   <p className="text-sm text-red-600">❌ {docsError}</p>
//                 )}

//                 {!loadingDocs && !docsError && documents.length === 0 && (
//                   <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
//                     <p className="text-sm text-gray-500">
//                       No documents found for this client.
//                     </p>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
//                   {documents.map((proof) => (
//                     <DocumentCard
// //                       key={proof.file_hash}
// //                       name={proof.filename || proof.title}
// //                       type={proof.doc_type}
// //                       date={proof.uploaded_at || "Unknown date"}
// //                       status="verified"
// //                       historyHref={`/history/${proof.document_id}`}
// //                       canUploadLatest={true}
// //                       latestVersionHref={`/upload?documentId=${proof.document_id}`}
// //                       canTransfer={proof.owner_lawyer_uid === user?.uid}
// //                       transferHref={`/transfer/${proof.document_id}`}
// //                     />
// //                   ))}
// //                 </div>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </AppShell>
// //     </ProtectedRoute>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import AppShell from "@/components/AppShell";
// import ProtectedRoute from "@/components/ProtectedRoute";

// const API = "http://127.0.0.1:5001";

// type Client = {
//   uid: string;
//   full_name: string;
//   email: string;
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

// export default function ClientsPage() {
//   const [clients, setClients] = useState<Client[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const res = await fetch(`${API}/users/clients`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load clients");
//         setClients(data.clients || []);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load clients");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchClients();
//   }, []);

//   const filtered = clients.filter(
//     (c) =>
//       c.full_name.toLowerCase().includes(search.toLowerCase()) ||
//       c.email.toLowerCase().includes(search.toLowerCase())
//   );

//   // Group by first letter
//   const grouped = filtered.reduce<Record<string, Client[]>>((acc, client) => {
//     const letter = client.full_name[0].toUpperCase();
//     if (!acc[letter]) acc[letter] = [];
//     acc[letter].push(client);
//     return acc;
//   }, {});

//   const letters = Object.keys(grouped).sort();

//   return (
//     <ProtectedRoute allowedRoles={["lawyer"]}>
//       <AppShell>
//         <div className="max-w-3xl">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-2xl font-semibold text-[#22333B]">Clients</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               {loading
//                 ? "Loading…"
//                 : `${clients.length} client${clients.length !== 1 ? "s" : ""} total`}
//             </p>
//           </div>

//           {/* Search */}
//           <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
//             <input
//               type="text"
//               placeholder="Search by name or email…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B] text-sm"
//             />
//           </div>

//           {/* States */}
//           {loading && <p className="text-sm text-gray-500">Loading clients…</p>}
//           {error && <p className="text-sm text-red-600">❌ {error}</p>}
//           {!loading && !error && filtered.length === 0 && (
//             <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
//               <p className="text-sm text-gray-500">No clients found.</p>
//             </div>
//           )}

//           {/* Alphabetical list */}
//           {!loading &&
//             !error &&
//             letters.map((letter) => (
//               <div key={letter} className="mb-6">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
//                   {letter}
//                 </p>
//                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//                   {grouped[letter].map((client, i) => (
//                     <a
//                       key={client.uid}
//                       href={`/clients/${client.uid}`}
//                       className={`flex items-center gap-4 px-5 py-4 hover:bg-[#f5f0eb] transition group ${
//                         i !== 0 ? "border-t border-gray-100" : ""
//                       }`}
//                     >
//                       {/* Avatar */}
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor(
//                           client.full_name
//                         )}`}
//                       >
//                         {getInitials(client.full_name)}
//                       </div>

//                       {/* Info */}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-[#22333B] group-hover:underline">
//                           {client.full_name}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           {client.email}
//                         </p>
//                       </div>

//                       {/* Arrow */}
//                       <span className="text-gray-300 group-hover:text-[#22333B] transition text-lg">
//                         →
//                       </span>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             ))}
//         </div>
//       </AppShell>
//     </ProtectedRoute>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = "http://127.0.0.1:5001";

type Client = {
  uid: string;
  full_name: string;
  email: string;
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${API}/users/clients`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load clients");
        setClients(data.clients || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Client[]>>((acc, client) => {
    const letter = client.full_name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(client);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        <div className="max-w-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
              Clients
            </p>
            <h1 className="text-2xl font-semibold text-[#22333B]">All Clients</h1>
            <p className="text-sm text-[#22333B]/50 mt-1">
              {loading ? "Loading…" : `${clients.length} client${clients.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <input
              id="client-search"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#EAE0D5]/40 text-sm text-[#22333B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22333B]/20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 h-16 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-2xl mb-2">👤</p>
              <p className="text-sm font-medium text-[#22333B]">No clients found</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? "Try a different search term" : "No clients registered yet"}
              </p>
            </div>
          )}

          {!loading && !error && letters.map((letter) => (
            <div key={letter} className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22333B]/30 mb-2 px-1">
                {letter}
              </p>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {grouped[letter].map((client, i) => (
                  <Link
                    key={client.uid}
                    href={`/clients/${client.uid}`}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-[#EAE0D5]/40 transition group ${
                      i !== 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(client.full_name)}`}>
                      {getInitials(client.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#22333B] group-hover:underline truncate">
                        {client.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{client.email}</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#22333B] transition shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}