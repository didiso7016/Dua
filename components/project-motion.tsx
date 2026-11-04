'use client';
import {useEffect,useRef,useState} from 'react';
export function Advantages({items}:{items:{title:string;text:string}[]}){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[inside,setInside]=useState(false),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[compact,setCompact]=useState(false),[reduced,setReduced]=useState(true),[hidden,setHidden]=useState(false);
 const root=useRef<HTMLElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 const count=items.length,current=Math.min(index,Math.max(0,count-1));
 useEffect(()=>{const mq=matchMedia('(max-width:1100px)'),rm=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>{setCompact(mq.matches);setReduced(rm.matches)};sync();mq.addEventListener('change',sync);rm.addEventListener('change',sync);return()=>{mq.removeEventListener('change',sync);rm.removeEventListener('change',sync)}},[]);
 useEffect(()=>{if(!root.current)return;const ob=new IntersectionObserver(([entry])=>setInside(entry.isIntersecting),{threshold:.25});ob.observe(root.current);const sync=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',sync);sync();return()=>{ob.disconnect();document.removeEventListener('visibilitychange',sync)}},[count]);
 useEffect(()=>{if(!compact||reduced||paused||hover||focus||!inside||hidden||count<2)return;const id=setInterval(()=>setIndex(i=>(i+1)%count),5000);return()=>clearInterval(id)},[compact,reduced,paused,hover,focus,inside,hidden,count]);
 if(!count)return null;
 const select=(i:number)=>{setIndex((i+count)%count);setPaused(true)};
 return <section ref={root} className={'project-advantages'+(count===1?' single':'')} aria-label="建案優勢" aria-roledescription={compact?'輪播':undefined} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocus(false)}}>
 <div className="advantages-heading"><span className="pd-eyebrow">REASONS TO CALL IT HOME</span><h2>本案的 {count} 大優勢</h2></div>
 <div className="advantages-window" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchCancel={()=>{touch.current=null}} onTouchEnd={e=>{const p=touch.current;touch.current=null;if(!p)return;const dx=e.changedTouches[0].clientX-p.x,dy=e.changedTouches[0].clientY-p.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)select(current+(dx<0?1:-1))}} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(current+(e.key==='ArrowLeft'?-1:1))}}}>
 {/* 第 5 批：優勢是真正可選取／複製的 HTML 文字（ol > li > h3 + p），不包在按鈕裡；手機輪播只靠左右鍵、滑動與點卡片切換。 */}
 <ol className="advantages-track" style={{'--adv-index':current} as React.CSSProperties}>{items.map((item,i)=><li key={i} className={'advantage-capsule'+(i===current?' is-current':'')} style={{'--adv-offset':((i-current+count+Math.floor(count/2))%count)-Math.floor(count/2)} as React.CSSProperties} aria-current={compact&&i===current?'true':undefined} onClick={()=>{if(!compact||i===current)return;if(window.getSelection()?.toString())return;select(i)}}><div className="advantage-card"><span className="advantage-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</div></li>)}</ol></div>
 {count>1&&<div className="advantages-controls"><button type="button" onClick={()=>select(current-1)} aria-label="上一項優勢">←</button><span aria-live={paused?'polite':'off'}>{String(current+1).padStart(2,'0')}／{String(count).padStart(2,'0')}</span><button type="button" onClick={()=>select(current+1)} aria-label="下一項優勢">→</button></div>}
 </section>
}

// 第 6 批：經典模板的捲動進場（只動 opacity/transform，一次性；styles/project-detail.css「經典」段）。
// 只處理圖片與章節標題；掛載時已在畫面內的元素不隱藏（不閃），減少動態效果或不支援 IntersectionObserver 時不做任何事，
// 沒有 JS 時內容照常顯示（隱藏樣式只套用在腳本標記過的元素）。
const revealTargets='.pd-body .detail-gallery,.pd-summary-map,.pd-custom-media,.project-video,.pd-heading,.advantages-heading';
export function DetailReveal(){
 useEffect(()=>{
  const root=document.querySelector('.project-detail.pd-classic');
  if(!root||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ob=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){(e.target as HTMLElement).dataset.revealed='';ob.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.12});
  for(const el of root.querySelectorAll<HTMLElement>(revealTargets)){if(el.getBoundingClientRect().top<innerHeight*.92)continue;el.dataset.reveal='';ob.observe(el)}
  return()=>ob.disconnect();
 },[]);
 return null;
}
