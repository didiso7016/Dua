// 第 5 批：自訂章節（custom sections）。存在專案 JSON 的 customSections 欄位（舊資料沒有此欄位 → 視為空陣列，不需資料庫遷移）。
// 與 contentBlocks（掛在章節內的補充段落）不同：自訂章節是獨立的一整個章節，有自己的標題，放在指定主要章節之後。
import {z} from 'zod';
import type {CustomSection} from './model';

export const customSectionAnchors=['basic','plan','surrounding','location'] as const;
export const customSectionAnchorLabels:Record<CustomSection['after'],string>={basic:'基本資料',plan:'格局',surrounding:'周邊機能',location:'位置／預約賞屋'};
export const CUSTOM_SECTION_MAX=12;

const imageUrl=z.string().max(2000).refine(v=>!v||(/^\/(assets|api\/media)\/[a-zA-Z0-9_./%-]+$/.test(v)&&!v.split('/').includes('..')),{message:'圖片網址只能使用網站上傳的圖片'});
export const customSectionSchema=z.object({
 id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
 after:z.enum(customSectionAnchors).default('location'),
 visible:z.boolean().default(true),
 title:z.string().trim().max(80).default(''),
 text:z.string().max(10000).default(''),
 image:imageUrl.default(''),
 caption:z.string().max(300).default(''),
});
export const customSectionsSchema=z.array(customSectionSchema).max(CUSTOM_SECTION_MAX).refine(a=>new Set(a.map(s=>s.id)).size===a.length,{message:'章節編號不可重複'}).default([]);

export function blankCustomSection(after:CustomSection['after']='location',id:string=crypto.randomUUID()):CustomSection{return {id,after,visible:true,title:'',text:'',image:'',caption:''}}

/** Something to show: a title, some text or an image. Hidden or empty sections never render. */
export function customSectionHasContent(s:CustomSection){return !!(s.title.trim()||s.text.trim()||s.image)}

/**
 * Sections to render right after chapter `after`, in admin order. `present` = chapters actually on the page;
 * when the anchor chapter is hidden, its sections are appended after the last present chapter (pass `isLast`).
 */
export function customSectionsAfter(sections:CustomSection[]|undefined,after:string,present:string[],isLast=false){
 return (sections||[]).filter(s=>s.visible&&customSectionHasContent(s)&&(s.after===after||(isLast&&!present.includes(s.after))));
}

/** Admin/render order: grouped by anchor chapter (basic → plan → surrounding → location), admin order inside each group. */
export function orderCustomSections(sections:CustomSection[]){
 const rank=(s:CustomSection)=>customSectionAnchors.indexOf(s.after);
 return sections.map((s,i)=>({s,i})).sort((a,b)=>rank(a.s)-rank(b.s)||a.i-b.i).map(x=>x.s);
}

/**
 * Move one step up/down in the page order. Inside a chapter group it swaps with its neighbour; at a group edge
 * it moves into the adjacent chapter (its `after` changes), so the admin can place a section anywhere with ↑/↓.
 */
export function moveCustomSection(sections:CustomSection[],id:string,direction:-1|1){
 const list=orderCustomSections(sections),i=list.findIndex(s=>s.id===id);
 if(i<0)return sections;
 const item=list[i],neighbour=list[i+direction];
 if(neighbour&&neighbour.after===item.after){const out=[...list];[out[i],out[i+direction]]=[neighbour,item];return out}
 const anchor=customSectionAnchors.indexOf(item.after)+direction;
 if(anchor<0||anchor>=customSectionAnchors.length)return sections;
 const out=[...list];out[i]={...item,after:customSectionAnchors[anchor]};return orderCustomSections(out);
}
