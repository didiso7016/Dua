/**
 * Page-loading opening scene (server-safe, no hooks). About 2.6s, CSS only
 * (styles/page-loading.css):
 *  1. the DUA+ girl walks in from the left while homes rise from the ground one by one,
 *  2. she stops at the last home (DUA+ logo on its roof),
 *  3. takes out a house-shaped key and turns it,
 *  4. we zoom into the double doors, which swing open to reveal the page.
 * Character art: swap DUA_LOADING_ART (components/dua-loading.tsx) when the run-cycle art arrives.
 */
import {DUA_LOADING_ART} from './dua-loading';

const INK='#141814';

function Apartment({fill}:{fill:string}){
 return <svg viewBox="0 0 100 170" preserveAspectRatio="xMidYMax meet" focusable="false">
  <rect x="6" y="10" width="88" height="158" rx="3" fill={fill} stroke={INK} strokeWidth="4"/>
  <rect x="2" y="4" width="96" height="12" rx="2" fill="#F8F6F0" stroke={INK} strokeWidth="4"/>
  {[30,62,94,126].map(y=>[22,58].map(x=><rect key={x+'-'+y} x={x} y={y} width="20" height="20" rx="2" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>))}
  <rect x="40" y="140" width="20" height="28" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
 </svg>;
}

function Townhouse({fill,roof}:{fill:string;roof:string}){
 return <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMax meet" focusable="false">
  <path d="M4 52 50 8 96 52Z" fill={roof} stroke={INK} strokeWidth="4" strokeLinejoin="round"/>
  <rect x="12" y="50" width="76" height="68" rx="2" fill={fill} stroke={INK} strokeWidth="4"/>
  <rect x="22" y="64" width="20" height="18" rx="2" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
  <rect x="58" y="64" width="20" height="18" rx="2" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
  <rect x="40" y="90" width="20" height="28" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
 </svg>;
}

function DuaHome(){
 return <>
  <svg viewBox="0 0 140 150" preserveAspectRatio="xMidYMax meet" focusable="false">
   <path d="M4 66 70 8 136 66Z" fill="#D92A40" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>
   <rect x="16" y="62" width="108" height="86" rx="3" fill="#F8F6F0" stroke={INK} strokeWidth="4"/>
   <rect x="26" y="76" width="20" height="18" rx="2" fill="#519AC5" stroke={INK} strokeWidth="3"/>
   <rect x="94" y="76" width="20" height="18" rx="2" fill="#519AC5" stroke={INK} strokeWidth="3"/>
   <rect x="48" y="92" width="22" height="56" fill="#D92A40" stroke={INK} strokeWidth="3"/>
   <rect x="70" y="92" width="22" height="56" fill="#D92A40" stroke={INK} strokeWidth="3"/>
   <circle cx="65" cy="122" r="2.5" fill={INK}/><circle cx="75" cy="122" r="2.5" fill={INK}/>
   <rect x="40" y="144" width="60" height="6" fill="#53B576" stroke={INK} strokeWidth="3"/>
  </svg>
  <span className="dls-home__badge"><img className="dls-home__logo" src="/assets/logo.png" alt="" decoding="async"/></span>
 </>;
}

function HouseKey(){
 return <svg viewBox="0 0 60 90" focusable="false">
  <path d="M30 6 8 24V44H52V24Z" fill="#ECE388" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>
  <circle cx="30" cy="28" r="6" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
  <rect x="25" y="44" width="10" height="40" rx="2" fill="#ECE388" stroke={INK} strokeWidth="4"/>
  <path d="M35 62h9v7h-9M35 74h6v7h-6" fill="#ECE388" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
 </svg>;
}

function DoorPanel({side}:{side:'l'|'r'}){
 return <span className={'dls-door dls-door--'+side}><span className="dls-door__panel"/><span className="dls-door__panel"/><span className="dls-door__knob"/></span>;
}

export function LoadingScene(){
 return <span className="dls" role="status" aria-live="polite">
  <span className="dua-visually-hidden">載入中…</span>
  <span className="dls-scene" aria-hidden="true">
   <span className="dls-stage">
    <span className="dls-ground"/>
    <span className="dls-bld dls-bld--1"><Apartment fill="#519AC5"/></span>
    <span className="dls-bld dls-bld--2"><Townhouse fill="#53B576" roof="#F7875C"/></span>
    <span className="dls-bld dls-bld--3"><Apartment fill="#A9BFE5"/></span>
    <span className="dls-bld dls-bld--4"><Townhouse fill="#ECE388" roof="#53B576"/></span>
    <span className="dls-bld dls-home"><DuaHome/></span>
    <span className="dls-walker"><img className="dls-walker__art" src={DUA_LOADING_ART} alt="" decoding="async"/><span className="dls-key"><HouseKey/></span></span>
   </span>
  </span>
  <span className="dls-doors" aria-hidden="true"><DoorPanel side="l"/><DoorPanel side="r"/></span>
 </span>;
}
