"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { profile, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#22333B] to-[#1e293b] text-white p-6 flex flex-col justify-between shadow-xl">
      
      {/* TOP SECTION */}
      <div>
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-10 tracking-wide text-[#EAE0D5]">
          Dashboard
        </h2>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 text-sm">
          
          <a
            href="/dashboard"
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
          >
            Overview
          </a>

          {profile?.role === "lawyer" && (
            <a
              href="/upload"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
            >
              Upload
            </a>
          )}

          <a
            href="/verify"
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-[#3b82f6] hover:text-white transition duration-300"
          >
            Verify
          </a>
        </nav>
      </div>

      {/* BOTTOM USER SECTION */}
      <div className="mt-10 border-t border-white/10 pt-6">
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">
            {profile?.full_name || "User"}
          </p>
          <p className="text-xs text-white/70">
            {user?.email}
          </p>
          <p className="text-xs mt-1 text-[#93c5fd] uppercase tracking-wide">
            {profile?.role}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white transition duration-300 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}