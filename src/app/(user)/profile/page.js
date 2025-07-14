"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const [form, setForm] = useState({
    user_id: "",
    username: "",
    email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    contact_no: "",
    paypal_id: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) return;

        const res = await fetch(`/api/users?user_id=${user_id}`);
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage("Update failed: " + text);
        return;
      }

      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Error updating profile");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["1", "2"]}>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ReadOnlyField label="Username" value={form.username} />
          <ReadOnlyField label="Email" value={form.email} />

          <InputField
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={form.date_of_birth || ""}
            onChange={handleChange}
          />
          <SelectField
            label="Gender"
            name="gender"
            value={form.gender || ""}
            onChange={handleChange}
          />
          <TextAreaField
            label="Address"
            name="address"
            value={form.address || ""}
            onChange={handleChange}
          />
          <InputField
            label="City"
            name="city"
            value={form.city || ""}
            onChange={handleChange}
          />
          <InputField
            label="Contact No"
            name="contact_no"
            value={form.contact_no || ""}
            onChange={handleChange}
          />
          <InputField
            label="PayPal ID"
            name="paypal_id"
            value={form.paypal_id || ""}
            onChange={handleChange}
          />

          {message && (
            <p className="text-sm text-center text-blue-600 mt-8">{message}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Save Change
          </button>
        </form>
      </main>
    </ProtectedRoute>
  );
}

function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mt-2">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full mt-1 p-2 border border-gray-300 rounded"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mt-2">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full mt-1 p-2 border border-gray-300 rounded"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mt-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 p-2 border border-gray-300 rounded"
      >
        <option value="">-- Select Gender --</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mt-2">
        {label}
      </label>
      <input
        value={value}
        disabled
        className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-100"
      />
    </div>
  );
}
