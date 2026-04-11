"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";

const API = "http://127.0.0.1:5001";

type DiffLine = {
  type: "same" | "added" | "removed";
  text: string;
};

type CompareResponse = {
  old_version_id: string;
  new_version_id: string;
  old_file_url: string;
  new_file_url: string;
  old_diff: DiffLine[];
  new_diff: DiffLine[];
};

export default function ComparePage() {
  const params = useParams<{ oldId: string; newId: string }>();
  const oldId = params.oldId;
  const newId = params.newId;

  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!oldId || !newId) return;

    const fetchCompare = async () => {
      try {
        const res = await fetch(`${API}/compare/${oldId}/${newId}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to compare versions");
        }

        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to compare versions");
      } finally {
        setLoading(false);
      }
    };

    fetchCompare();
  }, [oldId, newId]);

  return (
    <AppShell>
      <div className="max-w-7xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
          Compare Document Versions
        </h1>

        {loading && (
          <p className="text-sm text-gray-600 mb-6">Loading comparison...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-6">{error}</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#22333B] mb-4">
                  Previous Version
                </h2>
                <iframe
                  src={data.old_file_url}
                  className="w-full h-[700px] rounded-lg border border-gray-200"
                  title="Previous PDF"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#22333B] mb-4">
                  New Version
                </h2>
                <iframe
                  src={data.new_file_url}
                  className="w-full h-[700px] rounded-lg border border-gray-200"
                  title="New PDF"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#22333B] mb-4">
                  Previous Version Diff
                </h2>
                <div className="space-y-1 max-h-[600px] overflow-auto text-sm">
                  {data.old_diff.map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded whitespace-pre-wrap ${
                        line.type === "removed"
                          ? "bg-red-100 text-red-800"
                          : line.type === "same"
                          ? "bg-transparent text-gray-700"
                          : "hidden"
                      }`}
                    >
                      {line.type === "removed" ? `- ${line.text}` : line.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#22333B] mb-4">
                  New Version Diff
                </h2>
                <div className="space-y-1 max-h-[600px] overflow-auto text-sm">
                  {data.new_diff.map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded whitespace-pre-wrap ${
                        line.type === "added"
                          ? "bg-green-100 text-green-800"
                          : line.type === "same"
                          ? "bg-transparent text-gray-700"
                          : "hidden"
                      }`}
                    >
                      {line.type === "added" ? `+ ${line.text}` : line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}