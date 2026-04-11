"use client";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";


export default function Home() {
  useEffect(() => {
    signOut(auth).catch((error) => {
      console.error("Auto logout failed:", error);
    });
  }, []);

  const stats = [
    { label: "Documents Secured", value: "12.4K+" },
    { label: "Verifications Completed", value: "48.9K+" },
    { label: "Uptime", value: "99.9%" },
  ];

  const features = [
    {
      title: "Register Proofs Instantly",
      desc: "Create immutable blockchain-backed records for contracts, wills, affidavits, and other sensitive legal documents.",
      icon: "⌘",
    },
    {
      title: "Verify in Seconds",
      desc: "Re-check any uploaded file against its on-chain fingerprint and confirm authenticity with a clean verification flow.",
      icon: "◈",
    },
    {
      title: "Built for Legal Teams",
      desc: "A polished legal-tech workspace for firms, compliance teams, and document custodians who need trust and traceability.",
      icon: "✦",
    },
  ];

  const reasons = [
    {
      title: "Tamper Detection",
      desc: "Any file change results in a different fingerprint, making hidden edits easier to detect.",
    },
    {
      title: "Timestamped Records",
      desc: "Every proof entry includes a verifiable on-chain timestamp and uploader address.",
    },
    {
      title: "Fast Verification",
      desc: "Check authenticity without digging through folders, emails, or version histories.",
    },
    {
      title: "Clear Audit Trail",
      desc: "Track registered proofs and verification activity through a structured dashboard.",
    },
  ];

  return (
    <>
    <Navbar />
    <main className="min-h-screen overflow-hidden bg-[#eff6ff] text-[#0f172a]">
      <section className="relative isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.25),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#1e3a8a_50%,#2563eb_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-6 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative">
              <span className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#dbeafe] backdrop-blur">
                Blockchain-backed legal document security
              </span>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                Your trusted desk for{" "}
                <span className="text-[#93c5fd]">legal document</span> verification
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
                Register, verify, and track sensitive legal files with immutable blockchain proof records. Designed for law firms, estate planners, and compliance teams that need authenticity without complexity.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/login"
                  className="w-[180px] text-center rounded-2xl bg-[#3b82f6] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-900/30 transition hover:-translate-y-0.5 hover:bg-[#2563eb]"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="w-[180px] text-center rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Create Account
                </a>
              </div>

              <div className="mt-14 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
                  >
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-[#3b82f6]/30 blur-3xl" />
              <div className="absolute -right-6 bottom-10 h-24 w-24 rounded-full bg-[#60a5fa]/30 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-[#0f172a]/35 backdrop-blur-xl">
                <div className="rounded-[1.6rem] border border-white/15 bg-[#eff6ff] p-5 text-[#0f172a] shadow-inner">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#64748b]">Latest registered proof</p>
                      <h2 className="mt-1 text-2xl font-semibold">Estate Transfer Agreement</h2>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-4 py-3 text-right text-white shadow-lg">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/70">Status</p>
                      <p className="text-base font-semibold">Verified</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.16em] text-[#60a5fa]">Hash</p>
                      <p className="mt-2 text-sm font-semibold">0xA41F...9C2B</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.16em] text-[#60a5fa]">Timestamp</p>
                      <p className="mt-2 text-sm font-semibold">2026-04-11</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.16em] text-[#60a5fa]">Network</p>
                      <p className="mt-2 text-sm font-semibold">Proof Chain</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-5 text-white">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-sm text-white/70">Blockchain record</p>
                        <p className="mt-2 text-3xl font-semibold">Immutable proof, readable history</p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl">
                        ⚖
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-4/5 rounded-full bg-[#93c5fd]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative -mt-10 mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[2rem] border border-[#dbeafe] bg-white/85 p-7 shadow-[0_20px_60px_rgba(37,99,235,0.08)] backdrop-blur"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-2xl text-white shadow-lg shadow-blue-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a]">{feature.title}</h3>
              <p className="mt-3 leading-7 text-[#475569]">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">Why trust us</p>
          <h2 className="mt-4 text-4xl font-semibold text-[#0f172a] sm:text-5xl">
            Built for credibility, clarity, and control
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#475569]">
            ProofVault combines legal-tech simplicity with blockchain-backed integrity so your team can protect sensitive records with more confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason.title} className="rounded-[2rem] bg-[#1e3a8a] p-7 text-white shadow-xl shadow-blue-200/30">
              <div className="mb-5 h-1.5 w-14 rounded-full bg-[#3b82f6]" />
              <h3 className="text-xl font-semibold">{reason.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{reason.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[2.2rem] border border-[#dbeafe] bg-white shadow-[0_25px_80px_rgba(37,99,235,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-[#0f172a] sm:text-4xl">
                One secure flow from upload to verification
              </h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-[#475569]">
                Keep your process simple: register the file, store the proof, and verify it later whenever authenticity needs to be demonstrated.
              </p>
            </div>

            <div className="grid gap-0 divide-y divide-[#dbeafe]">
              {[
                ["1", "Upload document", "Add a legal file and generate its unique cryptographic fingerprint."],
                ["2", "Store blockchain proof", "Record the file hash, timestamp, and metadata in an immutable proof entry."],
                ["3", "Verify anytime", "Re-upload the file later and compare it against the stored record instantly."],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex gap-5 p-8 sm:p-10">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe] text-lg font-semibold text-[#1d4ed8]">
                    {num}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0f172a]">{title}</h3>
                    <p className="mt-2 leading-7 text-[#475569]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-[#0f172a] to-[#2563eb] px-8 py-12 text-center text-white shadow-2xl shadow-blue-300/30 sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">Ready to start</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Secure your legal records with a cleaner, more modern workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/75">
            Whether you need trusted proof registration or fast authenticity checks, ProofVault keeps the experience professional, polished, and easy to use.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/login"
              className="rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-[#1e3a8a] transition hover:-translate-y-0.5"
            >
              Login
            </a>
            <a
              href="/verify"
              className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Check Authenticity
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}