"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) return;

    fetch(`/api/transaction?user_id=${user_id}`)
      .then((res) => res.json())
      .then(setTransactions)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Transactions</h1>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Transaction ID</th>
              <th className="p-2">Date</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Shipping</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.transaction_id} className="border-t">
                <td className="p-2">{tx.transaction_id}</td>
                <td className="p-2">
                  {new Date(tx.transaction_date).toLocaleString()}
                </td>
                <td className="p-2">Rp.{tx.total_price}</td>
                <td className="p-2 capitalize">{tx.transaction_status}</td>
                <td className="p-2 capitalize">{tx.shipping_status}</td>
                <td className="p-2">
                  <Link
                    href={`/transactions/${tx.transaction_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
