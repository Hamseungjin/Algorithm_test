"use client";

import { useWalletStore } from "@/store/walletStore";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/calculations";

interface CardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "danger" | "accent";
  emphasize?: boolean;
}

function Card({ label, value, hint, tone = "neutral", emphasize = false }: CardProps): JSX.Element {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "accent"
          ? "text-accent"
          : "text-textPrimary";

  const valueSize = emphasize ? "text-3xl" : "text-2xl";

  return (
    <div className="card card-hover">
      <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
        {label}
      </p>
      <p className={`mt-3 font-semibold tabular-nums ${valueSize} ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-textSecondary">{hint}</p> : null}
    </div>
  );
}

export function SummaryCards(): JSX.Element | null {
  const metrics = useWalletStore((s) => s.metrics);
  const status = useWalletStore((s) => s.status);

  if (status !== "success" || !metrics) return null;

  const profitTone = metrics.trueProfit >= 0 ? "success" : "danger";
  const roiTone = metrics.trueROI >= 0 ? "success" : "danger";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        label="Total Deposits"
        value={formatCurrency(metrics.totalDeposit)}
        tone="success"
        hint="External USDC inflow"
      />
      <Card
        label="Total Withdrawals"
        value={formatCurrency(metrics.totalWithdraw)}
        tone="danger"
        hint="External USDC outflow"
      />
      <Card
        label="Trade Count"
        value={formatNumber(metrics.tradesCount)}
        hint="Matched CLOB trades"
      />
      <Card
        label="Current Balance"
        value={formatCurrency(metrics.currentBalance)}
        tone="accent"
        hint="Polymarket positions value"
      />
      <Card
        label="True Profit"
        value={formatCurrency(metrics.trueProfit)}
        tone={profitTone}
        hint="balance + withdraw − deposit"
        emphasize
      />
      <Card
        label="True ROI"
        value={formatPercent(metrics.trueROI)}
        tone={roiTone}
        hint="trueProfit / totalDeposit"
        emphasize
      />
    </div>
  );
}
