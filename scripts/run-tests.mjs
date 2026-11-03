// 依序執行 tests/*.mjs（每個檔案都是獨立的 node 腳本），任何一個失敗就回傳非 0。
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=readdirSync(new URL('../tests/',import.meta.url)).filter(f=>f.endsWith('.mjs')).sort();
let failed=0;
for(const f of files){
 const r=spawnSync(process.execPath,['tests/'+f],{cwd:root,stdio:'inherit'});
 if(r.status!==0){failed++;console.error(`✗ ${f} 失敗 (exit ${r.status})`)}
}
console.log(failed?`${failed}/${files.length} 個測試檔失敗`:`全部 ${files.length} 個測試檔通過`);
process.exit(failed?1:0);
