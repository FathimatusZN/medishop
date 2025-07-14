// File: src/app/(admin)/reports/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/report";
      if (startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`;
      }
      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const exportCSV = () => {
    const headers = [
      "Transaction ID",
      "Username",
      "Date",
      "Total",
      "Status",
      "Shipping",
      "Payment",
      "Bank",
    ];
    const rows = data.map((t) => [
      t.transaction_id,
      t.username,
      format(new Date(t.transaction_date), "yyyy-MM-dd HH:mm"),
      t.total_price,
      t.transaction_status,
      t.shipping_status,
      t.payment_method,
      t.payment_bank,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "report.csv");
  };

  const exportPDF = async () => {
    const url = `/api/report-pdf?start=${startDate}&end=${endDate}`;
    const res = await fetch(url);
    const blob = await res.blob();
    saveAs(blob, "report.pdf");
  };

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Report</h1>

        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filter
          </button>
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Payment</th>
                  <th className="p-2">Bank</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Shipping</th>
                </tr>
              </thead>
              <tbody>
                {data.map((tx) => (
                  <tr key={tx.transaction_id} className="border-t">
                    <td className="p-2">{tx.transaction_id}</td>
                    <td className="p-2">{tx.username}</td>
                    <td className="p-2">
                      {new Date(tx.transaction_date).toLocaleString()}
                    </td>
                    <td className="p-2">Rp.{tx.total_price}</td>
                    <td className="p-2">{tx.payment_method}</td>
                    <td className="p-2">{tx.payment_bank}</td>
                    <td className="p-2">{tx.transaction_status}</td>
                    <td className="p-2">{tx.shipping_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
