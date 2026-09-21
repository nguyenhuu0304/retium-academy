import {NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';
import {modules} from '../../questions';
import {sign,Certificate} from '../../../lib/certificate';
export const runtime='nodejs';
export async function POST(req:Request){try{const body=await req.json();const name=String(body.name||'').trim();const mod=modules.find(m=>m.id===body.module);const answers=body.answers;if(!mod||name.length<2||name.length>50||/[<>\r\n]/.test(name)||!Array.isArray(answers)||answers.length!==mod.questions.length||!answers.every((a:unknown)=>Number.isInteger(a)&&Number(a)>=0&&Number(a)<=3))return NextResponse.json({error:'Invalid certificate request'},{status:400});const score=answers.filter((a:number,i:number)=>a===mod.questions[i].answer).length;const cert:Certificate={v:1,name,module:mod.id,score,total:mod.questions.length,issued:new Date().toISOString(),nonce:randomBytes(8).toString('hex')};return NextResponse.json({token:sign(cert),score})}catch{return NextResponse.json({error:'Certificate service unavailable. Configure CERTIFICATE_SECRET in .env.local and Vercel.'},{status:503})}}
