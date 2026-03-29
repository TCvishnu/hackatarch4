import pool from "./db.js";
import vm from "node:vm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getOptimizationData(asin) {
  const client = await pool.connect();

  try {
    const productRes = await client.query(
      `SELECT id, product_name FROM products WHERE asin = $1`,
      [asin],
    );

    if (productRes.rows.length === 0) {
      throw new Error("Product not found");
    }

    const product = productRes.rows[0];
    const productId = product.id;

    const [priceRes, metricsRes, competitorsRes, reviewsRes] =
      await Promise.all([
        client.query(
          `
        SELECT price
        FROM product_prices
        WHERE product_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1
        `,
          [productId],
        ),

        client.query(
          `
        SELECT *
        FROM product_metrics
        WHERE product_id = $1
        ORDER BY date DESC
        LIMIT 7
        `,
          [productId],
        ),

        client.query(
          `
        SELECT 
          p.asin,
          pp.price
        FROM product_competitors pc
        JOIN products p ON pc.competitor_product_id = p.id
        LEFT JOIN LATERAL (
          SELECT price
          FROM product_prices
          WHERE product_id = p.id
          ORDER BY recorded_at DESC
          LIMIT 1
        ) pp ON true
        WHERE pc.product_id = $1
        `,
          [productId],
        ),

        client.query(
          `
        SELECT review_text
        FROM product_reviews
        WHERE product_id = $1
        `,
          [productId],
        ),
      ]);

    return {
      product,
      price: priceRes.rows[0]?.price,
      metrics: metricsRes.rows,
      competitors: competitorsRes.rows,
      reviews: reviewsRes.rows,
    };
  } finally {
    client.release();
  }
}

export function buildFeatures(data) {
  const { price, metrics, competitors, reviews } = data;

  const avgConversion =
    metrics.reduce((a, m) => a + Number(m.conversion_rate || 0), 0) /
    metrics.length;

  const conversionTrend =
    metrics.length > 1 &&
    metrics[0].conversion_rate < metrics[metrics.length - 1].conversion_rate
      ? "down"
      : "up";

  const competitorPrices = competitors
    .map((c) => Number(c.price))
    .filter(Boolean);

  const avgCompetitorPrice =
    competitorPrices.reduce((a, b) => a + b, 0) /
    (competitorPrices.length || 1);

  return {
    current_price: Number(price),
    avg_conversion_rate: avgConversion,
    conversion_trend: conversionTrend,
    buy_box_percentage: metrics[0]?.buy_box_percentage || 0,
    price_gap: Number(price) - avgCompetitorPrice,
    reviews,
    competitor_prices: competitorPrices,
  };
}

export async function generateCode(features) {
  const prompt = `
Write short JavaScript code that:
- Computes a base suggested_price
- Uses price_gap, conversion_rate, buy_box_percentage

Return ONLY code that returns JSON.

Input:
${JSON.stringify(features)}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const code = res.choices[0].message.content;

  return { code, prompt };
}

export function runCode(code, features) {
  // basic validation
  if (!code || code.length > 2000) {
    throw new Error("Invalid code length");
  }

  // block obvious dangerous patterns
  const banned = [
    "while",
    "for(",
    "for (",
    "process",
    "require",
    "global",
    "Function",
    "eval",
  ];

  if (banned.some((word) => code.includes(word))) {
    throw new Error("Unsafe code detected");
  }

  const sandbox = Object.freeze({
    data: Object.freeze(features),
    result: null,
  });

  const context = vm.createContext(sandbox);

  const wrapped = `
    "use strict";
    result = (function() {
      ${code}
    })();
  `;

  const script = new vm.Script(wrapped);

  script.runInContext(context, {
    timeout: 1000,
  });

  return validateResult(context.result);
}
export async function reason(features, computed, product) {
  const prompt = `
You are a pricing optimizer.
Remember seasonality: If valentines is coming then optimize price and title for that
Product Title: ${product.product_name}

Features:
${JSON.stringify(features)}

Computed:
${JSON.stringify(computed)}

Return JSON:
{
  "recommended_price": number,
  "suggested_title": string,
  "reasoning": string
}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const output = JSON.parse(res.choices[0].message.content);

  return { output, prompt };
}
export async function saveOptimization(
  productId,
  price,
  result,
  productName,
  context,
) {
  await pool.query(
    `
    INSERT INTO price_optimizations (
      product_id,
      current_price,
      recommended_price,
      old_title,
      suggested_title,
      reasoning,
      context
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [
      productId,
      price,
      result.recommended_price,
      productName,
      result.suggested_title,
      result.reasoning,
      JSON.stringify(context),
    ],
  );
}
