// 第 3 批：建案詳細頁模板（template 欄位、預設值、三種模板都渲染相同段落）。
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import path from 'node:path';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),cache=new Map();const jsx=(type,props)=>({type,props:props||{}});
const mocks={'react':{Fragment:'Fragment'},'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'./detail-navigation':{DetailNavigation:'DetailNavigation',MobileBooking:'MobileBooking'},'./site':{Header:'Header',Footer:'Footer'},'./detail-gallery':{DetailGallery:'DetailGallery',PlanGallery:'PlanGallery'},'./district-map':{DistrictMap:'DistrictMap'},'./project-blocks':{ProjectBlocks:'ProjectBlocks'},'./project-visit':{ProjectVisit:'ProjectVisit'},'./project-motion':{Advantages:'Advantages'},'./view-tracker':{ViewTracker:'ViewTracker'}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,crypto,require:n=>mocks[n]??(n.startsWith('@/')?load(n.slice(2)+'.ts'):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):req(n))});return exports}
const all=(n,p)=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(x=>all(x,p)):[...(p(n)?[n]:[]),...all(n.props?.children,p)];
const {projectTemplateIds,projectTemplates,resolveProjectTemplate}=load('lib/project-templates.ts');
const {sample,defaultSettings}=load('lib/model.ts'),{projectSchema}=load('lib/project-schema.ts');
assert.deepEqual([...projectTemplateIds],['classic','gallery','compact']);assert.equal(projectTemplates.length,3);
assert.equal(resolveProjectTemplate(undefined),'classic');assert.equal(resolveProjectTemplate('bogus'),'classic');assert.equal(resolveProjectTemplate('gallery'),'gallery');
// Schema: optional (legacy data without template stays valid), known values kept, unknown rejected.
assert.equal(projectSchema.parse(sample).template,undefined);
for(const t of projectTemplateIds)assert.equal(projectSchema.parse({...sample,template:t}).template,t);
assert.equal(projectSchema.safeParse({...sample,template:'magazine'}).success,false);
// Every template renders the same sections, galleries, facts, blocks and JSON-LD; only the class changes.
const {ProjectDetail}=load('components/project-detail.tsx');
const shape=tree=>({ids:all(tree,n=>n.type==='section').map(n=>n.props.id),galleries:all(tree,n=>n.type==='DetailGallery').length,plans:all(tree,n=>n.type==='PlanGallery').length,blocks:all(tree,n=>n.type==='ProjectBlocks').map(n=>n.props.chapter),visit:all(tree,n=>n.type==='ProjectVisit').length,facts:all(tree,n=>n.type==='dt').length,ld:all(tree,n=>n.type==='script').length,map:all(tree,n=>n.type==='DistrictMap').length,adv:all(tree,n=>n.type==='Advantages').length});
const project={...sample,photos:[...sample.photos,{url:'/assets/x.jpg',caption:'第二張'}],surroundings:[...sample.surroundings,{title:'無照片',text:'文字',photos:[]},{title:'有照片',text:'',photos:[{url:'/assets/y.jpg',caption:''}]}]};
const main=tree=>all(tree,n=>n.type==='main')[0];
const legacy=ProjectDetail({project,settings:defaultSettings});assert.equal(main(legacy).props['data-template'],'classic');assert.match(main(legacy).props.className,/\bpd-classic\b/);
const base=shape(legacy);assert.deepEqual(base.ids,['basic','plan','surrounding','location']);assert.equal(base.ld,1);assert.equal(base.map,1);assert.equal(base.adv,1);
for(const t of projectTemplateIds){const tree=ProjectDetail({project:{...project,template:t},settings:defaultSettings});assert.equal(main(tree).props['data-template'],t);assert.match(main(tree).props.className,new RegExp('\\bpd-'+t+'\\b'));assert.deepEqual(shape(tree),base,t)}
assert.equal(main(ProjectDetail({project:{...project,template:'unknown'},settings:defaultSettings})).props['data-template'],'classic');
// Preview never emits JSON-LD (unchanged behaviour), whichever template.
assert.equal(shape(ProjectDetail({project:{...project,template:'gallery'},settings:defaultSettings,preview:true})).ld,0);
// Old detail CSS layers are gone and no component still references their class names.
const css=fs.readFileSync('app/globals.css','utf8');for(const c of ['.jp-','.clean-','.apricot-','.polished-'])assert.equal(css.includes(c),false,c+' still in globals.css');
for(const f of ['components/project-detail.tsx','components/detail-gallery.tsx','components/project-visit.tsx','components/project-motion.tsx','components/project-blocks.tsx'])assert.equal(/\b(jp|clean|apricot|polished)-/.test(fs.readFileSync(f,'utf8').replace(/\/\/.*$/gm,'')),false,f);
console.log('Project templates: ids/labels, legacy default classic, schema accept/reject, identical sections/galleries/blocks/JSON-LD across classic/gallery/compact, preview and legacy CSS removal passed');
