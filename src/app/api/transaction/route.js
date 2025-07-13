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
