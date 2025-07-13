"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/product");
      const data = await res.json();
      const found = data.find((p) => p.product_id === id);
      if (found) setForm(found);
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product_id", form.product_id);
    formData.append("product_name", form.product_name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    if (form.image && typeof form.image !== "string") {
      formData.append("image", form.image);
    }

    const res = await fetch("/api/upload", {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      alert("Product updated successfully");
      router.push("/products");
    } else {
      alert("Failed to update product");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Product</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md p-6 rounded-md space-y-4 border"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 mt-4">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select Category --</option>
              <option value="1">Medicine and Supplements</option>
              <option value="2">Medical Equipment</option>
              <option value="3">Health Monitoring Devices</option>
              <option value="4">Therapy and Rehabilitation Tools</option>
            </select>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 mt-4">Image</label>
            <div className="flex items-center gap-4">
              <label className="bg-blue-100 text-black px-4 py-2 rounded cursor-pointer hover:bg-blue-700 hover:text-white transition">
                Choose Image
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {form.image && typeof form.image === "object" ? (
                <span className="text-sm text-gray-700">{form.image.name}</span>
              ) : form.image ? (
                <span className="text-sm text-gray-500 italic">
                  Current image is already uploaded
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-8"
          >
            Save Changes
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
