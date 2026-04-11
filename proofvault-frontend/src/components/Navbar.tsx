export default function Navbar() {
  return (
    <nav className="w-full h-16 fixed top-0 z-50 backdrop-blur-lg bg-[#0f172a]/70 text-white flex items-center justify-between px-10 border-b border-white/10 shadow-lg">
      
      {/* Logo */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center font-bold text-white shadow-md group-hover:scale-110 transition duration-300">
          P
        </div>
        <h1 className="text-lg font-semibold tracking-wide group-hover:text-[#93c5fd] transition">
          ProofVault
        </h1>
      </div>

      {/* Links */}
      <div className="flex items-center gap-8 text-sm font-medium">
        
        <a href="/" className="relative group">
          Home
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#3b82f6] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a href="#features" className="relative group">
          Features
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#3b82f6] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a href="#why" className="relative group">
          Why Us
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#3b82f6] transition-all duration-300 group-hover:w-full"></span>
        </a>

        {/* Login */}
        <a
          href="/login"
          className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 hover:scale-105 transition duration-300"
        >
          Login
        </a>

        {/* Dashboard */}
        <a
          href="/dashboard"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] transition duration-300 font-semibold shadow-md hover:shadow-blue-500/30 hover:scale-105"
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}