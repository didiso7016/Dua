import {authorize,errorResponse} from '@/lib/api';
import {database,getHomeSettings} from '@/lib/storage';
import {homeSchema} from '@/lib/home-schema';
export async function GET(req:Request){const denied=await authorize(req);if(denied)return denied;try{return Response.json(await getHomeSettings(),{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
export async function POST(req:Request){const denied=await authorize(req);if(denied)return denied;try{const parsed=homeSchema.safeParse(await req.json());if(!parsed.success)return Response.json({error:'請確認預算級距、推薦網址與刊登日期。預算最多12組、推薦橫幅最多10組，編號不可重複。'},{status:400});await database().prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('home',JSON.stringify(parsed.data)).run();return Response.json({ok:true,home:parsed.data})}catch(e){return errorResponse(e)}}
