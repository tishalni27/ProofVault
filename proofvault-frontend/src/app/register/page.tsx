// export default function RegisterPage() {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#3b82f6] px-6 pt-32 pb-16">
      
//       <div className="mx-auto w-full max-w-5xl rounded-[32px] bg-white p-8 shadow-[0_25px_80px_rgba(37,99,235,0.15)] sm:p-12">
        
//         {/* Header */}
//         <div className="mb-10 text-center">
//           <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
//             Registration
//           </p>
//           <h1 className="mt-3 text-4xl font-semibold text-[#0f172a] sm:text-5xl">
//             Create your ProofVault account
//           </h1>
//           <p className="mx-auto mt-4 max-w-2xl text-[#475569] leading-7">
//             Set up your account to securely upload, verify, and manage blockchain-backed legal documents.
//           </p>
//         </div>

//         {/* Form */}
//         <form className="grid gap-6 md:grid-cols-2">

//           <div className="md:col-span-2">
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Full name
//             </label>
//             <input
//               type="text"
//               placeholder="Enter your full name"
//               className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Role
//             </label>
//             <select className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20">
//               <option>Select your role</option>
//               <option>Lawyer</option>
//               <option>Client</option>
              
              
              
//             </select>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Phone number
//             </label>
//             <input
//               type="tel"
//               placeholder="Enter your phone number"
//               className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Email address
//             </label>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Create a password"
//               className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[#0f172a]">
//               Confirm password
//             </label>
//             <input
//               type="password"
//               placeholder="Re-enter your password"
//               className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
//             />
//           </div>

//           <div className="md:col-span-2 flex items-start gap-3 rounded-2xl bg-[#eff6ff] p-4">
//             <input type="checkbox" className="mt-1 rounded border-[#cbd5f5]" />
//             <p className="text-sm leading-6 text-[#475569]">
//               I agree to the terms and confirm that the information provided is accurate.
//             </p>
//           </div>

//           <div className="md:col-span-2 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-sm text-[#475569]">
//               Already have an account?{" "}
//               <a href="/login" className="font-semibold text-[#2563eb] hover:underline">
//                 Sign in
//               </a>
//             </p>

//             <button
//               type="submit"
//               className="rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-8 py-3.5 font-semibold text-white transition hover:scale-[1.02] hover:shadow-blue-500/30"
//             >
//               Create Account
//             </button>
//           </div>
//         </form>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !role || !phone || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (role !== "lawyer" && role !== "client") {
      setError("Please select a valid role.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("You must accept the terms.");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await set(ref(db, `users/${cred.user.uid}`), {
        full_name: fullName,
        email,
        phone,
        role,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#3b82f6] px-6 pt-32 pb-16">
      <div className="mx-auto w-full max-w-5xl rounded-[32px] bg-white p-8 shadow-[0_25px_80px_rgba(37,99,235,0.15)] sm:p-12">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
            Registration
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0f172a] sm:text-5xl">
            Create your ProofVault account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[#475569] leading-7">
            Set up your account to securely upload, verify, and manage blockchain-backed legal documents.
          </p>
        </div>

        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleRegister}>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            >
              <option value="">Select your role</option>
              <option value="lawyer">Lawyer</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
            />
          </div>

          <div className="md:col-span-2 flex items-start gap-3 rounded-2xl bg-[#eff6ff] p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded border-[#cbd5f5]"
            />
            <p className="text-sm leading-6 text-[#475569]">
              I agree to the terms and confirm that the information provided is accurate.
            </p>
          </div>

          {error && (
            <div className="md:col-span-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#475569]">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-[#2563eb] hover:underline">
                Sign in
              </a>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-8 py-3.5 font-semibold text-white transition hover:scale-[1.02] hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </main>
    </>
  );
}