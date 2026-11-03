 'use client';
import {useState} from 'react';
import type {HomeSettings} from '@/lib/model';
import type {DiscoveryProject} from '@/lib/discovery';
import {HomeProjectRail} from './home-discovery';
export function ExploreShowcase({projects,popular,banners}:{projects:DiscoveryProject[];popular:DiscoveryProject[];banners:HomeSettings['banners']}){
 const [tab,setTab]=useState('latest');const tabs=[{id:'latest',label:'最新建案'},...(popular.length?[{id:'popular',label:'熱門瀏覽'}]:[]),...(banners.length?[{id:'featured',label:'精選消息'}]:[])];
 return <aside className="explore-showcase" aria-label="建案探索"><div className="explore-showcase-title"><h2 id="explore-content-title">{tab==='latest'?<>最新<span>建案</span></>:tab==='popular'?'熱門瀏覽':'精選消息'}</h2></div>{tabs.length>1&&<div className="explore-tabs" role="tablist" aria-label="探索內容">{tabs.map((t,i)=><button id={'explore-tab-'+t.id} key={t.id} role="tab" aria-selected={tab===t.id} aria-controls="explore-panel" tabIndex={tab===t.id?0:-1} onClick={()=>setTab(t.id)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(tabs[next].id);document.getElementById('explore-tab-'+tabs[next].id)?.focus()}}}>{t.label}</button>)}</div>}
 <div id="explore-panel" role={tabs.length>1?'tabpanel':'region'} aria-labelledby={tabs.length>1?'explore-tab-'+tab:'explore-content-title'} key={tab}>{tab==='featured'?<div className="explore-banners">{banners.map(b=><a key={b.id} href={b.url} {...(b.url.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{})}><img src={b.image} alt=""/><span>{b.kind==='ad'?'廣告／贊助':'編輯精選'}</span><h3>{b.title}</h3>{b.description&&<p>{b.description}</p>}<span>了解更多 ↗</span></a>)}</div>:<HomeProjectRail projects={tab==='popular'?popular:projects} label={tab==='popular'?'熱門瀏覽建案':'最新刊登建案'}/>}</div>
 <a className="explore-all" href="/projects?all=1">看全部建案 <span>↗</span></a></aside>
}
