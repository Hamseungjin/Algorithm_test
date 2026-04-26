import { NextResponse } from "next/server";
import { fetchAllTrades } from "@/lib/polymarket";
import { ADDRESS_REGEX } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");

  if (!address || !ADDRESS_REGEX.test(address)) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 },
    );
  }

  try {
    const trades = await fetchAllTrades(address);
    return NextResponse.json({ trades });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch trades: ${message}` },
      { status: 502 },
    );
  }
}
