import db from "@/db";
import bcrypt from "bcryptjs";

// POST /api/auth/register - Registers a new user with a unique user_id, hashed password, and validates unique username and email.
export async function POST(req) {
  try {
    // Extract user input from request body
    const {
      username,
      email,
      password,
      date_of_birth,
      gender,
      address,
      city,
      contact_no,
      paypal_id,
    } = await req.json();

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
      if (existing.username === username) {
        return new Response("Username already taken", { status: 409 });
      }
      if (existing.email === email) {
        return new Response("Email already registered", { status: 409 });
      }
    }

    // Generate new user ID like USER-001
    const result = await db.query(
      "SELECT user_id FROM users WHERE user_id LIKE 'USER-%' ORDER BY user_id DESC LIMIT 1"
    );

    let newIdNumber = 1;
    if (result.rows.length > 0) {
      const lastId = result.rows[0].user_id;
      const lastNum = parseInt(lastId.split("-")[1], 10);
      newIdNumber = lastNum + 1;
    }

    const newUserId = `USER-${newIdNumber.toString().padStart(3, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with all fields
    await db.query(
      `INSERT INTO users 
        (user_id, username, email, password, date_of_birth, gender, address, city, contact_no, paypal_id)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newUserId,
        username,
        email,
        hashedPassword,
        date_of_birth || null,
        gender || null,
        address || null,
        city || null,
        contact_no || null,
        paypal_id || null,
      ]
    );

    return new Response("User registered successfully", { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
