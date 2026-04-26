import { NextResponse } from "next/server";
import { getUSDCTransfers } from "@/lib/polygon";
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
    const transfers = await getUSDCTransfers(address);
    return NextResponse.json({ transfers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch transfers: ${message}` },
      { status: 502 },
    );
  }
}
