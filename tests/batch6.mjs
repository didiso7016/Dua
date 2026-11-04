// 第 6 批：經典模板改版（滿版首圖＋資訊列、捲動進場只動 opacity/transform）、seed 70 全部改經典。
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import path from 'node:path';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),cache=new Map();const jsx=(type,props)=>({type,props:props||{}});
const mocks={'react':{Fragment:'Fragment'},'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'./detail-navigation':{DetailNavigation:'DetailNavigation',MobileBooking:'MobileBooking'},'./site':{Header:'Header',Footer:'Footer'},'./detail-gallery':{DetailGallery:'DetailGallery',PlanGallery:'PlanGallery'},'./district-map':{DistrictMap:'DistrictMap'},'./project-blocks':{ProjectBlocks:'ProjectBlocks',CustomSections:'CustomSections'},'./project-visit':{ProjectVisit:'ProjectVisit'},'./project-motion':{Advantages:'Advantages',DetailReveal:'DetailReveal'},'./view-tracker':{ViewTracker:'ViewTracker'}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,crypto,require:n=>mocks[n]??(n.startsWith('@/')?load(n.slice(2)+'.ts'):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):req(n))});return exports}
const all=(n,p)=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(x=>all(x,p)):[...(p(n)?[n]:[]),...all(n.props?.children,p)];
const text=n=>typeof n==='string'?n:Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):'';
const {sample,defaultSettings}=load('lib/model.ts');const {ProjectDetail}=load('components/project-detail.tsx');
const cls=c=>n=>typeof n.props?.className==='string'&&n.props.className.split(' ').includes(c);
const p={...sample,city:'桃園市',district:'中壢區',sales:'銷售中',rooms:'2房2衛',area:'全案22–27坪',stage:'預售屋',type:'大樓'};
// classic：資訊列（地區・銷售狀態）＋規格列＋捲動進場元件
const classic=ProjectDetail({project:{...p,template:'classic'},settings:defaultSettings});
assert.equal(text(all(classic,cls('pd-meta'))[0]),'桃園市中壢區 · 銷售中');
assert.deepEqual(JSON.parse(JSON.stringify(all(classic,cls('pd-specs'))[0].props.children.map(text))),['2房2衛','全案22–27坪','預售屋・大樓']);
assert.equal(all(classic,n=>n.type==='DetailReveal').length,1);
// 空白欄位不輸出空項目
const sparse=ProjectDetail({project:{...p,template:'classic',sales:'',rooms:'',area:'',stage:'',type:''},settings:defaultSettings});
assert.equal(text(all(sparse,cls('pd-meta'))[0]),'桃園市中壢區');assert.equal(all(sparse,cls('pd-specs')).length,0);
// 其他模板不變：沒有資訊列、規格列與捲動進場
for(const t of ['gallery','compact']){const tree=ProjectDetail({project:{...p,template:t},settings:defaultSettings});assert.equal(all(tree,cls('pd-meta')).length,0,t);assert.equal(all(tree,cls('pd-specs')).length,0,t);assert.equal(all(tree,n=>n.type==='DetailReveal').length,0,t)}
// 捲動進場：只動 opacity/transform；只標記腳本處理過的元素（沒有 JS 時內容可見）；尊重減少動態效果
const css=fs.readFileSync('styles/project-detail.css','utf8');const block=css.slice(css.indexOf('Template 1 — 經典 classic'));
for(const m of block.matchAll(/transition:\s*([^;]+);/g))for(const part of m[1].split(','))assert.match(part.trim(),/^(opacity|transform)\b/,part);
assert.match(block,/\[data-reveal\]:not\(\[data-revealed\]\)\s*\{\s*opacity:\s*0;\s*transform:/);
const motion=fs.readFileSync('components/project-motion.tsx','utf8');assert.match(motion,/prefers-reduced-motion: reduce/);assert.match(motion,/dataset\.reveal=''/);
// seed 70：5 個建案全部改經典，只動 template 欄位
const seed=fs.readFileSync('seed/70-classic-all.sql','utf8');assert.match(seed,/json_set\(data,'\$\.template','classic'\)/);
for(const id of ['huayi-yoyogi-5','demo-taipei-qingtian','demo-newtaipei-yuesen','demo-taichung-hikari','demo-kaohsiung-hele'])assert.ok(seed.includes("'"+id+"'"),id);
assert.equal(/INSERT|DELETE/i.test(seed.replace(/--.*$/gm,'')),false);
// 後台：帳號入口在左側選單底部，上方列不再有帳號／回前台連結，桌機（>=768px）隱藏上方列
const admin=fs.readFileSync('app/admin/ui.tsx','utf8');assert.match(admin,/<SidebarFooter>.*href="\/admin\/account".*<\/SidebarFooter>/s);
const bar=admin.slice(admin.indexOf('className="admin-bar"'));assert.equal(bar.slice(0,bar.indexOf('</div>')).includes('/admin/account'),false);
assert.match(fs.readFileSync('styles/admin.css','utf8'),/@media \(min-width: 768px\) \{\s*body:has\(\.admin-root\) \.admin-bar \{ display: none; \}/);
// 首頁：移除「最新消息」列與最新建案說明句
const home=fs.readFileSync('components/home-sections.tsx','utf8')+fs.readFileSync('app/page.tsx','utf8');assert.equal(/HomeNews|hs-news|依首次刊登時間排序/.test(home),false);assert.equal(fs.readFileSync('styles/home.css','utf8').includes('hs-news'),false);
console.log('Batch 6: classic meta/specs row, empty-field handling, other templates unchanged, reveal opacity/transform only + reduced-motion, seed 70, admin sidebar account link, home news bar removed passed');
