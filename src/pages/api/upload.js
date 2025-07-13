// /src/pages/api/upload.js

import { promises as fs } from "fs";
import path from "path";
import db from "@/db";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function generateProductId() {
  const result = await db.query("SELECT COUNT(*) FROM products");
  const count = parseInt(result.rows[0].count) + 1;
  return `PRD-${count.toString().padStart(4, "0")}`;
}

export default async function handler(req, res) {
  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), "public/products"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).send("Upload error");
    }

    try {
      const { product_name, category, price, stock } = fields;
      const imageFile = files.image?.[0];
      const imagePath = imageFile
        ? `/products/${path.basename(imageFile.filepath)}`
        : null;

      if (req.method === "POST") {
        const product_id = await generateProductId();

        await db.query(
          `INSERT INTO products (product_id, product_name, category, price, stock, image, sold)
           VALUES ($1, $2, $3, $4, $5, $6, 0)`,
          [
            product_id,
            product_name?.[0],
            category?.[0],
            price?.[0],
            stock?.[0],
            imagePath,
          ]
        );

        return res.status(200).json({ message: "Product successfully added" });
      }

      if (req.method === "PUT") {
        const { product_id } = fields;

        // If image is updated, include it. Otherwise, only update text fields.
        if (imagePath) {
          await db.query(
            `UPDATE products
             SET product_name = $1, category = $2, price = $3, stock = $4, image = $5
             WHERE product_id = $6`,
            [
              product_name?.[0],
              category?.[0],
              price?.[0],
              stock?.[0],
              imagePath,
              product_id?.[0],
            ]
          );
        } else {
          await db.query(
            `UPDATE products
             SET product_name = $1, category = $2, price = $3, stock = $4
             WHERE product_id = $5`,
            [
              product_name?.[0],
              category?.[0],
              price?.[0],
              stock?.[0],
              product_id?.[0],
            ]
          );
        }

        return res
          .status(200)
          .json({ message: "Product successfully updated" });
      }

      return res.status(405).json({ message: "Method not allowed" });
    } catch (e) {
      console.error("Database error:", e);
      return res.status(500).send("Internal error");
    }
  });
}
