import type {Metadata} from 'next';
import {Header,Footer} from '@/components/site';
import {getSettings} from '@/lib/storage';
import {privacyIntro,privacySections,privacyTitle,PRIVACY_UPDATED} from '@/lib/privacy';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'隱私權政策',description:'DUA+ 建案導覽平台個資告知事項聲明：個人資料的蒐集、處理及利用方式、資料保護、Cookie 使用與政策修正說明。',openGraph:{title:'隱私權政策｜DUA+',description:'DUA+ 建案導覽平台個資告知事項聲明。'}};
export default async function Page(){
 const s=await getSettings();
 return <><Header/><main className="dua-container dua-info-page dua-legal">
  <header className="dua-info-hero"><span className="dua-eyebrow">PRIVACY POLICY</span><h1>隱私權政策</h1><p className="dua-info-hero__lead">{privacyTitle}</p><p className="dua-legal__meta">版本：{PRIVACY_UPDATED}</p></header>
  <nav className="dua-info-card dua-legal__toc" aria-labelledby="privacy-toc"><h2 id="privacy-toc">目錄</h2><ol>{privacySections.map((section,i)=><li key={section.heading}><a href={'#privacy-'+(i+1)}>{section.heading}</a></li>)}</ol></nav>
  <article className="dua-info-card dua-legal__body">
   <p>{privacyIntro}</p>
   {privacySections.map((section,i)=><section key={section.heading} id={'privacy-'+(i+1)} className="dua-legal__section" aria-labelledby={'privacy-h-'+(i+1)}>
    <h2 id={'privacy-h-'+(i+1)}>{section.heading}</h2>
    {section.blocks.map((block,j)=>block.kind==='p'?<p key={j}>{block.text}</p>:<ul key={j}>{block.items.map(item=><li key={item}>{item}</li>)}</ul>)}
   </section>)}
  </article>
 </main><Footer settings={s}/></>;
}
