"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";

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
  const [pageLoading, setPageLoading] = useState(true);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLatestVersionMode = Boolean(documentId);

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
              (p: { document_id: string; client_uid?: string }) => p.document_id === documentId
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
      setTitle(f.name);
    }
    setResult(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
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
    setError("");

    if (!isLatestVersionMode) {
      setTitle("");
      setDocType("Document");
      setClientUid("");
    }
  };

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
              : "Upload an original legal document and assign it to a client."}
          </p>

          {pageLoading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <p className="text-sm text-gray-600">Loading upload form...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
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
                    onChange={(e) => setDocType(e.target.value)}
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
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
                      <span className="text-[#22333B] font-medium">
                        {result.version ?? 1}
                      </span>
                    </p>
                    <p>
                      Status:{" "}
                      <span className="text-green-600 font-semibold">
                        {result.already_existed ? "Already registered" : "Registered on blockchain"}
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

                {error && <p className="text-red-600 text-sm mt-3">✕ {error}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={reset}
                  className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition"
                >
                  Reset
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!file || loading}
                  className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition disabled:opacity-40"
                >
                  {loading
                    ? isLatestVersionMode
                      ? "Uploading latest version..."
                      : "Uploading..."
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