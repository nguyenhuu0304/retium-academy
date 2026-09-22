import {randomUUID,randomInt} from 'node:crypto';
import {NextResponse} from 'next/server';
import {session,verifiedMember} from '../../../../lib/discord';
import {modules} from '../../../questions';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const user=await session();if(!user||!await verifiedMember(user))return NextResponse.json({error:'Connect Discord and join the Retium server first'},{status:401});
 const body=await req.json();const mod=modules.find(m=>m.id===body.module);if(!mod||mod.questions.length<5)return NextResponse.json({error:'Invalid module'},{status:400});
 const ids=mod.questions.map((_,i)=>i);for(let i=ids.length-1;i>0;i--){const j=randomInt(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}const questionIds=ids.slice(0,5);const attemptId=randomUUID();
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw Error('Database not configured');
 const response=await fetch(`${url}/rest/v1/quiz_attempts`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({id:attemptId,discord_id:user.id,module_id:mod.id,question_ids:questionIds}),cache:'no-store'});
 if(!response.ok)throw Error(`Unable to start quiz (${response.status}); run SQL-SECURE-QUIZ.sql`);
 return NextResponse.json({attemptId,questionIds},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to start quiz'},{status:503})}}
