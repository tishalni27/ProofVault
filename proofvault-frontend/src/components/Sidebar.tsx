// "use client";

// import { signOut } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";

// export default function Sidebar() {
//   const { profile, user } = useAuth();
//   const router = useRouter();

//   const handleLogout = async () => {
//     await signOut(auth);
//     router.push("/login");
//   };

//   return (
//     <aside className="w-64 min-h-screen bg-gradient-to-b from-[#22333B] to-[#1e293b] text-white p-6 flex flex-col justify-between shadow-xl">
      
//       {/* TOP SECTION */}
//       <div>
//         {/* Title */}
//         <h2 className="text-2xl font-semibold mb-10 tracking-wide text-[#EAE0D5]">
//           Dashboard
//         </h2>

//         {/* Navigation */}
//         <nav className="flex flex-col gap-3 text-sm">
          
//           <a
//             href="/dashboard"
//             className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
//           >
//             Overview
//           </a>

//           {profile?.role === "lawyer" && (
//             <a
//               href="/upload"
//               className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
//             >
//               Upload
//             </a>
//           )}

//           <a
//             href="/verify"
//             className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
//           >
//             Verify
//           </a>
//           {profile?.role === "lawyer" && (
//             <a href="/clients" className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300">
//               Clients
//             </a>
//           )}
//         </nav>
//       </div>

//       {/* BOTTOM USER SECTION */}
//       <div className="mt-10 border-t border-white/10 pt-6">
        
//         <div className="mb-4">
//           <p className="text-sm font-semibold text-white">
//             {profile?.full_name || "User"}
//           </p>
//           <p className="text-xs text-white/70">
//             {user?.email}
//           </p>
//           <p className="text-xs mt-1 text-[#93c5fd] uppercase tracking-wide">
//             {profile?.role}
//           </p>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full py-2 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white transition duration-300 text-sm font-medium"
//         >
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }

"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Overview", always: true },
    { href: "/upload", label: "Upload", lawyerOnly: true },
    { href: "/clients", label: "Clients", lawyerOnly: true },
    { href: "/verify", label: "Verify", always: true },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="w-64 min-h-screen bg-[#22333B] text-white flex flex-col justify-between shadow-xl shrink-0">
      {/* Logo / Brand */}
      <div>
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAE0D5] flex items-center justify-center text-[#22333B] font-bold text-sm tracking-tight">
              PV
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">ProofVault</p>
              <p className="text-[11px] text-white/50 mt-0.5 leading-none">Legal Document Security</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-4 py-5 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 px-3 mb-2">
            Navigation
          </p>
          {navLinks.map(({ href, label, always, lawyerOnly }) => {
            if (lawyerOnly && profile?.role !== "lawyer") return null;
            if (!always && !lawyerOnly) return null;
            const active = isActive(href);
            return (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    active ? "bg-[#EAE0D5]" : "bg-transparent"
                  }`}
                />
                {label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#EAE0D5]/20 flex items-center justify-center text-xs font-semibold text-[#EAE0D5] shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-none">
              {profile?.full_name || "User"}
            </p>
            <p className="text-[10px] text-white/40 truncate mt-0.5 leading-none">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="px-3">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#EAE0D5]/60 bg-white/10 rounded-md px-2 py-0.5 mb-3">
            {profile?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mx-1 text-left px-3 py-2 rounded-xl text-sm text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 font-medium"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}