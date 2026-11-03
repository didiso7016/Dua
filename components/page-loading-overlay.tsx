'use client';
// TEMPORARY PREVIEW (2026-11): forces the loading overlay for a fixed time so the owner can review the animation.
// To turn off: set LOADING_PREVIEW_ENABLED = false (or delete this component and its usage).
export const LOADING_PREVIEW_ENABLED = true;
export const LOADING_MIN_MS = 4500; // opening scene length, see styles/page-loading.css

import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {LoadingScene} from './loading-scene';

/** Must match the fade duration in styles/page-loading.css. */
const LOADING_FADE_MS = 50;

/** Never on the back office (admin, admin login/reset/etc., admin previews). */
function isAdminPath(pathname:string){
 return pathname==='/admin'||pathname.startsWith('/admin/')||pathname==='/admin-preview'||pathname.startsWith('/admin-preview/');
}

type Phase='visible'|'leaving'|'gone';

/**
 * Full-screen DuaLoading overlay shown for LOADING_MIN_MS on every public page load
 * and again whenever the pathname changes client-side. Rendered by the public Header.
 *
 * Robustness (see styles/page-loading.css):
 * - It is server-rendered, so it covers the page from the first paint (no content flash).
 * - The fade-out is a pure CSS animation (1s delay + 300ms), so it disappears on its own
 *   even if JavaScript never runs or hydration fails. JS only removes it from the DOM
 *   afterwards and replays it on client-side navigation (a new `key` restarts the animation).
 * - A <noscript> style hides it entirely for no-JS visitors; the page HTML underneath is
 *   always rendered normally, so crawlers see full content.
 */
export function PageLoadingOverlay(){
 const pathname=usePathname()??'/';
 const [run,setRun]=useState<{id:number;phase:Phase;path:string}>({id:0,phase:'visible',path:pathname});

 // Replay on client-side route changes (not on the initial mount). Adjusting state during
 // render (instead of in an effect) shows the overlay in the same commit as the new page.
 if(run.path!==pathname)setRun({id:run.id+1,phase:'visible',path:pathname});

 // Timeline for the current run: visible → leaving (aria-hidden, fading) → removed.
 // Keyed on the run id only, so the phase updates below don't cancel the pending timers.
 const runId=run.id;
 useEffect(()=>{
  const leave=window.setTimeout(()=>setRun(r=>r.id===runId?{...r,phase:'leaving'}:r),LOADING_MIN_MS);
  const remove=window.setTimeout(()=>setRun(r=>r.id===runId?{...r,phase:'gone'}:r),LOADING_MIN_MS+LOADING_FADE_MS);
  return()=>{window.clearTimeout(leave);window.clearTimeout(remove)};
 },[runId]);

 if(!LOADING_PREVIEW_ENABLED||isAdminPath(pathname)||run.phase==='gone')return null;
 const leaving=run.phase==='leaving';
 return <>
  <noscript dangerouslySetInnerHTML={{__html:'<style>.dua-page-loading{display:none!important}</style>'}}/>
  <div key={run.id} className={'dua-page-loading'+(leaving?' dua-page-loading--leaving':'')} aria-hidden={leaving?true:undefined}>
   <LoadingScene/>
  </div>
 </>;
}
