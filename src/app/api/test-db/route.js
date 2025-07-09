import db from "@/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW()");
    return Response.json({ connected: true, time: result.rows[0].now });
  } catch (error) {
    console.error("Database connection failed:", error);
    return new Response("Database error", { status: 500 });
  }
}
