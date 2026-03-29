import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import cors from "cors";

import {
  getOptimizationData,
  buildFeatures,
  generateCode,
  runCode,
  reason,
  saveOptimization,
} from "./prepare-data.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = ["http://localhost:5173", "http://127.0.0.1:5173"];

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

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

app.get("/optimize/:asin", async (req, res) => {
  try {
    const data = await getOptimizationData(req.params.asin);

    const features = buildFeatures(data);

    // code agent
    const { code, prompt: codePrompt } = await generateCode(features);

    let computed;
    try {
      computed = runCode(code, features);
    } catch {
      computed = {
        suggested_price: features.current_price * 0.9,
        fallback: true,
      };
    }

    // reasoning agent
    const { output: decision, prompt: reasonPrompt } = await reason(
      features,
      computed,
      data.product,
    );

    const context = {
      input: data,
      features,
      code_agent: {
        prompt: codePrompt,
        generated_code: code,
      },
      execution: {
        computed,
      },
      reasoning_agent: {
        prompt: reasonPrompt,
        output: decision,
      },
    };

    await saveOptimization(
      data.product.id,
      data.price,
      decision,
      data.product.product_name,
      context,
    );

    res.json({
      features,
      computed,
      decision,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Optimization failed" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
