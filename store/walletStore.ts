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
  setAddress: (addr: string) => void;
  analyze: (addr: string) => Promise<void>;
  reset: () => void;
}

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
    }),
  analyze: async (addr: string): Promise<void> => {
    const trimmed = addr.trim();
    if (!ADDRESS_REGEX.test(trimmed)) {
      set({
        status: "error",
        error: "Invalid wallet address. Must be a 0x-prefixed 40-char hex string.",
        step: 0,
      });
      return;
    }

    set({
      address: trimmed,
      status: "loading",
      step: 1,
      error: null,
      trades: [],
      transfers: [],
      profile: null,
      metrics: null,
      chartData: [],
    });

    try {
      const tradesPromise = getJson<{ trades: Trade[] }>(
        `/api/trades?address=${trimmed}`,
      );
      const profilePromise = getJson<{ profile: PolymarketProfile }>(
        `/api/profile?address=${trimmed}`,
      );

      const [{ trades }, { profile }] = await Promise.all([
        tradesPromise,
        profilePromise,
      ]);

      if (get().address !== trimmed) return;
      set({ trades, profile, step: 2 });

      const { transfers } = await getJson<{ transfers: Transfer[] }>(
        `/api/transfers?address=${trimmed}`,
      );

      if (get().address !== trimmed) return;
      set({ transfers, step: 3 });

      const classified = transfers;
      set({ step: 4 });
      const metrics = computeMetrics({ transfers: classified, profile, trades });

      set({ step: 5 });
      const chartData = buildChartData({
        trades,
        transfers: classified,
        currentBalance: profile.positionsValue,
      });

      set({
        metrics,
        chartData,
        status: "success",
        step: 5,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ status: "error", error: message });
    }
  },
}));
