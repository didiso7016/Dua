/**
 * Homepage hero (server component): playful editorial poster with flat colour shapes,
 * the DUA+ characters and a marquee strip. Styles: styles/home-hero.css.
 * Character PNGs are small, so each one is capped at its natural width in CSS.
 */
const marqueeWords=['DUA+ HOME GUIDE','台北','新北','桃園','新竹','台中','台南','高雄','FIND YOUR PLACE','新建案探索','NEW HOMES 2026'];

function Star({className}:{className:string}){
 return <svg className={'dua-hero__star '+className} viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M20 3.5 24.2 15.8 37 16.1 26.8 23.9 30.5 36.3 20 28.9 9.5 36.3 13.2 23.9 3 16.1 15.8 15.8Z" fill="currentColor" stroke="#141814" strokeWidth="2" strokeLinejoin="round"/></svg>;
}

function MarqueeGroup(){
 return <span className="dua-hero__marquee-group">{marqueeWords.map(word=><span key={word} className="dua-hero__marquee-item">{word}<span className="dua-hero__marquee-dot">✦</span></span>)}</span>;
}

export function HomeHero(){
 return <section className="dua-hero" aria-labelledby="dua-hero-title">
  <div className="dua-hero__bg" aria-hidden="true">
   <span className="dua-hero__bg-dot dua-hero__bg-dot--lavender"/>
   <span className="dua-hero__bg-dot dua-hero__bg-dot--pink"/>
   <span className="dua-hero__bg-dot dua-hero__bg-dot--orange"/>
   <Star className="dua-hero__star--bg"/>
  </div>
  <div className="dua-hero__inner">
   <div className="dua-hero__copy">
    <p className="dua-hero__eyebrow" lang="en">NEW HOMES IN TAIWAN — 2026</p>
    <p className="dua-hero__display" lang="en"><span>FIND YOUR</span><span className="dua-hero__display-accent">PLACE</span></p>
    <h1 id="dua-hero-title" className="dua-hero__title"><span className="dua-hero__title-line">下一個<mark className="dua-hero__mark">家</mark>，</span><span className="dua-hero__title-line dua-hero__title-line--indent">從你的生活開始</span></h1>
    <p className="dua-hero__lead">選幾個生活條件，看看哪些新建案最適合你。</p>
    <div className="dua-hero__ctas">
     <a className="dua-btn dua-btn--primary dua-btn--lg" href="#home-finder">開始找房</a>
     <a className="dua-btn dua-btn--secondary dua-btn--lg" href="/projects">看全部建案</a>
    </div>
   </div>
   <div className="dua-hero__stage" aria-hidden="true">
    <span className="dua-hero__shape dua-hero__shape--sky"/>
    <span className="dua-hero__shape dua-hero__shape--red"/>
    <span className="dua-hero__shape dua-hero__shape--grass"/>
    <span className="dua-hero__shape dua-hero__shape--yellow"/>
    <Star className="dua-hero__star--a"/>
    <Star className="dua-hero__star--b"/>
    <span className="dua-hero__badge" lang="en">DUA+<br/>HOME<br/>GUIDE</span>
    <span className="dua-hero__char dua-hero__char--pair"><img src="/assets/characters/dua.5.png" alt="" width={395} height={225} decoding="async" fetchPriority="high"/></span>
    <span className="dua-hero__char dua-hero__char--megaphone"><img src="/assets/characters/dua.3.png" alt="" width={300} height={265} decoding="async"/></span>
    <span className="dua-hero__char dua-hero__char--cheer"><img src="/assets/characters/dua.1.png" alt="" width={174} height={288} decoding="async"/></span>
    <span className="dua-hero__sticker dua-hero__sticker--tour">建案導覽</span>
    <span className="dua-hero__sticker dua-hero__sticker--plans">看房型</span>
    <span className="dua-hero__sticker dua-hero__sticker--visit">免費預約</span>
   </div>
  </div>
  <div className="dua-hero__marquee" aria-hidden="true"><div className="dua-hero__marquee-track"><MarqueeGroup/><MarqueeGroup/></div></div>
 </section>;
}
