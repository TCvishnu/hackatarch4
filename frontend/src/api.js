const BASE_URL = "http://localhost:3000";

export async function fetchBrandProducts(brandName) {
  const res = await fetch(`${BASE_URL}/brands/${brandName}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function optimizeProduct(asin) {
  const res = await fetch(`${BASE_URL}/optimize/${asin}`);
  if (!res.ok) throw new Error("Optimization failed");
  return res.json();
}

export async function fetchOptimizationHistory(asin) {
  const res = await fetch(`${BASE_URL}/optimization-history/${asin}`);
  if (!res.ok) throw new Error("History fetch failed");
  return res.json();
}
