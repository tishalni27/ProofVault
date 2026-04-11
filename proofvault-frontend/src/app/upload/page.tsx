// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import AppShell from "@/components/AppShell";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuth } from "@/context/AuthContext";

// const API = "http://127.0.0.1:5001";
// const CHECKER_API = "http://127.0.0.1:5002";

// type CheckResult = {
//   score: number;
//   status: string;
//   issues: string[];
//   section_results: Record<string, boolean>;
//   placeholders: string[];
//   blank_signature_lines: string[];
//   missing_name_issues: string[];
//   blank_field_issues: string[];
//   preview: string;
// };

// type UploadResult = {
//   success: boolean;
//   filename: string;
//   title: string;
//   document_type: string;
//   file_hash: string;
//   tx_hash: string;
//   block_number: number;
//   uploaded_at: string;
//   version?: number;
//   document_id?: string;
//   already_existed?: boolean;
//   error?: string;
// };

// type ClientOption = { uid: string; full_name: string; email: string };

// type HistoryVersion = {
//   version_id: string;
//   version_number: number;
//   file_hash: string;
//   tx_hash: string;
//   block_number: number;
//   uploaded_at: string;
//   filename: string;
//   uploader: string;
//   previous_version_id?: string | null;
//   is_current: boolean;
//   status: string;
// };

// type HistoryResponse = {
//   document_id: string;
//   title: string;
//   document_type: string;
//   current_version_id: string;
//   versions: HistoryVersion[];
// };

// const SECTION_LABELS: Record<string, string> = {
//   testator_name: "Testator Name",
//   date: "Date",
//   signature_section: "Signature Section",
//   witness_section: "Witness Section",
//   beneficiary: "Beneficiary",
//   executor: "Executor",
// };

// function ScoreRing({ score }: { score: number }) {
//   const radius = 36;
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (score / 100) * circumference;
//   const color =
//     score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : score >= 50 ? "#f97316" : "#ef4444";

//   return (
//     <div className="relative flex items-center justify-center w-24 h-24">
//       <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
//         <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
//         <circle
//           cx="44" cy="44" r={radius}
//           fill="none" stroke={color} strokeWidth="8"
//           strokeDasharray={circumference} strokeDashoffset={offset}
//           strokeLinecap="round"
//           style={{ transition: "stroke-dashoffset 0.8s ease" }}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center">
//         <span className="text-xl font-semibold text-[#22333B]">{score}</span>
//         <span className="text-[10px] text-gray-400">/100</span>
//       </div>
//     </div>
//   );
// }

// export default function UploadPage() {
//   const { user, profile, loading: authLoading } = useAuth();
//   const searchParams = useSearchParams();
//   const documentId = searchParams.get("documentId");

//   const [file, setFile] = useState<File | null>(null);
//   const [title, setTitle] = useState("");
//   const [docType, setDocType] = useState("Document");
//   const [clientUid, setClientUid] = useState("");
//   const [clients, setClients] = useState<ClientOption[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [checking, setChecking] = useState(false);
//   const [pageLoading, setPageLoading] = useState(false);
//   const [result, setResult] = useState<UploadResult | null>(null);
//   const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
//   const [error, setError] = useState("");
//   const [checkError, setCheckError] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);

//   const isLatestVersionMode = Boolean(documentId);
//   const isWillType = docType === "Will";

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user || profile?.role !== "lawyer") { setPageLoading(false); return; }

//     const loadData = async () => {
//       try {
//         setPageLoading(true);
//         const clientRes = await fetch(`${API}/users/clients`);
//         const clientData = await clientRes.json();
//         if (!clientRes.ok) throw new Error(clientData.error || "Failed to load clients");
//         setClients(clientData.clients || []);

//         if (documentId) {
//           const historyRes = await fetch(`${API}/history/${documentId}`);
//           const historyData: HistoryResponse = await historyRes.json();
//           if (!historyRes.ok) throw new Error((historyData as { error?: string }).error || "Failed to load document");
//           setTitle(historyData.title || "");
//           setDocType(historyData.document_type || "Document");

