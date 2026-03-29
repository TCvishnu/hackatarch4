// src/pages/DashboardPage.jsx
import PriceHubLogo from "../assets/latest.png";
import {
  DiamondIcon,
  DiamondFilledIcon,
  ArrowLeftIcon,
} from "../components/Icons";

export default function DashboardPage({ brands, onSelectProduct, onBack }) {
  const brand = brands[0]; // We always show one searched brand

  return (
    <div className="relative min-h-screen bg-[#080808] font-mono text-[#e2e2e2]">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="relative z-10 border-b border-[#181818] py-6 inner-shadow animate-fade-in">
        <div className="max-w-4xl px-6 flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + back */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-md bg-gold/20" />
                {/* <DiamondIcon size={20} color="#f5c842" /> */}
              </div>
              <img
                src={PriceHubLogo}
                alt="PriceHub"
                className="h-10 object-contain" // adjust height as needed
              />

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
        {brands.map((b, brandIdx) => (
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
                  key={product.id}
                  className={`
                    flex items-center justify-between px-6 py-4
                    group hover:bg-[#0f0f0f] transition-all duration-200
                    animate-fade-slide stagger-${Math.min(pIdx + 2, 6)}
                  `}
                >
                  {/* Product info */}
                  <div className="flex flex-col gap-2 min-w-0 flex-1 pr-4">
                    <span className="font-syne text-[13px] font-semibold text-[#d8d8d8] group-hover:text-white transition-colors duration-150 truncate">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#484848] bg-[#111] border border-[#1e1e1e] rounded-md px-2 py-0.5 tracking-[0.06em]">
                        {product.asin}
                      </span>
                      <span className="text-[11px] text-[#666] font-medium">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#2e2e2e]">
                        {product.history.length} run
                        {product.history.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Run Optimization button */}
                  <button
                    onClick={() => onSelectProduct(product, b.brandName)}
                    className="
    flex-shrink-0
    px-4 py-2
    text-[11px] font-syne font-bold uppercase tracking-[0.04em]
    rounded-xl
    border border-yellow-400 text-yellow-400
    bg-transparent
    hover:bg-yellow-400/10 hover:border-yellow-300
    active:scale-95
    transition-all duration-200
  "
                  >
                    Run Optimization
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
