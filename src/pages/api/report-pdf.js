import db from "@/db";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  try {
    let query = `
      SELECT t.transaction_id, u.username, t.transaction_date, 
             t.total_price, t.transaction_status, 
             t.shipping_status, t.payment_method, t.payment_bank
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
    `;
    const params = [];

    if (start && end) {
      query += ` WHERE t.transaction_date BETWEEN $1 AND $2`;
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    query += ` ORDER BY t.transaction_date DESC`;

    const result = await db.query(query, params);
    const transactions = result.rows;

    const totalIncome = transactions.reduce(
      (sum, t) => sum + parseFloat(t.total_price || 0),
      0
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });
    doc.pipe(res);

    const logoPath = path.join(process.cwd(), "public", "medishop.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 25, 10, { width: 50 });
    }
    doc.moveDown(2);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Transaction Report", {
      align: "center",
    });

    // Export date
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Exported at: ${new Date().toLocaleString()}`, {
        align: "center",
      });

    if (start && end) {
      const formattedStart = new Date(start).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const formattedEnd = new Date(end).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      doc
        .moveDown(0.2)
        .fontSize(10)
        .text(`Data range: ${formattedStart} - ${formattedEnd}`, {
          align: "center",
        });
    }

    doc.moveDown(1.5);

    const tableTop = doc.y;
    const rowHeight = 25;
    const colWidths = [140, 100, 100, 80, 80, 80, 70, 70];
    const headers = [
      "ID",
      "Username",
      "Date",
      "Total",
      "Payment",
      "Bank",
      "Status",
      "Shipping",
    ];

    // Draw Header Background
    doc
      .rect(
        50,
        tableTop,
        colWidths.reduce((a, b) => a + b),
        rowHeight
      )
      .fill("#e0e0e0");

    // Draw Header Text
    let x = 50;
    doc.fillColor("black").fontSize(10).font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(h, x + 5, tableTop + 7, {
        width: colWidths[i] - 10,
        align: "left",
      });
      x += colWidths[i];
    });

    // Draw Rows
    doc.font("Helvetica").fontSize(9);
    transactions.forEach((t, idx) => {
      const y = tableTop + (idx + 1) * rowHeight;
      let x = 50;

      const row = [
        t.transaction_id,
        t.username,
        new Date(t.transaction_date).toLocaleString(),
        "Rp." + t.total_price,
        t.payment_method,
        t.payment_bank,
        t.transaction_status,
        t.shipping_status,
      ];

      // Cell borders
      x = 50;
      colWidths.forEach((w) => {
        doc.rect(x, y, w, rowHeight).stroke();
        x += w;
      });

      // Cell content
      x = 50;
      row.forEach((cell, i) => {
        doc.text(cell || "-", x + 5, y + 7, {
          width: colWidths[i] - 10,
          align: "left",
        });
        x += colWidths[i];
      });
    });

    // Total Income
    const totalY = tableTop + (transactions.length + 1) * rowHeight + 20; // bawah tabel
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        `Total Income: Rp. ${totalIncome.toLocaleString("id-ID")}`,
        50,
        totalY
      );

    doc.end();
  } catch (err) {
    console.error("Export PDF Error:", err);
    res.status(500).json({ message: "Failed to generate PDF report." });
  }
}
