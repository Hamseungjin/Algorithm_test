import {
  FALLBACK_RPC_URL,
  POLYGONSCAN_BASE_URL,
  POLYGONSCAN_RATE_LIMIT_DELAY_MS,
  POLYMARKET_ADDRESSES,
  PRIMARY_RPC_URL,
  RPC_BLOCK_RANGE,
  TRANSFER_TOPIC,
  USDC_CONTRACT_ADDRESS,
  USDC_DIVISOR,
} from "./constants";
import { fetchJson, FetchError, sleep } from "./fetcher";
import { getCached, setCached } from "./cache";
import type {
  PolygonscanResponse,
  RawPolygonscanTx,
  Transfer,
  TransferDirection,
} from "@/types";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function classifyTransferDirection(
  from: string,
  to: string,
  walletAddress: string,
): TransferDirection {
  const wallet = normalizeAddress(walletAddress);
  const fromLower = normalizeAddress(from);
  const toLower = normalizeAddress(to);

  const fromIsPolymarket = POLYMARKET_ADDRESSES.has(fromLower);
  const toIsPolymarket = POLYMARKET_ADDRESSES.has(toLower);

  if (toLower === wallet && !fromIsPolymarket) return "deposit";
  if (fromLower === wallet && !toIsPolymarket) return "withdrawal";
  return "internal";
}

function rawTxToTransfer(
  raw: RawPolygonscanTx,
  walletAddress: string,
): Transfer {
  const decimals = Number(raw.tokenDecimal) || 6;
  const divisor = decimals === 6 ? USDC_DIVISOR : 10 ** decimals;
  const amount = Number(raw.value) / divisor;
  const direction = classifyTransferDirection(raw.from, raw.to, walletAddress);
  const wallet = normalizeAddress(walletAddress);
  const fromLower = normalizeAddress(raw.from);
  const counterparty = fromLower === wallet ? raw.to : raw.from;

  return {
    hash: raw.hash,
    blockNumber: Number(raw.blockNumber),
    timestamp: Number(raw.timeStamp),
    from: fromLower,
    to: normalizeAddress(raw.to),
    amount,
    direction,
    counterparty: normalizeAddress(counterparty),
  };
}

async function fetchFromPolygonscan(
  address: string,
  apiKey: string,
): Promise<RawPolygonscanTx[]> {
  const params = new URLSearchParams({
    module: "account",
    action: "tokentx",
    contractaddress: USDC_CONTRACT_ADDRESS,
    address,
    sort: "asc",
    apikey: apiKey,
  });

  const url = `${POLYGONSCAN_BASE_URL}?${params.toString()}`;
  const response = await fetchJson<PolygonscanResponse>(url);

  if (response.status !== "1") {
    if (typeof response.result === "string") {
      const message = response.result.toLowerCase();
      if (message.includes("no transactions")) return [];
      throw new FetchError(
        `Polygonscan: ${response.message} (${response.result})`,
        429,
        url,
      );
    }
    return [];
  }

  if (!Array.isArray(response.result)) return [];
  return response.result;
}

interface RpcLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
}

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

async function rpcCall<T>(rpcUrl: string, method: string, params: unknown[]): Promise<T> {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const response = await fetchJson<RpcResponse<T>>(rpcUrl, {
    method: "POST",
    body,
  });
  if (response.error) {
    throw new FetchError(`RPC error: ${response.error.message}`, 500, rpcUrl);
  }
  if (response.result === undefined) {
    throw new FetchError("RPC returned no result", 500, rpcUrl);
  }
  return response.result;
}

function addressToTopic(address: string): string {
  const clean = address.toLowerCase().replace(/^0x/, "");
  return `0x${clean.padStart(64, "0")}`;
}

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

