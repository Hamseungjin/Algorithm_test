export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (!BASE_PATH) return path;
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
