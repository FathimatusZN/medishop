// File: src/app/api/report/route.js

import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  try {
    let query = `
      SELECT t.transaction_id, t.transaction_date, t.total_price,
             t.payment_method, t.payment_bank, t.payment_status,
             t.transaction_status, t.shipping_status,
             u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ` WHERE t.transaction_date BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY t.transaction_date DESC`;

    const result = await db.query(query, params);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /report error:", err);
    return NextResponse.json(
      { message: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}
