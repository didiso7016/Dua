import {Header,Footer} from '@/components/site';
import {DuaLoading} from '@/components/dua-loading';
import {getSettings} from '@/lib/storage';
import './design-system.css';

export const dynamic='force-dynamic';
export const metadata={title:'設計系統',robots:{index:false,follow:false}};

type Swatch={token:string;name:string;base:string;soft?:string;ink?:string;onBase:'ink'|'white';note?:string};

const palette:Swatch[]=[
  {token:'red',name:'主色紅',base:'#D92A40',soft:'#FCE4E6',ink:'#B0202F',onBase:'white',note:'白字僅可用於紅色與手繪紅橘'},
  {token:'sky',name:'天空藍',base:'#519AC5',soft:'#E3F0F8',ink:'#1D5E85',onBase:'ink',note:'文字一律用墨色'},
  {token:'grass',name:'草地綠',base:'#53B576',soft:'#E3F4E9',ink:'#23703F',onBase:'ink',note:'文字一律用墨色'},
  {token:'orange',name:'橘',base:'#F7875C',soft:'#FDE6DC',ink:'#A8441C',onBase:'ink'},
  {token:'yellow',name:'黃',base:'#ECE388',soft:'#FAF7D9',ink:'#6B6110',onBase:'ink'},
  {token:'lavender',name:'薰衣草',base:'#A9BFE5',soft:'#ECF1FA',ink:'#3F5F96',onBase:'ink'},
  {token:'pink',name:'粉紫',base:'#D98DC1',soft:'#F8E6F1',ink:'#8E3F76',onBase:'ink'},
];

const neutrals:Swatch[]=[
  {token:'bg',name:'底色',base:'#F8F6F0',onBase:'ink'},
  {token:'bg-alt',name:'粉底',base:'#FFE1E1',onBase:'ink'},
  {token:'surface',name:'表面',base:'#FFFFFF',onBase:'ink'},
  {token:'ink',name:'墨色（主要文字）',base:'#141814',onBase:'white'},
  {token:'ink-2',name:'次要文字',base:'#4A4F4B',onBase:'white'},
  {token:'scribble',name:'手繪紅橘',base:'#CC4831',onBase:'white',note:'可用白字'},
  {token:'uniform',name:'角色制服綠',base:'#394E3D',soft:'#798B7A',onBase:'white',note:'僅限插畫使用'},
];

const fonts=[
  {token:'--dua-font-sans',name:'Noto Sans TC',use:'內文與介面（400 / 500 / 700）',sample:'從地區開始，找到適合你的新建案。',className:'dua-ds-font-sans'},
  {token:'--dua-font-display',name:'Huninn',use:'大標題',sample:'下一個家，從你的生活開始',className:'dua-ds-font-display'},
  {token:'--dua-font-en',name:'Outfit',use:'英文標題與數字（500–800）',sample:'DUA+ Find your place 2026',className:'dua-ds-font-en'},
  {token:'--dua-font-mono',name:'Space Mono',use:'眉標、步驟編號、Loading...',sample:'STEP 01 · Loading...',className:'dua-ds-font-mono'},
];

const typeScale=[
  {token:'--dua-text-3xl',size:'40–64px'},
  {token:'--dua-text-2xl',size:'28–40px'},
  {token:'--dua-text-xl',size:'22–28px'},
  {token:'--dua-text-lg',size:'18–20px'},
  {token:'--dua-text-base',size:'16px'},
  {token:'--dua-text-sm',size:'14–15px'},
  {token:'--dua-text-xs',size:'12–13px'},
];

const radii=[
  {token:'--dua-radius-sm',value:'8px'},
  {token:'--dua-radius-md',value:'14px'},
  {token:'--dua-radius-lg',value:'24px'},
  {token:'--dua-radius-pill',value:'999px'},
];

const shadows=[
  {token:'--dua-shadow-sm',value:'2px 2px 0 墨色'},
  {token:'--dua-shadow',value:'3px 3px 0 墨色'},
  {token:'--dua-shadow-lg',value:'6px 6px 0 墨色'},
  {token:'--dua-shadow-red',value:'4px 4px 0 紅色'},
];

