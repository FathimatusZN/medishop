"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction?id=${id}`);
      const data = await res.json();

      if (data.message) {
        setError(data.message);
      } else {
        setOrder(data);

        const ids = data.cart_item_ids;
        if (Array.isArray(ids) && ids.length > 0) {
          const res = await fetch(`/api/cart?ids=${ids.join(",")}`);
          const detail = await res.json();
          setItems(Array.isArray(detail) ? detail : []);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleAction = async (action) => {
    try {
      const res = await fetch("/api/transaction", {
        method: "PUT",
        body: JSON.stringify({ transaction_id: id, action }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        await fetchOrder(); // 👈 update data langsung
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  if (loading) return <p className="p-4 text-center">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500 text-center">Error: {error}</p>;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order Detail</h1>
      <div className="space-y-2 text-sm mb-6">
        <p>
          <strong>Transaction ID:</strong> {order.transaction_id}
        </p>
        <p>
          <strong>User ID:</strong> {order.user_id}
        </p>
        <p>
          <strong>Username:</strong> {order.username}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.transaction_date).toLocaleString()}
        </p>
        <p>
          <strong>Total:</strong> Rp.{order.total_price}
        </p>
        <p>
          <strong>Payment:</strong> {order.payment_method.toUpperCase()} via{" "}
          {order.payment_bank}
        </p>
        <p>
          <strong>Payment Status:</strong> {order.payment_status}
        </p>
        <p>
          <strong>Transaction Status:</strong> {order.transaction_status}
        </p>
        <p>
          <strong>Shipping Status:</strong> {order.shipping_status || "-"}
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-2">Items:</h2>
      <table className="w-full text-sm border border-gray-200 rounded shadow-sm mb-6">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Product</th>
            <th className="p-2">Price</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.cart_item_id} className="border-t text-center">
              <td className="p-2 text-left">{item.product_name}</td>
              <td className="p-2">Rp.{item.price}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">Rp.{item.price * item.quantity}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 text-lg border-t font-semibold">
            <td colSpan={3} className="p-2 text-right">
              Total:
            </td>
            <td className="text-center p-2 text-[#008B8B]">Rp.{total}</td>
          </tr>
        </tbody>
      </table>

      {/* Admin Actions */}
      <div className="space-x-2 mt-4">
        {order.transaction_status === "pending" && (
          <>
            <button
              onClick={() => handleAction("approve")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}
        {order.transaction_status === "approved" && (
          <button
            onClick={() => handleAction("ship")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Mark as Shipped
          </button>
        )}
        {order.shipping_status === "shipped" && (
          <button
            onClick={() => handleAction("complete")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}
