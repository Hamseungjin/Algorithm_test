"use client";

import { useWalletStore } from "@/store/walletStore";

export function WarningBanner(): JSX.Element | null {
  const status = useWalletStore((s) => s.status);
  const warnings = useWalletStore((s) => s.warnings);

  if (status !== "success" || warnings.length === 0) return null;

  return (
    <div className="card border-warning/40 bg-warning/5">
      <h3 className="text-sm font-semibold text-warning">Partial data warning</h3>
      <p className="mt-1 text-xs text-textSecondary">
        Some upstream sources failed. Results may be incomplete.
      </p>
      <ul className="mt-3 space-y-1 text-xs text-textSecondary">
        {warnings.map((w, i) => (
          <li key={i} className="break-all">
            • {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
