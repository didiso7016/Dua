import type {Metadata} from 'next';
import {Header,Footer} from '@/components/site';
import {getSettings} from '@/lib/storage';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'刊登合作',description:'DUA+ 建案導覽平台由築里整合行銷有限公司經營，協助建設公司與代銷團隊把建案整理成清楚好懂的導覽頁，預約名單同步至指定試算表。歡迎洽詢建案刊登合作。',openGraph:{title:'刊登合作｜DUA+',description:'建案刊登合作：導覽頁製作、格局與周邊整理、預約名單分流。'}};
// /about 已併入本頁（next.config.ts 以 308 轉址至 /partner#about）。
const positioning=[
 {title:'從地區開始找',text:'購屋者先選區域、預算與房型，再進入符合條件的建案，不必在大量廣告中翻找。'},
 {title:'一頁看懂建案',text:'房型、格局、位置、周邊機能與常見問題整理在同一頁，手機上也好閱讀。'},
 {title:'直接預約賞屋',text:'看完導覽即可留下聯絡方式與希望時段，名單直接交給銷售窗口。'},
];
const audiences=[
 {title:'建設公司',text:'想讓新案資訊有一個清楚、可長期使用的線上導覽頁。'},
 {title:'代銷團隊',text:'需要整理多個建案的格局與賣點，並集中接收預約名單。'},
 {title:'購屋族',text:'想先在線上比較地區與房型，再決定要去看哪一個建案。'},
];
const services=[
 {title:'建案導覽頁製作',text:'依建商提供的資料整理基本資料、照片、格局與建案優勢，並標示資料來源與確認日期。'},
 {title:'格局與周邊整理',text:'依房型分類呈現各戶格局，整理交通、採買、休閒與學區等生活機能。'},
 {title:'預約名單分流',text:'預約賞屋名單保存在平台，並寫入公司總表與該建案指定的 Google 試算表。'},
 {title:'搜尋資訊整理',text:'為每個建案整理標題、摘要與結構化資料，方便搜尋服務理解內容（不保證收錄或排名）。'},
];
const steps=[
 {title:'聯絡洽詢',text:'填寫合作洽詢表單或來電，告訴我們建案與合作需求。'},
 {title:'提供資料',text:'提供建案基本資料、照片、格局圖與銷售窗口資訊。'},
 {title:'製作與確認',text:'平台整理導覽頁內容，與你確認文字與資料正確後再刊登。'},
 {title:'上線與名單接收',text:'建案頁上線，預約名單同步到指定試算表，資料可隨時更新。'},
];
export default async function Page(){
 const s=await getSettings();
 const tel=s.phone.replace(/[^\d+]/g,'');
 return <><Header/><main className="dua-container dua-info-page">
  <header className="dua-info-hero"><span className="dua-eyebrow">PARTNER WITH DUA+</span><h1>刊登合作</h1><p className="dua-info-hero__lead">讓你的建案被正在找家的人看見。DUA+ 協助建設公司與代銷團隊，把建案資訊整理成清楚好懂的導覽頁。</p></header>
  <div className="dua-partner">
   <section id="about" className="dua-partner__section dua-info-card dua-partner__about" aria-labelledby="partner-about">
    <div><span className="dua-eyebrow">ABOUT</span><h2 id="partner-about">公司介紹</h2><p>DUA+ 是由{s.company}經營的建案導覽平台，整合不同建商與地區的建案資訊，協助你看懂房型、格局與周邊生活。</p><a className="dua-btn dua-btn--secondary" href="/projects">開始找建案</a></div>
    <img src="/assets/characters/dua.5.png" alt="" width={395} height={225} loading="lazy" decoding="async"/>
   </section>
   <section id="positioning" className="dua-partner__section" aria-labelledby="partner-positioning">
    <span className="dua-eyebrow">POSITIONING</span><h2 id="partner-positioning">平台定位</h2>
    <p>DUA+ 是以地區為起點的建案導覽平台：不做廣告堆疊，而是把每個建案整理成購屋者看得懂、願意預約的內容。</p>
    <ul className="dua-partner__grid dua-partner__grid--3 dua-partner__grid--sky">{positioning.map(x=><li key={x.title}><h3>{x.title}</h3><p>{x.text}</p></li>)}</ul>
   </section>
   <section id="audience" className="dua-partner__section" aria-labelledby="partner-audience">
    <span className="dua-eyebrow">WHO WE SERVE</span><h2 id="partner-audience">服務對象</h2>
    <ul className="dua-partner__grid dua-partner__grid--3 dua-partner__grid--grass">{audiences.map(x=><li key={x.title}><h3>{x.title}</h3><p>{x.text}</p></li>)}</ul>
   </section>
   <section id="services" className="dua-partner__section" aria-labelledby="partner-services">
    <span className="dua-eyebrow">SERVICES</span><h2 id="partner-services">合作服務</h2>
    <ul className="dua-partner__grid">{services.map(x=><li key={x.title}><h3>{x.title}</h3><p>{x.text}</p></li>)}</ul>
   </section>
   <section id="process" className="dua-partner__section" aria-labelledby="partner-process">
    <span className="dua-eyebrow">HOW IT WORKS</span><h2 id="partner-process">刊登流程</h2>
    <ol className="dua-partner__steps">{steps.map(x=><li key={x.title}><h3>{x.title}</h3><p>{x.text}</p></li>)}</ol>
   </section>
   <section id="inquiry" className="dua-partner__section dua-info-card dua-partner__cta" aria-labelledby="partner-inquiry">
    <span className="dua-eyebrow">LET&apos;S TALK</span><h2 id="partner-inquiry">合作洽詢</h2>
    <p>初期由平台統一管理刊登內容。想刊登建案或了解合作方式，歡迎留下資料，我們會盡快與你聯絡。</p>
    <div className="dua-partner__cta-actions"><a className="dua-btn dua-btn--primary dua-btn--lg" href="/contact?type=partner" data-inquiry="partner" aria-haspopup="dialog">填寫合作洽詢</a>{s.phone&&<a className="dua-btn dua-btn--secondary dua-btn--lg" href={'tel:'+tel}>來電 {s.phone}</a>}</div>
    {s.email&&<p>Email：<a href={'mailto:'+s.email}>{s.email}</a></p>}
   </section>
  </div>
 </main><Footer settings={s}/></>;
}
