"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/transaction")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (tx) => tx.feedback && tx.feedback.trim() !== ""
        );
        setFeedbacks(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load feedbacks");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4 text-center">Loading...</p>;
  if (error) return <p className="p-4 text-red-500 text-center">{error}</p>;

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">User Feedback</h1>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 text-sm">No feedbacks available.</p>
        ) : (
          <table className="w-full text-sm border border-gray-200 rounded shadow-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">Transaction ID</th>
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.transaction_id} className="border-t">
                  <td className="p-2">{fb.transaction_id}</td>
                  <td className="p-2">{fb.username}</td>
                  <td className="p-2 whitespace-pre-wrap">{fb.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedRoute>
  );
}
