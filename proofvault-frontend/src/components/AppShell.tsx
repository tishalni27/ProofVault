import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 pt-24 px-10 pb-10 min-h-screen bg-[#EAE0D5]">
        {children}
      </main>
    </div>
  );
}