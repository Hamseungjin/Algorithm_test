import {
  CLOB_BASE_URL,
  GAMMA_BASE_URL,
  TRADES_PAGE_LIMIT,
} from "./constants";
import { fetchJson, FetchError, sleep } from "./fetcher";
import { getCached, setCached } from "./cache";
import type {
  PolymarketProfile,
  RawTrade,
  Trade,
  TradesApiResponse,
} from "@/types";

function normalizeTrade(raw: RawTrade): Trade {
  return {
    id: raw.id,
    takerOrderId: raw.taker_order_id,
    market: raw.market,
    assetId: raw.asset_id,
    side: raw.side,
    size: Number(raw.size),
    feeRateBps: Number(raw.fee_rate_bps),
    price: Number(raw.price),
    status: raw.status,
    matchTime: Number(raw.match_time),
    outcome: raw.outcome,
    makerAddress: raw.maker_address,
    transactionHash: raw.transaction_hash,
    bucketIndex: raw.bucket_index,
    type: raw.type,
  };
}

async function fetchTradesPage(
  address: string,
  cursor: string | undefined,
): Promise<TradesApiResponse> {
  const params = new URLSearchParams({
    maker_address: address,
    limit: String(TRADES_PAGE_LIMIT),
  });
  if (cursor) params.set("next_cursor", cursor);

  const url = `${CLOB_BASE_URL}/trades?${params.toString()}`;

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchJson<TradesApiResponse>(url);
    } catch (error) {
      lastError = error;
      if (error instanceof FetchError) {
        if (error.status === 400) throw error;
        if (error.status === 408 || error.status === 429 || error.status >= 500) {
          await sleep(500 * (attempt + 1));
          continue;
        }
        if (error.status === 0) {
          await sleep(500 * (attempt + 1));
          continue;
        }
        throw error;
      }
      await sleep(500 * (attempt + 1));
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Unknown CLOB error");
}

export async function fetchAllTrades(address: string): Promise<Trade[]> {
  const cacheKey = address.toLowerCase();
  const cached = getCached<Trade[]>("trades", cacheKey);
  if (cached) return cached;

  const trades: Trade[] = [];
  const seenIds = new Set<string>();
  let cursor: string | undefined;
  let safetyCounter = 0;
  const safetyMax = 200;

  do {
    const response = await fetchTradesPage(address, cursor);

    if (Array.isArray(response.data)) {
      for (const raw of response.data) {
        const dedupeKey = `${raw.id}-${raw.transaction_hash}`;
        if (seenIds.has(dedupeKey)) continue;
        seenIds.add(dedupeKey);
        trades.push(normalizeTrade(raw));
      }
    }

    const nextCursor = response.next_cursor;
    if (!nextCursor || nextCursor === "LTE=" || nextCursor === cursor) {
      cursor = undefined;
    } else {
      cursor = nextCursor;
    }

    safetyCounter += 1;
    if (safetyCounter >= safetyMax) break;
  } while (cursor);

  setCached("trades", cacheKey, trades);
  return trades;
}

interface RawProfile {
  name?: string;
  bio?: string;
  profit?: number;
  volume?: number;
  positions_value?: number;
  positionsValue?: number;
  trades_count?: number;
  tradesCount?: number;
}

export async function fetchProfile(address: string): Promise<PolymarketProfile> {
  const cacheKey = address.toLowerCase();
  const cached = getCached<PolymarketProfile>("profile", cacheKey);
  if (cached) return cached;

  const url = `${GAMMA_BASE_URL}/profiles/${address}`;
  const raw = await fetchJson<RawProfile>(url).catch(() => ({}) as RawProfile);

  const profile: PolymarketProfile = {
    name: raw.name ?? "",
    bio: raw.bio ?? "",
    profit: typeof raw.profit === "number" ? raw.profit : 0,
    volume: typeof raw.volume === "number" ? raw.volume : 0,
    positionsValue:
      typeof raw.positions_value === "number"
        ? raw.positions_value
        : typeof raw.positionsValue === "number"
          ? raw.positionsValue
          : 0,
    tradesCount:
      typeof raw.trades_count === "number"
        ? raw.trades_count
        : typeof raw.tradesCount === "number"
          ? raw.tradesCount
          : 0,
  };

  setCached("profile", cacheKey, profile);
  return profile;
}
