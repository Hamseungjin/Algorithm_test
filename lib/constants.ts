export const POLYMARKET_ADDRESSES: ReadonlySet<string> = new Set<string>([
  "0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e",
  "0xc5d563a36ae78145c45a50134d48a1215220f80a",
  "0xd91e80cf2e7be2e162c6513ced06f1dd0da35296",
  "0x4d97dcd97ec945f40cf65f87097ace5ea0476045",
  "0x0000000000000000000000000000000000000000",
]);

export const USDC_CONTRACT_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

export const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const CLOB_BASE_URL = "https://clob.polymarket.com";
export const GAMMA_BASE_URL = "https://gamma-api.polymarket.com";
export const POLYGONSCAN_BASE_URL = "https://api.polygonscan.com/api";

export const PRIMARY_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://polygon-rpc.com";
export const FALLBACK_RPC_URL = "https://rpc.ankr.com/polygon";

export const RPC_BLOCK_RANGE = 9_000;
export const FETCH_TIMEOUT_MS = 10_000;
export const CACHE_TTL_MS = 5 * 60 * 1000;
export const TRADES_PAGE_LIMIT = 500;
export const POLYGONSCAN_RATE_LIMIT_DELAY_MS = 250;

export const USDC_DECIMALS = 6;
export const USDC_DIVISOR = 1_000_000;

export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
