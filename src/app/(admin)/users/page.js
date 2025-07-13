"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (user_id, targetRole) => {
    const confirmMsg =
      targetRole === 2
        ? "Are you sure you want to make this user an Admin?"
        : "Are you sure you want to remove Admin privileges?";
    if (!confirm(confirmMsg)) return;

    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, role: targetRole }),
    });
    fetchUsers();
  };

  return (
    <ProtectedRoute allowedRoles={["2"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User List</h1>

        <table className="w-full border text-sm text-center">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-3 py-2 border">No</th>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Username</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Role</th>
              <th className="px-3 py-2 border">Contact No</th>
              <th className="px-3 py-2 border">City</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.user_id}>
                <td className="px-3 py-2 border">{i + 1}</td>
                <td className="px-3 py-2 border">{u.user_id}</td>
                <td className="px-3 py-2 border">{u.username}</td>
                <td className="px-3 py-2 border">{u.email}</td>
                <td className="px-3 py-2 border">
                  {u.role === 2 ? "Admin" : "User"}
                </td>
                <td className="px-3 py-2 border">{u.contact_no}</td>
                <td className="px-3 py-2 border">{u.city}</td>
                <td className="px-3 py-2 border">
                  {u.role === 1 ? (
                    <button
                      onClick={() => handleChangeRole(u.user_id, 2)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangeRole(u.user_id, 1)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
