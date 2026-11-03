'use client';
import {useEffect,useState} from 'react';

/**
 * Shared floating "back to top" button (rendered once by Footer on public pages).
 * Appears after `threshold` px of scrolling; smooth scroll unless the user prefers
 * reduced motion. Positioning / lift above the mobile booking bar: styles/site-chrome.css.
 */
export function BackToTop({threshold=400}:{threshold?:number}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;setVisible(window.scrollY>threshold)};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[threshold]);
 const toTop=()=>{
  const reduce=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,left:0,behavior:reduce?'instant':'smooth'});
  // Keep keyboard users oriented: move focus to the header's home link without jumping.
  document.querySelector<HTMLElement>('.dua-header a')?.focus({preventScroll:true});
 };
 return <button type="button" className="dua-back-to-top" aria-label="回到頂端" data-visible={visible?'true':'false'} tabIndex={visible?0:-1} aria-hidden={visible?undefined:true} onClick={toTop}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>;
}
