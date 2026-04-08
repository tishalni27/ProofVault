import AppShell from "@/components/AppShell";

export default function VerifyPage() {
  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
          Verify Document
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Upload a document to verify its authenticity against the latest accepted version.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          {/* Select Original Document */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#22333B] mb-2">
              Select Original Document
            </label>

            <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B]">
              <option>Select document</option>
              <option>Will_v1.pdf</option>
              <option>House_Agreement.pdf</option>
            </select>
          </div>

          {/* Upload New File */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#22333B] mb-2">
              Upload File to Compare
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-[#faf7f3] p-10 text-center hover:border-[#22333B] transition">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#22333B] text-[#EAE0D5] flex items-center justify-center text-xl">
                  ↑
                </div>
                <p className="text-[#22333B] font-medium">
                  Drag and drop file for verification
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-[#f8f5f1] border border-gray-200 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-[#22333B] mb-3">
              Verification Result
            </h2>

            <p className="text-sm text-gray-600">
              Status: <span className="text-gray-800">No file uploaded</span>
            </p>

            <p className="text-sm text-gray-600 mt-2">
              Compared Against: <span className="text-gray-800">Latest Version</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition">
              Cancel
            </button>

            <button className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition">
              Run Verification
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}