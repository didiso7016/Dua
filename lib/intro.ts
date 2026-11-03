// Opening scene (components/page-loading-overlay.tsx): plays once per browser session.
export const INTRO_FLAG='dua:intro-played';
export const INTRO_PLAYED_CLASS='dua-intro-played';

type FlagStore=Pick<Storage,'getItem'|'setItem'>;

/** Never on the back office (admin, admin login/reset/etc., admin previews). */
export function isAdminPath(pathname:string){
 return pathname==='/admin'||pathname.startsWith('/admin/')||pathname==='/admin-preview'||pathname.startsWith('/admin-preview/');
}

/** True when the intro already ran in this session (flag in sessionStorage, or the <html> class set by the head script). Storage errors (private mode) count as "not played". */
export function introAlreadyPlayed(store:FlagStore|null|undefined,root?:{classList:{contains(c:string):boolean}}|null){
 if(root?.classList.contains(INTRO_PLAYED_CLASS))return true;
 try{return !!store?.getItem(INTRO_FLAG)}catch{return false}
}

export function markIntroPlayed(store:FlagStore|null|undefined){
 try{store?.setItem(INTRO_FLAG,'1')}catch{/* storage unavailable: it may replay, never breaks the page */}
}

/** Inline <head> script: before first paint, mark <html> when the intro already played so CSS hides the overlay (no flash on repeat visits). */
export const INTRO_HEAD_SCRIPT=`try{if(sessionStorage.getItem(${JSON.stringify(INTRO_FLAG)}))document.documentElement.classList.add(${JSON.stringify(INTRO_PLAYED_CLASS)})}catch(e){}`;