//           const docRes = await fetch(`${API}/proofs?user_uid=${user.uid}`);
//           const docData = await docRes.json();
//           if (docRes.ok) {
//             const currentDoc = (docData.proofs || []).find(
//               (p: { document_id: string; client_uid?: string }) => p.document_id === documentId
//             );
//             if (currentDoc?.client_uid) setClientUid(currentDoc.client_uid);
//           }
//         }
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to load form data");
//       } finally {
//         setPageLoading(false);
//       }
//     };
//     loadData();
//   }, [authLoading, user, profile, documentId]);

//   const handleFile = (f: File) => {
//     setFile(f);
//     if (!isLatestVersionMode) setTitle(f.name.replace(/\.[^.]+$/, ""));
//     setResult(null); setCheckResult(null); setError(""); setCheckError("");
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f) handleFile(f);
//   };

//   const handleCheck = async () => {
//     if (!file) return;
//     setChecking(true); setCheckError(""); setCheckResult(null);
//     try {
//       const form = new FormData();
//       form.append("file", file);
//       const res = await fetch(`${CHECKER_API}/check-will`, { method: "POST", body: form });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Check failed");
//       setCheckResult(data);
//     } catch (e: unknown) {
//       setCheckError(e instanceof Error ? e.message : "Check failed");
//     } finally {
//       setChecking(false);
//     }
//   };

//   const handleSubmit = async (force = false) => {
//     if (!file) return setError("Please select a file.");
//     if (!user) return setError("You must be logged in.");
//     if (!clientUid) return setError("Please select a client.");
//     if (isWillType && !checkResult && !force) { await handleCheck(); return; }

//     setLoading(true); setError(""); setResult(null);
//     try {
//       const form = new FormData();
//       form.append("file", file);
//       form.append("title", title || file.name);
//       form.append("document_type", docType);
//       form.append("uploaded_by_uid", user.uid);
//       form.append("client_uid", clientUid);

//       const res = await fetch(`${API}/upload`, { method: "POST", body: form });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Upload failed");
//       setResult(data);
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setFile(null); setResult(null); setCheckResult(null); setError(""); setCheckError("");
//     if (!isLatestVersionMode) { setTitle(""); setDocType("Document"); setClientUid(""); }
//   };

//   const needsForce = checkResult && checkResult.score < 100 && isWillType && !result;

//   const scoreColor =
//     !checkResult ? "text-gray-400"
//     : checkResult.score >= 90 ? "text-emerald-600"
//     : checkResult.score >= 75 ? "text-amber-600"
//     : "text-red-600";

//   return (
//     <ProtectedRoute allowedRoles={["lawyer"]}>
//       <AppShell>
//         <div className="max-w-3xl">
//           {/* Header */}
//           <div className="mb-8">
//             <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
//               {isLatestVersionMode ? "Document Management" : "Upload"}
//             </p>
//             <h1 className="text-2xl font-semibold text-[#22333B]">
//               {isLatestVersionMode ? "Upload New Version" : "Register Document"}
//             </h1>
//             <p className="text-sm text-[#22333B]/50 mt-1">
//               {isLatestVersionMode
//                 ? "Upload a new version for this existing document."
//                 : "Register a legal document on the blockchain and assign it to a client."}
//             </p>
//           </div>

