import { NextResponse } from "next/server";
import db from "@/db";

// GET: get all user's cart items that are not checked out
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const idsParam = searchParams.get("ids");

  try {
    if (idsParam) {
      // Ambil banyak cart_items berdasarkan ids
      const ids = idsParam
        .split(",")
        .map((id) => parseInt(id))
        .filter(Boolean);

      const result = await db.query(
        `SELECT ci.*, p.product_name, p.price, p.image
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.product_id
         WHERE ci.cart_item_id = ANY($1::int[])`,
        [ids]
      );

      return NextResponse.json(result.rows);
    }

    if (user_id) {
      // Ambil semua cart item milik user yang belum checkout
      const result = await db.query(
        `SELECT ci.*, p.product_name, p.price, p.image 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.product_id 
         WHERE ci.user_id = $1 AND ci.checked_out = false`,
        [user_id]
      );

      return NextResponse.json(result.rows);
    }

    return NextResponse.json(
      { message: "Missing query parameter" },
      { status: 400 }
    );
  } catch (e) {
    console.error("GET /cart error:", e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

// POST: add to cart (or update quantity if it already exists)
export async function POST(req) {
  const { user_id, product_id, quantity } = await req.json();

  if (!user_id || !product_id || !quantity) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const existing = await db.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2 AND checked_out = false",
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_item_id = $2",
        [quantity, existing.rows[0].cart_item_id]
      );
    } else {
      await db.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [user_id, product_id, quantity]
      );
    }

    return NextResponse.json({ message: "Item added/updated in cart" });
  } catch (e) {
    console.error("POST /cart error:", e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

// DELETE: remove item from cart
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const cart_item_id = searchParams.get("id");

  if (!cart_item_id) {
    return NextResponse.json(
      { message: "Missing cart_item_id" },
      { status: 400 }
    );
  }

  try {
    await db.query("DELETE FROM cart_items WHERE cart_item_id = $1", [
      cart_item_id,
    ]);
    return NextResponse.json({ message: "Item removed from cart" });
  } catch (e) {
    console.error("DELETE /cart error:", e);
    return NextResponse.json(
      { message: "Failed to delete item" },
      { status: 500 }
    );
  }
}
