import AppShell from "@/components/AppShell";

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
          Document History
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Version history of this document. Each update is tracked and immutable.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

          {/* Version List */}
          <div className="flex flex-col gap-6">

            {/* Version 3 (Latest) */}
            <div className="flex gap-4">
              <div className="w-3 h-3 mt-2 rounded-full bg-green-600"></div>

              <div>
                <p className="font-semibold text-[#22333B]">
                  Version 3 (Latest Accepted)
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded: 22 Apr 2026
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Verified and accepted as current version
                </p>
              </div>
            </div>

            {/* Version 2 */}
            <div className="flex gap-4">
              <div className="w-3 h-3 mt-2 rounded-full bg-yellow-500"></div>

              <div>
                <p className="font-semibold text-[#22333B]">
                  Version 2
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded: 20 Apr 2026
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Pending verification
                </p>
              </div>
            </div>

            {/* Version 1 */}
            <div className="flex gap-4">
              <div className="w-3 h-3 mt-2 rounded-full bg-gray-400"></div>

              <div>
                <p className="font-semibold text-[#22333B]">
                  Version 1 (Original)
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded: 18 Apr 2026
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Initial document upload
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}