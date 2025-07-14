import db from "@/db";
import nodemailer from "nodemailer";
import https from "http";

export default async function handler(req, res) {
  const { transaction_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!transaction_id) {
    return res.status(400).json({ message: "Missing transaction_id" });
  }

  try {
    // Ambil email user
    const result = await db.query(
      `SELECT u.email, u.username
       FROM transactions t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.transaction_id = $1`,
      [transaction_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User/email not found" });
    }

    const { email, username } = result.rows[0];

    // Ambil file invoice dari API invoice (localhost atau domain kamu)
    const baseUrl = process.env.BASE_URL;
    const invoiceUrl = `${baseUrl}/api/invoice?id=${transaction_id}`;
    const invoiceRes = await fetch(invoiceUrl);
    if (!invoiceRes.ok) {
      throw new Error("Failed to fetch invoice PDF");
    }
    const pdfBuffer = Buffer.from(await invoiceRes.arrayBuffer());

    // Kirim email pakai nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MediShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice - Transaction ${transaction_id}`,
      text: `Hi ${username},

Thanks for shopping with MediShop. Please find your invoice attached.

Regards,
MediShop Team`,
      attachments: [
        {
          filename: `invoice-${transaction_id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({ message: "Invoice email sent successfully." });
  } catch (err) {
    console.error("SEND-INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to send invoice email" });
  }
}
