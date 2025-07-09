import db from "@/db";
import bcrypt from "bcryptjs";

// POST /api/auth/login - Authenticates user by either username or email.
export async function POST(req) {
  try {
    // Extract identifier (username or email) and password from request body
    const { identifier, password } = await req.json();

    // Basic validation: all fields must be provided
    if (!identifier || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    // Determine whether the identifier is an email (contains "@")
    const isEmail = identifier.includes("@");

    // Query user from database using email or username
    const result = await db.query(
      `SELECT * FROM users WHERE ${isEmail ? "email" : "username"} = $1`,
      [identifier]
    );
    const user = result.rows[0];

    // If user not found, return error
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Compare entered password with hashed password in database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // Return public user data (do NOT include password)
    const userData = {
      id: user.user_id,
      username: user.username,
      email: user.email,
    };

    return Response.json(userData);
  } catch (error) {
    console.error("Login error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
