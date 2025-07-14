"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState("");
  const [paymentType, setPaymentType] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(null);

  const fetchCart = async () => {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) return;

    const res = await fetch(`/api/cart?user_id=${user_id}`);
    const data = await res.json();
    setCartItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cart_item_id, delta) => {
    const item = cartItems.find((i) => i.cart_item_id === cart_item_id);
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: item.user_id,
          product_id: item.product_id,
          quantity: delta,
        }),
      });

      if (res.ok) fetchCart();
    } catch (err) {
      console.error("Update quantity failed", err);
    }
  };

  const deleteItem = async (cart_item_id) => {
    try {
      await fetch(`/api/cart?id=${cart_item_id}`, {
        method: "DELETE",
      });
      fetchCart();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleCheckout = async () => {
    if (!bank || !paymentType) {
      alert("Please select payment type and bank.");
      return;
    }

    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
      alert("User ID not found.");
      return;
    }

    const cart_item_ids = cartItems.map((item) => item.cart_item_id);

    const confirmText = `Checkout Confirmation:\n\nTotal: Rp.${total}\nPayment Type: ${paymentType.toUpperCase()}\nBank: ${bank}\n\nLanjutkan checkout?`;
    const confirmed = confirm(confirmText);
    if (!confirmed) return;

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          cart_item_ids,
          total_price: total,
          payment_method: paymentType,
          payment_bank: bank,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Checkout success! Transaction ID : " + result.transaction_id);
        fetchCart(); // refresh cart
        setPaymentType("");
        setBank("");
      } else {
        alert("Checkout failed : " + result.message);
      }
    } catch (err) {
      console.error("Error checkout:", err);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  const handleCheckoutClick = () => {
    if (!bank || !paymentType) {
      alert("Please select payment type and bank.");
      return;
    }

    setCheckoutInfo({
      total,
      bank,
      paymentType,
    });
    setShowConfirmModal(true);
  };

  const confirmCheckout = async () => {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
      alert("User ID not found.");
      return;
    }

    const cart_item_ids = cartItems.map((item) => item.cart_item_id);

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          cart_item_ids,
          total_price: total,
          payment_method: paymentType,
          payment_bank: bank,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        await fetch(
          `/api/send-invoice?transaction_id=${result.transaction_id}`
        );
        alert("Checkout success! Transaction ID : " + result.transaction_id);
        fetchCart();
        setPaymentType("");
        setBank("");
      } else {
        alert("Checkout failed : " + result.message);
      }
    } catch (err) {
      console.error("Error checkout:", err);
      alert("Something went wrong during checkout. Please try again.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Your Cart</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : cartItems.length === 0 ? (
        <p className="text-center text-gray-500">
          Your cart is empty. Start shopping{" "}
          <Link
            href="/product"
            className="text-[lightGreen] hover:text-[darkGreen] text-underline"
          >
            here
          </Link>
          .
        </p>
      ) : (
        <>
          <table className="w-full text-sm border border-gray-200 rounded overflow-hidden shadow-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2">Price</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Subtotal</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.cart_item_id} className="border-t text-center">
                  <td className="p-2 text-left">{item.product_name}</td>
                  <td className="p-2">Rp.{item.price}</td>
                  <td className="p-2 flex justify-center items-center gap-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() => updateQuantity(item.cart_item_id, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() => updateQuantity(item.cart_item_id, 1)}
                    >
                      +
                    </button>
                  </td>
                  <td className="p-2">Rp.{item.price * item.quantity}</td>
                  <td className="p-2">
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={() => deleteItem(item.cart_item_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="bg-gray-50 text-lg border-t font-semibold">
                <td colSpan={3} className="p-2 text-right">
                  Total:
                </td>
                <td className="text-center p-2 text-[#008B8B]">Rp.{total}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Bank Selection */}
          <div className="mt-6">
            <label className="block mb-2 font-medium">
              Choose Payment Bank:
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="border px-4 py-2 rounded shadow w-full max-w-md"
            >
              <option value="">Choose Payment</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BCA">BCA</option>
              <option value="BRI">BRI</option>
              <option value="CASH">Bayar di Tempat (CASH)</option>
            </select>
          </div>

          {/* Payment Type */}
          <div className="mt-6">
            <p className="mb-2 font-medium">Payment Type:</p>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="payment"
                  value="prepaid"
                  checked={paymentType === "prepaid"}
                  onChange={() => setPaymentType("prepaid")}
                />
                <span>
                  <strong>Prepaid:</strong> Anda membayar terlebih dahulu
                  sebelum barang dikirim.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="payment"
                  value="postpaid"
                  checked={paymentType === "postpaid"}
                  onChange={() => setPaymentType("postpaid")}
                />
                <span>
                  <strong>Postpaid:</strong> Anda membayar setelah barang
                  diterima.
                </span>
              </label>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="mt-8 text-right">
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to remove all items from your cart?"
                    )
                  ) {
                    const user_id = sessionStorage.getItem("user_id");
                    if (!user_id) return;

                    try {
                      await Promise.all(
                        cartItems.map((item) =>
                          fetch(`/api/cart?id=${item.cart_item_id}`, {
                            method: "DELETE",
                          })
                        )
                      );
                      fetchCart();
                    } catch (err) {
                      console.error("Failed to delete all items", err);
                    }
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Delete All
              </button>

              <button
                onClick={handleCheckoutClick}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">
              Konfirmasi Checkout
            </h2>
            <p className="mb-2">
              Total: <strong>Rp.{checkoutInfo.total}</strong>
            </p>
            <p className="mb-2">
              Payment Type:{" "}
              <strong>{checkoutInfo.paymentType.toUpperCase()}</strong>
            </p>
            <p className="mb-4">
              Bank: <strong>{checkoutInfo.bank}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={confirmCheckout}
              >
                Confirm & Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
