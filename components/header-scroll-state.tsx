'use client';
import {useEffect} from 'react';

/**
 * Toggles `data-scrolled="true|false"` on the public `.dua-header` once the page has
 * scrolled past `threshold` px (styles/site-chrome.css draws the scrolled look).
 * Renders nothing, so the server-rendered Header markup is unchanged.
 */
export function HeaderScrollState({threshold=8}:{threshold?:number}){
 useEffect(()=>{
  const header=document.querySelector<HTMLElement>('.dua-header');
  if(!header)return;
  let frame=0;
  const update=()=>{frame=0;header.dataset.scrolled=window.scrollY>threshold?'true':'false'};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();
  window.addEventListener('scroll',schedule,{passive:true});
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);delete header.dataset.scrolled};
 },[threshold]);
 return null;
}
