// 洽詢名單：Apps Script inquiry 動作、deliverInquiry 租約／重送、驗證規則、migration SQL、隱私權政策內容。

const same=(a,b,m)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m); // values from vm contexts live in another realm
// 洽詢名單：Apps Script inquiry 動作、deliverInquiry 租約／重送、驗證規則、migration SQL、隱私權政策內容。
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';import {DatabaseSync} from 'node:sqlite';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const load=(file,require=req)=>{const context={exports:{},require,URL,AbortSignal,Date};vm.runInNewContext(compile(file),context);return context};

// ---------------------------------------------------------------- Apps Script
const token='a'.repeat(64),master='1ZQYgbmrqUSYPbvK24DuD4MHRotpu82Kb08Ls6OKDsNI',project='1gTzmRvTaEN-E1_oNiNpyzhSrRgM9FIRgQ9J_XD5bg20';
const bookingHeaders=['預約編號','填寫時間','建案名稱','姓名','聯絡電話','希望賞屋日期','希望時段','備註'];
const inquiryHeaders=['編號','時間','類型','姓名','電話','Email','公司','內容','來源頁'];
const books={[master]:{'預約名單':[bookingHeaders]},[project]:{'預約名單':[bookingHeaders]}};
const sheet=(id,name)=>{const rows=books[id][name];return {getLastRow:()=>rows.length,getMaxRows:()=>1000,insertRowsAfter:()=>{},setFrozenRows:()=>{},getRange:(row,col,height=1,width=1)=>({getValues:()=>Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>(rows[row-1+i]||[])[col-1+j]??'')),setNumberFormat:()=>{},setWrap:()=>{},setValues:values=>{for(let i=0;i<values.length;i++)rows[row-1+i]=values[i]},createTextFinder:value=>{const finder={matchEntireCell:()=>finder,useRegularExpression:()=>finder,findNext:()=>rows.slice(1).some(r=>r[0]===value)?{}:null};return finder}})}};
const gas={ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>text})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>token})},SpreadsheetApp:{openById:id=>({getSheetByName:name=>books[id][name]?sheet(id,name):null,insertSheet:name=>{books[id][name]=[];return sheet(id,name)},setSpreadsheetTimeZone:()=>{}}),flush:()=>{}},LockService:{getScriptLock:()=>({tryLock:()=>true,hasLock:()=>true,releaseLock:()=>{}})}};
vm.createContext(gas);vm.runInContext(load('lib/google-sheet-script.ts').exports.googleSheetScript,gas);
const send=value=>JSON.parse(gas.doPost({postData:{contents:JSON.stringify(value)}}));
const inquiry={id:'22345678-1234-4123-8123-123456789012',type:'合作洽詢',name:'=HYPERLINK("x")',phone:'0912345678',email:'a@example.com',company:'築里測試',message:'想刊登建案',sourcePage:'/partner',createdAt:'2026-11-03T02:00:00Z'};
const payload={token,action:'inquiry',destinations:{master},inquiry};
assert.equal(send({...payload,token:'b'.repeat(64)}).ok,false);
assert.equal(send({...payload,destinations:{master:'unapproved'}}).ok,false);
assert.equal(send({...payload,inquiry:{...inquiry,type:'其他'}}).ok,false);
assert.equal(books[master]['洽詢名單'],undefined,'rejected requests do not create the tab');
const ok=send(payload);assert.equal(ok.ok,true);assert.equal(ok.id,inquiry.id);assert.equal(ok.master,true);
same([...books[master]['洽詢名單'][0]],[...inquiryHeaders],'missing tab is created with the exact headers');
assert.equal(send(payload).ok,true);assert.equal(books[master]['洽詢名單'].length,2,'same id is not appended twice');
const written=books[master]['洽詢名單'][1];assert.equal(written[0],inquiry.id);assert.equal(written[2],'合作洽詢');assert.equal(written[3].startsWith("'="),true);assert.equal(written[4],'0912345678');assert.equal(written[8],'/partner');
books[master]['洽詢名單'][0]=['舊標題'];assert.equal(send({...payload,inquiry:{...inquiry,id:'32345678-1234-4123-8123-123456789012'}}).ok,false,'changed headers are refused');books[master]['洽詢名單'][0]=inquiryHeaders;
const booking={id:'12345678-1234-4123-8123-123456789012',name:'測試',phone:'0912345678',projectName:'測試建案',date:'2026-10-09',time:'下午',notes:'',createdAt:'2026-10-08T02:00:00Z'};
assert.equal(send({token,action:'deliver',destinations:{master,project},booking}).ok,true,'booking delivery still works');assert.equal(books[master]['預約名單'].length,2);

