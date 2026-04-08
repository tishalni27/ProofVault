export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#22333B] text-[#EAE0D5] p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-8">Dashboard</h2>

      <nav className="flex flex-col gap-4 text-sm">
        <a href="/dashboard" className="hover:underline">Overview</a>
        <a href="/upload" className="hover:underline">Upload</a>
        <a href="/verify" className="hover:underline">Verify</a>
        <a href="/history/1" className="hover:underline">History</a>
      </nav>
    </aside>
  );
}