import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ status: "ok", time: result.rows[0] });
});

app.get("/brands/:brandName/products", async (req, res) => {
  const { brandName } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT product_name, asin, price
      FROM brand_products_with_latest_price
      WHERE brand_name = $1
      `,
      [brandName],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/optimization-history/:asin", async (req, res) => {
  const { asin } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        asin,
        product_name,
        current_price,
        recommended_price,
        reasoning,
        created_at
      FROM product_price_optimization_history
      WHERE asin = $1
      ORDER BY created_at DESC
      `,
      [asin],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No optimization history found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch optimization history" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
