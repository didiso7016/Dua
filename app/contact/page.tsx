import type {Metadata} from 'next';
import {Header,Footer} from '@/components/site';
import {ContactIcon} from '@/components/contact-icon';
import {InquiryForm} from '@/components/inquiry';
import {getSettings} from '@/lib/storage';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'聯絡我們',description:'DUA+ 建案導覽平台由築里整合行銷有限公司經營。一般問題或建案刊登合作，歡迎來電、來信或填寫線上洽詢表單。',openGraph:{title:'聯絡我們｜DUA+',description:'一般洽詢與建案刊登合作，歡迎與 DUA+ 聯絡。'}};
const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [s,params]=await Promise.all([getSettings(),searchParams]);
 const defaultType=params?.type==='partner'?'partner':'general';
 const tel=s.phone.replace(/[^\d+]/g,'');
 const ld={'@context':'https://schema.org','@type':'ContactPage',name:'聯絡 DUA+',about:{'@type':'Organization',name:s.company,brand:'DUA+ 建案導覽平台',telephone:s.phone,email:s.email,address:s.address,sameAs:[s.facebook,s.instagram].filter(Boolean),contactPoint:{'@type':'ContactPoint',contactType:'customer support',telephone:s.phone,email:s.email,areaServed:'TW',availableLanguage:'zh-Hant'}}};
 return <><Header/><main className="dua-container dua-info-page">
  <header className="dua-info-hero"><span className="dua-eyebrow">CONTACT</span><h1>聯絡我們</h1><p className="dua-info-hero__lead">DUA+ 建案導覽平台，從地區開始，幫你看懂房型、格局與周邊生活，找到適合的新家。</p></header>
  <div className="dua-contact">
   <section className="dua-info-card dua-contact__info" aria-labelledby="contact-info">
    <h2 id="contact-info">平台資訊</h2>
    <dl className="dua-contact__list">
     <div><dt>營運公司</dt><dd>{s.company}</dd></div>
     {s.phone&&<div><dt>電話</dt><dd><a href={'tel:'+tel}>{s.phone}</a></dd></div>}
     {s.email&&<div><dt>EMAIL</dt><dd><a href={'mailto:'+s.email}>{s.email}</a></dd></div>}
     {s.address&&<div><dt>地址</dt><dd>{s.address}</dd></div>}
    </dl>
    {(s.facebook||s.instagram)&&<div className="dua-contact__socials">{s.facebook&&<a href={s.facebook} target="_blank" rel="noopener noreferrer"><ContactIcon name="facebook"/><span>Facebook</span></a>}{s.instagram&&<a href={s.instagram} target="_blank" rel="noopener noreferrer"><ContactIcon name="instagram"/><span>Instagram</span></a>}</div>}
   </section>
   <section className="dua-info-card dua-contact__form" aria-labelledby="contact-form">
    <h2 id="contact-form">線上洽詢</h2>
    <p>一般問題或建案刊登合作都可以留言，我們會盡快與你聯絡。</p>
    <InquiryForm defaultType={defaultType} sourcePage="/contact"/>
   </section>
  </div>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(ld)}}/>
 </main><Footer settings={s}/></>;
}
