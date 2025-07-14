// File: src/app/api/dashboard/route.js
import db from "@/db";

export async function GET(req) {
  try {
    const results = await Promise.all([
      db.query(
        `SELECT COUNT(*) FROM transactions WHERE transaction_status = 'completed'`
      ),
      db.query(
        `SELECT COUNT(*) FROM transactions WHERE shipping_status = 'shipped' AND transaction_status != 'completed'`
      ),
      db.query(
        `SELECT COUNT(*) FROM transactions WHERE transaction_status = 'pending'`
      ),
      db.query(
        `SELECT COUNT(*) FROM transactions WHERE transaction_status = 'rejected'`
      ),
      db.query(
        `SELECT COUNT(*) FROM transactions WHERE transaction_status = 'approved' AND (shipping_status IS NULL OR shipping_status = 'not_sent')`
      ),
      db.query(`SELECT COUNT(*) FROM products`),
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(
        `SELECT COALESCE(SUM(total_price), 0) FROM transactions WHERE transaction_status = 'completed'`
      ),
      db.query(`SELECT COUNT(*) FROM guestbook`),
    ]);

    const [
      completed,
      shipped,
      pending,
      rejected,
      approvedNotShipped,
      products,
      users,
      revenue,
      guestbook,
    ] = results.map((r) => r.rows[0]);

    return Response.json({
      completed: Number(completed.count),
      shipped: Number(shipped.count),
      pending: Number(pending.count),
      rejected: Number(rejected.count),
      approvedNotShipped: Number(approvedNotShipped.count),
      productCount: Number(products.count),
      userCount: Number(users.count),
      totalRevenue: Number(revenue.coalesce || revenue.sum || 0),
      guestbookCount: Number(guestbook.count),
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return Response.json(
      { message: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
