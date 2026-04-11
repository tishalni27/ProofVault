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
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[220px]">
      <div>
        <p className="font-semibold text-[#22333B] text-lg break-words">{name}</p>
        <p className="text-sm text-gray-500 mt-2">Type: {type}</p>
        <p className="text-sm text-gray-500">Uploaded: {date}</p>
      </div>

      <div className="mt-5">
        <span
          className={`text-sm font-medium ${
            status === "verified" ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {status === "verified" ? "Registered" : "Pending"}
        </span>

        <div className="mt-3 flex gap-2 flex-wrap">
          <a
            href="/verify"
            className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
          >
            Verify
          </a>

        {canUploadLatest && (
          <a
            href={latestVersionHref}
            className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
          >
            Upload Latest Version
          </a>
        )}


        {canTransfer && (
          <a
            href={transferHref}
            className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
          >
            Transfer Ownership
          </a>
        )}

          <a
            href={historyHref}
            className="text-xs px-3 py-2 border border-[#22333B] rounded-md hover:bg-gray-100 transition"
          >
            History
          </a>
        </div>
      </div>
    </div>
  );
}