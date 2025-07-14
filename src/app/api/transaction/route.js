// File: src/app/api/transaction/route.js
import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  const body = await req.json();
  const {
    user_id,
    cart_item_ids,
    total_price,
    payment_method, // prepaid / postpaid
    payment_bank, // Mandiri / BCA / BNI / BRI /(CASH)
  } = body;

  if (
    !user_id ||
    !cart_item_ids?.length ||
    !total_price ||
    !payment_method ||
    !payment_bank
  ) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  // Generate transaction_id: TRS-<yymmddhhmm>-<5char>
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const yymmddhhmm = `${now.getFullYear().toString().slice(2)}${pad(
    now.getMonth() + 1
  )}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  const randomStr = uuidv4().replace(/-/g, "").slice(0, 5).toUpperCase();
  const transaction_id = `TRS-${yymmddhhmm}-${randomStr}`;

  // Logic for payment_status
  const isCash = payment_bank.toLowerCase().includes("cash");
  const isPostpaid = payment_method.toLowerCase() === "postpaid";
  const payment_status = isPostpaid || isCash ? "unpaid" : "paid";

  try {
    // Insert transaction
    await db.query(
      `INSERT INTO transactions (
        transaction_id,
        user_id,
        cart_item_ids,
        total_price,
        payment_method,
        payment_bank,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        transaction_id,
        user_id,
        cart_item_ids,
        total_price,
        payment_method,
        payment_bank,
        payment_status,
      ]
    );

    // Update checked_out = true untuk item terkait
    await db.query(
      `UPDATE cart_items
   SET checked_out = true
   WHERE cart_item_id = ANY($1) AND checked_out = false`,
      [cart_item_ids]
    );

    // Kurangi stok di tabel products berdasarkan cart_items
    await db.query(
      `
        UPDATE products
        SET stock = stock - sub.total
        FROM (
          SELECT product_id, quantity as total
          FROM cart_items
          WHERE cart_item_id = ANY($1)
        ) as sub
        WHERE products.product_id = sub.product_id
      `,
      [cart_item_ids]
    );

    return NextResponse.json({
      message: "Transaction successful",
      transaction_id,
    });
  } catch (err) {
    console.error("POST /transaction error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch transactions
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const transaction_id = searchParams.get("id");

  try {
    if (user_id) {
      // Fetch transaksi milik user tertentu
      const result = await db.query(
        `SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC`,
        [user_id]
      );
      return NextResponse.json(result.rows);
    }
    if (transaction_id) {
      const result = await db.query(
        `SELECT t.*, u.username
          FROM transactions t
          JOIN users u ON t.user_id = u.user_id
          WHERE t.transaction_id = $1`,
        [transaction_id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(result.rows[0]);
    }
    if (!user_id && !transaction_id) {
      const result = await db.query(
        `SELECT t.*, u.username
     FROM transactions t
     JOIN users u ON t.user_id = u.user_id
     ORDER BY t.transaction_date DESC`
      );
      return NextResponse.json(result.rows);
    } else {
      // Admin request semua transaksi
      const result = await db.query(
        `SELECT * FROM transactions ORDER BY transaction_date DESC`
      );
      return NextResponse.json(result.rows);
    }
  } catch (err) {
    console.error("GET /transaction error:", err);
    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// PUT: Update transaction status
export async function PUT(req) {
  const body = await req.json();
  const { transaction_id, action } = body;

  if (!transaction_id || !action) {
    return NextResponse.json(
      { message: "Missing transaction_id or action" },
      { status: 400 }
    );
  }

  let updateQuery = "";
  let updateParams = [];

  switch (action) {
    case "approve":
      updateQuery = `UPDATE transactions SET transaction_status = 'approved' WHERE transaction_id = $1`;
      updateParams = [transaction_id];
      break;
    case "reject":
      updateQuery = `UPDATE transactions SET transaction_status = 'rejected' WHERE transaction_id = $1`;
      updateParams = [transaction_id];
      break;
    case "ship":
      updateQuery = `UPDATE transactions SET shipping_status = 'shipped' WHERE transaction_id = $1`;
      updateParams = [transaction_id];
      break;
    case "complete":
      updateQuery = `UPDATE transactions SET shipping_status = 'delivered', transaction_status = 'completed' WHERE transaction_id = $1`;
      updateParams = [transaction_id];
      break;
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  try {
    await db.query(updateQuery, updateParams);
    return NextResponse.json({ message: `Transaction ${action}d` });
  } catch (err) {
    console.error("PUT /transaction error:", err);
    return NextResponse.json(
      { message: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE: Delete transaction and restore stock
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const transaction_id = searchParams.get("id");

  if (!transaction_id) {
    return NextResponse.json(
      { message: "Missing transaction_id" },
      { status: 400 }
    );
  }

  try {
    // Ambil cart_item_ids dan status
    const txResult = await db.query(
      `SELECT cart_item_ids, transaction_status FROM transactions WHERE transaction_id = $1`,
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    const { cart_item_ids, transaction_status } = txResult.rows[0];

    // Validasi status
    if (transaction_status !== "pending") {
      return NextResponse.json(
        { message: "Only pending transactions can be deleted" },
        { status: 403 }
      );
    }

    // Kembalikan stok ke products
    await db.query(
      `
      UPDATE products
      SET stock = stock + sub.total
      FROM (
        SELECT product_id, quantity as total
        FROM cart_items
        WHERE cart_item_id = ANY($1)
      ) as sub
      WHERE products.product_id = sub.product_id
    `,
      [cart_item_ids]
    );

    // Tandai cart_items sebagai belum checkout
    await db.query(
      `
      UPDATE cart_items
      SET checked_out = false
      WHERE cart_item_id = ANY($1)
    `,
      [cart_item_ids]
    );

    // Hapus transaksi
    await db.query(`DELETE FROM transactions WHERE transaction_id = $1`, [
      transaction_id,
    ]);

    return NextResponse.json({
      message: "Transaction deleted and stock restored",
    });
  } catch (err) {
    console.error("DELETE /transaction error:", err);
    return NextResponse.json(
      { message: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
