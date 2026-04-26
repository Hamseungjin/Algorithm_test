import { create } from "zustand";
import type {
  ChartPoint,
  LoadingStatus,
  LoadingStep,
  Metrics,
  PolymarketProfile,
  Trade,
  Transfer,
} from "@/types";
import { ADDRESS_REGEX } from "@/lib/constants";
import { buildChartData, computeMetrics } from "@/lib/calculations";
import { withBasePath } from "@/lib/basePath";

interface ApiError {
  error: string;
}

interface WalletStore {
  address: string;
  step: LoadingStep;
  status: LoadingStatus;
  trades: Trade[];
  transfers: Transfer[];
  profile: PolymarketProfile | null;
  metrics: Metrics | null;
  chartData: ChartPoint[];
  error: string | null;
  warnings: string[];
  setAddress: (addr: string) => void;
  analyze: (addr: string) => Promise<void>;
  reset: () => void;
}

const EMPTY_PROFILE: PolymarketProfile = {
  name: "",
  bio: "",
  profit: 0,
  volume: 0,
  positionsValue: 0,
  tradesCount: 0,
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as ApiError;
      if (data.error) message = data.error;
    } catch {
      /* ignore body parse error */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

async function safeFetch<T>(
  url: string,
  fallback: T,
  warnings: string[],
  label: string,
): Promise<T> {
  try {
    return await getJson<T>(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    warnings.push(`${label}: ${message}`);
    return fallback;
  }
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: "",
  step: 0,
  status: "idle",
  trades: [],
  transfers: [],
  profile: null,
  metrics: null,
  chartData: [],
  error: null,
  warnings: [],
  setAddress: (addr: string) => set({ address: addr }),
  reset: () =>
    set({
      address: "",
      step: 0,
      status: "idle",
      trades: [],
      transfers: [],
      profile: null,
      metrics: null,
      chartData: [],
      error: null,
      warnings: [],
    }),
  analyze: async (addr: string): Promise<void> => {
    const trimmed = addr.trim();
    if (!ADDRESS_REGEX.test(trimmed)) {
      set({
        status: "error",
        error: "Invalid wallet address. Must be a 0x-prefixed 40-character hex string.",
        step: 0,
      });
      return;
    }

    set({
      address: trimmed,
      status: "loading",
      step: 1,
      error: null,
      warnings: [],
      trades: [],
      transfers: [],
      profile: null,
      metrics: null,
      chartData: [],
    });

    const warnings: string[] = [];

    try {
      const [tradesResp, profileResp] = await Promise.all([
        safeFetch<{ trades: Trade[] }>(
          withBasePath(`/api/trades/?address=${trimmed}`),
          { trades: [] },
          warnings,
          "Trades",
        ),
        safeFetch<{ profile: PolymarketProfile }>(
          withBasePath(`/api/profile/?address=${trimmed}`),
          { profile: EMPTY_PROFILE },
          warnings,
          "Profile",
        ),
      ]);

      if (get().address !== trimmed) return;
      const trades = tradesResp.trades ?? [];
      const profile = profileResp.profile ?? EMPTY_PROFILE;
      set({ trades, profile, step: 2 });

      const transfersResp = await safeFetch<{ transfers: Transfer[] }>(
        withBasePath(`/api/transfers/?address=${trimmed}`),
        { transfers: [] },
        warnings,
        "Transfers",
      );

      if (get().address !== trimmed) return;
      const transfers = transfersResp.transfers ?? [];

      set({ transfers, step: 3 });

      set({ step: 4 });
      const metrics = computeMetrics({ transfers, profile, trades });

      set({ step: 5 });
      const chartData = buildChartData({
        trades,
        transfers,
        currentBalance: profile.positionsValue,
      });

      const totalCalls = 3;
      if (warnings.length === totalCalls) {
        set({
          status: "error",
          error:
            "All upstream data sources failed. Check your network or POLYGONSCAN_API_KEY/RPC URL.",
          warnings,
        });
        return;
      }

      set({
        metrics,
        chartData,
        status: "success",
        step: 5,
        warnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ status: "error", error: message, warnings });
    }
  },
}));
