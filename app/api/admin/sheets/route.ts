import {authorize,errorResponse} from '@/lib/api';
import {database} from '@/lib/storage';
import {getSheetConnection,validWebhook,callSheetWebhook,deliverBooking,deliverInquiry} from '@/lib/sheet-delivery';
import {z} from 'zod';
export async function GET(req:Request){const denied=await authorize(req);if(denied)return denied;try{const c=await getSheetConnection();return Response.json({configured:!!c,url:c?.url||''},{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
export async function POST(req:Request){const denied=await authorize(req);if(denied)return denied;try{
 const schema=z.discriminatedUnion('action',[z.object({action:z.literal('save'),url:z.string().refine(validWebhook),token:z.string().regex(/^[a-f0-9]{64}$/)}),z.object({action:z.literal('test')}),z.object({action:z.literal('retry')})]);
 const parsed=schema.safeParse(await req.json());if(!parsed.success)return Response.json({error:'請確認部署網址與 64 位串接金鑰。'},{status:400});
 const data=parsed.data;
 if(data.action==='save'){await database().prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('integration:sheets',JSON.stringify({url:data.url,token:data.token})).run();return Response.json({message:'串接設定已儲存，請執行連線測試。'})}
 const connection=await getSheetConnection();if(!connection)return Response.json({error:'請先儲存串接設定。'},{status:400});
 if(data.action==='test'){const result=await callSheetWebhook(connection,{action:'ping'});if(!result.ok)return Response.json({error:'Google 驗證失敗，請確認金鑰與部署權限。'},{status:400});return Response.json({message:'Google 接收入口連線成功。尚未測試兩份名單的實際寫入。'})}
 const pending=await database().prepare("SELECT id FROM bookings WHERE COALESCE(json_extract(data,'$.sheetStatus'),'pending')!='sent' ORDER BY created_at LIMIT 5").all<{id:string}>();
 const results=await Promise.all(pending.results.map(r=>deliverBooking(r.id)));
 let inquiryResults:{status:string}[]=[];
 try{const pendingInquiries=await database().prepare("SELECT id FROM inquiries WHERE sheet_status!='sent' ORDER BY created_at LIMIT 5").all<{id:string}>();inquiryResults=await Promise.all(pendingInquiries.results.map(r=>deliverInquiry(r.id)))}catch{/* inquiries 資料表尚未 migration 時不影響預約補送 */}
 return Response.json({message:`本次補送預約 ${results.filter(x=>x.status==='sent').length} 筆、洽詢 ${inquiryResults.filter(x=>x.status==='sent').length} 筆；兩者每次各最多處理 5 筆。未完成的名單保留，可再次補送。`});
}catch(e){return errorResponse(e)}}
