export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-[#22333B] text-[#EAE0D5] flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold">ProofVault</h1>

      <div className="flex gap-6 text-sm">
        <a href="/" className="hover:underline">Home</a>
        <a href="/login" className="hover:underline">Login</a>
      </div>
    </nav>
  );
}