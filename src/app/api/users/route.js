import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (user_id) {
      const res = await db.query(
        "SELECT user_id, username, email, date_of_birth, gender, address, city, contact_no, paypal_id FROM users WHERE user_id = $1",
        [user_id]
      );
      return NextResponse.json(res.rows[0]);
    }

    // Default: get all users (admin use-case)
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

// PATCH - Update user profile
export async function PATCH(req) {
  try {
    const {
      user_id,
      date_of_birth,
      gender,
      address,
      city,
      contact_no,
      paypal_id,
    } = await req.json();

    await db.query(
      `UPDATE users SET 
        date_of_birth = $1,
        gender = $2,
        address = $3,
        city = $4,
        contact_no = $5,
        paypal_id = $6
       WHERE user_id = $7`,
      [
        date_of_birth || null,
        gender || null,
        address || null,
        city || null,
        contact_no || null,
        paypal_id || null,
        user_id,
      ]
    );

    return NextResponse.json({ message: "Profile updated" });
  } catch (err) {
    console.error("PATCH /api/users error:", err);
    return new NextResponse("Failed to update profile", { status: 500 });
  }
}
