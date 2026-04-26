"use client";

import { useWalletStore } from "@/store/walletStore";
import type { LoadingStep } from "@/types";

const STEPS: { id: LoadingStep; label: string }[] = [
  { id: 1, label: "Fetching trade history (CLOB API)" },
  { id: 2, label: "Reading on-chain transfers (Polygon)" },
  { id: 3, label: "Classifying deposits & withdrawals" },
  { id: 4, label: "Computing true ROI" },
  { id: 5, label: "Building chart timeline" },
];

export function LoadingProgress(): JSX.Element | null {
  const status = useWalletStore((s) => s.status);
  const step = useWalletStore((s) => s.step);
  const error = useWalletStore((s) => s.error);
  const warnings = useWalletStore((s) => s.warnings);
  const analyze = useWalletStore((s) => s.analyze);
  const address = useWalletStore((s) => s.address);

  if (status === "idle" || status === "success") return null;

  if (status === "error") {
    return (
      <div className="card border-danger/40 bg-danger/5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-danger">Analysis failed</h3>
            <p className="mt-1 text-sm text-textSecondary">{error ?? "Unknown error"}</p>
            {warnings.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-textSecondary">
                {warnings.map((w, i) => (
                  <li key={i} className="break-all">
                    • {w}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {address ? (
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                void analyze(address);
              }}
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-textPrimary">Analyzing wallet…</h3>
      <ol className="space-y-2">
        {STEPS.map((s) => {
          const completed = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                  completed
                    ? "border-success bg-success/10 text-success"
                    : active
                      ? "border-accent bg-accent/10 text-accent animate-pulse-slow"
                      : "border-border bg-surfaceAlt text-textSecondary"
                }`}
              >
                {completed ? "✓" : s.id}
              </span>
              <span
                className={
                  completed
                    ? "text-textPrimary"
                    : active
                      ? "text-textPrimary"
                      : "text-textSecondary"
                }
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
