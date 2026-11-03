import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE settings (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
function statement(query,args=[]){
 return {
  bind(...values){return statement(query,values)},
  async first(){return sql.prepare(query).get(...args)||null},
  async run(){const result=sql.prepare(query).run(...args);return {meta:{changes:Number(result.changes)}}}
 };
}
const db={prepare:statement,async batch(queries){sql.exec('BEGIN');try{const results=[];for(const q of queries)results.push(await q.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
let cookie='';const env={DUA_AUTH_PEPPER:'test-only-pepper',DUA_ADMIN_USERNAME:'admin',DUA_RESET_EMAIL:'test@example.com'};
globalThis.__test={env,database:()=>db,cookies:async()=>({get(){return cookie?{value:cookie}:undefined}})};
function source(path,replace=[]){let text=fs.readFileSync(path,'utf8');for(const [a,b] of replace)text=text.replace(a,b);return 'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64')}
const passwordUrl=source('lib/password.ts');const password=await import(passwordUrl);env.DUA_INITIAL_PASSWORD_HASH=await password.hashPassword('admin12345',env.DUA_AUTH_PEPPER);
assert.equal(await password.verifyPassword('bad',env.DUA_INITIAL_PASSWORD_HASH,env.DUA_AUTH_PEPPER),false);assert.equal(await password.verifyPassword('admin12345',env.DUA_INITIAL_PASSWORD_HASH,env.DUA_AUTH_PEPPER),true);assert.equal(await password.verifyPassword('admin12345',env.DUA_INITIAL_PASSWORD_HASH,'wrong-pepper'),false);
const accountUrl=source('lib/account-auth.ts',[["import {env} from 'cloudflare:workers';","const env=globalThis.__test.env;"],["import {cookies} from 'next/headers';","const cookies=globalThis.__test.cookies;"],["import {database} from './storage';","const database=globalThis.__test.database;"],["from './password'",`from '${passwordUrl}'`]]);const account=await import(accountUrl);
const apiUrl=source('lib/api.ts',[["console.error(error instanceof Error?error.name:'Request failed');","globalThis.__test.error=error;"],["import {isAdmin} from './admin-auth';",`import {currentAccount} from '${accountUrl}';const isAdmin=async()=>!!await currentAccount();`]]);const api=await import(apiUrl);
const routeUrl=source('app/api/auth/[action]/route.ts',[["from 'zod'",`from '${new URL('../node_modules/zod/lib/index.mjs',import.meta.url).href}'`],["import {database} from '@/lib/storage';","const database=globalThis.__test.database;"],["from '@/lib/api'",`from '${apiUrl}'`],["from '@/lib/account-auth'",`from '${accountUrl}'`],["from '@/lib/password'",`from '${passwordUrl}'`]]);
// Resolve installed Zod entry through Node, preserving the package's actual version.
const routeCode=Buffer.from(routeUrl.split(',')[1],'base64').toString().replace(new URL('../node_modules/zod/lib/index.mjs',import.meta.url).href,import.meta.resolve('zod'));
const route=await import('data:text/javascript;base64,'+Buffer.from(routeCode).toString('base64'));
async function send(action,body,origin='https://dua.test'){const req=new Request('https://dua.test/api/auth/'+action,{method:'POST',headers:{origin,'content-type':'application/json','cf-connecting-ip':'test-ip'},body:JSON.stringify(body)});const response=await route.POST(req,{params:Promise.resolve({action})});if(response.status===503&&globalThis.__test.error)console.log('Auth test failure:',globalThis.__test.error.message);return response}
assert.equal((await api.authorize(new Request('https://dua.test/api/admin/projects'))).status,401);
assert.equal((await send('login',{username:'admin',password:'bad'})).status,401);
assert.equal((await send('login',{username:'other',password:'admin12345'})).status,401);
assert.equal((await send('login',{username:'admin',password:'admin12345'},'https://evil.test')).status,403);
let response=await send('login',{username:'admin',password:'admin12345'});assert.equal(response.status,200);const header=response.headers.get('set-cookie');assert.match(header,/HttpOnly/);assert.match(header,/Secure/);assert.match(header,/SameSite=Strict/);cookie=header.split(';')[0].split('=')[1];assert.equal((await account.currentAccount()).username,'admin');assert.equal(await api.authorize(new Request('https://dua.test/api/admin/projects')),null);
assert.equal((await api.authorize(new Request('https://dua.test/api/admin/projects',{method:'POST',headers:{origin:'https://evil.test'}}))).status,403);
assert.equal((await send('change',{current:'bad',password:'newpassword12345'})).status,400);
assert.equal((await send('change',{current:'admin12345',password:'newpassword12345'})).status,200);assert.equal(await account.currentAccount(),null);assert.equal((await send('login',{username:'admin',password:'admin12345'})).status,401);
assert.equal((await send('forgot',{email:'test@example.com'})).status,503);
const latest=await account.getAccount();const token=password.randomToken();sql.prepare("INSERT INTO settings (key,value) VALUES ('auth:reset',?)").run(JSON.stringify({hash:await password.tokenHash(token),version:latest.version,expires:Date.now()+60000}));
assert.equal((await send('reset',{token:'0'.repeat(64),password:'resetpassword12345'})).status,400);assert.equal((await send('reset',{token,password:'resetpassword12345'})).status,200);assert.equal((await send('reset',{token,password:'resetpassword12345'})).status,400);
response=await send('login',{username:'admin',password:'resetpassword12345'});assert.equal(response.status,200);cookie=response.headers.get('set-cookie').split(';')[0].split('=')[1];assert.equal((await send('logout',{})).status,200);assert.equal(await account.currentAccount(),null);
const active=await account.getAccount();assert.equal(account.sessionValid({username:'admin',version:active.version,expires:Date.now()-1},active),false);assert.equal(account.sessionValid({username:'admin',version:'stale',expires:Date.now()+60000},active),false);
let limited=false;for(let i=0;i<22;i++)if(!await account.rateLimit(new Request('https://dua.test',{headers:{'cf-connecting-ip':'rate-test'}}),'check'))limited=true;assert.equal(limited,true);
console.log('Account auth integration tests passed: hashing, login, CSRF, session expiry, password change, reset single-use, logout, rate limit, mail not configured.');
