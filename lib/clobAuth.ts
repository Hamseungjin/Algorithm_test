import { createHmac } from "crypto";

export interface ClobCredentials {
  apiKey: string;
  secret: string;
  passphrase: string;
  address: string;
}

export function getClobCredentials(): ClobCredentials | null {
  const apiKey = process.env.CLOB_API_KEY?.trim() ?? "";
  const secret = process.env.CLOB_SECRET?.trim() ?? "";
  const passphrase = process.env.CLOB_PASSPHRASE?.trim() ?? "";
  const address =
    process.env.CLOB_ADDRESS?.trim() ??
    process.env.CLOB_FUNDER_ADDRESS?.trim() ??
    "";

  if (!apiKey || !secret || !passphrase || !address) return null;
  return { apiKey, secret, passphrase, address };
}

function urlSafeBase64(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function buildL2Signature(
  secret: string,
  timestamp: number,
  method: string,
  requestPath: string,
  body?: string,
): string {
  let message = `${timestamp}${method.toUpperCase()}${requestPath}`;
  if (body !== undefined) message += body;

  const secretBuffer = Buffer.from(secret, "base64");
  const hmac = createHmac("sha256", secretBuffer);
  hmac.update(message);
  return urlSafeBase64(hmac.digest());
}

export function buildL2Headers(
  creds: ClobCredentials,
  method: string,
  requestPath: string,
  body?: string,
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildL2Signature(
    creds.secret,
    timestamp,
    method,
    requestPath,
    body,
  );

  return {
    POLY_ADDRESS: creds.address,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: String(timestamp),
    POLY_API_KEY: creds.apiKey,
    POLY_PASSPHRASE: creds.passphrase,
  };
}
