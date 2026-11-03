'use client';
// TEMPORARY PREVIEW (2026-11): the opening scene (styles/page-loading.css) for the owner to review.
// To turn off: set LOADING_PREVIEW_ENABLED = false (or delete this component and its usage in app/layout.tsx).
export const LOADING_PREVIEW_ENABLED = true;
export const LOADING_MIN_MS = 4500; // opening scene length, see styles/page-loading.css

import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {LoadingScene} from './loading-scene';
import {introAlreadyPlayed,isAdminPath,markIntroPlayed} from '@/lib/intro';

/** Must match the fade durations in styles/page-loading.css. */
const LOADING_FADE_MS = 50;
const SKIP_FADE_MS = 200;

type Phase='visible'|'leaving'|'gone';

/**
 * Full-screen opening scene, played ONCE per browser session (sessionStorage `dua:intro-played`).
 * Rendered by the root layout (app/layout.tsx), so it is never re-mounted by client-side or
 * header-menu navigation.
 *
 * - Server-rendered so it covers the first paint of a fresh session (no content flash).
 * - Repeat visits in the same session: an inline <head> script (INTRO_HEAD_SCRIPT) adds
 *   `dua-intro-played` to <html> before paint, and CSS hides the overlay, so it never flashes;
 *   on mount JS removes it from the DOM.
 * - Tap/click anywhere on the overlay skips it (quick 200ms fade).
 * - The fade-out is still a pure CSS animation, so it disappears even if JS never runs; a
 *   <noscript> style hides it for no-JS visitors. Crawlers always get the full page HTML.
 */
export function PageLoadingOverlay(){
 const pathname=usePathname()??'/';
 const [phase,setPhase]=useState<Phase>('visible');
 const [skipped,setSkipped]=useState(false);

 // Decide once on mount (empty deps: pathname changes never replay it).
 useEffect(()=>{
  if(!LOADING_PREVIEW_ENABLED||isAdminPath(window.location.pathname)||introAlreadyPlayed(window.sessionStorage,document.documentElement)){setPhase('gone');return}
  markIntroPlayed(window.sessionStorage);
  const leave=window.setTimeout(()=>setPhase(p=>p==='visible'?'leaving':p),LOADING_MIN_MS);
  const remove=window.setTimeout(()=>setPhase('gone'),LOADING_MIN_MS+LOADING_FADE_MS);
  return()=>{window.clearTimeout(leave);window.clearTimeout(remove)};
 },[]);

 useEffect(()=>{
  if(!skipped)return;
  const remove=window.setTimeout(()=>setPhase('gone'),SKIP_FADE_MS);
  return()=>window.clearTimeout(remove);
 },[skipped]);

 // Keyboard users can skip with Escape while it plays.
 useEffect(()=>{
  if(phase!=='visible')return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSkipped(true);setPhase('leaving')}};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[phase]);

 if(!LOADING_PREVIEW_ENABLED||isAdminPath(pathname)||phase==='gone')return null;
 const leaving=phase==='leaving'||skipped;
 const skip=()=>{if(!skipped){setSkipped(true);setPhase('leaving')}};
 return <>
  <noscript dangerouslySetInnerHTML={{__html:'<style>.dua-page-loading{display:none!important}</style>'}}/>
  <div className={'dua-page-loading'+(leaving?' dua-page-loading--leaving':'')+(skipped?' dua-page-loading--skipped':'')} aria-hidden={leaving?true:undefined} onClick={skip} title="點一下即可略過">
   <LoadingScene/>
  </div>
 </>;
}
