// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { fetchBrandProducts } from "../api";

import {
  DiamondIcon,
  DiamondFilledIcon,
  ArrowLeftIcon,
} from "../components/Icons";

export default function DashboardPage({ brands, onSelectProduct, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const brandName = brands[0]?.brandName;

  useEffect(() => {
    if (!brandName) return;

    const load = async () => {
      try {
        setLoading(true);
        const products = await fetchBrandProducts(brandName);

        setData([
          {
            id: brandName,
            brandName,
            products,
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [brandName]);

  const brand = data[0];
  return (
    <div className="relative min-h-screen bg-[#080808] font-mono text-[#e2e2e2]">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="relative z-10 border-b border-[#181818] px-8 py-6 inner-shadow animate-fade-in">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + back */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="
                flex items-center gap-2
                text-[11px] text-[#444] uppercase tracking-widest
                border border-[#1e1e1e] hover:border-[#2e2e2e] hover:text-[#888]
                px-3 py-2 rounded-lg transition-all duration-200
              "
            >
              <ArrowLeftIcon />
              Search
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-md bg-gold/20" />
                <DiamondIcon size={20} color="#f5c842" />
              </div>
              <span className="font-syne text-[20px] font-extrabold tracking-[-0.04em] text-white">
                PriceAgent
              </span>
            </div>
          </div>

          {/* Brand pill */}
          {brand && (
            <div className="flex items-center gap-2 border border-[#1e1e1e] rounded-xl px-4 py-2 bg-[#0d0d0d] inner-shadow animate-fade-in stagger-1">
              <DiamondFilledIcon size={11} />
              <span className="font-syne text-[11px] font-bold text-gold uppercase tracking-[0.1em]">
                {brand.brandName}
              </span>
              <span className="text-[10px] text-[#333] ml-1">
                · {brand.products.length} product
                {brand.products.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-8 flex flex-col gap-5">
        {data.map((b, brandIdx) => (
          <div
            key={b.id}
            className={`
              border border-[#1c1c1c] rounded-2xl overflow-hidden
              bg-gradient-to-br from-[#0d0d0d] to-[#0a0a0a]
              inner-shadow animate-fade-slide
              stagger-${Math.min(brandIdx + 1, 6)}
            `}
          >
            {/* Brand header */}
            <div className="flex items-center gap-2.5 px-6 pt-5 pb-4 border-b border-[#161616]">
              <DiamondFilledIcon size={13} />
              <span className="font-syne text-[11px] font-bold text-gold uppercase tracking-[0.12em]">
                {b.brandName}
              </span>
              <span className="ml-auto text-[10px] text-[#333] tracking-widest">
                {b.products.length} product{b.products.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Product rows */}
            <div className="flex flex-col divide-y divide-[#111]">
              {b.products.map((product, pIdx) => (
                <div
                  key={product.asin}
                  className={`
                    flex items-center justify-between px-6 py-4
                    group hover:bg-[#0f0f0f] transition-all duration-200
                    animate-fade-slide stagger-${Math.min(pIdx + 2, 6)}
                  `}
                >
                  {/* Product info */}
                  <div className="flex flex-col gap-2 min-w-0 flex-1 pr-4">
                    <span className="font-syne text-[13px] font-semibold text-[#d8d8d8] group-hover:text-white transition-colors duration-150 truncate">
                      {product.product_name}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#484848] bg-[#111] border border-[#1e1e1e] rounded-md px-2 py-0.5 tracking-[0.06em]">
                        {product.asin}
                      </span>
                      <span className="text-[11px] text-[#666] font-medium">
                        $
                        {product.price ? Number(product.price).toFixed(2) : "—"}
                      </span>
                      {/* <span className="text-[10px] text-[#2e2e2e]">
                        {product.history.length} run
                        {product.history.length !== 1 ? "s" : ""}
                      </span> */}
                    </div>
                  </div>

                  {/* Optimize button */}
                  <button
                    onClick={() => onSelectProduct(product, b.brandName)}
                    title="Run optimization"
                    className="
                      flex-shrink-0 w-10 h-10
                      flex items-center justify-center
                      rounded-xl border border-[#252525]
                      bg-transparent
                      hover:border-gold/40 hover:bg-gold/5
                      active:scale-95
                      transition-all duration-200
                      group/btn
                    "
                  >
                    <DiamondIcon
                      size={17}
                      color="#f5c842"
                      className="transition-transform duration-150 group-hover/btn:scale-110"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
