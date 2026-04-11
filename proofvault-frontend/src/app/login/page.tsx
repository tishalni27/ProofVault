export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eff6ff] flex items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(37,99,235,0.10)] lg:grid-cols-2">
        
        {/* Left Side */}
        <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb] p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 font-bold text-white">
                P
              </div>
              <div>
                <h1 className="text-xl font-semibold">ProofVault</h1>
                <p className="text-sm text-white/70">Secure legal verification</p>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                Welcome back
              </p>
              <h2 className="mt-4 text-5xl font-semibold leading-tight">
                Access your secure legal workspace
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-white/75">
                Log in to verify documents, upload records, and manage blockchain-backed proof history in one place.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-white/65">Trusted by teams for</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold">12.4K+</p>
                <p className="text-sm text-white/60">Documents secured</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">48.9K+</p>
                <p className="text-sm text-white/60">Checks completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
              Login
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-[#0f172a]">
              Sign in to your account
            </h2>
            <p className="mt-3 text-[#475569]">
              Continue to your dashboard and manage your proof records securely.
            </p>

            <form className="mt-10 space-y-5">
              
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0f172a]">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0f172a]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/20"
                />
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#475569]">
                  <input type="checkbox" className="rounded border-[#cbd5f5]" />
                  Remember me
                </label>
                <a href="#" className="font-medium text-[#2563eb] hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-5 py-3.5 font-semibold text-white transition hover:scale-[1.02] hover:shadow-blue-500/30"
              >
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#475569]">
              Don&apos;t have an account?{" "}
              <a href="/register" className="font-semibold text-[#2563eb] hover:underline">
                Create one
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}