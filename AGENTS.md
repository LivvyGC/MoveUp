# MoveUp — implementation rules
- Stack: React + TypeScript + Vite, Supabase Edge Functions (Deno); tests: Vitest.
- Preserve the editorial MoveUp interface, brand, and no-property-listings scope.
- No authentication, billing, DB, or scraping for this MVP.
- A prediction market reports **market-implied probability**, not a forecast.
- Never call a fallback value "live." Never fabricate probabilities.
- The BUY / WAIT / MIXED output is deterministic prototype logic, not financial advice.
- Run \`npm test\` and \`npm run build\` after changes.
