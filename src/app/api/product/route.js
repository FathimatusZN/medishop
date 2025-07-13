import { NextResponse } from "next/server";
import db from "@/db";
import path from "path";
import { promises as fs } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET() {
  const result = await db.query(
    "SELECT * FROM products ORDER BY product_id ASC"
  );
  return NextResponse.json(result.rows);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("id");

  try {
    // Ambil nama file gambar dulu
    const result = await db.query(
      "SELECT image FROM products WHERE product_id = $1",
      [product_id]
    );

    const imagePath = result.rows[0]?.image;
    if (imagePath) {
      const filePath = path.join(process.cwd(), "public", imagePath);
      try {
        await fs.unlink(filePath); // hapus file
      } catch (err) {
        console.warn("Gagal menghapus file:", filePath, err.message);
        // tidak fatal, lanjutkan penghapusan DB
      }
    }

    // Hapus data dari DB
    await db.query("DELETE FROM products WHERE product_id = $1", [product_id]);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (e) {
    console.error("Delete failed:", e);
    return new NextResponse("Delete failed", { status: 500 });
  }
}
