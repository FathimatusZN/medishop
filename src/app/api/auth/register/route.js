import db from "@/db";
import bcrypt from "bcryptjs";

// POST /api/auth/register - Registers a new user with a unique user_id, hashed password, and validates unique username and email.
export async function POST(req) {
  try {
    // Extract user input from request body
    const { username, email, password } = await req.json();

    // Validate required fields
    if (!username || !email || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    // Check if username OR email already exists in the database
    const checkUser = await db.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      const existing = checkUser.rows[0];

      // Conflict: Username already taken
      if (existing.username === username) {
        return new Response("Username already taken", { status: 409 });
      }

      // Conflict: Email already registered
      if (existing.email === email) {
        return new Response("Email already registered", { status: 409 });
      }
    }

    // Generate new user ID with format USER-XXX (e.g., USER-001)
    const result = await db.query(
      "SELECT user_id FROM users WHERE user_id LIKE 'USER-%' ORDER BY user_id DESC LIMIT 1"
    );

    let newIdNumber = 1; // Default for first user

    if (result.rows.length > 0) {
      const lastId = result.rows[0].user_id; // Example: "USER-007"
      const lastNum = parseInt(lastId.split("-")[1], 10); // Extract 007 → 7
      newIdNumber = lastNum + 1;
    }

    const newUserId = `USER-${newIdNumber.toString().padStart(3, "0")}`; // → USER-008

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database with custom user_id
    await db.query(
      "INSERT INTO users (user_id, username, email, password) VALUES ($1, $2, $3, $4)",
      [newUserId, username, email, hashedPassword]
    );

    // Success response
    return new Response("User registered successfully", { status: 201 });
  } catch (error) {
    // Catch unexpected errors and log for debugging
    console.error("Register error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
