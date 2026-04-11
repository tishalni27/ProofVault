// // type Props = {
// //   name: string;
// //   type: string;
// //   date: string;
// //   status: "verified" | "pending";
// //   historyHref?: string;
// // };

// // export default function DocumentCard({
// //   name,
// //   type,
// //   date,
// //   status,
// //   historyHref = "/history/1",
// // }: Props) {
// //   return (
// //     <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[220px]">
// //       <div>
// //         <p className="font-semibold text-[#22333B] text-lg break-words">{name}</p>
// //         <p className="text-sm text-gray-500 mt-2">Type: {type}</p>
// //         <p className="text-sm text-gray-500">Uploaded: {date}</p>
// //       </div>

// //       <div className="mt-5">
// //         <span
// //           className={`text-sm font-medium ${
// //             status === "verified" ? "text-green-600" : "text-yellow-600"
// //           }`}
// //         >
// //           {status === "verified" ? "Registered" : "Pending"}
// //         </span>

// //         <div className="mt-3 flex gap-2 flex-wrap">
// //           <a
// //             href="/verify"
// //             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
// //           >
// //             Verify
// //           </a>

// //           <a
// //             href={historyHref}
// //             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
// //           >
// //             History
// //           </a>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// type Props = {
//   name: string;
//   type: string;
//   date: string;
//   status: "verified" | "pending";
//   historyHref?: string;
//   latestVersionHref?: string;
//   transferHref?: string;
//   canUploadLatest?: boolean;
//   canTransfer?: boolean;
// };

// export default function DocumentCard({
//   name,
//   type,
//   date,
//   status,
//   historyHref = "/history/1",
//   latestVersionHref = "/upload",
//   transferHref = "/dashboard",
//   canUploadLatest = false,
//   canTransfer = false,
// }: Props) {
//   return (
//     <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[220px]">
//       <div>
//         <p className="font-semibold text-[#22333B] text-lg break-words">{name}</p>
//         <p className="text-sm text-gray-500 mt-2">Type: {type}</p>
//         <p className="text-sm text-gray-500">Uploaded: {date}</p>
//       </div>

//       <div className="mt-5">
//         <span
//           className={`text-sm font-medium ${
//             status === "verified" ? "text-green-600" : "text-yellow-600"
//           }`}
//         >
//           {status === "verified" ? "Registered" : "Pending"}
//         </span>

//         <div className="mt-3 flex gap-2 flex-wrap">
//           <a
//             href="/verify"
//             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
//           >
//             Verify
//           </a>

//         {canUploadLatest && (
//           <a
//             href={latestVersionHref}
//             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
//           >
//             Upload Latest Version
//           </a>
//         )}


//         {canTransfer && (
//           <a
//             href={transferHref}
//             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
//           >
//             Transfer Ownership
//           </a>
//         )}

//           <a
//             href={historyHref}
//             className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
//           >
//             History
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

type Props = {
  name: string;
  type: string;
  date: string;
  status: "verified" | "pending";
  historyHref?: string;
  latestVersionHref?: string;
  transferHref?: string;
  canUploadLatest?: boolean;
  canTransfer?: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  Will: "bg-purple-100 text-purple-700",
  Contract: "bg-blue-100 text-blue-700",
  Inheritance: "bg-amber-100 text-amber-700",
  "Property Agreement": "bg-emerald-100 text-emerald-700",
  Document: "bg-gray-100 text-gray-600",
};

export default function DocumentCard({
  name,
  type,
  date,
  status,
  historyHref = "/history/1",
  latestVersionHref = "/upload",
  transferHref = "/dashboard",
  canUploadLatest = false,
  canTransfer = false,
}: Props) {
  const typeColor = TYPE_COLORS[type] ?? TYPE_COLORS["Document"];

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-[#22333B]/30 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[#22333B] to-[#22333B]/40" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#22333B] text-sm leading-snug break-words line-clamp-2">
              {name}
            </p>
          </div>
          <span
            className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${typeColor}`}
          >
            {type}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mb-auto">
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              status === "verified" ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === "verified" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {status === "verified" ? "Registered" : "Pending"}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-2 mb-5">{date}</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <a
            href="/verify"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#EAE0D5] text-[#22333B] font-medium hover:bg-[#d8cfc4] transition"
          >
            Verify
          </a>

          <a
            href={historyHref}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#EAE0D5] text-[#22333B] font-medium hover:bg-[#d8cfc4] transition"
          >
            History
          </a>

          {canUploadLatest && (
            <a
              href={latestVersionHref}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#EAE0D5] text-[#22333B] font-medium hover:bg-[#d8cfc4] transition"
            >
              New Version
            </a>
          )}

          {canTransfer && (
            <a
              href={transferHref}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#22333B] text-[#EAE0D5] font-medium hover:opacity-80 transition"
            >
              Transfer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}