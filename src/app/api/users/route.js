import { NextResponse } from "next/server";
import db from "@/db";

// GET - Ambil daftar user (tanpa password)
export async function GET() {
  try {
    const result = await db.query(
      "SELECT user_id, username, email, role, contact_no, city FROM users ORDER BY user_id ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return new NextResponse("Failed to fetch users", { status: 500 });
  }
}

// Promote / Demote admin role
export async function PUT(req) {
  try {
    const { user_id, role } = await req.json();

    if (![1, 2].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    await db.query("UPDATE users SET role = $1 WHERE user_id = $2", [
      role,
      user_id,
    ]);

    return NextResponse.json({ message: "User role updated" });
  } catch (err) {
    console.error("PUT /api/users error:", err);
    return new NextResponse("Error updating user role", { status: 500 });
  }
}
