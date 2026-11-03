// 第 4 批：後台建案「逐步建立／編輯」精靈的步驟定義與每步驗證。
// 驗證完全沿用 lib/project-schema.ts 的 projectSchema（與 /api/admin/projects 相同規則），
// 只是依欄位歸屬把錯誤分到各步驟；另外加上精靈本身的必填欄位與刊登前條件（與 API 一致）。
import {projectSchema} from './project-schema';
import type {Project} from './model';

export type WizardStep={id:string;label:string;hint:string;/** 這一步要顯示的編輯面板（app/admin/ui.tsx 的 panels key） */panels:string[];/** 這一步負責驗證的 Project 欄位 */fields:(keyof Project)[];/** 按「下一步」前必填 */required?:(keyof Project)[]};

export const wizardSteps:WizardStep[]=[
 {id:'basic',label:'基本資料',hint:'案名、地區、房型坪數、價格與基本資料欄位',panels:['basic'],fields:['id','name','builder','city','district','rooms','area','stage','type','sales','slogan','feature','description','price','facts','roomTypes'],required:['name','city','district']},
 {id:'media',label:'照片與格局',hint:'封面與輪播照片、各戶別格局',panels:['images'],fields:['photos','plans']},
 {id:'surrounding',label:'周邊機能',hint:'周邊機能、生活分類、位置與聯絡方式',panels:['surrounding','location'],fields:['surroundings','lifestyles','address','reception','map','receptionMap','phone','mapEmbed','facebook','hours']},
 {id:'content',label:'內容區塊',hint:'建案優勢、常見問題、自訂段落',panels:['advantages','faq','blocks'],fields:['advantages','faq','contentBlocks']},
 {id:'template',label:'版型選擇',hint:'詳細頁模板、段落排序與顯示',panels:['layout'],fields:['template','sections']},
 {id:'publish',label:'預覽與發佈',hint:'搜尋資訊、資料來源、預覽後刊登',panels:['geo'],fields:['seoTitle','seoDescription','source','verifiedOn','status','sheet','email','contact','publishedAt','updatedAt']},
];

export const fieldLabels:Partial<Record<keyof Project,string>>={id:'建案編號',name:'案名',builder:'建商',city:'縣市',district:'行政區',rooms:'房型',area:'全案坪數',stage:'建案階段',type:'建築類型',sales:'銷售狀態',slogan:'標語',feature:'特色介紹',description:'建案介紹',price:'價格',facts:'基本資料欄位',roomTypes:'房型分類',photos:'照片',plans:'格局資料',surroundings:'周邊機能',lifestyles:'生活分類',address:'基地位置',reception:'接待會館位置',map:'基地導航連結',receptionMap:'接待中心導航連結',phone:'電話諮詢號碼',mapEmbed:'Google 地圖嵌入網址',facebook:'建案 Facebook 網址',hours:'服務時間',advantages:'建案優勢',faq:'常見問題',contentBlocks:'新增段落',template:'詳細頁模板',sections:'段落排序與顯示',seoTitle:'搜尋標題',seoDescription:'搜尋摘要',source:'資料來源',verifiedOn:'資料確認日期',status:'刊登狀態',sheet:'本案 Google Sheets 網址',email:'通知 Email',contact:'銷售窗口名稱',publishedAt:'刊登日期',updatedAt:'更新時間'};

export type WizardError={field:string;message:string};
const label=(f:string)=>fieldLabels[f as keyof Project]||f;
const blank=(v:unknown)=>v===undefined||v===null||(typeof v==='string'&&!v.trim())||(Array.isArray(v)&&!v.length);

/** 依 projectSchema 檢查整筆資料，回傳 欄位 → 錯誤 清單（每個欄位只留第一個錯誤）。 */
function schemaErrors(project:Project):WizardError[]{
 const parsed=projectSchema.safeParse({...project,updatedAt:project.updatedAt||''});
 if(parsed.success)return [];
 const seen=new Set<string>(),out:WizardError[]=[];
 for(const issue of parsed.error.issues){const field=String(issue.path[0]??'');if(seen.has(field))continue;seen.add(field);
  const detail=issue.path.length>1?`第 ${Number(issue.path[1])+1||issue.path[1]} 項`:'';
  out.push({field,message:issue.code==='too_small'&&issue.path.length===1&&typeof (project as any)[field]==='string'?`請填寫${label(field)}`:`${label(field)}${detail?'（'+detail+'）':''}格式或長度不符，請檢查。`})}
 return out;
}

/** 單一步驟的驗證：必填＋該步驟負責欄位的 schema 錯誤。最後一步也收「不屬於任何步驟」的欄位錯誤。 */
export function validateStep(project:Project,index:number):WizardError[]{
 const step=wizardSteps[index];if(!step)return [];
 const owned=new Set<string>(step.fields as string[]);
 if(index===wizardSteps.length-1){const all=new Set(wizardSteps.flatMap(s=>s.fields as string[]));for(const e of schemaErrors(project))if(!all.has(e.field))owned.add(e.field)}
 const errors:WizardError[]=[];
 for(const f of step.required||[])if(blank(project[f]))errors.push({field:f,message:`請填寫${label(f)}`});
 for(const e of schemaErrors(project))if(owned.has(e.field)&&!errors.some(x=>x.field===e.field))errors.push(e);
 return errors;
}

/** 第一個有錯誤的步驟（全部通過回傳 -1）。checkRequired=false 時只看 schema（儲存草稿用）。 */
export function firstInvalidStep(project:Project,checkRequired=true):number{
 if(checkRequired){for(let i=0;i<wizardSteps.length;i++)if(validateStep(project,i).length)return i;return -1}
 const fields=schemaErrors(project).map(e=>e.field);if(!fields.length)return -1;
 const i=wizardSteps.findIndex(s=>fields.some(f=>(s.fields as string[]).includes(f)));
 return i<0?wizardSteps.length-1:i;
}

/** 刊登前條件（與 API 相同：縣市、行政區、至少一張照片）。 */
export function publishErrors(project:Project):WizardError[]{
 const errors:WizardError[]=[];
 if(blank(project.city))errors.push({field:'city',message:'刊登前請填寫縣市'});
 if(blank(project.district))errors.push({field:'district',message:'刊登前請填寫行政區'});
 if(!project.photos.length)errors.push({field:'photos',message:'刊登前請新增至少一張照片'});
 return errors;
}
