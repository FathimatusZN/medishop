"use client";

import { useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    contact_no: "",
    paypal_id: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      setSuccess("Registration successful! Please login.");
      setForm({
        username: "",
        email: "",
        password: "",
        date_of_birth: "",
        gender: "",
        address: "",
        city: "",
        contact_no: "",
        paypal_id: "",
      });
    } catch (err) {
      setError("Registration failed.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4 text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg my-8 border border-gray-200 rounded-2xl p-8 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Image
            src="/medishop.png"
            alt="Medishop Logo"
            width={64}
            height={64}
            className="w-20 h-20"
          />
          <div>
            <h1 className="text-2xl font-bold text-[darkTurquoise]">
              Welcome to MEDISHOP
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Medical equipment store
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-[#2c7be5]">
          Create Account
        </h2>

        {/* Input Fields */}
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          placeholder="Your username"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
        <Input
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={handleChange}
        />

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <div className="flex gap-4">
            {["M", "F"].map((g) => (
              <label key={g} className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={form.gender === g}
                  onChange={handleChange}
                  className="text-[#2c7be5] focus:ring-[#2c7be5]"
                />
                {g === "M" ? "Male" : "Female"}
              </label>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            placeholder="Your address"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 text-sm px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c7be5]"
          />
        </div>

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Your city"
        />
        <Input
          label="Contact No"
          name="contact_no"
          value={form.contact_no}
          onChange={handleChange}
          placeholder="+62..."
        />
        <Input
          label="PayPal ID"
          name="paypal_id"
          value={form.paypal_id}
          onChange={handleChange}
          placeholder="yourpaypal@example.com"
        />

        {/* Feedback */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full bg-[#28c76f] hover:bg-[#22b463] transition-colors text-white py-2.5 rounded-lg font-semibold text-sm"
        >
          REGISTER
        </button>

        <div className="text-center text-sm text-gray-500 mt-2">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#2c7be5] font-medium hover:underline"
          >
            Login
          </a>
        </div>
      </form>
    </main>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 text-sm px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c7be5] text-gray-900"
      />
    </div>
  );
}
