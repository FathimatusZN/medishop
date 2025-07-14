"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/transaction")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        else setError("Failed to fetch orders");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4 text-center">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      <div className="overflow-auto">
        <table className="w-full text-sm border border-gray-300 rounded shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Date</th>
              <th className="p-2">Total</th>
              <th className="p-2">Payment</th>
              <th className="p-2">Payment Status</th>
              <th className="p-2">Transaction Status</th>
              <th className="p-2">Shipping</th>
              <th className="p-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.transaction_id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-2">{order.transaction_id}</td>
                <td className="p-2">{order.user_id}</td>
                <td className="p-2">{order.username || "-"}</td>
                <td className="p-2">
                  {new Date(order.transaction_date).toLocaleString()}
                </td>
                <td className="p-2">Rp.{order.total_price}</td>
                <td className="p-2">{order.payment_method.toUpperCase()}</td>
                <td className="p-2">{order.payment_status}</td>
                <td className="p-2">{order.transaction_status}</td>
                <td className="p-2">{order.shipping_status || "-"}</td>
                <td className="p-2">
                  <Link
                    href={`/orders/${order.transaction_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
