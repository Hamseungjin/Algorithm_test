# Polymarket True ROI Calculator

A production-grade Next.js 14 web app that analyzes a Polymarket wallet by
combining CLOB trades with on-chain USDC transfers to compute the real ROI
that accounts for external deposits and withdrawals.

```
trueProfit = currentBalance + totalWithdraw − totalDeposit
trueROI    = (trueProfit / totalDeposit) × 100
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode, `noUncheckedIndexedAccess`)
- Tailwind CSS (dark mode by default)
- Zustand (global state)
- Recharts (charts)
- Vercel (deploy target)

## Project Layout

```
app/
  api/
    trades/route.ts        # CLOB API proxy (CORS bypass)
    transfers/route.ts     # Polygonscan / RPC proxy
    profile/route.ts       # Gamma API proxy
  layout.tsx
  page.tsx
  globals.css
components/
  WalletInput.tsx
  SummaryCards.tsx
  AssetChart.tsx
  PnLComparison.tsx
  TradeLogTable.tsx
  LoadingProgress.tsx
  SkeletonCard.tsx
lib/
  cache.ts
  calculations.ts
  constants.ts
  fetcher.ts
  polygon.ts
  polymarket.ts
store/
  walletStore.ts
types/
  index.ts
```

## Setup

```bash
cp .env.local.example .env.local
# edit POLYGONSCAN_API_KEY (optional but recommended)
npm install
npm run dev
```

`POLYGONSCAN_API_KEY` is optional — if missing or rate-limited, the app
automatically falls back to direct `eth_getLogs` calls against the configured
Polygon RPC.

## Scripts

- `npm run dev` — Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — Next/ESLint
- `npm run typecheck` — TypeScript check

## Notes

- All third-party API calls are proxied through `/app/api/*` routes to avoid
  CORS issues.
- Internal Polymarket addresses are filtered out when classifying transfers.
- Server-side Map cache (5 min TTL) deduplicates calls per wallet.
