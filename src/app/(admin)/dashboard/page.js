"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="p-4 text-center text-slate-600">Loading dashboard...</p>
    );
  }

  const cards = [
    { label: "Completed Transactions", value: stats.completed },
    { label: "Transactions Being Shipped", value: stats.shipped },
    { label: "Pending Transactions", value: stats.pending },
    { label: "Rejected Transactions", value: stats.rejected },
    { label: "Approved but Not Yet Shipped", value: stats.approvedNotShipped },
    { label: "Total Products", value: stats.productCount },
    { label: "Total Users", value: stats.userCount },
    {
      label: "Total Revenue (Completed)",
      value: `Rp.${parseInt(stats.totalRevenue).toLocaleString()}`,
    },
    { label: "Guestbook Entries", value: stats.guestbookCount },
  ];

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-800 mb-10">
          Admin Dashboard
        </h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col items-center justify-center text-center min-h-[140px] space-y-2"
            >
              <p className="text-lg text-slate-700 font-medium">{card.label}</p>
              <p className="text-3xl font-semibold text-emerald-600">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
