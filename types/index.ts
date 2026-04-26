export type TradeSide = "BUY" | "SELL";
export type TradeOutcome = "Yes" | "No";

export interface Trade {
  id: string;
  takerOrderId: string;
  market: string;
  assetId: string;
  side: TradeSide;
  size: number;
  feeRateBps: number;
  price: number;
  status: string;
  matchTime: number;
  outcome: TradeOutcome;
  makerAddress: string;
  transactionHash: string;
  bucketIndex: number;
  type: string;
}

export interface RawTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: TradeSide;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  outcome: TradeOutcome;
  maker_address: string;
  transaction_hash: string;
  bucket_index: number;
  type: string;
}

export interface TradesApiResponse {
  data: RawTrade[];
  next_cursor?: string;
}

export interface PolymarketProfile {
  name: string;
  bio: string;
  profit: number;
  volume: number;
  positionsValue: number;
  tradesCount: number;
}

export type TransferDirection = "deposit" | "withdrawal" | "internal";

export interface Transfer {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  direction: TransferDirection;
  counterparty: string;
}

export interface RawPolygonscanTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  tokenDecimal: string;
}

export interface PolygonscanResponse {
  status: string;
  message: string;
  result: RawPolygonscanTx[] | string;
}

export interface Metrics {
  totalDeposit: number;
  totalWithdraw: number;
  currentBalance: number;
  trueProfit: number;
  trueROI: number;
  polymarketPnL: number;
  difference: number;
  tradesCount: number;
  volume: number;
}

export type ChartEvent = "deposit" | "withdrawal";

export interface ChartPoint {
  timestamp: number;
  totalValue: number;
  event?: ChartEvent;
  amount?: number;
  txHash?: string;
}

export type LoadingStep = 0 | 1 | 2 | 3 | 4 | 5;
export type LoadingStatus = "idle" | "loading" | "success" | "error";
