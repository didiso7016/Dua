import {authorize,errorResponse} from '@/lib/api';
import {database} from '@/lib/storage';
import {inquiryColumns,isInquiryType,type InquiryRow} from '@/lib/inquiry';
// 後台「洽詢名單」：最近 200 筆，可用 ?type=general|partner 篩選。
export async function GET(req:Request){const denied=await authorize(req);if(denied)return denied;try{
 const type=new URL(req.url).searchParams.get('type');
 const query=isInquiryType(type)?database().prepare(`SELECT ${inquiryColumns} FROM inquiries WHERE type=? ORDER BY created_at DESC LIMIT 200`).bind(type):database().prepare(`SELECT ${inquiryColumns} FROM inquiries ORDER BY created_at DESC LIMIT 200`);
 const r=await query.all<InquiryRow>();
 return Response.json({inquiries:r.results},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
