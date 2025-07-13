import { NextResponse } from "next/server";
import db from "@/db";

// Disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET: Retrieve all products
export async function GET() {
  const result = await db.query(
    "SELECT * FROM products ORDER BY product_id ASC"
  );
  return NextResponse.json(result.rows);
}

// DELETE: Delete a product
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("id");

  try {
    await db.query("DELETE FROM products WHERE product_id = $1", [product_id]);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch {
    return new NextResponse("Delete failed", { status: 500 });
  }
}
