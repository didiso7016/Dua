'use client';
// 第 5 批：後台「自訂章節」編輯器。新增、上移／下移（跨章節時自動換到相鄰位置）、編輯標題／文字／圖片、顯示／隱藏、刪除。
// 資料存在專案 JSON 的 customSections（lib/custom-sections.ts），儲存後三個模板都會在對應位置顯示。
import {useState} from 'react';
import type {ReactNode} from 'react';
import type {CustomSection,Photo} from '@/lib/model';
import {customSectionAnchors,customSectionAnchorLabels,blankCustomSection,moveCustomSection,orderCustomSections,customSectionHasContent,CUSTOM_SECTION_MAX} from '@/lib/custom-sections';
import {Checkbox} from '@/components/ui/checkbox';

export function CustomSectionsEditor({sections,onChange,photoList}:{sections:CustomSection[];onChange:(sections:CustomSection[])=>void;photoList:(photos:Photo[],onChange:(photos:Photo[])=>void,max?:number)=>ReactNode}){
 const [after,setAfter]=useState<CustomSection['after']>('location');
 const list=orderCustomSections(sections);
 const patch=(id:string,value:Partial<CustomSection>)=>onChange(list.map(s=>s.id===id?{...s,...value}:s));
 return <section className="panel custom-section-editor">
  <h2>自訂章節</h2>
  <p>每個自訂章節都是獨立的一整段（有自己的標題），三種詳細頁模板都會顯示在指定位置。可用來介紹建材、公設、建商理念等。</p>
  <div className="block-add-controls">
   <label>放在哪個章節之後<select value={after} onChange={e=>setAfter(e.target.value as CustomSection['after'])}>{customSectionAnchors.map(key=><option key={key} value={key}>{customSectionAnchorLabels[key]}之後</option>)}</select></label>
   <button type="button" className="action" disabled={list.length>=CUSTOM_SECTION_MAX} onClick={()=>onChange(orderCustomSections([...list,blankCustomSection(after)]))}>＋ 新增自訂章節</button>
  </div>
  <p className="muted">{list.length}／{CUSTOM_SECTION_MAX} 個。依下方順序顯示；「上移／下移」到章節邊界時會移到相鄰的位置。標題、文字、圖片都沒填，或設為隱藏時，前台不會顯示。</p>
  {!list.length&&<p className="notice">尚未新增自訂章節。</p>}
  {list.map((s,i)=><details className="block-editor-card custom-section-card" key={s.id} open>
   <summary>{i+1}. {s.title||'未命名章節'} <span className="muted">{customSectionAnchorLabels[s.after]}之後 · {s.visible?(customSectionHasContent(s)?'顯示':'內容空白（不顯示）'):'隱藏'}</span></summary>
   <div className="block-editor-body">
    <div className="row">
     <label className="check"><Checkbox checked={s.visible} onCheckedChange={v=>patch(s.id,{visible:v===true})}/><span>在前台顯示此章節</span></label>
     <div className="small-actions">
      <button type="button" disabled={i===0&&s.after===customSectionAnchors[0]} aria-label={'自訂章節 '+(s.title||i+1)+' 上移'} onClick={()=>onChange(moveCustomSection(list,s.id,-1))}>上移</button>
      <button type="button" disabled={i===list.length-1&&s.after===customSectionAnchors[customSectionAnchors.length-1]} aria-label={'自訂章節 '+(s.title||i+1)+' 下移'} onClick={()=>onChange(moveCustomSection(list,s.id,1))}>下移</button>
      <button type="button" onClick={()=>{if(confirm('刪除此自訂章節？儲存後才會更新前台。'))onChange(list.filter(v=>v.id!==s.id))}}>刪除章節</button>
     </div>
    </div>
    <label>位置<select value={s.after} onChange={e=>onChange(orderCustomSections(list.map(v=>v.id===s.id?{...v,after:e.target.value as CustomSection['after']}:v)))}>{customSectionAnchors.map(key=><option key={key} value={key}>{customSectionAnchorLabels[key]}之後</option>)}</select></label>
    <label>章節標題<input value={s.title} maxLength={80} placeholder="例如：建材與設備" onChange={e=>patch(s.id,{title:e.target.value})}/></label>
    <label>章節內容<textarea rows={4} maxLength={10000} value={s.text} onChange={e=>patch(s.id,{text:e.target.value})}/></label>
    <p className="muted">圖片（選填，1 張）。可上傳，或直接填寫網站內的圖片路徑（/assets/…）。</p>
    {photoList(s.image?[{url:s.image,caption:s.caption}]:[],photos=>patch(s.id,{image:photos[0]?.url||'',caption:photos[0]?.caption||''}),1)}
    <label>圖片路徑<input value={s.image} placeholder="/assets/demo/…" onChange={e=>patch(s.id,{image:e.target.value.trim()})}/></label>
   </div>
  </details>)}
 </section>;
}
