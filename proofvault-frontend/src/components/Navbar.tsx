"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="w-full h-16 bg-[#22333B] text-[#EAE0D5] flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold">ProofVault</h1>

      <div className="flex items-center gap-6 text-sm">
        <a href="/" className="hover:underline">Home</a>

        {!loading && !user && (
          <>
            <a href="/login" className="hover:underline">Login</a>
            <a href="/register" className="hover:underline">Register</a>
          </>
        )}

        {!loading && user && (
          <>
            <span className="text-[#EAE0D5]/80">
              {profile?.full_name || user.email} {profile?.role ? `(${profile.role})` : ""}
            </span>
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}