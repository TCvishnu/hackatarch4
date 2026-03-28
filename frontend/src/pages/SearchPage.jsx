// src/pages/SearchPage.jsx

import { useState, useRef } from "react";
import { brands } from "../data/brands";
import { DiamondIcon, SparkleIcon } from "../components/Icons";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16.5 16.5L21 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function SearchPage({ onSearch }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Live-filter brand names as user types
  const suggestions =
    query.trim().length > 0
      ? brands.filter((b) =>
          b.brandName.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : [];

  const handleSelect = (brand) => {
    setQuery(brand.brandName);
    setError("");
    onSearch([brand]);
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const match = brands.find(
      (b) => b.brandName.toLowerCase() === trimmed.toLowerCase(),
    );

    if (match) {
      onSearch([match]);
    } else {
      setError(
        `No results found for "${trimmed}". Try one of the suggestions below.`,
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setQuery("");
      setError("");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] font-mono text-[#e2e2e2] flex flex-col">
      {/* ── Top bar ─────────────────────────────────── */}
      <header className="relative z-10 border-b border-[#181818] px-8 py-6 inner-shadow animate-fade-in">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-gold/20 rounded-full" />
            <DiamondIcon size={22} color="#f5c842" />
          </div>
          <span className="font-syne text-[22px] font-extrabold tracking-[-0.04em] text-white">
            PriceAgent
          </span>
        </div>
      </header>

      {/* ── Hero + Search ───────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-16">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-xl flex flex-col items-center gap-8 animate-fade-slide">
          {/* Headline */}
          <div className="text-center flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <SparkleIcon className="text-gold opacity-80" />
              <span className="text-[10px] text-gold uppercase tracking-[0.16em] font-semibold">
                AI Pricing Intelligence
              </span>
              <SparkleIcon className="text-gold opacity-80" />
            </div>
            <h1 className="font-syne text-[36px] font-extrabold text-white leading-[1.1] tracking-[-0.03em]">
              Search a Brand
            </h1>
            <p className="text-[13px] text-[#444] leading-relaxed max-w-sm mx-auto">
              Enter a brand name to view its product catalogue and run AI
              pricing optimization.
            </p>
          </div>

          {/* Search box + dropdown */}
          <div className="w-full flex flex-col gap-3 relative">
            <div
              className={`
                flex items-center gap-3 w-full
                border rounded-2xl px-5 py-4
                bg-[#0d0d0d] inner-shadow
                transition-all duration-200
                ${
                  error
                    ? "border-red-900/60"
                    : "border-[#222] focus-within:border-gold/40 focus-within:bg-[#0f0f0a]"
                }
              `}
            >
              <span className="text-[#333] flex-shrink-0">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError("");
                  setTouched(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. NovaTech Electronics…"
                className="
                  flex-1 bg-transparent outline-none border-none
                  text-[14px] text-white placeholder-[#2e2e2e]
                  font-mono tracking-wide
                "
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setError("");
                    inputRef.current?.focus();
                  }}
                  className="text-[#333] hover:text-[#666] transition-colors text-[18px] leading-none flex-shrink-0"
                >
                  ×
                </button>
              )}
            </div>

            {/* Live dropdown suggestions */}
            {touched && suggestions.length > 0 && (
              <div className="absolute top-[64px] left-0 right-0 z-20 border border-[#1e1e1e] rounded-xl overflow-hidden bg-[#0d0d0d] inner-shadow animate-fade-in">
                {suggestions.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className="
                      w-full flex items-center justify-between
                      px-5 py-3.5 text-left
                      hover:bg-[#111] transition-colors duration-150
                      border-b border-[#161616] last:border-0
                      group
                    "
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-syne text-[13px] font-semibold text-[#ccc] group-hover:text-white transition-colors">
                        {b.brandName}
                      </span>
                      <span className="text-[10px] text-[#333]">
                        {b.products.length} product
                        {b.products.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-gold/50 group-hover:text-gold transition-colors tracking-widest uppercase">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No match hint */}
            {touched &&
              query.trim().length > 0 &&
              suggestions.length === 0 &&
              !error && (
                <p className="text-[11px] text-[#333] tracking-wide px-1 animate-fade-in">
                  No brands match "{query}" — try the suggestions below.
                </p>
              )}

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400/80 tracking-wide px-1 animate-fade-in">
                {error}
              </p>
            )}

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className={`
                w-full flex items-center justify-center gap-2.5
                py-3.5 rounded-xl
                font-syne text-[13px] font-bold tracking-[0.04em]
                border transition-all duration-200
                ${
                  !query.trim()
                    ? "border-[#1e1e1e] text-[#333] bg-[#0d0d0d] cursor-not-allowed"
                    : "border-gold/50 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold cursor-pointer active:scale-[0.98]"
                }
              `}
            >
              <DiamondIcon
                size={14}
                color={query.trim() ? "#f5c842" : "#333"}
              />
              Search Brand
            </button>
          </div>

          {/* Quick-pick pills — all available brands */}
          <div className="flex flex-col items-center gap-3 animate-fade-in stagger-3">
            <p className="text-[10px] text-[#2e2e2e] uppercase tracking-widest">
              Available brands
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelect(b)}
                  className="
                    text-[11px] text-[#444] border border-[#1a1a1a]
                    hover:border-gold/30 hover:text-gold/80
                    px-3 py-1.5 rounded-lg
                    transition-all duration-150
                    bg-[#0d0d0d]
                  "
                >
                  {b.brandName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#111] px-8 py-4">
        <p className="text-center text-[10px] text-[#222] tracking-widest uppercase">
          Powered by Claude AI · Amazon Pricing Intelligence
        </p>
      </footer>
    </div>
  );
}
