# MoveUp — educational market timing prototype

MoveUp combines a Fed rate-cut market and a mortgage-below-6% market with an illustrative 30-year mortgage scenario. It does **not** search property listings, forecast interest rates, or give financial advice.

## Start
\`\`\`bash
npm install
npm run dev
npm test
npm run build
\`\`\`

The site operates without API credentials: both signal cards transparently show **ESTIMATE**, with a neutral 50% fallback so the verdict is **MIXED / NO EDGE**. The mortgage cost calculator still works.

## Enable live signals
1. Create a Supabase project and deploy \`supabase/functions/signal\`: \`supabase functions deploy signal --no-verify-jwt\`.
2. Copy \`.env.example\` to \`.env.local\` and fill in the public project URL and publishable key. Do not commit credentials or a service-role key.
3. Inspect current Gamma market questions to confirm that \`src/lib/config.ts\` matches the intended active, appropriately dated markets. A generic keyword match does **not** prove the right market has been selected.
4. Run \`npm test\`, \`npm run build\`, then test both cards in the browser. Real deployment verification is still required.

The frontend is static and can be deployed on Vercel, Netlify or a comparable service. Hosting does not require your own computer to remain on.

## Prototype assumptions
- 30-year fixed term; 6.80% assumed APR and a hypothetical 6.55% scenario.
- 20% assumed down payment; illustrative city tax and insurance values.
- Fallback signal probabilities 50% (not actual market odds).
- No listings, accounts, payments or real estate API calls.

Do not interpret a lower hypothetical mortgage payment as a promise of a future rate, or the model verdict as a recommendation.
