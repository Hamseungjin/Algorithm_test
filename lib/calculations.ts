import type {
  ChartPoint,
  Metrics,
  PolymarketProfile,
  Trade,
  Transfer,
} from "@/types";

export interface ComputeMetricsInput {
  transfers: Transfer[];
  profile: PolymarketProfile;
  trades: Trade[];
}

export function computeMetrics({
  transfers,
  profile,
  trades,
}: ComputeMetricsInput): Metrics {
  let totalDeposit = 0;
  let totalWithdraw = 0;

  for (const t of transfers) {
    if (t.direction === "deposit") totalDeposit += t.amount;
    else if (t.direction === "withdrawal") totalWithdraw += t.amount;
  }

  const currentBalance = profile.positionsValue;
  const trueProfit = currentBalance + totalWithdraw - totalDeposit;
  const trueROI = totalDeposit > 0 ? (trueProfit / totalDeposit) * 100 : 0;
  const polymarketPnL = profile.profit;
  const difference = trueProfit - polymarketPnL;

  return {
    totalDeposit,
    totalWithdraw,
    currentBalance,
    trueProfit,
    trueROI,
    polymarketPnL,
    difference,
    tradesCount: trades.length || profile.tradesCount,
    volume: profile.volume,
  };
}

export interface BuildChartDataInput {
  trades: Trade[];
  transfers: Transfer[];
  currentBalance: number;
}

interface TimelineEvent {
  timestamp: number;
  type: "trade" | "deposit" | "withdrawal";
  amount: number;
  hash?: string;
  signedFlow: number;
}

export function buildChartData({
  trades,
  transfers,
  currentBalance,
}: BuildChartDataInput): ChartPoint[] {
  const events: TimelineEvent[] = [];

  for (const transfer of transfers) {
    if (transfer.direction === "deposit") {
      events.push({
        timestamp: transfer.timestamp,
        type: "deposit",
        amount: transfer.amount,
        hash: transfer.hash,
        signedFlow: transfer.amount,
      });
    } else if (transfer.direction === "withdrawal") {
      events.push({
        timestamp: transfer.timestamp,
        type: "withdrawal",
        amount: transfer.amount,
        hash: transfer.hash,
        signedFlow: -transfer.amount,
      });
    }
  }

  for (const trade of trades) {
    events.push({
      timestamp: trade.matchTime,
      type: "trade",
      amount: trade.size * trade.price,
      hash: trade.transactionHash,
      signedFlow: 0,
    });
  }

  events.sort((a, b) => a.timestamp - b.timestamp);

  if (events.length === 0) {
    return [];
  }

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  for (const e of events) {
    if (e.type === "deposit") totalDeposits += e.amount;
    else if (e.type === "withdrawal") totalWithdrawals += e.amount;
  }

  const totalProfit = currentBalance + totalWithdrawals - totalDeposits;

  const points: ChartPoint[] = [];
  let runningNet = 0;
  let cumulativeTradeIndex = 0;
  const totalTrades = events.filter((e) => e.type === "trade").length;

  for (const event of events) {
    runningNet += event.signedFlow;
    if (event.type === "trade") cumulativeTradeIndex += 1;
    const tradeProgress = totalTrades > 0 ? cumulativeTradeIndex / totalTrades : 0;
    const totalValue = Math.max(0, runningNet + totalProfit * tradeProgress);

    if (event.type === "deposit" || event.type === "withdrawal") {
      points.push({
        timestamp: event.timestamp,
        totalValue,
        event: event.type,
        amount: event.amount,
        txHash: event.hash,
      });
    } else {
      points.push({
        timestamp: event.timestamp,
        totalValue,
      });
    }
  }

  return points;
}

export function formatCurrency(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "$0.00";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function shortHash(hash: string, head = 8): string {
  if (!hash) return "";
  return hash.length <= head + 2 ? hash : `${hash.slice(0, head + 2)}…`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  const d = new Date(timestamp * 1000);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(timestamp: number): string {
  if (!timestamp) return "—";
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}
