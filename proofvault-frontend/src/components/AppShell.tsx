import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-10 min-h-screen bg-[#EAE0D5]">
        {children}
      </main>
    </div>
  );
}