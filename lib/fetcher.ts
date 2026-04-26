import { FETCH_TIMEOUT_MS } from "./constants";

export class FetchError extends Error {
  public readonly status: number;
  public readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.url = url;
  }
}

export interface FetchJsonOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { timeoutMs = FETCH_TIMEOUT_MS, headers = {}, method = "GET", body } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new FetchError(
        `Request failed (${response.status}): ${text.slice(0, 200) || response.statusText}`,
        response.status,
        url,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FetchError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new FetchError(`Request timed out after ${timeoutMs}ms`, 408, url);
    }
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    throw new FetchError(message, 0, url);
  } finally {
    clearTimeout(timeout);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
