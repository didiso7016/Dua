// 第 6 批：5 個建案統一經典模板（seed 70）、後台帳號設定在右側內容區、首頁移除「最新消息」列。
// 註：經典模板改版（滿版首圖、色帶、捲動進場）依負責人要求已撤回，建案詳細頁維持第 5 批樣式。
import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
// seed 70：5 個建案全部改經典，只動 template 欄位
const seed=fs.readFileSync('seed/70-classic-all.sql','utf8');assert.match(seed,/json_set\(data,'\$\.template','classic'\)/);
for(const id of ['huayi-yoyogi-5','demo-taipei-qingtian','demo-newtaipei-yuesen','demo-taichung-hikari','demo-kaohsiung-hele'])assert.ok(seed.includes("'"+id+"'"),id);
assert.equal(/INSERT|DELETE/i.test(seed.replace(/--.*$/gm,'')),false);
// 詳細頁維持第 5 批：沒有改版用的資訊列、規格列與捲動進場
const detail=fs.readFileSync('components/project-detail.tsx','utf8')+fs.readFileSync('components/project-motion.tsx','utf8');assert.equal(/pd-meta|pd-specs|DetailReveal/.test(detail),false);
assert.equal(fs.readFileSync('styles/project-detail.css','utf8').includes('data-reveal'),false);
// 後台：帳號設定在左側選單底部，點選後在右側內容區顯示；上方列不再有帳號連結，桌機（>=768px）隱藏上方列
const admin=fs.readFileSync('app/admin/ui.tsx','utf8');assert.match(admin,/<SidebarFooter>.*setPage\('account'\).*帳號設定.*<\/SidebarFooter>/s);assert.match(admin,/page==='account'&&<AdminAccountPanel account=\{account\}\/>/);
const bar=admin.slice(admin.indexOf('className="admin-bar"'));assert.equal(bar.slice(0,bar.indexOf('</div>')).includes('/admin/account'),false);
const panel=fs.readFileSync('components/admin-account.tsx','utf8');assert.match(panel,/\/api\/auth\/logout/);assert.match(panel,/href="\/admin\/change"/);assert.match(fs.readFileSync('app/admin/page.tsx','utf8'),/currentAccount\(\)/);
const adminCss=fs.readFileSync('styles/admin.css','utf8');assert.match(adminCss,/@media \(min-width: 768px\) \{\s*body:has\(\.admin-root\) \.admin-bar \{ display: none; \}/);assert.match(adminCss,/\.admin-main \{ margin-top: 0; margin-bottom: auto; \}/);
// 首頁：移除「最新消息」列與最新建案說明句
const home=fs.readFileSync('components/home-sections.tsx','utf8')+fs.readFileSync('app/page.tsx','utf8');assert.equal(/HomeNews|hs-news|依首次刊登時間排序/.test(home),false);assert.equal(fs.readFileSync('styles/home.css','utf8').includes('hs-news'),false);
// 上傳前縮圖：長邊 2400、等比例；小圖不動；兩個上傳點都經過 prepareUpload；框架 multipart 上限調為 8MB（原本 1MB 會擋掉 >1MB 的上傳）
{const m={};new Function('exports',ts.transpileModule(fs.readFileSync('lib/image-resize.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m);
const fit=(w,h)=>({...m.fitWithin(w,h)});assert.equal(m.MAX_EDGE,2400);assert.deepEqual(fit(4000,3000),{width:2400,height:1800});assert.deepEqual(fit(3000,4000),{width:1800,height:2400});assert.deepEqual(fit(800,600),{width:800,height:600});assert.deepEqual(fit(2400,100),{width:2400,height:100});}
assert.match(fs.readFileSync('app/admin/ui.tsx','utf8'),/body\.set\('file',await prepareUpload\(f\)\)/);assert.match(fs.readFileSync('components/admin-home.tsx','utf8'),/body\.set\('file',await prepareUpload\(file\)\)/);
assert.match(fs.readFileSync('next.config.ts','utf8'),/serverActions:\s*\{\s*bodySizeLimit:\s*"8mb"/);
// 周邊機能：沒有照片的項目放標題色塊（仍左右交錯），後台照片欄位有說明
{const d=fs.readFileSync('components/project-detail.tsx','utf8');assert.match(d,/pd-life-placeholder/);assert.equal(/' text-only'/.test(d),false);assert.match(fs.readFileSync('app/admin/ui.tsx','utf8'),/沒有照片時，前台會在照片位置顯示這一項的標題色塊/);}
// 格局段落收緊、格局圖最高 540px
assert.match(fs.readFileSync('styles/project-detail.css','utf8'),/\.pd-plan-image \.detail-gallery-image img \{ max-height: min\(60vh, 540px\); \}/);
// 後台周邊機能排序：moveItem 正確搬移、超出範圍不變；編輯器有拖曳把手與上移／下移
{const m={};new Function('exports',ts.transpileModule(fs.readFileSync('lib/reorder.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m);
const mv=(a,f,t)=>[...m.moveItem(a,f,t)];assert.deepEqual(mv(['a','b','c'],0,2),['b','c','a']);assert.deepEqual(mv(['a','b','c'],2,0),['c','a','b']);assert.deepEqual(mv(['a','b','c'],1,1),['a','b','c']);assert.deepEqual(mv(['a','b','c'],-1,1),['a','b','c']);assert.deepEqual(mv(['a','b','c'],0,3),['a','b','c']);assert.deepEqual(mv(['a','b'],Number('x'),0),['a','b']);
const a=fs.readFileSync('app/admin/ui.tsx','utf8');assert.match(a,/className="drag-handle" draggable/);assert.match(a,/moveItem\(edit\.surroundings,i,i-1\)/);assert.match(a,/moveItem\(edit\.surroundings,i,i\+1\)/);assert.match(a,/moveItem\(edit\.surroundings,from,i\)/);}
// 基本資料標題有 01 編號；頁首「聯絡我們」改為膠囊按鈕（開洽詢彈窗），右下角洽詢浮動按鈕移除、頁尾連結不變
assert.match(fs.readFileSync('components/project-detail.tsx','utf8'),/pd-heading pd-heading--summary"><span className="pd-number"/);
{const site=fs.readFileSync('components/site.tsx','utf8');assert.match(site,/<a href="\/contact" data-inquiry="" aria-haspopup="dialog" className="dua-header__cta">/);assert.equal((site.match(/className="dua-header__cta"/g)||[]).length,1);
assert.equal(fs.readFileSync('components/inquiry.tsx','utf8').includes('className="dua-inquiry-fab"'),false);assert.match(fs.readFileSync('styles/site-chrome.css','utf8'),/\.dua-header__nav > a\.dua-header__cta \{/);}
console.log('Batch 6: seed 70 all classic, detail page kept at batch 5, admin account panel in content area, home news bar removed, upload resize + 8MB limit, surroundings placeholder, plan spacing, surroundings reorder, basic 01 number, header contact pill passed');
