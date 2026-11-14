import { assertEquals } from "jsr:@std/assert";
import { pickBestMarket, yesProbability } from "./parse.ts";
const mk=(question:string,outcomes:string[],prices:string[],volume=1)=>({
  question,active:true,closed:false,volume,
  outcomes:JSON.stringify(outcomes),outcomePrices:JSON.stringify(prices),
});
Deno.test("Yes price is looked up by name",()=>{
  assertEquals(yesProbability(mk("q",["No","Yes"],["0.7","0.3"])),30);
});
Deno.test("No Yes outcome",()=>{
  assertEquals(yesProbability(mk("q",["Up","Down"],["0.5","0.5"])),null);
});
Deno.test("Malformed prices",()=>{
  assertEquals(yesProbability({outcomes:"not json",outcomePrices:"[]"}),null);
});
Deno.test("Highest-volume eligible match",()=>{
  const data={events:[
    {markets:[mk("Fed cut December?",["Yes","No"],["0.4","0.6"],10)]},
    {markets:[mk("Fed cut January?",["Yes","No"],["0.2","0.8"],99)]},
  ]};
  assertEquals(pickBestMarket(data,["fed","cut"])?.probability,20);
});
Deno.test("Empty results",()=>{
  assertEquals(pickBestMarket({events:[]},["fed"]),null);
  assertEquals(pickBestMarket("garbage",["fed"]),null);
});
