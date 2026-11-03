import {ViewTracker} from './view-tracker';
import {visibleBasicFacts} from '@/lib/basic-facts';
import {ProjectVisit} from './project-visit';
import {Advantages,DetailMotion} from './project-motion';
import {Fragment} from 'react';
import type {Project,Settings} from '@/lib/model';
import {DetailNavigation,MobileBooking} from './detail-navigation';
import {Header,Footer} from './site';
import {Booking} from './project-interactions';
import {DetailGallery,PlanGallery} from './detail-gallery';
import {DistrictMap} from './district-map';
import {ProjectBlocks} from './project-blocks';
import {mapEmbedUrl} from '@/lib/geo';
export function ProjectDetail({project:p,settings:s,preview=false}:{project:Project;settings:Settings;preview?:boolean}){
 const visible=(key:string)=>p.sections.some(x=>x.key===key&&x.visible);
 const booking=visible('appointment');
 const labels:Record<string,string>={basic:'基本資料',plan:'格局',surrounding:'周邊機能',location:'位置',faq:'常見問題',appointment:'預約賞屋'};
 // The overview is integrated into the opening; its extra blocks remain attached to it.
 for(const section of p.sections)if(section.label?.trim())labels[section.key]=section.label.trim();
 const keys=p.sections.filter(x=>x.visible&&['basic','plan','surrounding','location'].includes(x.key)).map(x=>x.key);
 if(!keys.includes('location')&&(booking||visible('faq')))keys.push('location');
 const orderedKeys=['basic',...keys.filter(key=>key!=='basic')].filter(key=>keys.includes(key));
 const jsonld={'@context':'https://schema.org','@type':'ApartmentComplex',name:p.name,address:{'@type':'PostalAddress',addressLocality:p.city+p.district,streetAddress:p.address,addressCountry:'TW'},description:[p.description,p.slogan,p.feature,p.rooms,p.area].filter(Boolean).join('；')};
 return <><Header compact/><main id="project-top" className={'jp-detail clean-detail apricot-detail polished-detail'+(booking?' has-booking':'')}>
 <header className={'project-opening'+(p.photos.length?' has-photos':'')}><div className="project-opening-top"><a href="/projects">← 返回建案列表</a>{booking&&<a href="#appointment">預約賞屋 ↗</a>}</div><div className="project-opening-title"><div><span>DUA+ ／ PROJECT GUIDE</span><h1>{p.name}</h1></div>{p.slogan&&<p>{p.slogan}</p>}</div>{p.photos.length>0&&<div className="project-opening-photo"><DetailGallery photos={p.photos} label={p.name+'建案照片'} hero fullBleed/></div>}</header>
 {!preview&&<ViewTracker projectId={p.id}/>}<DetailMotion/><DetailNavigation items={orderedKeys.map(key=>({key,label:labels[key]}))}/>
 {orderedKeys.map((key,index)=><Fragment key={key}><section id={key} className={'jp-chapter jp-'+key+' detail-section'}>
 {key==='basic'?<div className="project-summary"><div className="project-summary-copy"><p className="clean-eyebrow">ABOUT THE RESIDENCE</p><h2>{p.sections.find(section=>section.key==='basic')?.label?.trim()||p.feature||'建案資訊'}</h2>{p.description&&<p className="text-block">{p.description}</p>}<dl className="jp-facts">{visibleBasicFacts(p).map(fact=><div key={fact.id} className={fact.fullWidth?'fact-full':undefined}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>{(p.source||p.verifiedOn)&&<div className="muted">{p.source&&<p>資料來源：{p.source}</p>}{p.verifiedOn&&<p>資料確認日期：{p.verifiedOn}</p>}</div>}</div><DistrictMap city={p.city} district={p.district}/></div>:<><div className="jp-heading"><span className="jp-number">{String(index+1).padStart(2,'0')}</span><div><p className="jp-kicker">{({plan:'FLOOR PLAN',surrounding:'NEIGHBORHOOD',location:'LOCATION'} as Record<string,string>)[key]}</p><h2>{labels[key]}</h2></div></div>
 {p.sections.find(section=>section.key===key)?.mode==='blocks'?null:key==='plan'?<PlanGallery plans={p.plans}/>:key==='surrounding'?<div className="jp-neighborhood">{p.surroundings.length?p.surroundings.map((item,i)=><article className={'jp-life-row'+(i%2?' reverse':'')+(!item.photos.length?' clean-text-only':'')} key={i}>{item.photos.length>0&&<div className="jp-life-visual"><DetailGallery photos={item.photos} label={item.title+'照片'}/></div>}<div className="jp-life-copy"><span className="jp-kicker">LIFE SCENE ／ {String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3><p className="text-block">{item.text}</p></div></article>):<p>周邊機能資料待補。</p>}</div>:<><ProjectVisit project={p} showLocation={visible('location')} showBooking={booking} bookingLabel={labels.appointment} preview={preview}/>{visible('faq')&&<div className="jp-faq"><h3>{labels.faq}</h3>{p.faq.length?p.faq.map((f,i)=><details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>):<p>常見問題待補。</p>}</div>}</>}
 </>}
 </section><ProjectBlocks blocks={p.contentBlocks||[]} chapter={key}/>{key==='basic'&&<Advantages items={p.advantages||[]}/>}</Fragment>)}{!preview&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,'\\u003c')}}/>}</main><Footer settings={s}/>{booking&&<MobileBooking/>}</>
}
