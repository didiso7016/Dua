'use client';
/**
 * 首頁「開始找房」Q&A（HomeFinder）與建案橫向輪播（HomeProjectRail）。樣式：styles/home.css（.hf-*、.dua-rail*）。
 * 題目順序：地區 → 預算 → 房型 → 類型 → 生活需求；選項顏色 region=sky、budget=yellow、rooms=grass、type=orange、life=pink。
 * 條件會用 rememberFilters 記住，回訪時顯示 WELCOME BACK；結果網址一律由 searchQuery 產生（/projects 共用）。
 */
import {useEffect,useRef,useState} from 'react';
import type {BudgetRange} from '@/lib/model';
import {searchQuery,emptyFilters,lifeOptions,type DiscoveryProject,type SearchFilters} from '@/lib/discovery';
import {roomCategories} from '@/lib/floor-plans';
import {ProjectCard} from './site';
import {rememberFilters,recalledFilters} from '@/lib/discovery-memory';

export function HomeProjectRail({projects,label='最新刊登建案'}:{projects:DiscoveryProject[];label?:string}){
 const ref=useRef<HTMLDivElement>(null),[index,setIndex]=useState(0);
 const go=(next:number)=>{const track=ref.current;if(!track)return;const cards=[...track.children] as HTMLElement[];const target=Math.max(0,Math.min(next,cards.length-1));track.scrollTo({left:cards[target].offsetLeft-cards[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 const onScroll=()=>{const el=ref.current;if(!el?.children.length)return;const cards=[...el.children] as HTMLElement[];const nearest=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-cards[0].offsetLeft-el.scrollLeft)<Math.abs(cards[best].offsetLeft-cards[0].offsetLeft-el.scrollLeft)?i:best,0);setIndex(nearest)};
 return <div className="dua-rail" role="region" aria-label={label}>
  <div ref={ref} className="dua-rail__track" onScroll={onScroll}>{projects.map(p=><div className="dua-rail__item" key={p.id}><ProjectCard project={p}/></div>)}</div>
  {projects.length>1&&<div className="dua-rail__controls"><button type="button" className="dua-rail__arrow" aria-label={label+'上一個'} disabled={index===0} onClick={()=>go(index-1)}>←</button><span className="dua-rail__count" aria-live="polite">{String(index+1).padStart(2,'0')}／{String(projects.length).padStart(2,'0')}</span><button type="button" className="dua-rail__arrow" aria-label={label+'下一個'} disabled={index===projects.length-1} onClick={()=>go(index+1)}>→</button></div>}
  {!projects.length&&<p className="dua-rail__empty">新的建案準備中，歡迎稍後再來看看。</p>}
 </div>
}

type Kind='region'|'budget'|'rooms'|'type'|'life';
const questions:{kind:Kind;label:string;lead:string;ask:string;hint:string}[]=[
 {kind:'region',label:'地區',lead:'你想住在',ask:'哪裡？',hint:'選擇縣市與行政區，也可以先不限地區。'},
 {kind:'budget',label:'預算',lead:'這次買房',ask:'預算多少？',hint:'購屋總價以萬元計；車位另計時仍須加計費用。'},
 {kind:'rooms',label:'房型',lead:'理想的新家',ask:'需要幾房？',hint:'可以複選，也可以先不限房型。'},
 {kind:'type',label:'類型',lead:'喜歡哪一種',ask:'住宅類型？',hint:'選擇大樓、透天，或先不設限。'},
 {kind:'life',label:'生活需求',lead:'生活裡最在意',ask:'哪一件事？',hint:'選一個最重視的生活機能，也可以先不限。'}
];
const total=questions.length,pad=(n:number)=>String(n).padStart(2,'0');
const answered=(f:SearchFilters,i:number)=>[!!(f.city||f.district),!!f.budget,f.rooms.length>0,!!f.type,!!f.life][i];

/** 已選條件（含分類，用來上色）。 */
function summaryOf(f:SearchFilters,budgets:BudgetRange[]){
 return [{kind:'region',label:f.city},{kind:'region',label:f.district},{kind:'budget',label:budgets.find(b=>b.id===f.budget)?.label},...f.rooms.map(r=>({kind:'rooms',label:r})),{kind:'type',label:f.type},{kind:'life',label:f.life}].filter((s):s is {kind:Kind;label:string}=>!!s.label);
}
function Summary({items,label='已選條件'}:{items:{kind:Kind;label:string}[];label?:string}){
 return <ul className="hf-summary" aria-label={label}>{items.length?items.map(s=><li key={s.kind+s.label} data-kind={s.kind}>{s.label}</li>):<li data-kind="none">不限條件・看看所有可能</li>}</ul>
}

export function HomeFinder({projects,budgets}:{projects:DiscoveryProject[];budgets:BudgetRange[]}){
 const [step,setStep]=useState(0),[filters,setFilters]=useState({...emptyFilters}),[returning,setReturning]=useState(false),[touched,setTouched]=useState<number[]>([]);
 const title=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{const saved=recalledFilters(budgets);if(saved){setFilters(saved);setReturning(true)}},[budgets]);
 const patch=(v:Partial<SearchFilters>)=>{const next={...filters,...v};setFilters(next);rememberFilters(next);if(!touched.includes(step))setTouched([...touched,step])};
 const go=(next:number)=>{setStep(next);requestAnimationFrame(()=>title.current?.focus({preventScroll:true}))};
 const openResults=()=>{rememberFilters(filters);location.assign('/projects'+(searchQuery(filters)?'?'+searchQuery(filters):'?all=1'))};
 const reset=()=>{setFilters({...emptyFilters});rememberFilters({...emptyFilters});setTouched([]);go(0)};
 const cities=[...new Set(projects.map(p=>p.city))].sort(),districts=[...new Set(projects.filter(p=>!filters.city||p.city===filters.city).map(p=>p.district))].sort();
 const summary=summaryOf(filters,budgets),q=questions[step],last=step===total-1;
 // 角色表情：還沒作答 (•_•)?；選了具體條件 (^ᴗ^)；選了「不限」(・ω・)b
 const mood=!touched.includes(step)?'(•_•)?':answered(filters,step)?'(^ᴗ^)':'(・ω・)b';
 const chip=(kind:Kind,label:string,pressed:boolean,onClick:()=>void,key=label)=><button type="button" key={key} className={'dua-option dua-option--'+kind} aria-pressed={pressed} onClick={onClick}>{label}</button>;
 const skip:Partial<SearchFilters>[]=[{city:'',district:''},{budget:''},{rooms:[]},{type:''},{life:''}];

 if(returning)return <section className="hf" id="home-finder" aria-labelledby="hf-title">
  <div className="hf__inner"><FinderHeading/>
   <div className="hf-card hf-card--resume">
    <img className="hf-resume__char" src="/assets/duo.png" alt="" width={120} height={150} decoding="async"/>
    <span className="hf-eyebrow" lang="en">WELCOME BACK</span>
    <h3 className="hf-resume__title">接著找<strong>你的下一個家</strong></h3>
    <p className="hf-resume__lead">上次的找房方向已為你保留 <span aria-hidden="true">(^ᴗ^)/</span></p>
    <Summary items={summary} label="上次的找房條件"/>
    <div className="hf-actions"><button type="button" className="dua-btn dua-btn--primary" onClick={openResults}>繼續看建案 ↗</button><button type="button" className="dua-btn dua-btn--text" onClick={()=>{setReturning(false);go(0)}}>修改條件 →</button></div>
   </div>
  </div>
 </section>;

 return <section className="hf" id="home-finder" aria-labelledby="hf-title">
  <div className="hf__inner"><FinderHeading/>
   <div className="hf-card" data-kind={q.kind}>
    <div className="hf-top">
     <span className="hf-step" lang="en">{pad(step+1)}<small>／{pad(total)}</small></span>
     <ol className="hf-progress" aria-label={'第 '+(step+1)+' 步，共 '+total+' 步'}>{questions.map((x,i)=><li key={x.kind} data-kind={x.kind} className={'hf-dot'+(i<step||touched.includes(i)?' is-filled':'')+(i===step?' is-current':'')} aria-current={i===step?'step':undefined}><span className="hf-dot__num" lang="en">{i+1}</span><span className="hf-dot__label">{x.label}</span></li>)}</ol>
    </div>
    <div className="hf-question" key={step}>
     <div className="hf-conversation">
      <img className="hf-char" src="/assets/duo.png" alt="DUA+ 角色陪你找家" width={98} height={128} decoding="async"/>
      <div className="hf-speech">
       <span className="hf-kaomoji" key={mood} aria-hidden="true">{mood}</span>
       <h3 ref={title} tabIndex={-1} className="hf-ask"><span>{q.lead}</span><strong>{q.ask}</strong></h3>
       <p className="hf-hint">{q.hint}</p>
      </div>
     </div>
     <div className="hf-choices">{step===0?<div className="hf-location">
       <label className="dua-select" data-filled={!!filters.city||undefined}><span>縣市</span><select value={filters.city} onChange={e=>patch({city:e.target.value,district:''})}><option value="">不限縣市</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label>
       <label className="dua-select" data-filled={!!filters.district||undefined}><span>行政區</span><select value={filters.district} onChange={e=>patch({district:e.target.value})}><option value="">不限行政區</option>{districts.map(d=><option key={d}>{d}</option>)}</select></label>
      </div>
      :step===1?<div className="hf-chips">{chip('budget','預算不限',!filters.budget,()=>patch({budget:''}),'__all')}{budgets.map(b=>chip('budget',b.label,filters.budget===b.id,()=>patch({budget:b.id}),b.id))}</div>
      :step===2?<div className="hf-chips">{chip('rooms','房型不限',!filters.rooms.length,()=>patch({rooms:[]}),'__all')}{roomCategories.map(r=>chip('rooms',r,filters.rooms.includes(r),()=>patch({rooms:filters.rooms.includes(r)?filters.rooms.filter(v=>v!==r):[...filters.rooms,r]})))}</div>
      :step===3?<div className="hf-types">{['','大樓','透天'].map(t=><button type="button" key={t} className="dua-option dua-option--type dua-option--md hf-type" aria-pressed={filters.type===t} onClick={()=>patch({type:t})}><span className="hf-type__icon" aria-hidden="true">{t==='大樓'?'▥':t==='透天'?'⌂':'＋'}</span>{t||'先不設限'}</button>)}</div>
      :<div className="hf-chips">{chip('life','生活不限',!filters.life,()=>patch({life:''}),'__all')}{lifeOptions.map(l=>chip('life',l,filters.life===l,()=>patch({life:l})))}</div>}
     </div>
    </div>
    {summary.length>0&&<Summary items={summary}/>}
    <div className="hf-nav">
     <button type="button" className="dua-btn dua-btn--text" disabled={step===0} onClick={()=>go(step-1)}>← 上一步</button>
     <button type="button" className="dua-btn dua-btn--primary" onClick={()=>last?openResults():go(step+1)}>{last?'查看符合建案':'下一步'} →</button>
    </div>
    <div className="hf-shortcuts">
     <button type="button" className="dua-btn dua-btn--text dua-btn--sm" onClick={openResults}>先看目前結果 ↗</button>
     {!last&&<button type="button" className="dua-btn dua-btn--text dua-btn--sm" onClick={()=>{const next={...filters,...skip[step]};setFilters(next);rememberFilters(next);go(step+1)}}>略過這題 →</button>}
     {summary.length>0&&<button type="button" className="dua-btn dua-btn--text dua-btn--sm hf-reset" onClick={reset}>清除條件重新開始</button>}
    </div>
   </div>
  </div>
 </section>
}

function FinderHeading(){
 return <header className="hs-head hs-head--finder"><div><p className="hs-eyebrow" lang="en">STEP BY STEP</p><h2 id="hf-title" className="hs-title">開始<mark>找房</mark></h2></div><p className="hs-lead">回答 5 個小問題，幫你從生活條件找到合適的新建案。</p></header>
}
