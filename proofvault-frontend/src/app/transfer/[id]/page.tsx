// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import AppShell from "@/components/AppShell";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuth } from "@/context/AuthContext";

// const API = "http://127.0.0.1:5001";

// type Lawyer = {
//   uid: string;
//   full_name: string;
//   email: string;
// };

// export default function TransferOwnershipPage() {
//   const params = useParams<{ id: string }>();
//   const router = useRouter();
//   const { user, profile } = useAuth();

//   const [lawyers, setLawyers] = useState<Lawyer[]>([]);
//   const [selectedLawyer, setSelectedLawyer] = useState("");
//   const [removeOldAccess, setRemoveOldAccess] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     const fetchLawyers = async () => {
//       try {
//         const res = await fetch(`${API}/users/lawyers`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to load lawyers");

//         const filtered = (data.lawyers || []).filter(
//           (lawyer: Lawyer) => lawyer.uid !== user?.uid
//         );

//         setLawyers(filtered);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load lawyers");
//       } finally {
//         setFetching(false);
//       }
//     };

//     if (user) fetchLawyers();
//   }, [user]);

//   const handleTransfer = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!user?.uid) {
//       setError("You must be logged in.");
//       return;
//     }

//     if (!selectedLawyer) {
//       setError("Please select a new lawyer.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${API}/documents/${params.id}/transfer`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           current_lawyer_uid: user.uid,
//           new_lawyer_uid: selectedLawyer,
//           remove_old_lawyer_access: removeOldAccess
//         })
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Transfer failed");

//       setSuccess("Ownership transferred successfully.");
//       setTimeout(() => {
//         router.push("/dashboard");
//       }, 1200);
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Transfer failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ProtectedRoute allowedRoles={["lawyer"]}>
//       <AppShell>
//         <div className="max-w-2xl">
//           <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
//             Transfer Document Ownership
//           </h1>
//           <p className="text-sm text-gray-600 mb-8">
//             Assign this document and its full history to another lawyer.
//           </p>

//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
//             {fetching ? (
//               <p className="text-sm text-gray-600">Loading lawyers...</p>
//             ) : (
//               <form onSubmit={handleTransfer} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-[#22333B] mb-2">
//                     New Lawyer
//                   </label>
//                   <select
//                     value={selectedLawyer}
//                     onChange={(e) => setSelectedLawyer(e.target.value)}
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B]"
//                   >
//                     <option value="">Select a lawyer</option>
//                     {lawyers.map((lawyer) => (
//                       <option key={lawyer.uid} value={lawyer.uid}>
//                         {lawyer.full_name} ({lawyer.email})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <label className="flex items-center gap-3 text-sm text-gray-700">
//                   <input
//                     type="checkbox"
//                     checked={removeOldAccess}
//                     onChange={(e) => setRemoveOldAccess(e.target.checked)}
//                   />
//                   Remove old lawyer access after transfer
//                 </label>

//                 {error && <p className="text-sm text-red-600">{error}</p>}
//                 {success && <p className="text-sm text-green-600">{success}</p>}

//                 <div className="flex justify-end gap-3">
//                   <a
//                     href="/dashboard"
//                     className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition"
//                   >
//                     Cancel
//                   </a>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition disabled:opacity-50"
//                   >
//                     {loading ? "Transferring..." : "Transfer Ownership"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </AppShell>
//     </ProtectedRoute>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";

type Lawyer = {
  uid: string;
  full_name: string;
  email: string;
};

export default function TransferOwnershipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [removeOldAccess, setRemoveOldAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${API}/users/lawyers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load lawyers");
        const filtered = (data.lawyers || []).filter(
          (l: Lawyer) => l.uid !== user?.uid
        );
        setLawyers(filtered);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load lawyers");
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchLawyers();
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user?.uid) return setError("You must be logged in.");
    if (!selectedLawyer) return setError("Please select a new lawyer.");

    try {
      setLoading(true);
      const res = await fetch(`${API}/documents/${params.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_lawyer_uid: user.uid,
          new_lawyer_uid: selectedLawyer,
          remove_old_lawyer_access: removeOldAccess,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      setSuccess("Ownership transferred successfully.");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedLawyerInfo = lawyers.find((l) => l.uid === selectedLawyer);

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        <div className="max-w-lg">
          {/* Back */}
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-[#22333B]/50 hover:text-[#22333B] transition mb-6 font-medium"
          >
            ← Back to Dashboard
          </a>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
              Document Management
            </p>
            <h1 className="text-2xl font-semibold text-[#22333B]">Transfer Ownership</h1>
            <p className="text-sm text-[#22333B]/50 mt-1">
              Reassign this document and its full history to another lawyer.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Warning banner */}
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex gap-3">
              <span className="text-amber-500 text-sm shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                This action will permanently change document ownership. The new
                lawyer will gain full access and management rights.
              </p>
            </div>

            <div className="p-6">
              {fetching ? (
                <p className="text-sm text-gray-400">Loading lawyers…</p>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/60 mb-2">
                      New Lawyer
                    </label>
                    <select
                      value={selectedLawyer}
                      onChange={(e) => setSelectedLawyer(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#EAE0D5]/30 text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20"
                    >
                      <option value="">Select a lawyer…</option>
                      {lawyers.map((l) => (
                        <option key={l.uid} value={l.uid}>
                          {l.full_name} — {l.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview selected lawyer */}
                  {selectedLawyerInfo && (
                    <div className="flex items-center gap-3 bg-[#EAE0D5]/50 rounded-xl px-4 py-3 border border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-[#22333B] flex items-center justify-center text-[#EAE0D5] text-xs font-semibold shrink-0">
                        {selectedLawyerInfo.full_name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#22333B] truncate">
                          {selectedLawyerInfo.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedLawyerInfo.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeOldAccess}
                      onChange={(e) => setRemoveOldAccess(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#22333B]"
                    />
                    <span className="text-sm text-[#22333B]/70">
                      Remove my access after transfer
                    </span>
                  </label>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                      ✓ {success}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <a
                      href="/dashboard"
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#22333B] font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      disabled={loading || !selectedLawyer}
                      className="px-5 py-2.5 rounded-xl bg-[#22333B] text-[#EAE0D5] text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                    >
                      {loading ? "Transferring…" : "Transfer Ownership"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}