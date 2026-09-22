import {NextResponse} from 'next/server';
import {origin} from '../../../../lib/discord';
export async function GET(){const r=NextResponse.redirect(origin());r.cookies.delete('ra_session');return r}
