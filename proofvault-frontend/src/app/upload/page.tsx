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

type ClientOption = {
  uid: string;
  full_name: string;
  email: string;
};

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
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90
      ? "#16a34a"
      : score >= 75
      ? "#d97706"
      : score >= 50
      ? "#ea580c"
      : "#dc2626";

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#22333B]">{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
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
    if (!user || profile?.role !== "lawyer") {
      setPageLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setPageLoading(true);
        setError("");

        const clientRes = await fetch(`${API}/users/clients`);
        const clientData = await clientRes.json();
        if (!clientRes.ok) throw new Error(clientData.error || "Failed to load clients");
        setClients(clientData.clients || []);

        if (documentId) {
          const historyRes = await fetch(`${API}/history/${documentId}`);
          const historyData: HistoryResponse = await historyRes.json();
          if (!historyRes.ok) {
            throw new Error((historyData as { error?: string }).error || "Failed to load document");
          }

          setTitle(historyData.title || "");
          setDocType(historyData.document_type || "Document");

          const docRes = await fetch(`${API}/proofs?user_uid=${user.uid}`);
          const docData = await docRes.json();
          if (docRes.ok) {
            const currentDoc = (docData.proofs || []).find(
              (p: { document_id: string; client_uid?: string }) =>
                p.document_id === documentId
            );
            if (currentDoc?.client_uid) {
              setClientUid(currentDoc.client_uid);
            }
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load upload form data");
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, profile, documentId]);

  const handleFile = (f: File) => {
    setFile(f);
    if (!isLatestVersionMode) {
      setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
    setResult(null);
    setCheckResult(null);
    setError("");
    setCheckError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleCheck = async () => {
    if (!file) return;
    setChecking(true);
    setCheckError("");
    setCheckResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${CHECKER_API}/check-will`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setCheckResult(data);
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : "Check failed");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (force = false) => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    if (!clientUid) {
      setError("Please select a client.");
      return;
    }

    // Auto-run check for Will type before upload (unless forcing or already checked)
    if (isWillType && !checkResult && !force) {
      await handleCheck();
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title || file.name);
      form.append("document_type", docType);
      form.append("uploaded_by_uid", user.uid);
      form.append("client_uid", clientUid);

      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: form,
      });

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
    setFile(null);
    setResult(null);
    setCheckResult(null);
    setError("");
    setCheckError("");
    if (!isLatestVersionMode) {
      setTitle("");
      setDocType("Document");
      setClientUid("");
    }
  };

  const scoreColor =
    !checkResult
      ? "text-gray-400"
      : checkResult.score >= 90
      ? "text-green-600"
      : checkResult.score >= 75
      ? "text-amber-600"
      : "text-red-600";

  const statusBg =
    !checkResult
      ? "bg-gray-50 border-gray-200"
      : checkResult.score >= 90
      ? "bg-green-50 border-green-200"
      : checkResult.score >= 75
      ? "bg-amber-50 border-amber-200"
      : "bg-red-50 border-red-200";

  const needsForce = checkResult && checkResult.score < 100 && isWillType && !result;

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        <div className="max-w-4xl">
          <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
            {isLatestVersionMode ? "Upload Latest Version" : "Upload Document"}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {isLatestVersionMode
              ? "Upload a new version for this existing document."
              : "Upload an original legal document and assign it to a client. Wills are automatically checked for completeness before registration."}
          </p>

          {pageLoading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <p className="text-sm text-gray-600">Loading upload form...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              {/* ── Form Fields ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[#22333B] mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLatestVersionMode}
                    placeholder="Enter document title"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B] disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#22333B] mb-2">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value);
                      setCheckResult(null);
                      setCheckError("");
                    }}
                    disabled={isLatestVersionMode}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B] disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option>Document</option>
                    <option>Will</option>
                    <option>Contract</option>
                    <option>Inheritance</option>
                    <option>Property Agreement</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#22333B] mb-2">
                    Assigned Client
                  </label>
                  <select
                    value={clientUid}
                    onChange={(e) => setClientUid(e.target.value)}
                    disabled={isLatestVersionMode}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B] disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.uid} value={client.uid}>
                        {client.full_name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── File Drop ── */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#22333B] mb-2">
                  Upload File
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-2xl bg-[#faf7f3] p-10 text-center hover:border-[#22333B] transition cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#22333B] text-[#EAE0D5] flex items-center justify-center text-xl">
                      ↑
                    </div>
                    {file ? (
                      <p className="text-[#22333B] font-medium">{file.name}</p>
                    ) : (
                      <>
                        <p className="text-[#22333B] font-medium">
                          Drag and drop your file here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse from your device
                        </p>
                        <p className="text-xs text-gray-400">
                          Supported formats: PDF, DOCX
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── AI Will Checker Panel ── */}
              {isWillType && (
                <div className={`rounded-xl border p-5 mb-8 ${statusBg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-[#22333B]">
                        🤖 AI Will Completeness Checker
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Automatically analyzes your will for missing sections,
                        placeholders, and unsigned fields.
                      </p>
                    </div>
                    {file && !checkResult && (
                      <button
                        onClick={handleCheck}
                        disabled={checking}
                        className="px-4 py-2 rounded-lg bg-[#22333B] text-[#EAE0D5] text-sm hover:opacity-90 transition disabled:opacity-40 whitespace-nowrap"
                      >
                        {checking ? "Analysing…" : "Run Check"}
                      </button>
                    )}
                    {checkResult && (
                      <button
                        onClick={handleCheck}
                        disabled={checking}
                        className="px-3 py-1.5 rounded-lg border border-[#22333B] text-[#22333B] text-xs hover:bg-white/60 transition disabled:opacity-40"
                      >
                        {checking ? "Re-checking…" : "Re-check"}
                      </button>
                    )}
                  </div>

                  {checkError && (
                    <p className="text-red-600 text-sm mb-3">❌ {checkError}</p>
                  )}

                  {checking && (
                    <div className="flex items-center gap-3 py-4 text-sm text-gray-500">
                      <svg
                        className="animate-spin w-5 h-5 text-[#22333B]"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeOpacity="0.2"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Analysing document structure and completeness…
                    </div>
                  )}

                  {checkResult && !checking && (
                    <div className="space-y-5">
                      {/* Score + Status */}
                      <div className="flex items-center gap-6">
                        <ScoreRing score={checkResult.score} />
                        <div>
                          <p className={`text-lg font-bold ${scoreColor}`}>
                            {checkResult.status}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Completeness score:{" "}
                            <span className={`font-semibold ${scoreColor}`}>
                              {checkResult.score}/100
                            </span>
                          </p>
                          {checkResult.score < 100 && (
                            <p className="text-xs text-amber-700 mt-1">
                              ⚠️ You may still force-register this document below.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Section checklist */}
                      <div>
                        <p className="text-xs font-semibold text-[#22333B] uppercase tracking-wide mb-2">
                          Section Checks
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(checkResult.section_results).map(
                            ([key, present]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                                  present
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                                }`}
                              >
                                <span>{present ? "✅" : "❌"}</span>
                                <span>{SECTION_LABELS[key] ?? key}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Issues / Warnings */}
                      {checkResult.issues.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#22333B] uppercase tracking-wide mb-2">
                            ⚠️ Warnings ({checkResult.issues.length})
                          </p>
                          <ul className="space-y-1.5">
                            {checkResult.issues.map((issue, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                              >
                                <span className="mt-0.5 shrink-0">⚠️</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Blank signature lines */}
                      {checkResult.blank_signature_lines.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                            🔴 Blank Signature Lines Detected
                          </p>
                          <ul className="space-y-1">
                            {checkResult.blank_signature_lines.map((line, i) => (
                              <li
                                key={i}
                                className="text-xs font-mono bg-red-50 border border-red-200 text-red-700 rounded px-3 py-1.5"
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Draft placeholders */}
                      {checkResult.placeholders.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                            🟠 Unresolved Placeholders
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {checkResult.placeholders.map((p, i) => (
                              <span
                                key={i}
                                className="text-xs font-mono bg-orange-50 border border-orange-200 text-orange-700 rounded px-2 py-1"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All clear */}
                      {checkResult.issues.length === 0 &&
                        checkResult.blank_signature_lines.length === 0 &&
                        checkResult.placeholders.length === 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                            <span className="text-lg">✅</span>
                            <span>
                              No issues detected — document appears complete and
                              ready for registration.
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                  {!file && (
                    <p className="text-sm text-gray-400 italic">
                      Upload a PDF will to run the AI completeness check.
                    </p>
                  )}
                </div>
              )}

              {/* ── Upload Summary ── */}
              <div className="bg-[#f8f5f1] border border-gray-200 rounded-xl p-5 mb-8">
                <h2 className="text-sm font-semibold text-[#22333B] mb-3">
                  Upload Summary
                </h2>
                {result ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p>
                      Document Name:{" "}
                      <span className="text-[#22333B] font-medium">{result.filename}</span>
                    </p>
                    <p>
                      Type:{" "}
                      <span className="text-[#22333B] font-medium">{result.document_type}</span>
                    </p>
                    <p>
                      Block:{" "}
                      <span className="text-[#22333B] font-medium">#{result.block_number}</span>
                    </p>
                    <p>
                      Uploaded At:{" "}
                      <span className="text-[#22333B] font-medium">{result.uploaded_at}</span>
                    </p>
                    <p>
                      Version:{" "}
                      <span className="text-[#22333B] font-medium">{result.version ?? 1}</span>
                    </p>
                    <p>
                      Status:{" "}
                      <span className="text-green-600 font-semibold">
                        {result.already_existed
                          ? "⚠️ Already registered"
                          : "✅ Registered on blockchain"}
                      </span>
                    </p>
                    <p className="md:col-span-2">
                      Hash:{" "}
                      <span className="text-[#22333B] font-mono text-xs break-all">
                        {result.file_hash}
                      </span>
                    </p>
                    <p className="md:col-span-2">
                      Tx:{" "}
                      <span className="text-[#22333B] font-mono text-xs break-all">
                        {result.tx_hash}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <p>
                      Document Name:{" "}
                      <span className="text-[#22333B]">{file?.name || "No file selected"}</span>
                    </p>
                    <p>
                      Version:{" "}
                      <span className="text-[#22333B]">
                        {isLatestVersionMode ? "Latest Version Upload" : "Initial Upload"}
                      </span>
                    </p>
                    <p>
                      Status: <span className="text-yellow-600">Pending Registration</span>
                    </p>
                    <p>
                      Blockchain Record:{" "}
                      <span className="text-[#22333B]">Not yet created</span>
                    </p>
                  </div>
                )}
                {error && <p className="text-red-600 text-sm mt-3">❌ {error}</p>}
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={reset}
                  className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition"
                >
                  Reset
                </button>

                {/* Force Upload — only show for Will type after check with issues */}
                {needsForce && (
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="px-5 py-3 rounded-lg border-2 border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 transition disabled:opacity-40 font-medium"
                    title="Register document even though issues were detected"
                  >
                    {loading ? "Registering…" : "⚠️ Force Register Anyway"}
                  </button>
                )}

                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!file || loading}
                  className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition disabled:opacity-40"
                >
                  {loading
                    ? isLatestVersionMode
                      ? "Uploading latest version..."
                      : "Registering…"
                    : isWillType && !checkResult
                    ? "Check & Register"
                    : isLatestVersionMode
                    ? "Upload Latest Version"
                    : "Upload and Register"}
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}