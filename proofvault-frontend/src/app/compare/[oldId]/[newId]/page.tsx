// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import AppShell from "@/components/AppShell";

// const API = "http://127.0.0.1:5001";

// type DiffLine = {
//   type: "same" | "added" | "removed";
//   text: string;
// };

// type CompareResponse = {
//   old_version_id: string;
//   new_version_id: string;
//   old_file_url: string;
//   new_file_url: string;
//   old_diff: DiffLine[];
//   new_diff: DiffLine[];
// };

// export default function ComparePage() {
//   const params = useParams<{ oldId: string; newId: string }>();
//   const oldId = params.oldId;
//   const newId = params.newId;

//   const [data, setData] = useState<CompareResponse | null>(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!oldId || !newId) return;

//     const fetchCompare = async () => {
//       try {
//         const res = await fetch(`${API}/compare/${oldId}/${newId}`);
//         const json = await res.json();

//         if (!res.ok) {
//           throw new Error(json.error || "Failed to compare versions");
//         }

//         setData(json);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : "Failed to compare versions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCompare();
//   }, [oldId, newId]);

//   return (
//     <AppShell>
//       <div className="max-w-7xl">
//         <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
//           Compare Document Versions
//         </h1>

//         {loading && (
//           <p className="text-sm text-gray-600 mb-6">Loading comparison...</p>
//         )}

//         {error && (
//           <p className="text-sm text-red-600 mb-6">{error}</p>
//         )}

//         {data && (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//                 <h2 className="text-lg font-semibold text-[#22333B] mb-4">
//                   Previous Version
//                 </h2>
//                 <iframe
//                   src={data.old_file_url}
//                   className="w-full h-[700px] rounded-lg border border-gray-200"
//                   title="Previous PDF"
//                 />
//               </div>

//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//                 <h2 className="text-lg font-semibold text-[#22333B] mb-4">
//                   New Version
//                 </h2>
//                 <iframe
//                   src={data.new_file_url}
//                   className="w-full h-[700px] rounded-lg border border-gray-200"
//                   title="New PDF"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//                 <h2 className="text-lg font-semibold text-[#22333B] mb-4">
//                   Previous Version Diff
//                 </h2>
//                 <div className="space-y-1 max-h-[600px] overflow-auto text-sm">
//                   {data.old_diff.map((line, idx) => (
//                     <div
//                       key={idx}
//                       className={`px-2 py-1 rounded whitespace-pre-wrap ${
//                         line.type === "removed"
//                           ? "bg-red-100 text-red-800"
//                           : line.type === "same"
//                           ? "bg-transparent text-gray-700"
//                           : "hidden"
//                       }`}
//                     >
//                       {line.type === "removed" ? `- ${line.text}` : line.text}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//                 <h2 className="text-lg font-semibold text-[#22333B] mb-4">
//                   New Version Diff
//                 </h2>
//                 <div className="space-y-1 max-h-[600px] overflow-auto text-sm">
//                   {data.new_diff.map((line, idx) => (
//                     <div
//                       key={idx}
//                       className={`px-2 py-1 rounded whitespace-pre-wrap ${
//                         line.type === "added"
//                           ? "bg-green-100 text-green-800"
//                           : line.type === "same"
//                           ? "bg-transparent text-gray-700"
//                           : "hidden"
//                       }`}
//                     >
//                       {line.type === "added" ? `+ ${line.text}` : line.text}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </AppShell>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";

const API = "http://127.0.0.1:5001";

type DiffLine = { type: "same" | "added" | "removed"; text: string };

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
  const { oldId, newId } = params;

  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "diff">("preview");

  useEffect(() => {
    if (!oldId || !newId) return;
    const fetchCompare = async () => {
      try {
        const res = await fetch(`${API}/compare/${oldId}/${newId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to compare versions");
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to compare versions");
      } finally {
        setLoading(false);
      }
    };
    fetchCompare();
  }, [oldId, newId]);

  const addedCount = data?.new_diff.filter((l) => l.type === "added").length ?? 0;
  const removedCount = data?.old_diff.filter((l) => l.type === "removed").length ?? 0;

  return (
    <AppShell>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22333B]/40 mb-1">
            Document History
          </p>
          <h1 className="text-2xl font-semibold text-[#22333B]">Compare Versions</h1>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-400">Loading comparison…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-[#22333B]">
                  +{addedCount} lines added
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-[#22333B]">
                  -{removedCount} lines removed
                </span>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-5 bg-white rounded-xl border border-gray-200 p-1 w-fit">
              {(["preview", "diff"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-[#22333B] text-[#EAE0D5]"
                      : "text-[#22333B]/60 hover:text-[#22333B]"
                  }`}
                >
                  {tab === "preview" ? "Document Preview" : "Text Diff"}
                </button>
              ))}
            </div>

            {/* Preview tab */}
            {activeTab === "preview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[
                  { label: "Previous Version", url: data.old_file_url },
                  { label: "New Version", url: data.new_file_url },
                ].map(({ label, url }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#22333B]">{label}</p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#22333B]/50 hover:text-[#22333B] transition"
                      >
                        Open ↗
                      </a>
                    </div>
                    <iframe
                      src={url}
                      className="w-full h-[680px]"
                      title={label}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Diff tab */}
            {activeTab === "diff" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[
                  { label: "Previous Version", lines: data.old_diff, side: "old" },
                  { label: "New Version", lines: data.new_diff, side: "new" },
                ].map(({ label, lines, side }) => (
                  <div key={side} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#22333B]">{label}</p>
                    </div>
                    <div className="overflow-auto max-h-[620px] p-4 font-mono text-xs leading-relaxed space-y-0.5">
                      {lines.map((line, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-0.5 rounded whitespace-pre-wrap ${
                            line.type === "removed"
                              ? "bg-red-50 text-red-700"
                              : line.type === "added"
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-500"
                          } ${
                            line.type === "same" && side === "new" ? "hidden" : ""
                          } ${
                            line.type === "same" && side === "old" ? "" : ""
                          }`}
                        >
                          {line.type === "removed"
                            ? `− ${line.text}`
                            : line.type === "added"
                            ? `+ ${line.text}`
                            : `  ${line.text}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}