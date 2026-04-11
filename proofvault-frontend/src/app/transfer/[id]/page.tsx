"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:5001";

type Lawyer = {
  uid: string;
  full_name: string;
  email: string;
};

export default function TransferOwnershipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [removeOldAccess, setRemoveOldAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${API}/users/lawyers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load lawyers");

        const filtered = (data.lawyers || []).filter(
          (lawyer: Lawyer) => lawyer.uid !== user?.uid
        );

        setLawyers(filtered);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load lawyers");
      } finally {
        setFetching(false);
      }
    };

    if (user) fetchLawyers();
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.uid) {
      setError("You must be logged in.");
      return;
    }

    if (!selectedLawyer) {
      setError("Please select a new lawyer.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/documents/${params.id}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          current_lawyer_uid: user.uid,
          new_lawyer_uid: selectedLawyer,
          remove_old_lawyer_access: removeOldAccess
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");

      setSuccess("Ownership transferred successfully.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <AppShell>
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold text-[#22333B] mb-2">
            Transfer Document Ownership
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Assign this document and its full history to another lawyer.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            {fetching ? (
              <p className="text-sm text-gray-600">Loading lawyers...</p>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#22333B] mb-2">
                    New Lawyer
                  </label>
                  <select
                    value={selectedLawyer}
                    onChange={(e) => setSelectedLawyer(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#22333B]"
                  >
                    <option value="">Select a lawyer</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.uid} value={lawyer.uid}>
                        {lawyer.full_name} ({lawyer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={removeOldAccess}
                    onChange={(e) => setRemoveOldAccess(e.target.checked)}
                  />
                  Remove old lawyer access after transfer
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="flex justify-end gap-3">
                  <a
                    href="/dashboard"
                    className="px-5 py-3 rounded-lg border border-[#22333B] text-[#22333B] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 rounded-lg bg-[#22333B] text-[#EAE0D5] hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Transferring..." : "Transfer Ownership"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}