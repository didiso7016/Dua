export const googleSheetScript=String.raw`const HEADERS=['預約編號','填寫時間','建案名稱','姓名','聯絡電話','希望賞屋日期','希望時段','備註'];
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
}`;
