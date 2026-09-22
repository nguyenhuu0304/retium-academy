import {NextResponse} from 'next/server';
import {session,verifiedMember} from '../../../../lib/discord';
export const dynamic='force-dynamic';
export async function GET(){try{const s=await session();if(!s)return NextResponse.json({authenticated:false},{headers:{'Cache-Control':'no-store'}});return NextResponse.json({authenticated:await verifiedMember(s),username:s.username},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({authenticated:false},{status:503})}}
