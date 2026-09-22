import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
export const guildId=process.env.RETIUM_GUILD_ID||'1490455567100022965';
const secret=()=>{const s=process.env.AUTH_SESSION_SECRET;if(!s||s.length<32)throw Error('AUTH_SESSION_SECRET missing or too short');return s};
export const origin=()=>{const s=process.env.NEXT_PUBLIC_SITE_URL;if(!s||!s.startsWith('https://')&&!s.startsWith('http://localhost:'))throw Error('NEXT_PUBLIC_SITE_URL missing');return s.replace(/\/$/,'')};
export function sign(value:string){return createHmac('sha256',secret()).update(value).digest('base64url')}
export function seal(data:object){const payload=Buffer.from(JSON.stringify(data)).toString('base64url');return `${payload}.${sign(payload)}`}
export function unseal<T>(token:string|undefined):T|null{if(!token)return null;const [p,s,...extra]=token.split('.');if(!p||!s||extra.length)return null;const expected=sign(p);if(s.length!==expected.length||!timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;try{return JSON.parse(Buffer.from(p,'base64url').toString()) as T}catch{return null}}
export type Session={id:string;username:string;access:string;exp:number};
export async function session(){const c=await cookies();const s=unseal<Session>(c.get('ra_session')?.value);return s&&s.exp>Date.now()?s:null}
export async function verifiedMember(s:Session){const r=await fetch('https://discord.com/api/v10/users/@me/guilds',{headers:{Authorization:`Bearer ${s.access}`},cache:'no-store'});if(!r.ok)return false;const guilds=await r.json();return Array.isArray(guilds)&&guilds.some((g:{id?:string})=>g.id===guildId)}
export function nonce(){return randomBytes(24).toString('base64url')}
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};
