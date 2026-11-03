// 本機初始化：建立 .dev.vars（本機密鑰與管理者密碼雜湊）並在 .wrangler/state 建立本機 D1 資料表。
// 不會覆蓋既有密鑰，也不會連線到正式環境。
import {existsSync,writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {randomBytes,createHmac,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
if(!existsSync('node_modules/wrangler/bin/wrangler.js'))throw Error('請先執行 pnpm install --frozen-lockfile');
if(!existsSync('.dev.vars')){
 const pepper=randomBytes(32).toString('hex'),salt=randomBytes(16);
 const input=createHmac('sha256',pepper).update(process.env.DUA_LOCAL_PASSWORD||'admin12345').digest();
 const hash=`pbkdf2-hmac-v1:${salt.toString('hex')}:${pbkdf2Sync(input,salt,100000,32,'sha256').toString('hex')}`;
 const vars={DUA_AUTH_PEPPER:pepper,DUA_INITIAL_PASSWORD_HASH:hash,DUA_ADMIN_USERNAME:'admin',DUA_RESET_EMAIL:'zhuli705098@gmail.com',DUA_SITE_ORIGIN:'http://localhost:5173'};
 writeFileSync('.dev.vars',Object.entries(vars).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n',{mode:0o600,flag:'wx'});
 console.log('已建立獨立的本機管理者設定（未輸出密鑰）');
}else console.log('保留現有 .dev.vars，不變更密碼或密鑰');
mkdirSync('.wrangler/tmp',{recursive:true});
const schemaFile='.wrangler/tmp/local-schema.sql';
const schema=readFileSync('drizzle/0000_glorious_spencer_smythe.sql','utf8').replaceAll('CREATE TABLE ','CREATE TABLE IF NOT EXISTS ').replaceAll('CREATE INDEX ','CREATE INDEX IF NOT EXISTS ');
writeFileSync(schemaFile,schema);
const env={...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false',WRANGLER_WRITE_LOGS:'false',WRANGLER_LOG_PATH:'.wrangler/logs',WRANGLER_REGISTRY_PATH:'.wrangler/dev-registry',MINIFLARE_REGISTRY_PATH:'.wrangler/registry'};
const result=spawnSync(process.execPath,['./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/state','--file',schemaFile],{cwd:root,stdio:'inherit',env});
if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
console.log('本機資料庫已準備完成。接著執行 pnpm dev，開啟 http://localhost:5173 ；後台路徑 /admin/login。');
