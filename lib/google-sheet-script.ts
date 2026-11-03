// Google Apps Script 接收程式（/admin/sheets 顯示給管理者複製貼上）。
// action: ping（連線測試）、deliver（預約 → 公司總表＋本案表的「預約名單」）、inquiry（洽詢 → 公司總表的「洽詢名單」）。
// 修改後需在 Apps Script 貼上新版並「部署 → 管理部署作業 → 編輯 → 新版本」，步驟見 docs/sheets-inquiries.md。
export const googleSheetScript=String.raw`const HEADERS=['預約編號','填寫時間','建案名稱','姓名','聯絡電話','希望賞屋日期','希望時段','備註'];
const INQUIRY_TAB='洽詢名單';
const INQUIRY_HEADERS=['編號','時間','類型','姓名','電話','Email','公司','內容','來源頁'];
const INQUIRY_TYPES=['一般洽詢','合作洽詢'];
const ALLOWED=['1ZQYgbmrqUSYPbvK24DuD4MHRotpu82Kb08Ls6OKDsNI','1gTzmRvTaEN-E1_oNiNpyzhSrRgM9FIRgQ9J_XD5bg20'];
function reply(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}
function safeText(value){const s=String(value||'');return /^[=+@-]/.test(s)?"'"+s:s}
function appendOnce(sheetId,b){
 if(ALLOWED.indexOf(sheetId)<0)throw Error('Destination not allowed');
 const sheet=SpreadsheetApp.openById(sheetId).getSheetByName('預約名單');
 if(!sheet)throw Error('Missing sheet');
 const headers=sheet.getRange(1,1,1,8).getValues()[0];
 if(JSON.stringify(headers)!==JSON.stringify(HEADERS))throw Error('Headers changed');
 const last=sheet.getLastRow();
 if(last>1&&sheet.getRange(2,1,last-1,1).createTextFinder(b.id).matchEntireCell(true).useRegularExpression(false).findNext())return;
 const row=last+1;if(row>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),1);
 sheet.getRange(row,1).setNumberFormat('@');sheet.getRange(row,5).setNumberFormat('@');
 const date=b.date&&/^\d{4}-\d{2}-\d{2}$/.test(b.date)?new Date(b.date+'T00:00:00+08:00'):'';
 sheet.getRange(row,1,1,8).setValues([[b.id,new Date(b.createdAt),safeText(b.projectName),safeText(b.name),safeText(b.phone),date,safeText(b.time),safeText(b.notes)]]);
 sheet.getRange(row,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');sheet.getRange(row,6).setNumberFormat('yyyy-mm-dd');
 sheet.getRange(row,1,1,8).setWrap(true);SpreadsheetApp.flush();
}
function inquirySheet(sheetId){
 if(ALLOWED.indexOf(sheetId)<0)throw Error('Destination not allowed');
 const book=SpreadsheetApp.openById(sheetId);
 let sheet=book.getSheetByName(INQUIRY_TAB);
 if(!sheet){sheet=book.insertSheet(INQUIRY_TAB);sheet.getRange(1,1,1,9).setValues([INQUIRY_HEADERS]);sheet.setFrozenRows(1)}
 const headers=sheet.getRange(1,1,1,9).getValues()[0];
 if(headers.join('')===''){sheet.getRange(1,1,1,9).setValues([INQUIRY_HEADERS]);sheet.setFrozenRows(1)}
 else if(JSON.stringify(headers)!==JSON.stringify(INQUIRY_HEADERS))throw Error('Headers changed');
 return sheet;
}
function appendInquiryOnce(sheetId,q){
 const sheet=inquirySheet(sheetId);
 const last=sheet.getLastRow();
 if(last>1&&sheet.getRange(2,1,last-1,1).createTextFinder(q.id).matchEntireCell(true).useRegularExpression(false).findNext())return;
 const row=last+1;if(row>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),1);
 sheet.getRange(row,1).setNumberFormat('@');sheet.getRange(row,5).setNumberFormat('@');
 sheet.getRange(row,1,1,9).setValues([[q.id,new Date(q.createdAt),q.type,safeText(q.name),safeText(q.phone),safeText(q.email),safeText(q.company),safeText(q.message),safeText(q.sourcePage)]]);
 sheet.getRange(row,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
 sheet.getRange(row,1,1,9).setWrap(true);SpreadsheetApp.flush();
}
function doPost(e){
 let lock;let id='';let master=false,project=false;
 try{
  if(!e||!e.postData||e.postData.contents.length>12000)return reply({ok:false});
  const data=JSON.parse(e.postData.contents);
  const expected=PropertiesService.getScriptProperties().getProperty('DUA_TOKEN');
  if(!expected||!/^[a-f0-9]{64}$/.test(expected)||typeof data.token!=='string'||data.token.length!==64)return reply({ok:false});
  let difference=0;for(let i=0;i<64;i++)difference|=data.token.charCodeAt(i)^expected.charCodeAt(i);
  if(difference)return reply({ok:false});
  if(data.action==='ping')return reply({ok:true});
  if(data.action==='inquiry'){
   const q=data.inquiry;
   if(!q||!data.destinations||!/^[a-f0-9-]{36}$/i.test(q.id)||!q.name||typeof q.phone!=='string'||INQUIRY_TYPES.indexOf(q.type)<0||isNaN(new Date(q.createdAt).getTime()))return reply({ok:false});
   if(!ALLOWED.includes(data.destinations.master))return reply({ok:false});
   id=q.id;lock=LockService.getScriptLock();if(!lock.tryLock(10000))return reply({ok:false,id});
   appendInquiryOnce(data.destinations.master,q);master=true;
   return reply({ok:true,id,master});
  }
  const b=data.booking;
  if(data.action!=='deliver'||!b||!data.destinations||!/^[a-f0-9-]{36}$/i.test(b.id)||!b.name||typeof b.phone!=='string'||isNaN(new Date(b.createdAt).getTime()))return reply({ok:false});
  if(!ALLOWED.includes(data.destinations.master)||!ALLOWED.includes(data.destinations.project))return reply({ok:false});
  id=b.id;lock=LockService.getScriptLock();if(!lock.tryLock(10000))return reply({ok:false,id});
  appendOnce(data.destinations.master,b);master=true;
  appendOnce(data.destinations.project,b);project=true;
  return reply({ok:true,id,master,project});
 }catch(error){return reply({ok:false,id,master,project})}
 finally{if(lock&&lock.hasLock())lock.releaseLock()}
}
function authorizeSheets(){
 for(const id of ALLOWED){const book=SpreadsheetApp.openById(id);book.setSpreadsheetTimeZone('Asia/Taipei');if(!book.getSheetByName('預約名單'))throw Error('Missing sheet')}
 inquirySheet(ALLOWED[0]);
}`;
