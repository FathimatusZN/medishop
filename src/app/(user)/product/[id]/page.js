"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const categoryLabels = {
  1: "Medicine and Supplements",
  2: "Medical Equipment",
  3: "Health Monitoring Devices",
  4: "Therapy and Rehabilitation Tools",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch("/api/product");
      const data = await res.json();
      const selected = data.find((p) => p.product_id === id);
      setProduct(selected);
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <p className="text-center mt-10 text-gray-600">Loading product...</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/product")}
        className="absolute top-4 left-4 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
      >
        ← Back
      </button>

      <div className="bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 md:mt-10">
        {/* Product Image */}
        <div className="w-full flex justify-center items-start">
          {product.image && (
            <Image
              src={product.image}
              alt={product.product_name}
              width={320}
              height={320}
              className="object-contain rounded-lg max-w-full h-auto"
              priority
            />
          )}
        </div>

        {/* Product Detail */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {product.product_name}
            </h1>
            <p className="text-lg md:text-xl text-emerald-700 font-semibold mb-4">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </p>

            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium">Category:</span>{" "}
                {categoryLabels[product.category] || "Unknown"}
              </p>
              <p>
                <span className="font-medium">Stock:</span> {product.stock}
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Buying...")}
            className="w-full md:w-fit bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
