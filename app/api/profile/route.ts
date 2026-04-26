import { NextResponse } from "next/server";
import { fetchProfile } from "@/lib/polymarket";
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
    const profile = await fetchProfile(address);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch profile: ${message}` },
      { status: 502 },
    );
  }
}
