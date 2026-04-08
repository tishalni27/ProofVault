import AppShell from "@/components/AppShell";
import DocumentCard from "@/components/DocumentCard";

export default function Dashboard() {
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#22333B]">
          Your Documents
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by file name..."
            className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22333B]"
          />

          <div className="flex gap-3">
            <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22333B]">
              <option>All Types</option>
              <option>Will</option>
              <option>Contract</option>
              <option>Inheritance</option>
            </select>

            <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22333B]">
              <option>All Statuses</option>
              <option>Verified</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DocumentCard
          name="Will_v1.pdf"
          type="Will"
          date="20 Apr 2026"
          status="verified"
        />

        <DocumentCard
          name="House_Agreement.pdf"
          type="Contract"
          date="18 Apr 2026"
          status="pending"
        />

        <DocumentCard
          name="Family_Estate_Record.pdf"
          type="Inheritance"
          date="12 Apr 2026"
          status="verified"
        />
      </div>
    </AppShell>
  );
}