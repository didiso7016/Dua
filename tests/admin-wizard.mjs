// 第 4 批：後台建案精靈每一步的驗證（lib/project-wizard.ts，沿用 projectSchema）。
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import path from 'node:path';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,URL,crypto,require:n=>n.startsWith('@/')?load(n.slice(2)+'.ts'):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):req(n)});return exports}
const {wizardSteps,validateStep,firstInvalidStep,publishErrors}=load('lib/project-wizard.ts');
const {blankProject}=load('lib/model.ts');
const fields=e=>e.map(x=>x.field).sort();const eq=(a,b,m)=>assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),b,m);

// 6 個步驟、順序固定，第 5 步是版型選擇
eq(wizardSteps.map(s=>s.label),['基本資料','照片與格局','周邊機能','內容區塊','版型選擇','預覽與發佈']);
// 每個 projectSchema 欄位都歸屬恰好一個步驟
const owned=wizardSteps.flatMap(s=>s.fields);assert.equal(new Set(owned).size,owned.length,'欄位不可重複歸屬');
for(const k of ['name','city','photos','plans','surroundings','contentBlocks','template','sections','seoTitle','status'])assert.ok(owned.includes(k),k+' 應屬於某一步');

// 空白新建案：第 1 步擋下（案名／縣市／行政區必填），其他步驟沒有錯誤
const p=blankProject('wizard-test');
eq(fields(validateStep(p,0)),['city','district','name']);
for(let i=1;i<wizardSteps.length;i++)eq(validateStep(p,i),[],'步驟 '+(i+1)+' 應無錯誤');
assert.equal(firstInvalidStep(p),0);
// 儲存草稿只看 schema：縣市可空，但案名是 schema 必填
assert.equal(firstInvalidStep(p,false),0);
const named={...p,name:'精靈測試案'};
assert.equal(firstInvalidStep(named,false),-1,'有案名即可存草稿');
assert.equal(firstInvalidStep(named),0,'下一步仍要求縣市、行政區');

// 第 1 步填好就通過；錯誤訊息為中文
const s1={...named,city:'臺北市',district:'大安區'};
eq(validateStep(s1,0),[]);assert.equal(firstInvalidStep(s1),-1);
assert.match(validateStep(p,0)[0].message,/請填寫/);

// 照片網址不合規 → 落在第 2 步
const badPhoto={...s1,photos:[{url:'https://evil.test/a.jpg',caption:''}]};
eq(fields(validateStep(badPhoto,1)),['photos']);assert.equal(firstInvalidStep(badPhoto),1);assert.equal(firstInvalidStep(badPhoto,false),1);
// 導航連結不合規 → 第 3 步
eq(fields(validateStep({...s1,map:'javascript:alert(1)'},2)),['map']);
// 優勢標題空白 → 第 4 步，並標出第幾項
const adv=validateStep({...s1,advantages:[{title:'ok',text:''},{title:'  ',text:''}]},3);eq(fields(adv),['advantages']);assert.match(adv[0].message,/第 2 項/);
// 模板 id 不合法、段落數不對 → 第 5 步
eq(fields(validateStep({...s1,template:'nope'},4)),['template']);
eq(fields(validateStep({...s1,sections:s1.sections.slice(1)},4)),['sections']);
// 確認日期、通知 Email 不合規 → 第 6 步
eq(fields(validateStep({...s1,verifiedOn:'2026-02-30',email:'not-mail'},5)),['email','verifiedOn']);

// 刊登條件與 API 相同：縣市、行政區、至少一張照片
eq(fields(publishErrors(p)),['city','district','photos']);
eq(publishErrors({...s1,photos:[{url:'/assets/building.jpg',caption:''}]}),[]);

// 後台編輯器接上精靈，且保留「進階／全部欄位」與既有分頁
const ui=fs.readFileSync('app/admin/ui.tsx','utf8');
assert.match(ui,/ProjectWizard/);assert.match(ui,/進階／全部欄位/);assert.match(ui,/ProjectTemplatePicker/);assert.match(ui,/InquiriesAdmin/);
for(const t of ['基本資料','照片與格局','周邊機能','位置','常見問題','搜尋與資料來源','建案優勢','新增段落','版面設定'])assert.ok(ui.includes(`'${t}'`),'保留分頁 '+t);
// 種子草稿
const seed=fs.readFileSync('seed/50-admin-wizard.sql','utf8');assert.match(seed,/INSERT OR REPLACE INTO projects/);assert.match(seed,/'draft','2026/);
assert.doesNotMatch(seed,/huayi-yoyogi-5|demo-taipei-qingtian|demo-newtaipei-yuesen|demo-taichung-hikari|demo-kaohsiung-hele/);
const json=JSON.parse(seed.match(/VALUES \('demo-wizard-draft','(.*)','draft'/)[1].replaceAll("''","'"));
const {projectSchema}=load('lib/project-schema.ts');assert.ok(projectSchema.safeParse(json).success,'種子草稿需通過 projectSchema');
assert.equal(firstInvalidStep(json),-1);
console.log('Admin wizard step validation checks passed');
