"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function GuestbookDetailPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/guestbook?id=${id}`);
        const data = await res.json();
        setEntry(data);
      } catch (err) {
        console.error("Failed to load guestbook entry", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEntry();
  }, [id]);

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="max-w-xl mx-auto mt-10 px-4">
        {/* Tombol Back */}
        <div className="mb-4">
          <Link
            href="/guestbook-list"
            className="inline-block text-sm text hover:underline"
          >
            ← Back
          </Link>
        </div>

        {/* Box detail */}
        <div className="border rounded shadow px-6 py-8 bg-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Guestbook Entry Detail
          </h1>

          {loading ? (
            <p className="text-center text-gray-500 text-sm">Loading...</p>
          ) : !entry ? (
            <p className="text-center text-red-600 text-sm">Entry not found.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[150px_10px_1fr] gap-2">
                <span className="font-medium text-gray-700">ID</span>
                <span>:</span>
                <span>{entry.guestbook_id}</span>
              </div>
              <div className="grid grid-cols-[150px_10px_1fr] gap-2">
                <span className="font-medium text-gray-700">Full Name</span>
                <span>:</span>
                <span>{entry.full_name}</span>
              </div>
              <div className="grid grid-cols-[150px_10px_1fr] gap-2">
                <span className="font-medium text-gray-700">Email</span>
                <span>:</span>
                <span>{entry.email}</span>
              </div>
              <div className="grid grid-cols-[150px_10px_1fr] gap-2">
                <span className="font-medium text-gray-700">Message</span>
                <span>:</span>
                <span>{entry.message}</span>
              </div>
              <div className="grid grid-cols-[150px_10px_1fr] gap-2">
                <span className="font-medium text-gray-700">Submitted At</span>
                <span>:</span>
                <span>{new Date(entry.created_at).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
