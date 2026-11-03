'use client';
import {useEffect,useRef,useState} from 'react';

export function DetailNavigation({items}:{items:{key:string;label:string}[]}){
  const nav=useRef<HTMLElement>(null);
  const [active,setActive]=useState('');
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      const scrollTop=window.scrollY;
      const maxScroll=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      let current='';
      // The sticky site header adds html scroll-padding-top on top of each section's scroll-margin.
      const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
      for(const item of items){
        const section=document.getElementById(item.key);
        if(!section)continue;
        // Match the browser's anchor landing position, including bottom clamping.
        const margin=(parseFloat(getComputedStyle(section).scrollMarginTop)||0)+padding;
        const target=Math.max(0,Math.min(section.getBoundingClientRect().top+scrollTop-margin,maxScroll));
        if(scrollTop>=target-2)current=item.key;
      }
      setActive(current);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    window.addEventListener('hashchange',schedule);
    window.addEventListener('load',schedule);
    const observer=new ResizeObserver(schedule);
    observer.observe(document.body);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',schedule);window.removeEventListener('load',schedule)};
  },[items]);
  if(!items.length)return null;
  return <nav ref={nav} className="section-nav detail-navigation" style={{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}} aria-label="建案區塊">{items.map(item=><a key={item.key} href={'#'+item.key} aria-current={active===item.key?'location':undefined}>{item.label}</a>)}</nav>;
}

export function MobileBooking(){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const section=document.getElementById('appointment');
    if(!section)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(!entry.isIntersecting));
    observer.observe(section);
    return()=>observer.disconnect();
  },[]);
  return <div className="mobile-booking" hidden={!visible}><a className="action" href="#appointment">預約賞屋</a></div>;
}

// The project page's old back-to-top link is replaced by the shared button that Footer renders
// on every public page; re-exported here so existing imports keep working.
export {BackToTop} from './back-to-top';
