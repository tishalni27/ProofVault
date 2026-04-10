"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";

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
  already_existed?: boolean;
  error?: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("Document");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setTitle(f.name);
    setResult(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title || file.name);
      form.append("document_type", docType);
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
    setFile(null);
    setTitle("");
    setDocType("Document");
    setResult(null);
    setError("");
  };

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">Upload Document</h1>
        <p className="text-sm text-gray-600 mb-8">
          Upload an original legal document to register it on the blockchain.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#22333B] mb-2">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#22333B] mb-2">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B]"
              >
                <option>Document</option>
                <option>Will</option>
                <option>Contract</option>
                <option>Inheritance</option>
                <option>Property Agreement</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#22333B] mb-2">Upload File</label>
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
                <div className="w-14 h-14 rounded-full bg-[#22333B] text-[#EAE0D5] flex items-center justify-center text-xl">↑</div>
                {file ? (
                  <p className="text-[#22333B] font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-[#22333B] font-medium">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500">or click to browse from your device</p>
                    <p className="text-xs text-gray-400">Supported formats: PDF, DOCX</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary / Result */}
          <div className="bg-[#f8f5f1] border border-gray-200 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-[#22333B] mb-3">Upload Summary</h2>
            {result ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>Document Name: <span className="text-[#22333B] font-medium">{result.filename}</span></p>
                <p>Type: <span className="text-[#22333B] font-medium">{result.document_type}</span></p>
                <p>Block: <span className="text-[#22333B] font-medium">#{result.block_number}</span></p>
                <p>Uploaded At: <span className="text-[#22333B] font-medium">{result.uploaded_at}</span></p>
                <p className="md:col-span-2">
                  Hash: <span className="text-[#22333B] font-mono text-xs break-all">{result.file_hash}</span>
                </p>
                <p className="md:col-span-2">
                  Tx: <span className="text-[#22333B] font-mono text-xs break-all">{result.tx_hash}</span>
                </p>
                <p className="md:col-span-2">
                  Status:{" "}
                  <span className="text-green-600 font-semibold">
                    {result.already_existed ? "⚠️ Already registered" : "✅ Registered on blockchain"}
                  </span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <p>Document Name: <span className="text-[#22333B]">{file?.name || "No file selected"}</span></p>
                <p>Version: <span className="text-[#22333B]">Initial Upload</span></p>
                <p>Status: <span className="text-yellow-600">Pending Registration</span></p>
                <p>Blockchain Record: <span className="text-[#22333B]">Not yet created</span></p>
              </div>
            )}
            {error && <p className="text-red-600 text-sm mt-2">❌ {error}</p>}
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
              {loading ? "Registering…" : "Upload and Register"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}