function topicToAddress(topic: string): string {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

function dataToAmount(data: string): number {
  const clean = data.replace(/^0x/, "");
  if (clean.length === 0) return 0;
  return Number(BigInt(`0x${clean}`)) / USDC_DIVISOR;
}

async function fetchTransfersViaRpc(address: string): Promise<RawPolygonscanTx[]> {
  const rpcUrls = [PRIMARY_RPC_URL, FALLBACK_RPC_URL];
  let lastError: unknown = null;

  for (const rpcUrl of rpcUrls) {
    try {
      const latestHex = await rpcCall<string>(rpcUrl, "eth_blockNumber", []);
      const latest = hexToNumber(latestHex);
      const startBlock = Math.max(0, latest - RPC_BLOCK_RANGE * 50);

      const addressTopic = addressToTopic(address);
      const allLogs: RpcLog[] = [];

      for (let from = startBlock; from <= latest; from += RPC_BLOCK_RANGE) {
        const to = Math.min(from + RPC_BLOCK_RANGE - 1, latest);

        const incoming = await rpcCall<RpcLog[]>(rpcUrl, "eth_getLogs", [
          {
            fromBlock: `0x${from.toString(16)}`,
            toBlock: `0x${to.toString(16)}`,
            address: USDC_CONTRACT_ADDRESS,
            topics: [TRANSFER_TOPIC, null, addressTopic],
          },
        ]);
        allLogs.push(...incoming);

        const outgoing = await rpcCall<RpcLog[]>(rpcUrl, "eth_getLogs", [
          {
            fromBlock: `0x${from.toString(16)}`,
            toBlock: `0x${to.toString(16)}`,
            address: USDC_CONTRACT_ADDRESS,
            topics: [TRANSFER_TOPIC, addressTopic, null],
          },
        ]);
        allLogs.push(...outgoing);
      }

      const blockTimestamps = new Map<number, number>();
      const uniqueBlocks = Array.from(
        new Set(allLogs.map((log) => hexToNumber(log.blockNumber))),
      );

      for (const blockNumber of uniqueBlocks) {
        const block = await rpcCall<{ timestamp: string } | null>(
          rpcUrl,
          "eth_getBlockByNumber",
          [`0x${blockNumber.toString(16)}`, false],
        );
        if (block) {
          blockTimestamps.set(blockNumber, hexToNumber(block.timestamp));
        }
      }

      const seen = new Set<string>();
      const result: RawPolygonscanTx[] = [];
      for (const log of allLogs) {
        const fromTopic = log.topics[1];
        const toTopic = log.topics[2];
        if (!fromTopic || !toTopic) continue;

        const dedupeKey = `${log.transactionHash}-${log.topics.join(",")}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const blockNumber = hexToNumber(log.blockNumber);
        const timestamp = blockTimestamps.get(blockNumber) ?? 0;
        const amount = dataToAmount(log.data);

        result.push({
          blockNumber: String(blockNumber),
          timeStamp: String(timestamp),
          hash: log.transactionHash,
          from: topicToAddress(fromTopic),
          to: topicToAddress(toTopic),
          value: String(BigInt(Math.round(amount * USDC_DIVISOR))),
          contractAddress: USDC_CONTRACT_ADDRESS,
          tokenDecimal: "6",
        });
      }

      result.sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw new FetchError(`RPC fallback failed: ${lastError.message}`, 500, "rpc");
  }
  throw new FetchError("RPC fallback failed", 500, "rpc");
}

export async function getUSDCTransfers(address: string): Promise<Transfer[]> {
  const cacheKey = address.toLowerCase();
  const cached = getCached<Transfer[]>("transfers", cacheKey);
  if (cached) return cached;

  const apiKey = process.env.POLYGONSCAN_API_KEY ?? "";
  let rawTxs: RawPolygonscanTx[] = [];

  if (apiKey && apiKey !== "your_polygonscan_api_key_here") {
    try {
      await sleep(POLYGONSCAN_RATE_LIMIT_DELAY_MS);
      rawTxs = await fetchFromPolygonscan(address, apiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown";
      console.warn(`Polygonscan failed, falling back to RPC: ${message}`);
      rawTxs = await fetchTransfersViaRpc(address);
    }
  } else {
    rawTxs = await fetchTransfersViaRpc(address);
  }

  const transfers = rawTxs.map((raw) => rawTxToTransfer(raw, address));
  setCached("transfers", cacheKey, transfers);
  return transfers;
}
