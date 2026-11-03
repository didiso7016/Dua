import {deliverInquiry} from '@/lib/sheet-delivery';
import {database} from '@/lib/storage';
import {errorResponse} from '@/lib/api';
import {inquirySchema} from '@/lib/inquiry-schema';
import {PRIVACY_VERSION} from '@/lib/privacy';
// 洽詢表單（/contact、彈窗）。與 /api/bookings 相同：同源檢查、honeypot、前端 UUID 作為冪等鍵（INSERT OR IGNORE 後比對），
// 先存 D1 再嘗試寫入 Google Sheets；寫入失敗保留 pending，可在 /admin/sheets 補送。
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'不允許此來源'},{status:403});
 const parsed=inquirySchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success){const company=parsed.error.issues.some(i=>i.path[0]==='company');return Response.json({error:company?'合作洽詢請填寫公司名稱。':'請確認姓名、電話、Email、洽詢內容與隱私權政策同意。'},{status:400})}
 const d=parsed.data;
 await database().prepare('INSERT OR IGNORE INTO inquiries (id,type,name,phone,email,company,message,source_page,consent_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(d.id,d.type,d.name,d.phone,d.email,d.company,d.message,d.sourcePage,PRIVACY_VERSION,new Date().toISOString()).run();
 const existing=await database().prepare('SELECT type,phone FROM inquiries WHERE id=?').bind(d.id).first<{type:string;phone:string}>();
 if(!existing||existing.type!==d.type||existing.phone!==d.phone)return Response.json({error:'洽詢編號已使用，請重新開啟表單。'},{status:409});
 let sheetDelivery='pending';try{sheetDelivery=(await deliverInquiry(d.id)).status}catch{}
 return Response.json({id:d.id,saved:true,sheetDelivery},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
