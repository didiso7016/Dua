// 第 5 批：自訂章節 schema／排序、開場動畫每個瀏覽階段只播一次、地圖標籤長度分級、優勢 JSON-LD。
import assert from 'node:assert';/* non-strict: arrays from the vm context have another realm's prototype */import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import path from 'node:path';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,crypto,require:n=>n.startsWith('@/')?load(n.slice(2)+'.ts'):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):req(n)});return exports}

// --- custom sections
const cs=load('lib/custom-sections.ts');const {sample}=load('lib/model.ts');const {projectSchema}=load('lib/project-schema.ts');
assert.deepEqual(projectSchema.parse(sample).customSections,[],'legacy project without customSections stays valid (defaults to [])');
const a=cs.blankCustomSection('basic','a'),b={...cs.blankCustomSection('basic','b'),title:'B'},c={...cs.blankCustomSection('location','c'),text:'文字'};
const ok=projectSchema.safeParse({...sample,customSections:[{...a,title:'A',image:'/assets/demo/land-art.jpg'},b,c]});assert.equal(ok.success,true);
assert.equal(projectSchema.safeParse({...sample,customSections:[a,{...a}]}).success,false,'duplicate ids rejected');
assert.equal(projectSchema.safeParse({...sample,customSections:[{...a,image:'https://evil.example/x.jpg'}]}).success,false,'external image rejected');
assert.equal(projectSchema.safeParse({...sample,customSections:[{...a,image:'/assets/../secret'}]}).success,false,'path traversal rejected');
assert.equal(projectSchema.safeParse({...sample,customSections:[{...a,after:'faq'}]}).success,false,'unknown anchor rejected');
assert.equal(projectSchema.safeParse({...sample,customSections:Array.from({length:cs.CUSTOM_SECTION_MAX+1},(_,i)=>cs.blankCustomSection('basic','s'+i))}).success,false,'max enforced');
// rendering filter: hidden / empty never render; orphaned anchors go after the last chapter
const A={...a,title:'A'},H={...b,visible:false};
assert.deepEqual(cs.customSectionsAfter([A,H,a],'basic',['basic','plan']).map(s=>s.id),['a']);
assert.deepEqual(cs.customSectionsAfter([c],'plan',['basic','plan'],true).map(s=>s.id),['c'],'location hidden → appended after last chapter');
assert.deepEqual(cs.customSectionsAfter([c],'plan',['basic','plan','location'],false).length,0);
// ordering / moving across chapter groups
const list=[c,A,b];assert.deepEqual(cs.orderCustomSections(list).map(s=>s.id),['a','b','c']);
assert.deepEqual(cs.moveCustomSection(list,'b',-1).map(s=>s.id),['b','a','c'],'swap within group');
const moved=cs.moveCustomSection(list,'b',1);assert.equal(moved.find(s=>s.id==='b').after,'plan','crosses into next chapter at the group edge');
assert.equal(cs.moveCustomSection(list,'a',-1),list,'first item at first chapter cannot move up');
assert.equal(cs.moveCustomSection(list,'c',1),list,'last item at last chapter cannot move down');

// --- intro once per session
const intro=load('lib/intro.ts');const mem=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))}};
const store=mem();assert.equal(intro.introAlreadyPlayed(store),false);intro.markIntroPlayed(store);assert.equal(intro.introAlreadyPlayed(store),true);
assert.equal(intro.introAlreadyPlayed(mem(),{classList:{contains:c=>c===intro.INTRO_PLAYED_CLASS}}),true,'html class from head script counts');
const broken={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};assert.equal(intro.introAlreadyPlayed(broken),false);assert.doesNotThrow(()=>intro.markIntroPlayed(broken));
assert.equal(intro.isAdminPath('/admin'),true);assert.equal(intro.isAdminPath('/admin-preview/x'),true);assert.equal(intro.isAdminPath('/projects'),false);
// head script: adds the class only when the flag exists
const run=flag=>{const cls=new Set();vm.runInNewContext(intro.INTRO_HEAD_SCRIPT,{sessionStorage:{getItem:k=>k===intro.INTRO_FLAG?flag:null},document:{documentElement:{classList:{add:c=>cls.add(c)}}}});return cls.has(intro.INTRO_PLAYED_CLASS)};
assert.equal(run('1'),true);assert.equal(run(null),false);
// overlay is mounted once in the root layout, not in the Header (so navigation never re-mounts it)
assert.match(fs.readFileSync('app/layout.tsx','utf8'),/<PageLoadingOverlay\/>/);assert.equal(fs.readFileSync('components/site.tsx','utf8').includes('PageLoadingOverlay'),false);
assert.match(fs.readFileSync('styles/page-loading.css','utf8'),/html\.dua-intro-played \.dua-page-loading\s*\{\s*display:\s*none/);

// --- district map label fit
const src=fs.readFileSync('components/district-map.tsx','utf8');const fit=new Function('return '+'('+ts.transpile(src.match(/export function labelFit[\s\S]*?\n/)[0].replace('export ','').trim().replace(/^function labelFit/,'function'),{target:ts.ScriptTarget.ES2022}).trim().replace(/;$/,'')+')')();
assert.equal(fit('西屯區'),'short');assert.equal(fit('七期光之丘（示範）'),'short');assert.equal(fit('鳳山和樂透天（示範）'),'long');assert.equal(fit('這是一個非常非常長的建案名稱（示範）'),'xl');

console.log('Batch 5: custom sections schema/filter/order/move, intro once-per-session + head script + layout mount, map label fit passed');
