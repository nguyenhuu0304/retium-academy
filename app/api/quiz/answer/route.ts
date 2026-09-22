import {NextResponse} from 'next/server';
import {session,verifiedMember} from '../../../../lib/discord';
import {modules} from '../../../questions';
import {answerKey} from '../../../../lib/quiz-answer-key.server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const member=await session();if(!member||!await verifiedMember(member))return NextResponse.json({error:'Connect Discord first'},{status:401});
 const body=await req.json();if(typeof body.attemptId!=='string'||! /^[0-9a-f-]{36}$/.test(body.attemptId)||!Number.isInteger(body.step)||!Number.isInteger(body.answer)||body.answer< -1||body.answer>3)return NextResponse.json({error:'Invalid answer'},{status:400});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw Error('Database not configured');
 const headers={apikey:key,Authorization:`Bearer ${key}`};
 const lookup=await fetch(`${url}/rest/v1/quiz_attempts?id=eq.${encodeURIComponent(body.attemptId)}&discord_id=eq.${encodeURIComponent(member.id)}&select=module_id,question_ids,current_step`,{headers,cache:'no-store'});
 if(!lookup.ok)throw Error(`Quiz lookup failed (${lookup.status})`);const attempts=await lookup.json();const a=attempts[0];if(!a||a.current_step!==body.step)return NextResponse.json({error:'Invalid quiz step'},{status:409});
 const mod=modules.find(m=>m.id===a.module_id);const id=a.question_ids?.[body.step];if(!mod||!Number.isInteger(id)||!mod.questions[id])return NextResponse.json({error:'Invalid quiz question'},{status:400});
 const correct=body.answer===answerKey[a.module_id]?.[id];
 const rpc=await fetch(`${url}/rest/v1/rpc/answer_discord_quiz`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({p_attempt_id:body.attemptId,p_discord_id:member.id,p_step:body.step,p_answer:body.answer,p_correct:correct}),cache:'no-store'});
 const result=await rpc.json().catch(()=>null);if(!rpc.ok)return NextResponse.json({error:result?.message||'Unable to submit answer'},{status:409});return NextResponse.json({...result,correctAnswer:answerKey[a.module_id][id]},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to submit answer'},{status:503})}}
