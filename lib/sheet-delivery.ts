import {database,getProject,getSettings} from './storage';
export const masterSheet='https://docs.google.com/spreadsheets/d/1ZQYgbmrqUSYPbvK24DuD4MHRotpu82Kb08Ls6OKDsNI/edit';
export const sampleSheet='https://docs.google.com/spreadsheets/d/1gTzmRvTaEN-E1_oNiNpyzhSrRgM9FIRgQ9J_XD5bg20/edit';
export type SheetConnection={url:string;token:string};
export function sheetId(url:string){return /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)(?:\/|$)/.exec(url)?.[1]||''}
export function validWebhook(url:string){return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url)}
export async function getSheetConnection(){const r=await database().prepare('SELECT value FROM settings WHERE key=?').bind('integration:sheets').first<{value:string}>();return r?JSON.parse(r.value) as SheetConnection:null}
export async function callSheetWebhook(connection:SheetConnection,payload:unknown){
 if(!validWebhook(connection.url)||!connection.token)throw Error('Sheets not configured');
 const signal=AbortSignal.timeout(20000);
 let response=await fetch(connection.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:connection.token,...payload as object}),redirect:'manual',signal});
 if([301,302,303].includes(response.status)){
  const location=response.headers.get('location');if(!location)throw Error('Missing Google redirect');
  const url=new URL(location);if(url.protocol!=='https:'||url.hostname!=='script.googleusercontent.com')throw Error('Unexpected Google redirect');
  response=await fetch(url.toString(),{redirect:'error',signal});
 }
 if(!response.ok)throw Error('Google request failed');
 return await response.json() as {ok:boolean;id?:string;master?:boolean;project?:boolean};
}
export async function deliverBooking(id:string){
 const connection=await getSheetConnection();if(!connection)return {status:'not_connected'};
 const now=Date.now();
 const row=await database().prepare("UPDATE bookings SET data=json_set(data,'$.sheetLease',?) WHERE id=? AND COALESCE(json_extract(data,'$.sheetStatus'),'pending')!='sent' AND COALESCE(json_extract(data,'$.sheetLease'),0)<? RETURNING project_id,data,created_at").bind(now+60000,id,now).first<{project_id:string;data:string;created_at:string}>();
 if(!row)return {status:'skipped'};
 let status='pending';
 try{
  const data=JSON.parse(row.data);const [project,settings]=await Promise.all([getProject(row.project_id),getSettings()]);
  const master=sheetId(settings.masterSheet||masterSheet);const specific=sheetId(project?.sheet||(row.project_id==='huayi-yoyogi-5'?sampleSheet:''));
  if(!master||!specific)throw Error('Missing sheet destination');
  const result=await callSheetWebhook(connection,{action:'deliver',destinations:{master,project:specific},booking:{id,projectId:row.project_id,projectName:data.projectName,name:data.name,phone:data.phone,date:data.date,time:data.time,notes:data.notes,createdAt:row.created_at}});
  if(!result.ok||result.id!==id||!result.master||!result.project)throw Error('Incomplete sheet delivery');
  status='sent';
 }catch{status='pending'}
 await database().prepare("UPDATE bookings SET data=json_set(data,'$.sheetStatus',?,'$.sheetDelivery',?,'$.sheetLease',0,'$.sheetAttemptAt',?) WHERE id=? AND json_extract(data,'$.sheetLease')=?").bind(status,status,new Date().toISOString(),id,now+60000).run();
 return {status};
}
// 洽詢名單：只寫入公司總表的「洽詢名單」分頁。租約／pending→sent 與 deliverBooking 相同，狀態存在 inquiries 的實體欄位。
const inquiryLabels:Record<string,string>={general:'一般洽詢',partner:'合作洽詢'};
export async function deliverInquiry(id:string){
 const connection=await getSheetConnection();if(!connection)return {status:'not_connected'};
 const now=Date.now(),lease=now+60000;
 const row=await database().prepare("UPDATE inquiries SET sheet_lease=?,sheet_attempts=sheet_attempts+1 WHERE id=? AND sheet_status!='sent' AND sheet_lease<? RETURNING id,type,name,phone,email,company,message,source_page,created_at").bind(lease,id,now).first<{id:string;type:string;name:string;phone:string;email:string;company:string;message:string;source_page:string;created_at:string}>();
 if(!row)return {status:'skipped'};
 let status='pending';
 try{
  const settings=await getSettings();const master=sheetId(settings.masterSheet||masterSheet);
  if(!master)throw Error('Missing sheet destination');
  const result=await callSheetWebhook(connection,{action:'inquiry',destinations:{master},inquiry:{id,type:inquiryLabels[row.type]||row.type,name:row.name,phone:row.phone,email:row.email,company:row.company,message:row.message,sourcePage:row.source_page,createdAt:row.created_at}});
  if(!result.ok||result.id!==id||!result.master)throw Error('Incomplete sheet delivery');
  status='sent';
 }catch{status='pending'}
 await database().prepare('UPDATE inquiries SET sheet_status=?,sheet_lease=0,sheet_attempt_at=? WHERE id=? AND sheet_lease=?').bind(status,new Date().toISOString(),id,lease).run();
 return {status};
}
