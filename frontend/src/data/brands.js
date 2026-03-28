// data/brands.js — All hardcoded product and pricing data

export const brands = [
  {
    id: 1,
    brandName: "NovaTech Electronics",
    products: [
      {
        id: 101,
        name: "Wireless Noise-Cancelling Headphones",
        asin: "B08XYZ1234",
        price: 89.99,
        history: [
          {
            date: "Mar 1",
            price: 89.99,
            suggestion: 79.99,
            reason:
              "Competitor analysis shows 3 similar products priced at $75–$82. Lowering to $79.99 increases buy box win rate by an estimated 34% without significantly impacting margin.",
          },
          {
            date: "Mar 8",
            price: 89.99,
            suggestion: 84.99,
            reason:
              "Seasonal demand spike detected (Spring). Slight reduction retains competitiveness while capturing volume uptick.",
          },
          {
            date: "Mar 15",
            price: 84.99,
            suggestion: 84.99,
            reason:
              "Current price is optimal. Buy box ownership at 71%. No change recommended.",
          },
        ],
      },
      {
        id: 102,
        name: "USB-C Fast Charging Hub",
        asin: "B09ABC5678",
        price: 45.0,
        history: [
          {
            date: "Mar 1",
            price: 45.0,
            suggestion: 39.99,
            reason:
              "Price elasticity model suggests a $5 reduction leads to ~22% volume increase, net positive revenue impact.",
          },
          {
            date: "Mar 8",
            price: 39.99,
            suggestion: 42.99,
            reason:
              "Inventory levels are low. Slight price increase reduces velocity and extends stock runway by ~9 days.",
          },
        ],
      },
      {
        id: 103,
        name: '4K Portable Monitor 15.6"',
        asin: "B0AXYZ9900",
        price: 199.99,
        history: [
          {
            date: "Mar 5",
            price: 199.99,
            suggestion: 189.99,
            reason:
              "Three competing listings appeared this week at $185–$195. Matching closer to the midpoint improves conversion while preserving perceived quality.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    brandName: "PureLife Organics",
    products: [
      {
        id: 201,
        name: "Collagen Protein Powder 500g",
        asin: "B07DEF9012",
        price: 34.99,
        history: [
          {
            date: "Mar 1",
            price: 34.99,
            suggestion: 31.99,
            reason:
              "Top competitor dropped price to $29.99. Matching aggressively risks margin erosion; $31.99 balances conversion lift (~18%) with profitability.",
          },
          {
            date: "Mar 10",
            price: 34.99,
            suggestion: 34.99,
            reason:
              "Review velocity increased 40% this week (organic). Hold price — social proof is driving conversions without price incentive.",
          },
        ],
      },
      {
        id: 202,
        name: "Organic Ashwagandha Capsules",
        asin: "B08GHI3456",
        price: 22.5,
        history: [
          {
            date: "Mar 3",
            price: 22.5,
            suggestion: 19.99,
            reason:
              "Search volume for 'ashwagandha supplements' up 60% (seasonal). Lowering price now captures demand surge and improves ranking velocity.",
          },
          {
            date: "Mar 12",
            price: 19.99,
            suggestion: 21.99,
            reason:
              "Sales velocity exceeded projections. Small price bump tests elasticity without losing ranking gains from the past week.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    brandName: "ArcLight Studio",
    products: [
      {
        id: 301,
        name: 'LED Ring Light 18" Pro',
        asin: "B06JKL7890",
        price: 67.0,
        history: [
          {
            date: "Mar 2",
            price: 67.0,
            suggestion: 59.99,
            reason:
              "This category has extreme price sensitivity. Undercutting the average ($63) by ~6% historically yields a 30%+ conversion improvement in ring light listings.",
          },
          {
            date: "Mar 9",
            price: 59.99,
            suggestion: 62.99,
            reason:
              "Demand absorbed well at $59.99. Margin recovery opportunity — a $3 increase is within the inelastic band based on A/B test data.",
          },
        ],
      },
    ],
  },
];
