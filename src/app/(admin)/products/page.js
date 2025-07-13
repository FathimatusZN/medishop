"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await fetch("/api/product");
    const data = await res.json();
    setProducts(data);
  };

  const handleDelete = async (product_id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/product?id=${product_id}`, { method: "DELETE" });
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryMap = {
    1: "Medicine and Supplements",
    2: "Medical Equipment",
    3: "Health Monitoring Devices",
    4: "Therapy and Rehabilitation Tools",
  };

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Product List</h1>
          <Link
            href="/products/add"
            className="bg-green-600 text-white px-3 py-2 rounded text-sm"
          >
            + Add Product
          </Link>
        </div>

        <table className="w-full border text-sm text-center">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-3 py-2 border">No</th>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Category</th>
              <th className="px-3 py-2 border">Price</th>
              <th className="px-3 py-2 border">Stock</th>
              <th className="px-3 py-2 border">Image</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.product_id}>
                <td className="px-3 py-2 border">{i + 1}</td>
                <td className="px-3 py-2 border">{p.product_id}</td>
                <td className="px-3 py-2 border">{p.product_name}</td>
                <td className="px-3 py-2 border">
                  {categoryMap[p.category] || p.category}
                </td>
                <td className="px-3 py-2 border">
                  Rp {p.price.toLocaleString()}
                </td>
                <td className="px-3 py-2 border">{p.stock}</td>
                <td className="px-3 py-2 border">
                  <div className="flex justify-center items-center">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.product_name}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 border space-x-2">
                  <Link
                    href={`/products/edit/${p.product_id}`}
                    className="text-blue-600 text-sm pr-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.product_id)}
                    className="text-red-600 text-sm pl-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