//           {pageLoading ? (
//             <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse h-48" />
//           ) : (
//             <div className="space-y-5">
//               {/* ── Document Details card ── */}
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                 <div className="px-6 py-4 border-b border-gray-100">
//                   <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
//                     Document Details
//                   </p>
//                 </div>
//                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
//                       Title
//                     </label>
//                     <input
//                       type="text"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       disabled={isLatestVersionMode}
//                       placeholder="Document title"
//                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#EAE0D5]/30 text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
//                       Type
//                     </label>
//                     <select
//                       value={docType}
//                       onChange={(e) => { setDocType(e.target.value); setCheckResult(null); setCheckError(""); }}
//                       disabled={isLatestVersionMode}
//                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
//                     >
//                       <option>Document</option>
//                       <option>Will</option>
//                       <option>Contract</option>
//                       <option>Inheritance</option>
//                       <option>Property Agreement</option>
//                     </select>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
//                       Assigned Client
//                     </label>
//                     <select
//                       value={clientUid}
//                       onChange={(e) => setClientUid(e.target.value)}
//                       disabled={isLatestVersionMode}
//                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
//                     >
//                       <option value="">Select a client…</option>
//                       {clients.map((c) => (
//                         <option key={c.uid} value={c.uid}>
//                           {c.full_name} — {c.email}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* ── File Upload card ── */}
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                 <div className="px-6 py-4 border-b border-gray-100">
//                   <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
//                     File
//                   </p>
//                 </div>
//                 <div className="p-6">
//                   <div
//                     className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
//                       file
//                         ? "border-[#22333B]/30 bg-[#EAE0D5]/30"
//                         : "border-gray-200 bg-[#EAE0D5]/10 hover:border-[#22333B]/25 hover:bg-[#EAE0D5]/25"
//                     }`}
//                     onDrop={handleDrop}
//                     onDragOver={(e) => e.preventDefault()}
//                     onClick={() => inputRef.current?.click()}
//                   >
//                     <input
//                       ref={inputRef}
//                       type="file"
//                       className="hidden"
//                       accept=".pdf,.docx"
//                       onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
//                     />
//                     {file ? (
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-10 h-10 rounded-xl bg-[#22333B] flex items-center justify-center text-[#EAE0D5] font-bold">✓</div>
//                         <p className="text-sm font-medium text-[#22333B]">{file.name}</p>
//                         <p className="text-xs text-gray-400">Click to change</p>
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-10 h-10 rounded-xl bg-[#22333B]/10 flex items-center justify-center text-[#22333B] text-lg">↑</div>
//                         <p className="text-sm font-medium text-[#22333B]">Drop file or click to browse</p>
//                         <p className="text-xs text-gray-400">PDF, DOCX supported</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── AI Will Checker card ── */}
//               {isWillType && (
//                 <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                   <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//                     <div>
//                       <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
//                         AI Will Checker
//                       </p>
//                       <p className="text-xs text-gray-400 mt-0.5">
//                         Checks for missing sections, placeholders, and unsigned fields
//                       </p>
//                     </div>
//                     {file && !checkResult && (
//                       <button
//                         onClick={handleCheck}
//                         disabled={checking}
//                         className="px-4 py-2 rounded-xl bg-[#22333B] text-[#EAE0D5] text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
//                       >
//                         {checking ? "Analysing…" : "Run Check"}
//                       </button>
//                     )}
//                     {checkResult && (
//                       <button
//                         onClick={handleCheck}
//                         disabled={checking}
//                         className="px-3 py-1.5 rounded-xl border border-gray-200 text-[#22333B] text-xs font-medium hover:bg-gray-50 transition disabled:opacity-40"
//                       >
//                         Re-check
//                       </button>
//                     )}
//                   </div>

//                   <div className="p-6">
//                     {checkError && (
//                       <p className="text-sm text-red-600 mb-3">❌ {checkError}</p>
//                     )}

//                     {checking && (
//                       <div className="flex items-center gap-3 text-sm text-gray-400">
//                         <svg className="animate-spin w-4 h-4 text-[#22333B]" viewBox="0 0 24 24" fill="none">
//                           <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
//                           <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
//                         </svg>
//                         Analysing document…
//                       </div>
//                     )}

//                     {!checkResult && !checking && (
//                       <p className="text-sm text-gray-400">
//                         {file ? "Click 'Run Check' to analyse this will." : "Upload a PDF will to enable the AI check."}
//                       </p>
//                     )}

//                     {checkResult && !checking && (
//                       <div className="space-y-5">
//                         {/* Score row */}
//                         <div className="flex items-center gap-5">
//                           <ScoreRing score={checkResult.score} />
//                           <div>
//                             <p className={`text-base font-semibold ${scoreColor}`}>
//                               {checkResult.status}
//                             </p>
//                             <p className="text-xs text-gray-400 mt-1">
//                               Completeness score: <span className={`font-semibold ${scoreColor}`}>{checkResult.score}/100</span>
//                             </p>
//                             {checkResult.score < 100 && (
//                               <p className="text-xs text-amber-600 mt-1">
//                                 ⚠ You may still force-register this document.
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                         {/* Section checks */}
//                         <div>
//                           <p className="text-[10px] font-bold uppercase tracking-widest text-[#22333B]/40 mb-2">
//                             Section Checks
//                           </p>
//                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                             {Object.entries(checkResult.section_results).map(([key, present]) => (
//                               <div
//                                 key={key}
//                                 className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
//                                   present
//                                     ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//                                     : "bg-red-50 border-red-200 text-red-700"
//                                 }`}
//                               >
//                                 <span>{present ? "✓" : "✗"}</span>
//                                 <span>{SECTION_LABELS[key] ?? key}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         {/* Issues */}
//                         {checkResult.issues.length > 0 && (
//                           <div>
//                             <p className="text-[10px] font-bold uppercase tracking-widest text-[#22333B]/40 mb-2">
//                               Warnings ({checkResult.issues.length})
//                             </p>
//                             <ul className="space-y-1.5">
//                               {checkResult.issues.map((issue, i) => (
//                                 <li key={i} className="flex gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
//                                   <span className="shrink-0">⚠</span>
//                                   <span>{issue}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}

//                         {/* Blank sig lines */}
//                         {checkResult.blank_signature_lines.length > 0 && (
//                           <div>
//                             <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">
//                               Blank Signatures
//                             </p>
//                             <ul className="space-y-1">
//                               {checkResult.blank_signature_lines.map((line, i) => (
//                                 <li key={i} className="text-xs font-mono bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-1.5">
//                                   {line}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}

//                         {/* Placeholders */}
//                         {checkResult.placeholders.length > 0 && (
//                           <div>
//                             <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
//                               Unresolved Placeholders
//                             </p>
//                             <div className="flex flex-wrap gap-2">
//                               {checkResult.placeholders.map((p, i) => (
//                                 <span key={i} className="text-xs font-mono bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-2 py-1">
//                                   {p}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {checkResult.issues.length === 0 &&
//                           checkResult.blank_signature_lines.length === 0 &&
//                           checkResult.placeholders.length === 0 && (
//                             <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
//                               <span>✓</span>
//                               <span>No issues detected — document appears complete.</span>
//                             </div>
//                           )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ── Result / Summary card ── */}
//               {result && (
//                 <div className={`rounded-2xl border overflow-hidden ${result.already_existed ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
//                   <div className="px-6 py-4 border-b border-white/50">
//                     <p className={`text-sm font-semibold ${result.already_existed ? "text-amber-700" : "text-emerald-700"}`}>
//                       {result.already_existed ? "⚠ Already registered" : "✓ Registered on blockchain"}
//                     </p>
//                   </div>
//                   <div className="p-6 grid grid-cols-2 gap-3 text-xs">
//                     {[
//                       ["File", result.filename],
//                       ["Type", result.document_type],
//                       ["Block", `#${result.block_number}`],
//                       ["Version", String(result.version ?? 1)],
//                       ["Uploaded", result.uploaded_at],
//                     ].map(([label, value]) => (
//                       <div key={label} className="bg-white/70 rounded-xl p-3">
//                         <p className="text-gray-400 mb-0.5">{label}</p>
//                         <p className="font-medium text-[#22333B] truncate">{value}</p>
//                       </div>
//                     ))}
//                     <div className="col-span-2 bg-white/70 rounded-xl p-3">
//                       <p className="text-gray-400 mb-0.5">Hash</p>
//                       <p className="font-mono text-[#22333B] break-all">{result.file_hash}</p>
//                     </div>
//                     <div className="col-span-2 bg-white/70 rounded-xl p-3">
//                       <p className="text-gray-400 mb-0.5">Transaction</p>
//                       <p className="font-mono text-[#22333B] break-all">{result.tx_hash}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Error */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
//                   {error}
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex flex-wrap justify-end gap-3 pt-1">
//                 <button
//                   onClick={reset}
//                   className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#22333B] font-medium hover:bg-gray-50 transition"
//                 >
//                   Reset
//                 </button>

//                 {needsForce && (
//                   <button
//                     onClick={() => handleSubmit(true)}
//                     disabled={loading}
//                     className="px-5 py-2.5 rounded-xl border-2 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 text-sm font-medium transition disabled:opacity-40"
//                   >
//                     {loading ? "Registering…" : "⚠ Force Register"}
//                   </button>
//                 )}

//                 <button
//                   onClick={() => handleSubmit(false)}
//                   disabled={!file || loading}
//                   className="px-5 py-2.5 rounded-xl bg-[#22333B] text-[#EAE0D5] text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
//                 >
//                   {loading
//                     ? isLatestVersionMode ? "Uploading…" : "Registering…"
//                     : isWillType && !checkResult
//                     ? "Check & Register"
//                     : isLatestVersionMode
//                     ? "Upload Version"
//                     : "Register Document"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </AppShell>
//     </ProtectedRoute>
//   );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";
const CHECKER_API = "http://127.0.0.1:5002";

type CheckResult = {
  score: number;
  status: string;
  issues: string[];
  section_results: Record<string, boolean>;
  placeholders: string[];
  blank_signature_lines: string[];
  missing_name_issues: string[];
  blank_field_issues: string[];
  preview: string;
};

type UploadResult = {
  success: boolean;
  filename: string;
  title: string;
  document_type: string;
  file_hash: string;
  tx_hash: string;
  block_number: number;
  uploaded_at: string;
  version?: number;
  document_id?: string;
  already_existed?: boolean;
  error?: string;
};

type ClientOption = { uid: string; full_name: string; email: string };

type HistoryVersion = {
  version_id: string;
  version_number: number;
  file_hash: string;
  tx_hash: string;
  block_number: number;
  uploaded_at: string;
  filename: string;
  uploader: string;
  previous_version_id?: string | null;
  is_current: boolean;
  status: string;
};

type HistoryResponse = {
  document_id: string;
  title: string;
  document_type: string;
  current_version_id: string;
  versions: HistoryVersion[];
};

const SECTION_LABELS: Record<string, string> = {
  testator_name: "Testator Name",
  date: "Date",
  signature_section: "Signature Section",
  witness_section: "Witness Section",
  beneficiary: "Beneficiary",
  executor: "Executor",
};

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : score >= 50 ? "#f97316" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-semibold text-[#22333B]">{score}</span>
        <span className="text-[10px] text-gray-400">/100</span>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("Document");
  const [clientUid, setClientUid] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [checkError, setCheckError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLatestVersionMode = Boolean(documentId);
  const isWillType = docType === "Will";

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== "lawyer") { setPageLoading(false); return; }

    const loadData = async () => {
      try {
        setPageLoading(true);
        const clientRes = await fetch(`${API}/users/clients`);
        const clientData = await clientRes.json();
        if (!clientRes.ok) throw new Error(clientData.error || "Failed to load clients");
        setClients(clientData.clients || []);

        if (documentId) {
          const historyRes = await fetch(`${API}/history/${documentId}`);
          const historyData: HistoryResponse = await historyRes.json();
          if (!historyRes.ok) throw new Error((historyData as { error?: string }).error || "Failed to load document");
          setTitle(historyData.title || "");
          setDocType(historyData.document_type || "Document");

          const docRes = await fetch(`${API}/proofs?user_uid=${user.uid}`);
          const docData = await docRes.json();
          if (docRes.ok) {
            const currentDoc = (docData.proofs || []).find(
              (p: { document_id: string; client_uid?: string }) => p.document_id === documentId
            );
            if (currentDoc?.client_uid) setClientUid(currentDoc.client_uid);
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load form data");
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [authLoading, user, profile, documentId]);

  const handleFile = (f: File) => {
    setFile(f);
    if (!isLatestVersionMode) setTitle(f.name.replace(/\.[^.]+$/, ""));
    setResult(null); setCheckResult(null); setError(""); setCheckError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleCheck = async () => {
    if (!file) return;
    setChecking(true); setCheckError(""); setCheckResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${CHECKER_API}/check-will`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setCheckResult(data);
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : "Check failed");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please select a file.");
    if (!user) return setError("You must be logged in.");
    if (!clientUid) return setError("Please select a client.");
    if (isWillType && !checkResult) { await handleCheck(); return; }

    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title || file.name);
      form.append("document_type", docType);
      form.append("uploaded_by_uid", user.uid);
      form.append("client_uid", clientUid);

      const res = await fetch(`${API}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null); setResult(null); setCheckResult(null); setError(""); setCheckError("");
    if (!isLatestVersionMode) { setTitle(""); setDocType("Document"); setClientUid(""); }
  };

  const scoreColor =
    !checkResult ? "text-gray-400"
    : checkResult.score >= 90 ? "text-emerald-600"
    : checkResult.score >= 75 ? "text-amber-600"
    : "text-red-600";

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
              {isLatestVersionMode ? "Document Management" : "Upload"}
            </p>
            <h1 className="text-2xl font-semibold text-[#22333B]">
              {isLatestVersionMode ? "Upload New Version" : "Register Document"}
            </h1>
            <p className="text-sm text-[#22333B]/50 mt-1">
              {isLatestVersionMode
                ? "Upload a new version for this existing document."
                : "Register a legal document on the blockchain and assign it to a client."}
            </p>
          </div>

          {pageLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse h-48" />
          ) : (
            <div className="space-y-5">
              {/* ── Document Details card ── */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
                    Document Details
                  </p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
                      Title
                    </label>
                    <input
                      id="doc-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isLatestVersionMode}
                      placeholder="Document title"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#EAE0D5]/30 text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
                      Type
                    </label>
                    <select
                      id="doc-type"
                      value={docType}
                      onChange={(e) => { setDocType(e.target.value); setCheckResult(null); setCheckError(""); }}
                      disabled={isLatestVersionMode}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
                    >
                      <option>Document</option>
                      <option>Will</option>
                      <option>Contract</option>
                      <option>Inheritance</option>
                      <option>Property Agreement</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#22333B]/50 mb-1.5">
                      Assigned Client
                    </label>
                    <select
                      id="client-select"
                      value={clientUid}
                      onChange={(e) => setClientUid(e.target.value)}
                      disabled={isLatestVersionMode}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#22333B]/20 disabled:opacity-50"
                    >
                      <option value="">Select a client…</option>
                      {clients.map((c) => (
                        <option key={c.uid} value={c.uid}>
                          {c.full_name} — {c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── File Upload card ── */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
                    File
                  </p>
                </div>
                <div className="p-6">
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      file
                        ? "border-[#22333B]/30 bg-[#EAE0D5]/30"
                        : "border-gray-200 bg-[#EAE0D5]/10 hover:border-[#22333B]/25 hover:bg-[#EAE0D5]/25"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#22333B] flex items-center justify-center text-[#EAE0D5] font-bold">✓</div>
                        <p className="text-sm font-medium text-[#22333B]">{file.name}</p>
                        <p className="text-xs text-gray-400">Click to change</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#22333B]/10 flex items-center justify-center text-[#22333B] text-lg">↑</div>
                        <p className="text-sm font-medium text-[#22333B]">Drop file or click to browse</p>
                        <p className="text-xs text-gray-400">PDF, DOCX supported</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── AI Will Checker card ── */}
              {isWillType && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#22333B]/50">
                        AI Will Checker
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Checks for missing sections, placeholders, and unsigned fields
                      </p>
                    </div>
                    {file && !checkResult && (
                      <button
                        onClick={handleCheck}
                        disabled={checking}
                        className="px-4 py-2 rounded-xl bg-[#22333B] text-[#EAE0D5] text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
                      >
                        {checking ? "Analysing…" : "Run Check"}
                      </button>
                    )}
                    {checkResult && (
                      <button
                        onClick={handleCheck}
                        disabled={checking}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-[#22333B] text-xs font-medium hover:bg-gray-50 transition disabled:opacity-40"
                      >
                        Re-check
                      </button>
                    )}
                  </div>

                  <div className="p-6">
                    {checkError && (
                      <p className="text-sm text-red-600 mb-3">❌ {checkError}</p>
                    )}

                    {checking && (
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <svg className="animate-spin w-4 h-4 text-[#22333B]" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Analysing document…
                      </div>
                    )}

                    {!checkResult && !checking && (
                      <p className="text-sm text-gray-400">
                        {file ? "Click 'Run Check' to analyse this will." : "Upload a PDF will to enable the AI check."}
                      </p>
                    )}

                    {checkResult && !checking && (
                      <div className="space-y-5">
                        {/* Score row */}
                        <div className="flex items-center gap-5">
                          <ScoreRing score={checkResult.score} />
                          <div>
                            <p className={`text-base font-semibold ${scoreColor}`}>
                              {checkResult.status}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Completeness score:{" "}
                              <span className={`font-semibold ${scoreColor}`}>{checkResult.score}/100</span>
                            </p>
                          </div>
                        </div>

                        {/* Section checks */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#22333B]/40 mb-2">
                            Section Checks
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(checkResult.section_results).map(([key, present]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                                  present
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                                }`}
                              >
                                <span>{present ? "✓" : "✗"}</span>
                                <span>{SECTION_LABELS[key] ?? key}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Issues */}
                        {checkResult.issues.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#22333B]/40 mb-2">
                              Warnings ({checkResult.issues.length})
                            </p>
                            <ul className="space-y-1.5">
                              {checkResult.issues.map((issue, i) => (
                                <li key={i} className="flex gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                  <span className="shrink-0">⚠</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Blank sig lines */}
                        {checkResult.blank_signature_lines.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">
                              Blank Signatures
                            </p>
                            <ul className="space-y-1">
                              {checkResult.blank_signature_lines.map((line, i) => (
                                <li key={i} className="text-xs font-mono bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-1.5">
                                  {line}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Placeholders */}
                        {checkResult.placeholders.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                              Unresolved Placeholders
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {checkResult.placeholders.map((p, i) => (
                                <span key={i} className="text-xs font-mono bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-2 py-1">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {checkResult.issues.length === 0 &&
                          checkResult.blank_signature_lines.length === 0 &&
                          checkResult.placeholders.length === 0 && (
                            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                              <span>✓</span>
                              <span>No issues detected — document appears complete.</span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Result card ── */}
              {result && (
                <div className={`rounded-2xl border overflow-hidden ${result.already_existed ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                  <div className="px-6 py-4 border-b border-white/50">
                    <p className={`text-sm font-semibold ${result.already_existed ? "text-amber-700" : "text-emerald-700"}`}>
                      {result.already_existed ? "⚠ Already registered" : "✓ Registered on blockchain"}
                    </p>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-3 text-xs">
                    {[
                      ["File", result.filename],
                      ["Type", result.document_type],
                      ["Block", `#${result.block_number}`],
                      ["Version", String(result.version ?? 1)],
                      ["Uploaded", result.uploaded_at],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white/70 rounded-xl p-3">
                        <p className="text-gray-400 mb-0.5">{label}</p>
                        <p className="font-medium text-[#22333B] truncate">{value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 bg-white/70 rounded-xl p-3">
                      <p className="text-gray-400 mb-0.5">Hash</p>
                      <p className="font-mono text-[#22333B] break-all">{result.file_hash}</p>
                    </div>
                    <div className="col-span-2 bg-white/70 rounded-xl p-3">
                      <p className="text-gray-400 mb-0.5">Transaction</p>
                      <p className="font-mono text-[#22333B] break-all">{result.tx_hash}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#22333B] font-medium hover:bg-gray-50 transition"
                >
                  Reset
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!file || loading}
                  className="px-5 py-2.5 rounded-xl bg-[#22333B] text-[#EAE0D5] text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                >
                  {loading
                    ? isLatestVersionMode ? "Uploading…" : "Registering…"
                    : isWillType && !checkResult
                    ? "Check & Register"
                    : isLatestVersionMode
                    ? "Upload Version"
                    : "Register Document"}
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}