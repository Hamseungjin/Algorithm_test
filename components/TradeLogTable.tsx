"use client";

import { useMemo, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import {
  formatCurrency,
  formatDate,
  shortHash,
} from "@/lib/calculations";
import type { Trade } from "@/types";

type SortKey = "matchTime" | "market" | "outcome" | "price" | "size" | "amount";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

const PAGE_SIZE = 20;

function compareTrades(a: Trade, b: Trade, sort: SortState): number {
  const dirMul = sort.dir === "asc" ? 1 : -1;
  switch (sort.key) {
    case "matchTime":
      return (a.matchTime - b.matchTime) * dirMul;
    case "market":
      return a.market.localeCompare(b.market) * dirMul;
    case "outcome":
      return a.outcome.localeCompare(b.outcome) * dirMul;
    case "price":
      return (a.price - b.price) * dirMul;
    case "size":
      return (a.size - b.size) * dirMul;
    case "amount":
      return (a.size * a.price - b.size * b.price) * dirMul;
    default:
      return 0;
  }
}

function tradesToCsv(trades: Trade[]): string {
  const header = [
    "id",
    "match_time_iso",
    "market",
    "outcome",
    "side",
    "price",
    "size",
    "amount",
    "transaction_hash",
  ];
  const rows = trades.map((t) => [
    t.id,
    new Date(t.matchTime * 1000).toISOString(),
    t.market,
    t.outcome,
    t.side,
    t.price.toString(),
    t.size.toString(),
    (t.size * t.price).toFixed(6),
    t.transactionHash,
  ]);
  const escape = (cell: string): string => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };
  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  setSort: (next: SortState) => void;
}

function SortableHeader({
  label,
  sortKey,
  sort,
  setSort,
}: SortableHeaderProps): JSX.Element {
  const active = sort.key === sortKey;
  const arrow = active ? (sort.dir === "asc" ? "▲" : "▼") : "";
  return (
    <th className="table-header py-2 pr-4">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-textPrimary"
        onClick={() => {
          setSort({
            key: sortKey,
            dir: active && sort.dir === "desc" ? "asc" : "desc",
          });
        }}
      >
        {label}
        <span className="text-[10px]">{arrow}</span>
      </button>
    </th>
  );
}

export function TradeLogTable(): JSX.Element | null {
  const status = useWalletStore((s) => s.status);
  const trades = useWalletStore((s) => s.trades);
  const [sort, setSort] = useState<SortState>({ key: "matchTime", dir: "desc" });
  const [page, setPage] = useState<number>(1);

  const sorted = useMemo<Trade[]>(() => {
    return [...trades].sort((a, b) => compareTrades(a, b, sort));
  }, [trades, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (status !== "success") return null;

  if (trades.length === 0) {
    return (
      <div className="card">
        <h3 className="text-base font-semibold text-textPrimary">Trade Log</h3>
        <p className="mt-4 text-sm text-textSecondary">No trades found for this wallet.</p>
      </div>
    );
  }

  const handleDownload = (): void => {
    const csv = tradesToCsv(sorted);
    downloadCsv(csv, `polymarket-trades-${Date.now()}.csv`);
  };

  return (
    <div className="card">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-textPrimary">Trade Log</h3>
          <p className="text-xs text-textSecondary">
            {sorted.length.toLocaleString()} trades · click column headers to sort
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleDownload}>
          Download CSV
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader label="Date" sortKey="matchTime" sort={sort} setSort={setSort} />
              <SortableHeader label="Market" sortKey="market" sort={sort} setSort={setSort} />
              <SortableHeader label="Position" sortKey="outcome" sort={sort} setSort={setSort} />
              <SortableHeader label="Price" sortKey="price" sort={sort} setSort={setSort} />
              <SortableHeader label="Size" sortKey="size" sort={sort} setSort={setSort} />
              <SortableHeader label="Amount" sortKey="amount" sort={sort} setSort={setSort} />
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((t) => {
              const amount = t.size * t.price;
              const outcomeColor = t.outcome === "Yes" ? "text-success" : "text-danger";
              const sideColor = t.side === "BUY" ? "text-accent" : "text-warning";
              return (
                <tr
                  key={`${t.id}-${t.transactionHash}`}
                  className="border-b border-border/50 hover:bg-surfaceAlt"
                >
                  <td className="py-3 pr-4 text-textSecondary whitespace-nowrap">
                    {formatDate(t.matchTime)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-textPrimary">
                    {shortHash(t.market, 10)}
                  </td>
                  <td className={`py-3 pr-4 font-medium ${outcomeColor}`}>
                    {t.outcome}{" "}
                    <span className={`ml-1 text-xs font-normal ${sideColor}`}>{t.side}</span>
                  </td>
                  <td className="py-3 pr-4 font-mono tabular-nums">{t.price.toFixed(4)}</td>
                  <td className="py-3 pr-4 font-mono tabular-nums">
                    {t.size.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                  <td className="py-3 pr-4 font-mono tabular-nums">
                    {formatCurrency(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-textSecondary">
        <span>
          Page {safePage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary px-3 py-1 text-xs"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-1 text-xs"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
