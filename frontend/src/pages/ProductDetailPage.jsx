// src/pages/ProductDetailPage.jsx

import { useState } from "react";
import {
  DiamondIcon,
  DiamondFilledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparkleIcon,
  ArrowLeftIcon,
  LoaderIcon,
} from "../components/Icons";

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Returns today's full context string for the AI title prompt
function getTodayContext() {
  const now = new Date();
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-US", opts);
}

export default function ProductDetailPage({ product, brandName, onBack }) {
  const [history, setHistory] = useState(product.history);
  const [expandedRow, setExpandedRow] = useState(null);
  const [running, setRunning] = useState(false);
  const [runDone, setRunDone] = useState(false);

  // Dynamic title — starts as the product name, AI may update it
  const [pageTitle, setPageTitle] = useState(product.name);
  const [titleUpdated, setTitleUpdated] = useState(false);

  const handleRunAgent = async () => {
    if (running) return;
    setRunning(true);
    setRunDone(false);
    setTitleUpdated(false);

    const last = history[history.length - 1];
    const currentPrice = last?.suggestion ?? product.price;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an Amazon pricing optimization AI agent.
Given a product's current price, pricing history, and today's date context, suggest an optimal new price.
Also decide if the page title (product name) should be updated to reflect a special occasion, seasonal event, or marketing opportunity based on today's date.
Only change the title if there is a genuinely relevant reason (e.g. Valentine's Day, Christmas, Black Friday, back-to-school season, etc.). Otherwise keep it the same.
Respond ONLY with a valid JSON object — no markdown, no extra text.
Format exactly:
{
  "suggestedPrice": <number>,
  "reason": "<2-3 sentence pricing explanation>",
  "title": "<updated product title or same as original if no change needed>",
  "titleChanged": <true|false>,
  "salesImpact": "<Estimated increase or decrease in sales due to this suggestion>"
}`,
          messages: [
            {
              role: "user",
              content: `Product: ${product.name}
ASIN: ${product.asin}
Brand: ${brandName}
Today's date: ${getTodayContext()}
Current price going into this run: $${currentPrice.toFixed(2)}

Pricing history (${history.length} previous runs):
${history
  .map(
    (h) =>
      `- ${h.date}: listed at $${h.price.toFixed(2)}, AI suggested $${h.suggestion.toFixed(2)} — "${h.reason}"`,
  )
  .join("\n")}

Based on these trends and today's date context, what should the next optimal price be? And should the product title be updated for any seasonal/occasion reason?`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Update title if AI decided to change it
      if (
        parsed.titleChanged &&
        parsed.title &&
        parsed.title !== product.name
      ) {
        setPageTitle(parsed.title);
        setTitleUpdated(true);
      }

      const newEntry = {
        date: getTodayLabel(),
        price: currentPrice,
        suggestion: parseFloat(parseFloat(parsed.suggestedPrice).toFixed(2)),
        reason: parsed.reason,
        titleSuggestion:
          parsed.titleChanged && parsed.title && parsed.title !== product.name
            ? parsed.title
            : null,
        salesImpact:
          parsed.salesImpact ||
          "No significant sales impact estimate available.",
      };

      // Prepend new entry to the top
      setHistory((prev) => {
        setExpandedRow(0); // auto-expand the new top row
        return [newEntry, ...prev];
      });
      setRunDone(true);
    } catch (err) {
      console.error("Agent error:", err);
      const fallback = {
        date: getTodayLabel(),
        price: currentPrice,
        suggestion: parseFloat((currentPrice * 0.97).toFixed(2)),
        reason:
          "Agent encountered an issue connecting to the AI. Defaulting to a conservative 3% price reduction based on recent trend data.",
        titleSuggestion: null,
        salesImpact:
          "Estimated slight increase in sales due to the lower fallback price.",
      };
      setHistory((prev) => {
        setExpandedRow(0);
        return [fallback, ...prev];
      });
      setRunDone(true);
    } finally {
      setRunning(false);
    }
  };

  // Latest is always index 0 now (newest first)
  const latestSuggestion = history[0]?.suggestion ?? product.price;
  const priceDiff = latestSuggestion - product.price;

  return (
    <div className="relative min-h-screen bg-[#080808] font-mono text-[#e2e2e2]">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-[#181818] px-8 py-5 inner-shadow animate-fade-in">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="
                flex items-center gap-2 mt-1
                text-[11px] text-[#444] uppercase tracking-widest
                border border-[#1e1e1e] hover:border-[#2e2e2e] hover:text-[#888]
                px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0
              "
            >
              <ArrowLeftIcon />
              Back
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DiamondFilledIcon size={11} />
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.12em] font-syne">
                  {brandName}
                </span>
              </div>

              {/* Dynamic title with AI-updated indicator */}
              <div className="flex items-start gap-2 mb-1">
                <h1 className="font-syne text-[18px] font-extrabold text-white leading-tight tracking-[-0.02em]">
                  {pageTitle}
                </h1>
                {titleUpdated && (
                  <span
                    className="
                    flex-shrink-0 mt-1
                    text-[9px] font-bold text-gold
                    border border-gold/30 bg-gold/5
                    px-1.5 py-0.5 rounded
                    uppercase tracking-widest
                    animate-pulse-gold
                  "
                  >
                    AI
                  </span>
                )}
              </div>

              {/* Show original name if title was changed */}
              {titleUpdated && (
                <p className="text-[10px] text-[#333] tracking-wide mb-0.5 line-through">
                  {product.name}
                </p>
              )}

              <p className="text-[10px] text-[#383838] tracking-wide">
                ASIN: {product.asin}
              </p>
            </div>
          </div>

          {/* Run Agent button */}
          <button
            onClick={handleRunAgent}
            disabled={running}
            className={`
              flex items-center gap-2.5 px-5 py-2.5 rounded-xl
              text-[12px] font-medium tracking-[0.04em]
              border transition-all duration-200
              ${
                running
                  ? "border-[#222] text-[#444] bg-[#0d0d0d] cursor-not-allowed"
                  : "border-gold/40 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold/70 cursor-pointer active:scale-[0.98]"
              }
            `}
          >
            {running ? (
              <LoaderIcon className="animate-spin-slow" />
            ) : (
              <DiamondIcon size={14} color="#f5c842" />
            )}
            <span>{running ? "Running Agent…" : "Run Agent"}</span>
          </button>
        </div>
      </header>

      {/* ── Progress bar ────────────────────────────────── */}
      <div className="relative z-10 h-[2px] bg-[#111] overflow-hidden">
        {running && (
          <div className="h-full bg-gradient-to-r from-gold via-white/80 to-gold animate-progress" />
        )}
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-7 flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Current Price",
              value: `$${product.price.toFixed(2)}`,
              color: "text-white",
              delay: "stagger-1",
            },
            {
              label: "Latest AI Suggestion",
              value: `$${latestSuggestion.toFixed(2)}`,
              color: "text-gold",
              delay: "stagger-2",
            },
            {
              label: "Suggested Δ",
              value: `${priceDiff >= 0 ? "+" : ""}${priceDiff.toFixed(2)}`,
              color:
                priceDiff < 0
                  ? "text-emerald-400"
                  : priceDiff > 0
                    ? "text-red-400"
                    : "text-[#555]",
              delay: "stagger-3",
            },
          ].map(({ label, value, color, delay }) => (
            <div
              key={label}
              className={`border border-[#1c1c1c] rounded-xl p-4 bg-[#0a0a0a] inner-shadow animate-fade-slide ${delay}`}
            >
              <p className="text-[10px] text-[#3a3a3a] uppercase tracking-[0.12em] mb-2">
                {label}
              </p>
              <p
                className={`font-syne text-[22px] font-bold tracking-[-0.03em] ${color}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* History table — newest first */}
        <div className="border border-[#1c1c1c] rounded-2xl overflow-hidden bg-[#0a0a0a] inner-shadow animate-fade-slide stagger-4">
          {/* Head */}
          <div className="grid grid-cols-[1.2fr_1fr_1fr_90px_52px] px-5 py-3 border-b border-[#161616] bg-[#0d0d0d]">
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold">
              Date
            </span>
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold">
              Current Price
            </span>
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold">
              AI Suggestion
            </span>
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold">
              AI Title
            </span>
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold">
              Δ Change
            </span>
            <span className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold" />
          </div>

          {/* Rows — history is already newest-first */}
          {history.map((row, i) => {
            const delta = (row.suggestion - row.price).toFixed(2);
            const isNeg = parseFloat(delta) < 0;
            const isZero = parseFloat(delta) === 0;
            const isOpen = expandedRow === i;
            const isLast = i === history.length - 1;
            const isNew = runDone && i === 0; // newest is always at top

            return (
              <div
                key={`${i}-${row.date}-${row.suggestion}`}
                className={!isLast ? "border-b border-[#111]" : ""}
              >
                {/* Row */}
                <div
                  className={`
                    grid grid-cols-[1.1fr_1fr_1fr_1.4fr_90px_52px] px-5 py-4
                    transition-colors duration-150
                    ${isNew ? "bg-[#0f0f0a] animate-fade-slide" : isOpen ? "bg-[#0e0e0e]" : "hover:bg-[#0d0d0d]"}
                  `}
                >
                  {/* Date + NEW badge */}
                  <span className="text-[13px] text-[#888] self-center flex items-center gap-2">
                    {row.date}
                    {isNew && (
                      <span className="text-[9px] font-bold text-gold border border-gold/30 bg-gold/5 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse-gold">
                        new
                      </span>
                    )}
                  </span>

                  {/* Current price */}
                  <span className="text-[13px] text-[#aaa] self-center font-medium">
                    ${row.price.toFixed(2)}
                  </span>

                  {/* Suggestion */}
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gold self-center">
                    <SparkleIcon className="opacity-70 flex-shrink-0" />$
                    {row.suggestion.toFixed(2)}
                  </span>

                  {/* AI Title Suggestion */}
                  <span className="text-[12px] text-[#888] self-center truncate pr-3">
                    {row.titleSuggestion ? (
                      <span className="text-gold font-medium">
                        {row.titleSuggestion}
                      </span>
                    ) : (
                      <span className="text-[#333]">-</span>
                    )}
                  </span>

                  {/* Delta */}
                  <span
                    className={`text-[13px] font-semibold self-center ${isZero ? "text-[#444]" : isNeg ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {parseFloat(delta) > 0 ? "+" : ""}
                    {delta}
                  </span>

                  {/* Expand toggle */}
                  <div className="flex items-center justify-end self-center">
                    <button
                      onClick={() => setExpandedRow(isOpen ? null : i)}
                      className="
                        w-8 h-8 flex items-center justify-center
                        border border-[#1e1e1e] hover:border-[#2e2e2e]
                        rounded-lg text-[#444] hover:text-[#888]
                        bg-[#0d0d0d] hover:bg-[#111]
                        transition-all duration-150
                      "
                    >
                      {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>
                </div>

                {/* Reasoning panel */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 bg-[#0e0e0e] animate-fade-slide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#0a0a0a] inner-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <SparkleIcon className="text-gold" />
                          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.1em] font-syne">
                            AI Reasoning
                          </span>
                        </div>
                        <p className="text-[12px] text-[#666] leading-[1.75] tracking-[0.01em]">
                          {row.reason}
                        </p>
                      </div>

                      <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#0a0a0a] inner-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <SparkleIcon className="text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.1em] font-syne">
                            Sales Impact
                          </span>
                        </div>
                        <p className="text-[12px] text-[#666] leading-[1.75] tracking-[0.01em]">
                          {row.salesImpact}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
