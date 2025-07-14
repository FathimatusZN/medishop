"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function GuestbookListPage() {
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guestbook");
      const data = await res.json();
      setGuestbookEntries(data);
    } catch (err) {
      console.error("Error fetching guestbook entries:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/guestbook?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Entry deleted successfully.");
        fetchEntries();
        setSelectedEntry(null);
      } else {
        alert("Failed to delete entry.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting entry.");
    }
  };

  const handleView = (id) => {
    router.push(`/guestbook-list/${id}`);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Guestbook List</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Full Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Submitted At</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {guestbookEntries.map((entry) => (
                  <tr key={entry.guestbook_id} className="border-t">
                    <td className="px-4 py-2">{entry.guestbook_id}</td>
                    <td className="px-4 py-2">{entry.full_name}</td>
                    <td className="px-4 py-2">{entry.email}</td>
                    <td className="px-4 py-2">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded mr-4"
                        onClick={() => handleView(entry.guestbook_id)}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded "
                        onClick={() => handleDelete(entry.guestbook_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {guestbookEntries.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedEntry && (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Guestbook Detail</h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>ID:</strong> {selectedEntry.guestbook_id}
              </p>
              <p>
                <strong>Name:</strong> {selectedEntry.full_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedEntry.email}
              </p>
              <p>
                <strong>Message:</strong> {selectedEntry.message}
              </p>
              <p>
                <strong>Submitted At:</strong>{" "}
                {new Date(selectedEntry.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
