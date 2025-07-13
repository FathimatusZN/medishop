"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      const user = await res.json();
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("user_id", user.id);

      // redirect based on user role
      if (user.role === 1) {
        router.push("/product");
      } else if (user.role === 2) {
        router.push("/dashboard");
      } else {
        router.push("/"); // fallback if role is unknown
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError("Login failed. Please try again later.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4 text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg border border-gray-200 rounded-2xl p-8 space-y-6 transition-all"
      >
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          {/* Logo on the left */}
          <Image
            src="/medishop.png"
            alt="Medishop Logo"
            width={64}
            height={64}
            className="w-20 h-20"
          />

          {/* Text on the right */}
          <div>
            <h1 className="text-2xl font-bold text-[darkTurquoise]">
              Welcome to MEDISHOP
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Medical equipment store
            </p>
          </div>
        </div>

        {/* Identifier Field */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700"
          >
            Username or Email
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="mt-1 block w-full rounded-sm border border-gray-300 bg-gray-50 shadow-sm text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c7be5]"
            placeholder="e.g. johndoe@example.com"
          />
        </div>

        {/* Password Field */}
        <div className="mt-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c7be5]"
            placeholder="Enter your password"
          />
        </div>

        {/* Feedback Messages */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-10 w-full bg-[#28c76f] hover:bg-[#22b463] transition-colors text-white py-2.5 rounded-lg font-semibold text-sm"
        >
          LOGIN
        </button>

        {/* Optional: Link to register/forgot password */}
        <div className="text-center text-sm text-gray-500 mt-2">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-[#2c7be5] font-medium hover:underline"
          >
            Register
          </a>
        </div>
      </form>
    </main>
  );
}