// ------------------------------------------------------------ deliverInquiry
const sql=new DatabaseSync(':memory:');
sql.exec('CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT);');
for(const statement of fs.readFileSync('drizzle/0001_inquiries.sql','utf8').split('--> statement-breakpoint'))if(statement.trim())sql.exec(statement);
const database=()=>({prepare:query=>({bind:(...values)=>({first:async()=>sql.prepare(query).get(...values)||null,run:async()=>sql.prepare(query).run(...values)})})});
const connection={url:'https://script.google.com/macros/s/test/exec',token};sql.prepare('INSERT INTO settings VALUES (?,?)').run('integration:sheets',JSON.stringify(connection));
sql.prepare('INSERT INTO inquiries (id,type,name,phone,email,company,message,source_page,consent_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(inquiry.id,'partner','王小明','0912345678','','築里','內容','/partner','privacy-2026-11',inquiry.createdAt);
const fresh=sql.prepare('SELECT sheet_status,sheet_attempts,sheet_lease FROM inquiries').get();assert.equal(fresh.sheet_status,'pending');assert.equal(fresh.sheet_attempts,0);assert.equal(fresh.sheet_lease,0);
let network=0,fail=false,lastBody=null;
const lib=load('lib/sheet-delivery.ts',name=>name==='./storage'?{database,getProject:async()=>null,getSettings:async()=>({masterSheet:''})}:req(name));
lib.fetch=async(_url,init)=>{network++;lastBody=JSON.parse(init.body);if(fail)throw Error('network');return {status:200,ok:true,json:async()=>({ok:true,id:lastBody.inquiry.id,master:true})}};
fail=true;assert.equal((await lib.exports.deliverInquiry(inquiry.id)).status,'pending');
let state=sql.prepare('SELECT sheet_status,sheet_attempts,sheet_lease,sheet_attempt_at FROM inquiries').get();assert.equal(state.sheet_status,'pending');assert.equal(state.sheet_attempts,1);assert.equal(state.sheet_lease,0);assert.ok(state.sheet_attempt_at);
fail=false;assert.equal((await lib.exports.deliverInquiry(inquiry.id)).status,'sent');
assert.equal(lastBody.action,'inquiry');assert.equal(lastBody.destinations.master,master,'falls back to the default master sheet');assert.equal(lastBody.inquiry.type,'合作洽詢');assert.equal(lastBody.inquiry.sourcePage,'/partner');
const calls=network;assert.equal((await lib.exports.deliverInquiry(inquiry.id)).status,'skipped');assert.equal(network,calls,'sent rows are never re-sent');
sql.prepare("UPDATE inquiries SET sheet_status='pending',sheet_lease=?").run(Date.now()+60000);assert.equal((await lib.exports.deliverInquiry(inquiry.id)).status,'skipped','an active lease blocks a parallel attempt');
sql.prepare('DELETE FROM settings').run();assert.equal((await lib.exports.deliverInquiry(inquiry.id)).status,'not_connected');

// ------------------------------------------------------------------- schema
const {inquirySchema}=load('lib/inquiry-schema.ts').exports;
const valid={id:'42345678-1234-4123-8123-123456789012',type:'general',name:'王小明',phone:'0912-345-678',email:'',company:'',message:'想詢問',sourcePage:'/contact',consent:true,website:''};
assert.equal(inquirySchema.safeParse(valid).success,true,'email and company are optional for 一般洽詢');
assert.equal(inquirySchema.safeParse({...valid,type:'partner'}).success,false,'company is required for 合作洽詢');
assert.equal(inquirySchema.safeParse({...valid,type:'partner',company:'築里'}).success,true);
assert.equal(inquirySchema.safeParse({...valid,website:'spam'}).success,false,'honeypot');
assert.equal(inquirySchema.safeParse({...valid,consent:false}).success,false);
assert.equal(inquirySchema.safeParse({...valid,email:'not-an-email'}).success,false);
assert.equal(inquirySchema.safeParse({...valid,sourcePage:'https://evil.example'}).success,false);
assert.equal(inquirySchema.safeParse({...valid,sourcePage:'//evil.example'}).success,false);

// ------------------------------------------------------------------ privacy
const privacy=load('lib/privacy.ts').exports;
assert.equal(privacy.PRIVACY_VERSION,'privacy-2026-11');
same(privacy.privacySections.map(s=>s.heading.slice(0,2)),['一、','二、','三、','四、','五、','六、','七、']);
const source=fs.readFileSync('lib/privacy.ts','utf8');for(const phrase of ['不在此限','有利於您的權益','決不對外公佈','修正後的條款將刊登於網站上'])assert.ok(source.includes(phrase));
const booking2=fs.readFileSync('components/project-interactions.tsx','utf8');assert.equal(booking2.includes('私人測試版'),false);assert.equal(booking2.includes('測試版個資告知'),false);assert.ok(booking2.includes('PrivacyConsent'));
assert.ok(fs.readFileSync('components/privacy-consent.tsx','utf8').includes('href="/privacy" target="_blank"'));

console.log('Inquiries passed: Apps Script inquiry action (auth, allow-list, auto tab, dedupe, formula escaping, header guard), deliverInquiry lease/pending/sent/skip, schema rules, migration SQL, privacy text and single consent line.');
