import {isAdmin} from '@/lib/admin-auth';
import {getProject} from '@/lib/storage';
import {recordView} from '@/lib/view-stats';
export async function POST(req:Request){
 const origin=new URL(req.url).origin;if(req.headers.get('origin')!==origin)return new Response(null,{status:403});
 const ua=req.headers.get('user-agent')||'',host=new URL(req.url).hostname;
 if(!ua||/bot|crawler|spider|headless|slurp|preview|facebookexternalhit|bingpreview|lighthouse/i.test(ua)||['localhost','127.0.0.1','terminal.local'].includes(host)||req.headers.get('sec-gpc')==='1')return new Response(null,{status:204});
 try{if(await isAdmin())return new Response(null,{status:204});const body=await req.json() as {projectId?:unknown};if(!body||typeof body.projectId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(body.projectId))return new Response(null,{status:400});const p=await getProject(body.projectId);if(!p||p.status!=='published')return new Response(null,{status:404});const existing=req.headers.get('cookie')?.match(/(?:^|;\s*)dua_view=([a-f0-9-]{36})(?:;|$)/)?.[1];const visitor=existing||crypto.randomUUID();await recordView(p.id,visitor);const headers:Record<string,string>={'Cache-Control':'no-store'};if(!existing)headers['Set-Cookie']=`dua_view=${visitor}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax; Secure`;return new Response(null,{status:204,headers})}catch{return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}})}
}
