"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(""); // ⬅️ inisialisasi awal kosong
  const [saving, setSaving] = useState(false);

  // Ambil data transaksi
  useEffect(() => {
    fetch(`/api/transaction?id=${id}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.message) setError(data.message);
        else {
          setTransaction(data);

          // ⬅️ Set feedback setelah data tersedia
          setFeedback(data.feedback || "");

          // fetch cart items detail
          const cartItemIds = data.cart_item_ids;
          if (Array.isArray(cartItemIds) && cartItemIds.length > 0) {
            const res = await fetch(`/api/cart?ids=${cartItemIds.join(",")}`);
            const cartItems = await res.json();
            setItems(Array.isArray(cartItems) ? cartItems : []);
          } else {
            setItems([]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch transaction");
        setLoading(false);
      });
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this transaction?")) return;

    try {
      const res = await fetch(`/api/transaction?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        alert("Transaction canceled successfully.");
        router.push("/transactions");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel transaction.");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return alert("Feedback cannot be empty.");

    setSaving(true);
    const res = await fetch("/api/transaction", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: transaction.transaction_id,
        feedback,
      }),
    });

    const result = await res.json();
    setSaving(false);
    if (res.ok) {
      alert("Feedback saved successfully.");
    } else {
      alert(result.message || "Failed to save feedback.");
    }
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 p-4">Error: {error}</p>;
  if (!transaction)
    return <p className="text-center p-4">Transaction not found.</p>;

  const total = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction Detail</h1>
      <div className="space-y-2 text-sm mb-6">
        <p>
          <strong>ID:</strong> {transaction.transaction_id}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(transaction.transaction_date).toLocaleString()}
        </p>
        <p>
          <strong>Total:</strong> Rp.{transaction.total_price}
        </p>
        <p>
          <strong>Payment:</strong> {transaction.payment_method.toUpperCase()}{" "}
          via {transaction.payment_bank}
        </p>
        <p>
          <strong>Payment Status:</strong> {transaction.payment_status}
        </p>
        <p>
          <strong>Transaction Status:</strong> {transaction.transaction_status}
        </p>
        <p>
          <strong>Shipping Status:</strong> {transaction.shipping_status || "-"}
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-2">Items:</h2>
      <table className="w-full text-sm border border-gray-200 rounded overflow-hidden shadow-sm mb-4">
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

      <div>
        <a
          href={`/api/invoice?id=${transaction.transaction_id}`}
          target="_blank"
          className="inline-block bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 mt-4"
        >
          Download Invoice (PDF)
        </a>
      </div>

      {/* Feedback section */}
      {transaction.transaction_status === "completed" &&
        transaction.shipping_status === "delivered" && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Your Feedback:</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Write your feedback here..."
              className="w-full p-2 border rounded text-sm"
            />
            <button
              onClick={handleSubmitFeedback}
              disabled={saving}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {transaction.feedback ? "Update Feedback" : "Submit Feedback"}
            </button>
          </div>
        )}

      {/* Cancel button if still pending */}
      {transaction.transaction_status === "pending" && (
        <div className="mt-6 text-right">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleCancel}
          >
            Cancel Transaction
          </button>
        </div>
      )}
    </div>
  );
}
