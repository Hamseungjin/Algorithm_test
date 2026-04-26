"use client";

import { useWalletStore } from "@/store/walletStore";
import { formatCurrency } from "@/lib/calculations";

export function PnLComparison(): JSX.Element | null {
  const metrics = useWalletStore((s) => s.metrics);
  const status = useWalletStore((s) => s.status);

  if (status !== "success" || !metrics) return null;

  const diffTone =
    Math.abs(metrics.difference) < 0.005
      ? "text-textSecondary"
      : metrics.difference > 0
        ? "text-success"
        : "text-danger";

  const reason =
    metrics.difference > 0
      ? "Polymarket understates your gains because it ignores withdrawn profit. The true profit accounts for cash you've already pulled out."
      : metrics.difference < 0
        ? "Polymarket overstates your gains relative to net cash flow. Outstanding deposits not yet realized as profit cause the gap."
        : "Polymarket's PnL matches the true cash-flow profit for this wallet.";

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-textPrimary">PnL Comparison</h3>
      <p className="mt-1 text-sm text-textSecondary">
        Polymarket's profile PnL ignores external deposits and withdrawals. The
        true profit recomputes ROI from on-chain cash flow.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header py-2">Metric</th>
              <th className="table-header py-2">Polymarket</th>
              <th className="table-header py-2">True (Cash Flow)</th>
              <th className="table-header py-2">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className="py-3 text-textSecondary">Profit / Loss</td>
              <td className="py-3 font-mono tabular-nums">
                {formatCurrency(metrics.polymarketPnL)}
              </td>
              <td
                className={`py-3 font-mono tabular-nums ${
                  metrics.trueProfit >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatCurrency(metrics.trueProfit)}
              </td>
              <td className={`py-3 font-mono tabular-nums ${diffTone}`}>
                {formatCurrency(metrics.difference)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-textSecondary">{reason}</p>
    </div>
  );
}
