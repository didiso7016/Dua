// 本機種子資料：依檔名順序執行 seed/*.sql 到本機 D1（.wrangler/state）。只用 --local，不會連到正式資料庫。
// 前提：已執行 pnpm setup:local（建立資料表）。
// seed/00-projects.sql 會 INSERT OR REPLACE 5 個既有建案；本機已有這 5 筆時預設跳過，
// 避免覆蓋你在本機後台做過的修改。要強制還原：pnpm seed:local -- --reset-projects
import {existsSync,readdirSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const wrangler='node_modules/wrangler/bin/wrangler.js';
if(!existsSync(wrangler))throw Error('請先執行 pnpm install --frozen-lockfile');
if(!existsSync('seed'))throw Error('找不到 seed/ 資料夾');
const resetProjects=process.argv.includes('--reset-projects');
const env={...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false',WRANGLER_WRITE_LOGS:'false',WRANGLER_LOG_PATH:'.wrangler/logs',WRANGLER_REGISTRY_PATH:'.wrangler/dev-registry',MINIFLARE_REGISTRY_PATH:'.wrangler/registry'};
const d1=(args,capture=false)=>spawnSync(process.execPath,[wrangler,'d1','execute','DB','--local','--persist-to','.wrangler/state',...args],{cwd:root,env,stdio:capture?['ignore','pipe','pipe']:'inherit',encoding:'utf8'});

// 檢查本機是否已有 00-projects.sql 內的建案（讀出檔內所有 id 後查詢）。
function existingProjectCount(file){
 const ids=[...readFileSync(file,'utf8').matchAll(/INSERT OR REPLACE INTO projects \(id,data,status,updated_at\) VALUES \('([^']+)'/g)].map(m=>m[1]);
 if(!ids.length)return {ids,count:0};
 const r=d1(['--json','--command',`SELECT COUNT(*) AS n FROM projects WHERE id IN (${ids.map(i=>`'${i.replaceAll("'","''")}'`).join(',')})`],true);
 if(r.error)throw r.error;
 if(r.status!==0){console.error(r.stderr||r.stdout);throw Error('無法讀取本機 projects 資料表。請先執行 pnpm setup:local 再重試。');}
 try{const out=JSON.parse(r.stdout);return {ids,count:Number(out?.[0]?.results?.[0]?.n??0)}}
 catch{throw Error('無法解析 wrangler 輸出，為避免覆蓋建案資料已停止。可加 --reset-projects 強制執行。')}
}

const files=readdirSync('seed').filter(f=>f.endsWith('.sql')).sort();
if(!files.length){console.log('seed/ 內沒有 .sql 檔');process.exit(0)}
for(const f of files){
 const file='seed/'+f;
 if(f==='00-projects.sql'&&!resetProjects){
  const {ids,count}=existingProjectCount(file);
  if(count>0){console.log(`略過 ${file}：本機已有其中 ${count}／${ids.length} 個建案，不覆蓋（要還原成檔案內容請加 --reset-projects）`);continue}
 }
 console.log(`\n▶ 載入 ${file}`);
 const r=d1(['--file',file]);
 if(r.error)throw r.error;
 if(r.status!==0){console.error(`✗ ${file} 失敗。若訊息為 no such table，請先執行 pnpm setup:local。`);process.exit(r.status||1)}
}
console.log('\n種子資料載入完成。執行 pnpm dev 後到 /admin 查看「洽詢名單」與預約資料。');
