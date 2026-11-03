import {ViewTracker} from './view-tracker';
import {visibleBasicFacts} from '@/lib/basic-facts';
import {ProjectVisit} from './project-visit';
import {Advantages} from './project-motion';
import {Fragment} from 'react';
import type {Project,Settings} from '@/lib/model';
import {DetailNavigation,MobileBooking} from './detail-navigation';
import {Header,Footer} from './site';
import {DetailGallery,PlanGallery} from './detail-gallery';
import {DistrictMap} from './district-map';
import {ProjectBlocks} from './project-blocks';

// 詳細頁模板（lib/project-templates.ts）：classic 經典／gallery 圖像／compact 簡約。
// 三個模板共用同一份結構與互動元件，只以 .pd-<template> 的樣式（styles/project-detail.css）改變呈現。
// 這裡刻意不 import lib/project-templates（tests/clean-detail.mjs 以替身模組執行本檔），沿用相同的預設規則。
const templateOf=(value:unknown)=>value==='gallery'||value==='compact'?value:'classic';
const kickers:Record<string,string>={plan:'FLOOR PLAN',surrounding:'NEIGHBORHOOD',location:'LOCATION'};

function OpeningChips({project:p}:{project:Project}){
 const region=[p.city,p.district].filter(Boolean).join('・');
 const rooms=p.roomTypes?.length?p.roomTypes:(p.rooms.match(/^\d(?:\+\d)?房/)?.slice(0,1)||[]);
 const price=p.price&&(p.price.min||p.price.max)?'總價 '+[p.price.min,p.price.max].filter((v,i,a)=>v&&a.indexOf(v)===i).map(v=>Number(v).toLocaleString('zh-TW')).join('–')+' 萬':'';
 const chips=[...(region?[['region',region]]:[]),...rooms.map(r=>['rooms',r]),...(p.type?[['type',p.type]]:[]),...(price?[['budget',price]]:[]),...(p.lifestyles||[]).map(l=>['life',l])];
 if(!chips.length)return null;
 return <ul className="pd-chips" aria-label="建案標籤">{chips.map(([kind,label],i)=><li key={kind+i} data-kind={kind}>{label}</li>)}</ul>;
}

export function ProjectDetail({project:p,settings:s,preview=false}:{project:Project;settings:Settings;preview?:boolean}){
 const template=templateOf(p.template);
 const visible=(key:string)=>p.sections.some(x=>x.key===key&&x.visible);
 const booking=visible('appointment');
 const labels:Record<string,string>={basic:'基本資料',plan:'格局',surrounding:'周邊機能',location:'位置',faq:'常見問題',appointment:'預約賞屋'};
 // The overview is integrated into the opening; its extra blocks remain attached to it.
 for(const section of p.sections)if(section.label?.trim())labels[section.key]=section.label.trim();
 const keys=p.sections.filter(x=>x.visible&&['basic','plan','surrounding','location'].includes(x.key)).map(x=>x.key);
 if(!keys.includes('location')&&(booking||visible('faq')))keys.push('location');
 const orderedKeys=['basic',...keys.filter(key=>key!=='basic')].filter(key=>keys.includes(key));
 const jsonld={'@context':'https://schema.org','@type':'ApartmentComplex',name:p.name,address:{'@type':'PostalAddress',addressLocality:p.city+p.district,streetAddress:p.address,addressCountry:'TW'},description:[p.description,p.slogan,p.feature,p.rooms,p.area].filter(Boolean).join('；')};
 return <><Header compact/><main id="project-top" data-template={template} className={'project-detail pd-'+template+(booking?' has-booking':'')}>
 <header className={'pd-opening'+(p.photos.length?' has-photos':' no-photos')}>
  <div className="pd-opening-bar"><a href="/projects">← 返回建案列表</a>{booking&&<a href="#appointment">預約賞屋 ↗</a>}</div>
  <div className="pd-opening-title"><span className="pd-eyebrow">DUA+ ／ PROJECT GUIDE</span><h1>{p.name}</h1>{p.slogan&&<p className="pd-slogan">{p.slogan}</p>}<OpeningChips project={p}/></div>
  {p.photos.length>0&&<div className="pd-opening-photo"><DetailGallery photos={p.photos} label={p.name+'建案照片'} hero fullBleed/></div>}
 </header>
 {!preview&&<ViewTracker projectId={p.id}/>}<DetailNavigation items={orderedKeys.map(key=>({key,label:labels[key]}))}/>
 <div className="pd-body">
 {orderedKeys.map((key,index)=><Fragment key={key}><section id={key} className={'pd-chapter pd-chapter--'+key+' detail-section'}><div className="pd-chapter-inner">
 {key==='basic'?<div className="pd-summary"><div className="pd-summary-copy"><p className="pd-eyebrow">ABOUT THE RESIDENCE</p><h2>{p.sections.find(section=>section.key==='basic')?.label?.trim()||p.feature||'建案資訊'}</h2>{p.description&&<p className="text-block">{p.description}</p>}<dl className="pd-facts">{visibleBasicFacts(p).map(fact=><div key={fact.id} className={fact.fullWidth?'fact-full':undefined}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>{(p.source||p.verifiedOn)&&<div className="pd-source">{p.source&&<p>資料來源：{p.source}</p>}{p.verifiedOn&&<p>資料確認日期：{p.verifiedOn}</p>}</div>}</div><div className="pd-summary-map"><DistrictMap city={p.city} district={p.district}/></div></div>:<><div className="pd-heading"><span className="pd-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><p className="pd-kicker">{kickers[key]}</p><h2>{labels[key]}</h2></div></div>
 {p.sections.find(section=>section.key===key)?.mode==='blocks'?null:key==='plan'?<PlanGallery plans={p.plans}/>:key==='surrounding'?<div className={'pd-neighborhood count-'+Math.min(p.surroundings.length,3)}>{p.surroundings.length?p.surroundings.map((item,i)=><article className={'pd-life'+(i%2?' reverse':'')+(item.photos.length?'':' text-only')} key={i}>{item.photos.length>0&&<div className="pd-life-visual"><DetailGallery photos={item.photos} label={item.title+'照片'}/></div>}<div className="pd-life-copy"><span className="pd-kicker">LIFE SCENE ／ {String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3><p className="text-block">{item.text}</p></div></article>):<p className="pd-empty">周邊機能資料待補。</p>}</div>:<><ProjectVisit project={p} showLocation={visible('location')} showBooking={booking} bookingLabel={labels.appointment} preview={preview}/>{visible('faq')&&<div className="pd-faq"><h3>{labels.faq}</h3>{p.faq.length?p.faq.map((f,i)=><details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>):<p className="pd-empty">常見問題待補。</p>}</div>}</>}
 </>}
 </div></section><ProjectBlocks blocks={p.contentBlocks||[]} chapter={key}/>{key==='basic'&&<Advantages items={p.advantages||[]}/>}</Fragment>)}
 </div>{!preview&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,'\\u003c')}}/>}</main><Footer settings={s}/>{booking&&<MobileBooking/>}</>
}
