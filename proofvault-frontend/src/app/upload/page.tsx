import AppShell from "@/components/AppShell";

export default function UploadPage() {
  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
          Upload Document
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Upload an original legal document to register it and begin its version history.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#22333B] mb-2">
                Document Title
              </label>
              <input
                type="text"
                placeholder="Enter document title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#22333B] mb-2">
                Document Type
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B]">
                <option>Select document type</option>
                <option>Will</option>
                <option>Contract</option>
                <option>Inheritance</option>
                <option>Property Agreement</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#22333B] mb-2">
              Upload File
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-[#faf7f3] p-10 text-center hover:border-[#22333B] transition">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#22333B] text-[#EAE0D5] flex items-center justify-center text-xl">
                  ↑
                </div>
                <p className="text-[#22333B] font-medium">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse from your device
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PDF, DOCX
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f5f1] border border-gray-200 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-[#22333B] mb-3">
              Upload Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                Document Name: <span className="text-[#22333B]">No file selected</span>
              </p>
              <p>
                Version: <span className="text-[#22333B]">Initial Upload</span>
              </p>
              <p>
                Status: <span className="text-yellow-600">Pending Registration</span>
              </p>
              <p>
                Blockchain Record: <span className="text-[#22333B]">Not yet created</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition">
              Cancel
            </button>
            <button className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition">
              Upload and Register
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}