type OptionGroup={key:'region'|'budget'|'rooms'|'type'|'life';title:string;options:string[];selected:number};
const optionGroups:OptionGroup[]=[
  {key:'region',title:'地區',options:['桃園市','新竹縣','台中市'],selected:0},
  {key:'budget',title:'預算',options:['1,000 萬以下','1,000–1,500 萬','1,500 萬以上'],selected:1},
  {key:'rooms',title:'房型',options:['2房','3房','4房以上'],selected:1},
  {key:'type',title:'類型',options:['電梯大樓','透天','華廈'],selected:0},
  {key:'life',title:'生活機能',options:['近捷運','學區','公園綠地'],selected:2},
];

function SwatchCard({s}:{s:Swatch}){
  return <li className="dua-ds-swatch">
    <div className="dua-ds-swatch__chip" style={{background:'var(--dua-'+s.token+')',color:s.onBase==='white'?'var(--dua-on-red)':'var(--dua-ink)'}}>
      <strong>{s.name}</strong><span>{s.base}</span>
    </div>
    <dl className="dua-ds-swatch__meta">
      <div><dt>base</dt><dd><code>--dua-{s.token}</code> {s.base}</dd></div>
      {s.soft&&<div><dt>soft</dt><dd><span className="dua-ds-dot" style={{background:s.soft}}/>{s.soft}</dd></div>}
      {s.ink&&<div><dt>ink</dt><dd><span className="dua-ds-dot" style={{background:s.ink}}/>{s.ink}</dd></div>}
    </dl>
    {s.note&&<p className="dua-ds-note">{s.note}</p>}
  </li>;
}

function Section({id,eyebrow,title,children}:{id:string;eyebrow:string;title:string;children:React.ReactNode}){
  return <section className="dua-ds-section" aria-labelledby={id}>
    <p className="dua-eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    {children}
  </section>;
}

