import db from "@/db";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id) {
    return res.status(400).json({ message: "Missing transaction ID" });
  }

  try {
    const txRes = await db.query(
      `SELECT t.*, u.username
       FROM transactions t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.transaction_id = $1`,
      [id]
    );

    if (txRes.rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = txRes.rows[0];

    const itemRes = await db.query(
      `SELECT ci.*, p.product_name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_item_id = ANY($1::int[])`,
      [transaction.cart_item_ids]
    );

    const items = itemRes.rows;

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${id}.pdf`
      );
      res.send(pdfBuffer);
    });

    // ===== Header dengan Logo =====
    const logoPath = path.join(process.cwd(), "public", "medishop2.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 });
    }
    doc.moveDown(8);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("MEDISHOP", { align: "center" });
    doc.fontSize(14).text("INVOICE PEMBELIAN", { align: "center" });
    doc.moveDown();

    // ===== Detail Transaksi =====
    const details = [
      ["Transaction ID", transaction.transaction_id],
      ["Tanggal", new Date(transaction.transaction_date).toLocaleString()],
      ["User ID", transaction.user_id],
      ["Username", transaction.username],
      [
        "Metode Pembayaran",
        `${transaction.payment_method} via ${transaction.payment_bank}`,
      ],
      ["Status Pembayaran", transaction.payment_status],
      ["Status Transaksi", transaction.transaction_status],
      ["Status Pengiriman", transaction.shipping_status || "-"],
    ];

    doc.moveDown().fontSize(11);
    details.forEach(([label, value]) => {
      const y = doc.y;
      doc.text(label, 50, y).text(":", 200, y).text(value, 210, y);
    });

    doc.moveDown(1.5);

    // ===== Tabel Item =====
    doc.font("Helvetica-Bold").text("Rincian Pembelian:", { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y + 10;

    doc
      .font("Helvetica-Bold")
      .text("No", 50, tableTop)
      .text("Produk", 90, tableTop)
      .text("Qty", 310, tableTop)
      .text("Harga", 370, tableTop)
      .text("Subtotal", 470, tableTop);

    doc.moveDown(0.5).font("Helvetica");

    let y = tableTop + 20;
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.price;
      doc
        .text(index + 1, 50, y)
        .text(item.product_name, 90, y)
        .text(item.quantity, 310, y)
        .text(`Rp.${item.price.toLocaleString()}`, 370, y)
        .text(`Rp.${subtotal.toLocaleString()}`, 470, y);
      y += 20;
    });

    doc
      .font("Helvetica-Bold")
      .text("Total:", 370, y + 10)
      .text(`Rp.${transaction.total_price.toLocaleString()}`, 470, y + 10);

    // ===== Footer =====
    doc.moveDown(10);

    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    doc
      .font("Helvetica-Oblique")
      .fontSize(12)
      .text("Terima kasih telah berbelanja di MEDISHOP!", margin, doc.y, {
        width: pageWidth - margin * 2,
        align: "center",
      });

    doc.moveDown(3);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text("Hormat kami,", { align: "right" })
      .text("MEDISHOP", { align: "right" });

    doc.end();
  } catch (err) {
    console.error("GET /api/invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
}
