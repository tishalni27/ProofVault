"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";

const API = "http://127.0.0.1:5001";
const CHECKER_API = "http://127.0.0.1:5002";

type VerifyResult = {
  filename: string;
  file_hash: string;
  exists_on_chain: boolean;
  block_number?: number;
  uploaded_at?: string;
  uploader?: string;
  document_title?: string;
  document_type?: string;
  tx_hash?: string;
  verdict: string;
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/verify`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const authentic = result?.exists_on_chain === true;

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">Verify Document</h1>
        <p className="text-sm text-gray-600 mb-8">
          Upload a document to verify its authenticity against the blockchain record.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#22333B] mb-2">Upload File to Verify</label>
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
                    <p className="text-[#22333B] font-medium">Drag and drop file for verification</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`rounded-xl p-5 mb-8 border ${
            result
              ? authentic
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
              : "bg-[#f8f5f1] border-gray-200"
          }`}>
            <h2 className="text-sm font-semibold text-[#22333B] mb-3">Verification Result</h2>

            {result ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p className="md:col-span-2 text-base font-semibold">
                  {result.verdict}
                </p>
                <p>File: <span className="font-medium text-[#22333B]">{result.filename}</span></p>
                {authentic && (
                  <>
                    <p>Block: <span className="font-medium text-[#22333B]">#{result.block_number}</span></p>
                    <p>Uploaded At: <span className="font-medium text-[#22333B]">{result.uploaded_at}</span></p>
                    <p>Title: <span className="font-medium text-[#22333B]">{result.document_title}</span></p>
                    <p>Type: <span className="font-medium text-[#22333B]">{result.document_type}</span></p>
                    <p className="md:col-span-2">
                      Tx: <span className="font-mono text-xs text-[#22333B] break-all">{result.tx_hash}</span>
                    </p>
                  </>
                )}
                <p className="md:col-span-2">
                  Hash: <span className="font-mono text-xs text-[#22333B] break-all">{result.file_hash}</span>
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>Status: <span className="text-gray-800">No file uploaded</span></p>
                <p className="mt-2">Result will appear here after verification.</p>
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
              onClick={handleVerify}
              disabled={!file || loading}
              className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition disabled:opacity-40"
            >
              {loading ? "Verifying…" : "Run Verification"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}