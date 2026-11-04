// 第 6 批：5 個建案統一經典模板（seed 70）、後台帳號設定在右側內容區、首頁移除「最新消息」列。
// 註：經典模板改版（滿版首圖、色帶、捲動進場）依負責人要求已撤回，建案詳細頁維持第 5 批樣式。
import assert from 'node:assert/strict';import fs from 'node:fs';
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
console.log('Batch 6: seed 70 all classic, detail page kept at batch 5, admin account panel in content area, home news bar removed passed');
