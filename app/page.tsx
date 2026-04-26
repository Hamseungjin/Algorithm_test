"use client";

import { useWalletStore } from "@/store/walletStore";
import { WalletInput } from "@/components/WalletInput";
import { LoadingProgress } from "@/components/LoadingProgress";
import { SummaryCards } from "@/components/SummaryCards";
import { AssetChart } from "@/components/AssetChart";
import { PnLComparison } from "@/components/PnLComparison";
import { TradeLogTable } from "@/components/TradeLogTable";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { WarningBanner } from "@/components/WarningBanner";

export default function HomePage(): JSX.Element {
  const status = useWalletStore((s) => s.status);
  const trades = useWalletStore((s) => s.trades);
  const transfers = useWalletStore((s) => s.transfers);

  const showSkeleton = status === "loading";
  const showEmpty =
    status === "success" && trades.length === 0 && transfers.length === 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-textSecondary">
          Polymarket Analytics
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
          True ROI Calculator
        </h1>
        <p className="max-w-2xl text-sm text-textSecondary">
          Polymarket's profile PnL ignores your external deposits and withdrawals.
          This tool joins on-chain USDC transfers with CLOB trades to compute the
          real cash-flow profit and ROI.
        </p>
      </header>

      <WalletInput />

      <LoadingProgress />

      {showSkeleton ? (
        <div className="space-y-6 animate-fade-in">
          <SkeletonGrid count={6} />
        </div>
      ) : null}

      {showEmpty ? (
        <div className="card text-center">
          <h3 className="text-base font-semibold text-textPrimary">
            No activity found
          </h3>
          <p className="mt-2 text-sm text-textSecondary">
            This wallet has no Polymarket trades or USDC transfers on Polygon.
          </p>
        </div>
      ) : null}

      {status === "success" ? <WarningBanner /> : null}

      {status === "success" && !showEmpty ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          <SummaryCards />
          <AssetChart />
          <PnLComparison />
          <TradeLogTable />
        </div>
      ) : null}

      <footer className="mt-auto pt-8 text-center text-xs text-textSecondary">
        Data: Polymarket CLOB · Gamma · Polygon (Polygonscan / RPC). Not financial
        advice.
      </footer>
    </main>
  );
}
