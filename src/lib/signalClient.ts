import { REQUEST_TIMEOUT_MS } from "./config";
export interface SignalConfig { name: string; query: string; match: readonly string[]; fallback: number; }
export interface SignalResult {
  query: string; question: string; probability: number;
  source: "live" | "estimate"; fetched_at: string;
}
export const localEstimate = (c: SignalConfig): SignalResult => ({
  query: c.query, question: "Estimate (no market data): " + c.query,
  probability: c.fallback, source: "estimate", fetched_at: new Date().toISOString(),
});
function valid(v: unknown): v is SignalResult {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const r = v as Record<string, unknown>;
  return typeof r.query === "string" && typeof r.question === "string" &&
    typeof r.fetched_at === "string" && typeof r.probability === "number" &&
    Number.isFinite(r.probability) && r.probability >= 0 && r.probability <= 100 &&
    (r.source === "live" || r.source === "estimate");
}
export async function fetchSignal(c: SignalConfig): Promise<SignalResult> {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return localEstimate(c);
  try {
    const res = await fetch(url.replace(/\/$/, "") + "/functions/v1/signal", {
      method: "POST", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({query:c.query,match:c.match,fallback:c.fallback}),
    });
    if (!res.ok) return localEstimate(c);
    const body: unknown = await res.json();
    return valid(body) && body.query === c.query ? body : localEstimate(c);
  } catch { return localEstimate(c); }
}
