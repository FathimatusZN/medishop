import db from "@/db";
import { v4 as uuidv4 } from "uuid";

// Utility to generate custom ID
function generateGuestbookId() {
  const now = new Date();
  const yymmddhhmm = now.toISOString().replace(/[-T:]/g, "").slice(2, 12);
  const randomPart = uuidv4().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `GST-${yymmddhhmm}-${randomPart}`;
}

// POST: Create new guestbook entry
export async function POST(req) {
  try {
    const { fullName, email, message } = await req.json();

    if (!fullName || !email || !message) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const guestbookId = generateGuestbookId();

    await db.query(
      `INSERT INTO guestbook (guestbook_id, full_name, email, message)
       VALUES ($1, $2, $3, $4)`,
      [guestbookId, fullName, email, message]
    );

    return Response.json({ success: true, id: guestbookId }, { status: 201 });
  } catch (err) {
    console.error("POST /guestbook error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// GET: all or by ID if `?id=...` is provided
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const result = await db.query(
        "SELECT * FROM guestbook WHERE guestbook_id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return Response.json(null, { status: 404 });
      }

      return Response.json(result.rows[0]);
    }

    // If no id, return all entries
    const result = await db.query(
      "SELECT * FROM guestbook ORDER BY created_at DESC"
    );
    return Response.json(result.rows);
  } catch (err) {
    console.error("GET /guestbook error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE by ID (for admin): /api/guestbook?id=GST-...
export async function DELETE(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const result = await db.query(
      "DELETE FROM guestbook WHERE guestbook_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /guestbook error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
