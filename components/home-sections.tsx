/**
 * 首頁 Q&A 之後的區塊（server component）：最新建案、熱門區塊、精選與廣告、最新消息。樣式：styles/home.css（.hs-*）。
 * 廣告版位內容來自首頁設定 banners（後台「首頁管理」）；空位顯示「廣告版位招募中」並連到 /partner。
 */
import type {ReactNode} from 'react';
import type {HomeSettings} from '@/lib/model';
import {adSlots,type DiscoveryProject} from '@/lib/discovery';
import {HomeProjectRail} from './home-discovery';
type Banner=HomeSettings['banners'][number];
const external=(url:string)=>url.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{};

function Head({id,eyebrow,title,accent,lead,action}:{id:string;eyebrow:string;title:string;accent:string;lead?:string;action?:ReactNode}){
 return <header className="hs-head"><div><p className="hs-eyebrow" lang="en">{eyebrow}</p><h2 id={id} className="hs-title">{title}<mark>{accent}</mark></h2></div>{lead&&<p className="hs-lead">{lead}</p>}{action}</header>
}

export function HomeLatest({projects}:{projects:DiscoveryProject[]}){
 return <section className="hs hs--latest" aria-labelledby="hs-latest-title"><div className="hs__inner">
  <Head id="hs-latest-title" eyebrow="NEW ARRIVALS" title="最新" accent="建案" lead="依首次刊登時間排序，最多 6 個。" action={<a className="dua-btn dua-btn--secondary dua-btn--sm hs-all" href="/projects?all=1">看全部建案 ↗</a>}/>
  <HomeProjectRail projects={projects} label="最新刊登建案"/>
 </div></section>
}

export function HomePopular({projects}:{projects:DiscoveryProject[]}){
 if(!projects.length)return null;
 return <section className="hs hs--popular" aria-labelledby="hs-popular-title"><div className="hs__inner">
  <Head id="hs-popular-title" eyebrow="POPULAR" title="大家都" accent="在看" lead="近 30 天有效瀏覽較多的建案。"/>
  <HomeProjectRail projects={projects} label="熱門瀏覽建案"/>
 </div></section>
}

function AdSlot({banner,shape}:{banner:Banner|null;shape:'wide'|'square'}){
 if(!banner)return <a className={'hs-ad hs-ad--'+shape+' hs-ad--empty'} href="/partner"><span className="hs-ad__tag">廣告</span><span className="hs-ad__empty"><strong>廣告版位招募中</strong><small>{shape==='wide'?'橫幅版位・了解刊登合作 →':'方形版位・了解合作 →'}</small></span></a>;
 return <a className={'hs-ad hs-ad--'+shape} href={banner.url} {...external(banner.url)}><img src={banner.image} alt={banner.title} loading="lazy" decoding="async"/><span className="hs-ad__tag">{banner.kind==='ad'?'廣告':'精選'}</span></a>;
}

export function HomeAds({banners}:{banners:Banner[]}){
 const {wide,squares}=adSlots(banners);
 return <section className="hs hs--ads" aria-labelledby="hs-ads-title"><div className="hs__inner">
  <Head id="hs-ads-title" eyebrow="FEATURED & ADS" title="精選與" accent="廣告"/>
  <div className="hs-ads"><AdSlot banner={wide} shape="wide"/><AdSlot banner={squares[0]} shape="square"/><AdSlot banner={squares[1]} shape="square"/></div>
 </div></section>
}

export function HomeNews({banners}:{banners:Banner[]}){
 const news=banners.filter(b=>b.kind==='editorial');if(!news.length)return null;
 return <aside className="hs-news" aria-label="最新消息"><div className="hs-news__inner"><span className="hs-news__tag">最新消息</span><div className="hs-news__links">{news.map(b=><a key={b.id} href={b.url} {...external(b.url)}>{b.title} ↗</a>)}</div></div></aside>
}
