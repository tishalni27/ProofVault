"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";

const API = "http://127.0.0.1:5001";

type Version = {
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
  versions: Version[];
};

export default function HistoryPage() {
  const params = useParams<{ id: string }>();
  const documentId = params.id;

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API}/history/${documentId}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load history");
        }

        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [documentId]);

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
          Document History
        </h1>

        {loading && (
          <p className="text-sm text-gray-600 mb-8">Loading history...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-8">{error}</p>
        )}

        {data && (
          <>
            <p className="text-sm text-gray-600 mb-8">
              {data.title} · {data.document_type}
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="relative pl-6 border-l border-gray-300 flex flex-col gap-8">
                {data.versions.map((v) => (
                  <div key={v.version_id} className="relative">
                    <div
                      className={`absolute -left-[7px] top-2 w-3 h-3 rounded-full ${
                        v.is_current ? "bg-green-600" : "bg-gray-400"
                      }`}
                    ></div>

                    <p className="font-semibold text-[#22333B]">
                      Version {v.version_number} {v.is_current ? "(Current)" : ""}
                    </p>

                    <p className="text-sm text-gray-500">
                      Uploaded: {v.uploaded_at}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      File: {v.filename}
                    </p>

                    <p className="text-sm text-gray-600">
                      Block: #{v.block_number}
                    </p>

                    <p className="text-sm text-gray-600 break-all">
                      Tx: {v.tx_hash}
                    </p>

                    <p className="text-sm text-gray-600 break-all">
                      Hash: {v.file_hash}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}