// /projects starts fresh from navigation links; saved filters + scroll are restored only on back/forward.
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import ts from 'typescript';
const jsx=(type,props)=>({type,props:props||{}});
let hooks=[],cursor=0,effects=[];
const react={useState(v){const i=cursor++;if(!(i in hooks))hooks[i]=v;return [hooks[i],n=>hooks[i]=typeof n==='function'?n(hooks[i]):n]},useEffect(fn){effects.push(fn)}};
// Browser globals shared by every loaded module (mutated per scenario).
const store=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}};
const env={localStorage:store(),sessionStorage:store(),performance:undefined,location:{pathname:'/projects',search:''},scrolled:null};
const globals={URLSearchParams,Event,console,Date,JSON,
 get localStorage(){return env.localStorage},get sessionStorage(){return env.sessionStorage},get performance(){return env.performance},get location(){return env.location},
 history:{state:null,replaceState(_s,_t,url){const u=new URL(url,'https://example.test');env.location.search=u.search;env.location.pathname=u.pathname}},
 window:{addEventListener(){},removeEventListener(){},dispatchEvent(){},scrollTo(o){env.scrolled=o},get scrollY(){return 0}},
 document:{},requestAnimationFrame:fn=>{fn();return 1},cancelAnimationFrame(){}};
const cache=new Map(),mocks={'react':react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'./discovery-results':{DiscoveryResults:'DiscoveryResults'}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 // Getters must stay live (env is mutated per scenario), so copy them as accessors, not values.
 const sandbox=Object.defineProperties({exports,require:n=>mocks[n]??(n.startsWith('@/')?resolve(n.slice(2)):n.startsWith('.')?resolve(path.relative(process.cwd(),path.resolve(path.dirname(file),n))):(()=>{throw Error('unexpected import '+n)})())},Object.getOwnPropertyDescriptors(globals));
 vm.runInNewContext(code,sandbox);return exports}
function resolve(p){return load(fs.existsSync(p+'.ts')?p+'.ts':p+'.tsx')}

const memory=load('lib/discovery-memory.ts'),{defaultHome,emptyFilters,searchQuery}=load('lib/discovery.ts');
const nav=type=>({getEntriesByType:kind=>kind==='navigation'?[{type}]:[]});

// isHistoryNavigation(): navigate → false, back_forward → true, missing/broken API → false.
env.performance=nav('navigate');assert.equal(memory.isHistoryNavigation(),false);
env.performance=nav('reload');assert.equal(memory.isHistoryNavigation(),false);
env.performance=nav('back_forward');assert.equal(memory.isHistoryNavigation(),true);
env.performance=undefined;assert.equal(memory.isHistoryNavigation(),false);
env.performance={};assert.equal(memory.isHistoryNavigation(),false);
env.performance={getEntriesByType:()=>[]};assert.equal(memory.isHistoryNavigation(),false);
env.performance={getEntriesByType:()=>{throw Error('blocked')}};assert.equal(memory.isHistoryNavigation(),false);

// The header link 找建案 is always plain /projects, even with a saved search.
const budget=defaultHome.budgetRanges[1],savedFilters={...emptyFilters,budget:budget.id},savedQuery=searchQuery(savedFilters);
env.localStorage.setItem('dua-search-v1',savedQuery);
const {ResumeSearchLink}=load('components/resume-search-link.tsx');const link=ResumeSearchLink();
assert.equal(link.type,'a');assert.equal(link.props.href,'/projects');assert.equal(link.props.children,'找建案');
assert.equal(memory.savedSearchHref(),'/projects?'+savedQuery,'saved query is still remembered for other features');
env.localStorage.clear();assert.equal(memory.savedSearchHref(),'/projects');

// ProjectSearch initial sync: render, run effects, re-render (ready) and run effects again.
const {ProjectSearch}=load('components/project-search.tsx');
function mount({search,type,saved,listReturn}){
 hooks=[];env.localStorage.clear();env.sessionStorage.clear();env.scrolled=null;env.location.pathname='/projects';env.location.search=search;env.performance=nav(type);
 if(saved!==undefined)env.localStorage.setItem('dua-search-v1',saved);
 if(listReturn)env.sessionStorage.setItem('dua-list-return',JSON.stringify(listReturn));
 const props={projects:[],budgets:defaultHome.budgetRanges};
 for(let pass=0;pass<2;pass++){cursor=0;effects=[];ProjectSearch(props);for(const fn of effects)fn()}
 return {filters:hooks[0],editing:hooks[3]};
}
const plain=f=>JSON.parse(JSON.stringify(f));
const listReturn={url:'/projects?'+savedQuery,y:640,at:Date.now(),editing:true,unknownOpen:false};

// Fresh entry from a nav link: no recall, no scroll restore, stored return entry discarded.
let r=mount({search:'',type:'navigate',saved:savedQuery,listReturn});
assert.deepEqual(plain(r.filters),plain(emptyFilters));assert.equal(env.scrolled,null);assert.equal(r.editing,false);
assert.equal(env.sessionStorage.getItem('dua-list-return'),null);assert.equal(env.location.search,'?all=1');

// Back/forward to a bare /projects: saved filters and the scroll position come back.
r=mount({search:'',type:'back_forward',saved:savedQuery,listReturn});
assert.deepEqual(plain(r.filters),plain(savedFilters));assert.equal(env.scrolled?.top,640);assert.equal(r.editing,true);

// Back/forward to the rewritten URL also restores the scroll position.
r=mount({search:'?'+savedQuery,type:'back_forward',listReturn});
assert.deepEqual(plain(r.filters),plain(savedFilters));assert.equal(env.scrolled?.top,640);

// An explicit query (e.g. the home Q&A) still applies, without recalling or restoring scroll.
r=mount({search:'?budget='+defaultHome.budgetRanges[2].id,type:'navigate',saved:savedQuery,listReturn});
assert.equal(r.filters.budget,defaultHome.budgetRanges[2].id);assert.equal(env.scrolled,null);
// rememberFilters() keeps saving the current search for other features.
assert.equal(env.localStorage.getItem('dua-search-v1'),'budget='+defaultHome.budgetRanges[2].id);

console.log('Search return: history-navigation detection (navigate/back_forward/missing API), plain /projects nav link, fresh entry vs back/forward recall + scroll restore, explicit query and remembered filters passed');