export default async function Page(){
  const s=await getSettings();
  return <>
    <Header/>
    <main className="dua-container dua-ds">
      <header className="dua-ds-intro">
        <p className="dua-eyebrow">DUA+ Design System · Phase 1</p>
        <h1>設計系統</h1>
        <p>DUA+ 新版視覺的色彩、字體、尺度與元件一覽。所有新樣式請使用 <code>--dua-*</code> 設計變數。</p>
      </header>

      <Section id="ds-colors" eyebrow="01 / Colors" title="色彩">
        <h3 className="dua-ds-sub">主題色（base / soft / ink）</h3>
        <ul className="dua-ds-swatches">{palette.map(c=><SwatchCard key={c.token} s={c}/>)}</ul>
        <h3 className="dua-ds-sub">底色與中性色</h3>
        <ul className="dua-ds-swatches">{neutrals.map(c=><SwatchCard key={c.token} s={c}/>)}</ul>
        <h3 className="dua-ds-sub">篩選分類色</h3>
        <ul className="dua-ds-filters">
          {optionGroups.map(g=><li key={g.key}><span className="dua-ds-dot dua-ds-dot--lg" style={{background:'var(--dua-filter-'+g.key+')'}}/><code>--dua-filter-{g.key}</code>{g.title}</li>)}
        </ul>
      </Section>

      <Section id="ds-fonts" eyebrow="02 / Typefaces" title="字體">
        <ul className="dua-ds-fonts">
          {fonts.map(f=><li key={f.token} className="dua-card"><p className="dua-eyebrow">{f.name} · <code>{f.token}</code></p><p className={'dua-ds-font-sample '+f.className}>{f.sample}</p><p className="dua-ds-note">{f.use}</p></li>)}
        </ul>
      </Section>

      <Section id="ds-type" eyebrow="03 / Type scale" title="字級（7 階）">
        <ol className="dua-ds-scale">
          {typeScale.map(t=><li key={t.token}><code>{t.token}</code><span className="dua-ds-note">{t.size}</span><span className="dua-ds-scale__sample" style={{fontSize:'var('+t.token+')'}}>家的方向</span></li>)}
        </ol>
        <p className="dua-ds-note">行高：標題 <code>--dua-leading-tight</code> 1.25；內文 <code>--dua-leading-normal</code> 1.7。</p>
      </Section>

      <Section id="ds-radii" eyebrow="04 / Radii" title="圓角">
        <ul className="dua-ds-boxes">
          {radii.map(r=><li key={r.token}><span className="dua-ds-box" style={{borderRadius:'var('+r.token+')'}}/><code>{r.token}</code><span className="dua-ds-note">{r.value}</span></li>)}
        </ul>
      </Section>

      <Section id="ds-shadows" eyebrow="05 / Shadows" title="位移陰影">
        <ul className="dua-ds-boxes">
          {shadows.map(sh=><li key={sh.token}><span className="dua-ds-box dua-ds-box--shadow" style={{boxShadow:'var('+sh.token+')'}}/><code>{sh.token}</code><span className="dua-ds-note">{sh.value}</span></li>)}
        </ul>
      </Section>

      <Section id="ds-buttons" eyebrow="06 / Buttons" title="按鈕">
        <div className="dua-ds-row">
          <button type="button" className="dua-btn dua-btn--primary">預約賞屋</button>
          <button type="button" className="dua-btn dua-btn--secondary">查看建案</button>
          <a href="#ds-buttons" className="dua-btn dua-btn--text">了解更多</a>
        </div>
        <div className="dua-ds-row">
          <button type="button" className="dua-btn dua-btn--primary dua-btn--sm">小按鈕</button>
          <button type="button" className="dua-btn dua-btn--secondary dua-btn--sm">小按鈕</button>
          <button type="button" className="dua-btn dua-btn--primary dua-btn--lg">大按鈕</button>
          <button type="button" className="dua-btn dua-btn--secondary dua-btn--lg">大按鈕</button>
        </div>
        <div className="dua-ds-row">
          <button type="button" className="dua-btn dua-btn--primary" disabled>無法使用</button>
          <button type="button" className="dua-btn dua-btn--secondary" disabled>無法使用</button>
          <button type="button" className="dua-btn dua-btn--text" disabled>無法使用</button>
        </div>
      </Section>

      <Section id="ds-options" eyebrow="07 / Options" title="選項按鈕">
        {optionGroups.map(g=><div key={g.key} className="dua-ds-option-group" role="group" aria-label={g.title}>
          <p className="dua-ds-option-title">{g.title}</p>
          <div className="dua-ds-row">{g.options.map((o,i)=><button key={o} type="button" className={'dua-option dua-option--'+g.key} aria-pressed={i===g.selected}>{o}</button>)}</div>
        </div>)}
      </Section>

      <Section id="ds-stickers" eyebrow="08 / Stickers & card" title="貼紙與卡片">
        <div className="dua-ds-row dua-ds-row--stickers">
          <span className="dua-sticker">NEW</span>
          <span className="dua-sticker dua-sticker--sky dua-sticker--tilt-left">熱門</span>
          <span className="dua-sticker dua-sticker--grass dua-sticker--tilt-right">預售</span>
          <span className="dua-sticker dua-sticker--yellow">新成屋</span>
          <span className="dua-sticker dua-sticker--scribble dua-sticker--tilt-left">HOT</span>
        </div>
        <article className="dua-card dua-ds-card">
          <p className="dua-eyebrow">Card · 卡片</p>
          <h3>示範建案</h3>
          <p>白底、墨色 2px 框線、14px 圓角與位移陰影。用於建案資訊、表單區塊等內容容器。</p>
          <a href="#ds-stickers" className="dua-btn dua-btn--secondary dua-btn--sm">查看詳情</a>
        </article>
      </Section>

      <Section id="ds-loading" eyebrow="09 / Loading" title="載入中">
        <div className="dua-ds-row dua-ds-row--loading">
          <div className="dua-ds-loading-cell"><DuaLoading size="sm"/><span className="dua-ds-note">sm</span></div>
          <div className="dua-ds-loading-cell"><DuaLoading size="md"/><span className="dua-ds-note">md</span></div>
          <div className="dua-ds-loading-cell"><DuaLoading size="lg"/><span className="dua-ds-note">lg</span></div>
        </div>
        <div className="dua-ds-row">
          <button type="button" className="dua-btn dua-btn--primary" aria-busy="true"><DuaLoading size="sm" inline label="送出中…"/></button>
        </div>
      </Section>
    </main>
    <Footer settings={s}/>
  </>;
}
