"use client";

import { useState, type FormEvent } from "react";
import { ADDRESS_REGEX } from "@/lib/constants";
import { useWalletStore } from "@/store/walletStore";

export function WalletInput(): JSX.Element {
  const status = useWalletStore((s) => s.status);
  const analyze = useWalletStore((s) => s.analyze);
  const reset = useWalletStore((s) => s.reset);
  const storedAddress = useWalletStore((s) => s.address);

  const [value, setValue] = useState<string>(storedAddress);
  const [touched, setTouched] = useState<boolean>(false);

  const trimmed = value.trim();
  const isValid = ADDRESS_REGEX.test(trimmed);
  const showError = touched && trimmed.length > 0 && !isValid;
  const isLoading = status === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    await analyze(trimmed);
  };

  const handleReset = (): void => {
    setValue("");
    setTouched(false);
    reset();
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <label htmlFor="wallet" className="mb-2 block text-sm font-medium text-textSecondary">
        Polymarket Wallet Address (Polygon)
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="wallet"
          type="text"
          spellCheck={false}
          autoComplete="off"
          placeholder="0x1a2b3c..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          aria-describedby={showError ? "wallet-error" : undefined}
          className="input flex-1 font-mono"
          disabled={isLoading}
        />
        <button type="submit" className="btn-primary sm:w-40" disabled={isLoading || !isValid}>
          {isLoading ? "Analyzing…" : "Analyze"}
        </button>
        <button
          type="button"
          className="btn-secondary sm:w-28"
          onClick={handleReset}
          disabled={isLoading && status !== "loading"}
        >
          Reset
        </button>
      </div>
      {showError ? (
        <p id="wallet-error" className="mt-2 text-sm text-danger">
          Invalid wallet address. Must be a 0x-prefixed 40-character hex string.
        </p>
      ) : (
        <p className="mt-2 text-xs text-textSecondary">
          Enter a Polymarket wallet address to compute the true ROI accounting for
          deposits, withdrawals, and current balance.
        </p>
      )}
    </form>
  );
}
