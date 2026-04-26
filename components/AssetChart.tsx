"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import { useWalletStore } from "@/store/walletStore";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  shortHash,
} from "@/lib/calculations";
import type { ChartPoint } from "@/types";

type RangeKey = "1D" | "1W" | "1M" | "ALL";

const RANGE_OPTIONS: { key: RangeKey; label: string; seconds: number | null }[] = [
  { key: "1D", label: "1D", seconds: 24 * 60 * 60 },
  { key: "1W", label: "1W", seconds: 7 * 24 * 60 * 60 },
  { key: "1M", label: "1M", seconds: 30 * 24 * 60 * 60 },
  { key: "ALL", label: "ALL", seconds: null },
];

interface ChartDatum {
  timestamp: number;
  totalValue: number;
  depositValue?: number;
  depositAmount?: number;
  depositHash?: string;
  withdrawalValue?: number;
  withdrawalAmount?: number;
  withdrawalHash?: string;
}

function buildDatasets(points: ChartPoint[]): ChartDatum[] {
  return points.map<ChartDatum>((p) => ({
    timestamp: p.timestamp,
    totalValue: p.totalValue,
    depositValue: p.event === "deposit" ? p.totalValue : undefined,
    depositAmount: p.event === "deposit" ? p.amount : undefined,
    depositHash: p.event === "deposit" ? p.txHash : undefined,
    withdrawalValue: p.event === "withdrawal" ? p.totalValue : undefined,
    withdrawalAmount: p.event === "withdrawal" ? p.amount : undefined,
    withdrawalHash: p.event === "withdrawal" ? p.txHash : undefined,
  }));
}

function ChartTooltip({
  active,
  payload,
}: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-xs shadow-lg">
      <p className="font-semibold text-textPrimary">{formatDate(datum.timestamp)}</p>
      <p className="mt-1 text-textSecondary">
        Total Value:{" "}
        <span className="font-mono text-textPrimary">{formatCurrency(datum.totalValue)}</span>
      </p>
      {datum.depositAmount !== undefined ? (
        <p className="mt-1 text-success">
          Deposit: {formatCurrency(datum.depositAmount)}
          {datum.depositHash ? (
            <span className="ml-2 text-textSecondary">{shortHash(datum.depositHash)}</span>
          ) : null}
        </p>
      ) : null}
      {datum.withdrawalAmount !== undefined ? (
        <p className="mt-1 text-danger">
          Withdrawal: {formatCurrency(datum.withdrawalAmount)}
          {datum.withdrawalHash ? (
            <span className="ml-2 text-textSecondary">{shortHash(datum.withdrawalHash)}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function AssetChart(): JSX.Element | null {
  const status = useWalletStore((s) => s.status);
  const chartData = useWalletStore((s) => s.chartData);
  const [range, setRange] = useState<RangeKey>("ALL");

  const filtered = useMemo<ChartPoint[]>(() => {
    if (chartData.length === 0) return [];
    const option = RANGE_OPTIONS.find((r) => r.key === range);
    if (!option || option.seconds === null) return chartData;
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - option.seconds;
    return chartData.filter((p) => p.timestamp >= cutoff);
  }, [chartData, range]);

  const datasets = useMemo(() => buildDatasets(filtered), [filtered]);

  if (status !== "success") return null;

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-textPrimary">Asset Flow</h3>
        </div>
        <p className="mt-6 text-center text-sm text-textSecondary">
          No timeline events to chart yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-textPrimary">Asset Flow</h3>
          <p className="text-xs text-textSecondary">
            Total value over time with external deposits and withdrawals.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surfaceAlt p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === option.key
                  ? "bg-accent text-white"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-80 w-full">
        {datasets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-textSecondary">
            No data points in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={datasets} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262d36" strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatShortDate}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                minTickGap={32}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={(value: number) =>
                  formatCurrency(value, value >= 1000 ? 0 : 2)
                }
                width={80}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="totalValue"
                name="Total Value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#totalGradient)"
                isAnimationActive={false}
              />
              <Scatter
                dataKey="depositValue"
                name="Deposit"
                fill="#22c55e"
                shape="circle"
                isAnimationActive={false}
              />
              <Scatter
                dataKey="withdrawalValue"
                name="Withdrawal"
                fill="#ef4444"
                shape="circle"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
