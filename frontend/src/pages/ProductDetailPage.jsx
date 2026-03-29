// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { optimizeProduct, fetchOptimizationHistory } from "../api";

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
  const [history, setHistory] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [running, setRunning] = useState(false);
  const [runDone, setRunDone] = useState(false);
  const [pageTitle, setPageTitle] = useState(product.product_name);
  const [titleUpdated, setTitleUpdated] = useState(false);

  const OPENAI_API_KEY = ""; // Replace with actual key

  // Deep Dive Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [currentDeepDiveContext, setCurrentDeepDiveContext] = useState("");

  const handleRunAgent = async () => {
    setRunning(true);
    setRunDone(false);

    try {
      const result = await optimizeProduct(product.asin);

      // Refresh history so new row appears at top
      const data = await fetchOptimizationHistory(product.asin);

      const formatted = data.map((row) => ({
        date: new Date(row.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        price: Number(row.current_price),
        suggestion: Number(row.recommended_price),
        reason: row.reasoning,
        titleSuggestion: row.suggested_title,
        salesImpact: "",
        rawContext: row.context, // ← add this
      }));

      setHistory(formatted.reverse());

      // Update page title if agent suggested one
      const suggestedTitle = result.decision?.suggested_title;
      if (suggestedTitle && suggestedTitle !== product.product_name) {
        setPageTitle(suggestedTitle);
        setTitleUpdated(true);
      }

      setRunDone(true);
      // Auto-expand the newest row
      setExpandedRow(0);
    } catch (err) {
      console.error("Agent run failed", err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchOptimizationHistory(product.asin);
        // map DB → UI format
        const formatted = data.map((row) => ({
          date: new Date(row.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          price: Number(row.current_price),
          suggestion: Number(row.recommended_price),
          reason: row.reasoning,
          titleSuggestion: row.suggested_title,
          salesImpact: "",
          // In loadHistory useEffect AND handleRunAgent — parse context safely
          rawContext:
            typeof row.context === "string"
              ? JSON.parse(row.context)
              : row.context,
        }));

        setHistory(formatted.reverse() || []); // latest first
      } catch (err) {
        setHistory([]);
        console.error("Failed to load history", err);
      }
    };

    loadHistory();
  }, [product.asin]);

  const latestSuggestion = history[0]?.suggestion ?? product.price;
  const priceDiff = latestSuggestion - product.price;

  return (
    <div className="relative min-h-screen bg-[#080808] font-mono text-[#e2e2e2]">
      {/* Header */}
      <header className="relative z-10 border-b border-[#181818] px-8 py-5 inner-shadow animate-fade-in">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mt-1 text-[11px] text-[#444] uppercase tracking-widest border border-[#1e1e1e] hover:border-[#2e2e2e] hover:text-[#888] px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0"
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
              <div className="flex items-start gap-2 mb-1">
                <h1 className="font-syne text-[18px] font-extrabold text-white leading-tight tracking-[-0.02em]">
                  {pageTitle}
                </h1>
                {titleUpdated && (
                  <span className="flex-shrink-0 mt-1 text-[9px] font-bold text-gold border border-gold/30 bg-gold/5 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse-gold">
                    AI
                  </span>
                )}
              </div>
              {titleUpdated && (
                <p className="text-[10px] text-[#333] tracking-wide mb-0.5 line-through">
                  {product.product_name}
                </p>
              )}
              <p className="text-[10px] text-[#383838] tracking-wide">
                ASIN: {product.asin}
              </p>
            </div>
          </div>
          {/* Run Agent Button */}
          <button
            disabled={running}
            onClick={handleRunAgent}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[12px] font-medium tracking-[0.04em] border transition-all duration-200 ${
              running
                ? "border-[#222] text-[#444] bg-[#0d0d0d] cursor-not-allowed"
                : "border-gold/40 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold/70 cursor-pointer active:scale-[0.98]"
            }`}
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

      {/* Progress bar */}
      <div className="relative z-10 h-[2px] bg-[#111] overflow-hidden">
        {running && (
          <div className="h-full bg-gradient-to-r from-gold via-white/80 to-gold animate-progress" />
        )}
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-7 flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Current Price",
              value: `$${Number(product.price).toFixed(2)}`,
              color: "text-white",
            },
            {
              label: "Latest AI Suggestion",
              value: `$${latestSuggestion}`,
              color: "text-gold",
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
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="border border-[#1c1c1c] rounded-xl p-4 bg-[#0a0a0a] inner-shadow"
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

        {/* History table */}
        <div className="border border-[#1c1c1c] rounded-2xl overflow-hidden bg-[#0a0a0a] inner-shadow">
          <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr_2fr_90px_52px] px-5 py-3 border-b border-[#161616] bg-[#0d0d0d]">
            {["Date", "Current Price", "AI Price", "AI Title", "Change"].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-[10px] text-[#333] uppercase tracking-[0.1em] font-semibold"
                >
                  {h}
                </span>
              ),
            )}
            <span />
          </div>
          {history.map((row, i) => {
            const delta = (row.suggestion - row.price).toFixed(2);
            const isNeg = parseFloat(delta) < 0;
            const isZero = parseFloat(delta) === 0;
            const isOpen = expandedRow === i;
            const isLast = i === history.length - 1;
            const isNew = runDone && i === 0;

            return (
              <div
                key={`${i}-${row.date}-${row.suggestion}`}
                className={!isLast ? "border-b border-[#111]" : ""}
              >
                {/* Row */}
                <div
                  className={`grid grid-cols-[1.1fr_1fr_1fr_1.4fr_90px_52px] px-5 py-4 transition-colors duration-150 ${isNew ? "bg-[#0f0f0a] animate-fade-slide" : isOpen ? "bg-[#0e0e0e]" : "hover:bg-[#0d0d0d]"}`}
                >
                  <span className="text-[13px] text-[#888] self-center flex items-center gap-2">
                    {row.date}
                    {isNew && (
                      <span className="text-[9px] font-bold text-gold border border-gold/30 bg-gold/5 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse-gold">
                        new
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] text-[#aaa] self-center font-medium">
                    ${row.price.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gold self-center">
                    <SparkleIcon className="opacity-70 flex-shrink-0" />$
                    {row.suggestion.toFixed(2)}
                  </span>
                  <span className="text-[12px] text-[#888] self-center truncate pr-3">
                    {row.titleSuggestion ? (
                      <span className="text-gold font-medium">
                        {row.titleSuggestion}
                      </span>
                    ) : (
                      <span className="text-[#333]">-</span>
                    )}
                  </span>
                  <span
                    className={`text-[13px] font-semibold self-center ${isZero ? "text-[#444]" : isNeg ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {parseFloat(delta) > 0 ? "+" : ""}
                    {delta}
                  </span>
                  <div className="flex items-center justify-end self-center">
                    <button
                      onClick={() => setExpandedRow(isOpen ? null : i)}
                      className="w-8 h-8 flex items-center justify-center border border-[#1e1e1e] hover:border-[#2e2e2e] rounded-lg text-[#444] hover:text-[#888] bg-[#0d0d0d] hover:bg-[#111] transition-all duration-150"
                    >
                      {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>
                </div>

                {/* Reasoning Panel with Deep Dive */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 bg-[#0e0e0e] animate-fade-slide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* AI Reasoning */}
                      <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#0a0a0a] inner-shadow flex flex-col justify-between">
                        <div>
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
                        <button
                          onClick={() => {
                            const ctx =
                              typeof row.rawContext === "string"
                                ? JSON.parse(row.rawContext)
                                : row.rawContext;

                            const features =
                              ctx?.features ?? ctx?.input?.features ?? {};
                            const computed = ctx?.execution?.computed ?? {};
                            const reasoning =
                              ctx?.reasoning_agent?.output ?? {};
                            const inputData = ctx?.input ?? {};

                            const deepDiveContext = `
You are an expert Amazon pricing analyst. You have full visibility into how this pricing decision was made.

=== PRODUCT ===
Name: ${product.product_name}
ASIN: ${product.asin}
Brand: ${brandName}
Current Price: $${row.price}
Recommended Price: $${row.suggestion}

=== MARKET FEATURES ===
Price Gap vs Competitors: ${features.price_gap}
Avg Competitor Price: ${(features.competitor_prices ?? []).join(", ")}
Avg Conversion Rate: ${features.avg_conversion_rate}
Conversion Trend: ${features.conversion_trend}
Buy Box %: ${features.buy_box_percentage}

=== CODE AGENT COMPUTATION ===
${JSON.stringify(computed, null, 2)}

=== REASONING AGENT OUTPUT ===
${JSON.stringify(reasoning, null, 2)}

=== RAW METRICS (last 7 days) ===
${JSON.stringify(inputData?.metrics ?? [], null, 2)}

Answer questions about WHY this price was chosen, what risks exist, and what actions the seller should take.
  `.trim();

                            setCurrentDeepDiveContext(deepDiveContext);
                            setChatMessages([]);
                            setChatOpen(true);
                          }}
                          className="mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-semibold"
                        >
                          Deep Dive
                        </button>
                      </div>

                      {/* Sales Impact */}
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

      {/* Deep Dive Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-[#111] shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${chatOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222]">
          <h2 className="text-white font-bold text-[14px]">Deep Dive Chat</h2>
          <button
            onClick={() => setChatOpen(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white self-end" : "bg-[#222] text-gray-300 self-start"}`}
            >
              {msg.content}
            </div>
          ))}
          {chatLoading && (
            <div className="p-3 rounded-xl bg-[#222] text-gray-300 animate-pulse self-start">
              AI is typing...
            </div>
          )}
        </div>
        <div className="p-3 border-t border-[#222] flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about pricing, trends..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={async () => {
              if (!chatInput.trim()) return;
              const userMessage = chatInput.trim();
              setChatMessages((prev) => [
                ...prev,
                { role: "user", content: userMessage },
              ]);
              setChatInput("");
              setChatLoading(true);
              try {
                const res = await fetch(
                  "https://api.openai.com/v1/chat/completions",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                      model: "gpt-4o-mini",
                      messages: [
                        {
                          role: "system",
                          content: `You are an Amazon pricing optimization AI agent. Context: ${currentDeepDiveContext}`,
                        },
                        ...chatMessages,
                        { role: "user", content: userMessage },
                      ],
                      temperature: 0.7,
                    }),
                  },
                );
                const data = await res.json();
                const aiReply =
                  data.choices?.[0]?.message?.content ?? "No response from AI";
                setChatMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: aiReply },
                ]);
              } catch (err) {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: "AI request failed. Please try again.",
                  },
                ]);
              } finally {
                setChatLoading(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
