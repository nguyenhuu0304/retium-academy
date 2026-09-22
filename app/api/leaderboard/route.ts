import {session,verifiedMember} from '../../../lib/discord';
import {NextResponse} from 'next/server';
import {modules} from '../../questions';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SECRET_KEY;
function config(){if(!url||!key)throw Error('Supabase server configuration missing');return {apikey:key,Authorization:`Bearer ${key}`}}
function today(){return new Date().toISOString().slice(0,10)}
export async function GET(){try{const headers=config();const from=`${today()}T00:00:00.000Z`;const to=new Date(Date.parse(from)+86400000).toISOString();const r=await fetch(`${url}/rest/v1/quiz_results?select=points,players(x_username)&completed_at=gte.${encodeURIComponent(from)}&completed_at=lt.${encodeURIComponent(to)}&limit=10000`,{headers,cache:'no-store'});if(!r.ok)throw Error(`Database read failed (${r.status})`);const data=await r.json();const namesResponse=await fetch(`${url}/rest/v1/discord_player_names?select=player_key,discord_username&limit=10000`,{headers,cache:'no-store'});if(!namesResponse.ok)throw Error(`Discord name lookup failed (${namesResponse.status}); run the SQL migration`);const nameRows=await namesResponse.json();const nameMap=new Map<string,string>(nameRows.map((v:{player_key:string;discord_username:string})=>[v.player_key,v.discord_username]));const scores=new Map<string,number>();for(const item of data){const key=String(item.players?.x_username||'');const name=nameMap.get(key)||key;if(name)scores.set(name,Math.max(scores.get(name)||0,Number(item.points)||0))}const rows=[...scores].map(([name,score])=>({name,score,day:today()})).sort((a,b)=>b.score-a.score).slice(0,100);return NextResponse.json({rows},{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Leaderboard unavailable'},{status:503})}}
export async function POST(req:Request){try{
 const headers=config();const member=await session();if(!member||!await verifiedMember(member))return NextResponse.json({error:'Connect Discord and join Retium server before saving'},{status:401});
 const body=await req.json();if(typeof body.attemptId!=='string'||! /^[0-9a-f-]{36}$/.test(body.attemptId))return NextResponse.json({error:'Invalid quiz submission'},{status:400});
 const rpc=await fetch(`${url}/rest/v1/rpc/submit_discord_quiz`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({p_attempt_id:body.attemptId,p_discord_id:member.id,p_discord_name:String(member.username||member.id).slice(0,80)}),cache:'no-store'});
 const result=await rpc.json().catch(()=>null);if(!rpc.ok)return NextResponse.json({error:result?.message||`Unable to save score (${rpc.status}); run SQL-SERVER-SPEED.sql`},{status:400});
 return NextResponse.json(result);
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to save score'},{status:503})}}
