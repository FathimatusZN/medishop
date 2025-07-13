"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const categoryOptions = [
  { value: "1", label: "Medicine and Supplements" },
  { value: "2", label: "Medical Equipment" },
  { value: "3", label: "Health Monitoring Devices" },
  { value: "4", label: "Therapy and Rehabilitation Tools" },
];

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/product");
      const data = await res.json();
      setProducts(data);
      setFiltered(data); // show all
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!category) {
      setFiltered(products);
    } else {
      const filteredData = products.filter(
        (p) => String(p.category) === category
      );
      setFiltered(filteredData);
    }
  }, [category, products]);

  // Function handleBuy
  const handleBuy = async (product_id) => {
    const user_id = sessionStorage.getItem("user_id");

    if (!user_id) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          product_id,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to cart");

      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Our Products</h1>

      {/* Filter */}
      <div className="flex justify-center mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 rounded shadow"
        >
          <option value="">All Category</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <div
            key={product.product_id}
            className="bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex flex-col items-center"
          >
            {product.image && (
              <Image
                src={product.image}
                alt={product.product_name}
                width={200}
                height={200}
                className="object-contain rounded-md mb-3"
              />
            )}

            <h2 className="text-lg font-semibold text-center">
              {product.product_name}
            </h2>

            <h1 className="text-md font-bold text-center text-[#008B8B] mb-2">
              Rp.{product.price}
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/product/${product.product_id}`)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                View
              </button>
              <button
                onClick={() => handleBuy(product.product_id)}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center mt-10 text-gray-500">No products found.</p>
      )}
    </div>
  );
}
