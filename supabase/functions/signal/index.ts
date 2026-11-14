import { isRecord, pickBestMarket } from "./parse.ts";
type Source = "live" | "estimate";
interface SignalRequest {query:string;fallback:number;match:string[];}
interface SignalResponse {query:string;question:string;probability:number;source:Source;fetched_at:string;}
const SEARCH_URL = "https://gamma-api.polymarket.com/public-search";
const TIMEOUT_MS = 8000;
const HEADERS: Record<string,string> = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Content-Type":"application/json",
};
const ok = (b:SignalResponse) => new Response(JSON.stringify(b),{status:200,headers:HEADERS});
const estimate = (r:SignalRequest) => ok({
  query:r.query,question:"Estimate (no market data): "+r.query,
  probability:r.fallback,source:"estimate",fetched_at:new Date().toISOString(),
});
function parseRequest(v:unknown):SignalRequest {
  if (!isRecord(v)) throw new Error("bad body");
  const {query,fallback,match}=v;
  if (typeof query!=="string" || query.trim()==="" || typeof fallback!=="number" ||
      !Number.isFinite(fallback) || fallback<0 || fallback>100) throw new Error("bad fields");
  const q=query.trim();
  const tokens=Array.isArray(match)&&match.length>0&&match.every(t=>typeof t==="string"&&t.trim()!=="")
    ? (match as string[]).map(t=>t.trim()) : q.split(/\s+/);
  return {query:q,fallback,match:tokens};
}
Deno.serve(async(req:Request):Promise<Response>=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEADERS});
  if(req.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:HEADERS});
  let input:SignalRequest;
  try {input=parseRequest(await req.json());}
  catch {return new Response(JSON.stringify({error:"Invalid request body"}),{status:400,headers:HEADERS});}
  try {
    const url=SEARCH_URL+"?q="+encodeURIComponent(input.query)+"&events_status=active";
    const up=await fetch(url,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:{Accept:"application/json"}});
    if(!up.ok)return estimate(input);
    const best=pickBestMarket(await up.json(),input.match);
    if(!best)return estimate(input);
    return ok({query:input.query,question:best.question,probability:best.probability,
      source:"live",fetched_at:new Date().toISOString()});
  } catch {return estimate(input);}
});
