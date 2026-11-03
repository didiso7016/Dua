/**
 * Construction-themed props that play beside the hero characters on their own
 * (hammer tapping a nail, blocks stacking under a waving flag, a house key glinting,
 * a brick being carried). Pure SVG + CSS (styles/hero-props.css); decorative only,
 * no interaction/scroll triggers; reduced-motion users get the static pose.
 */
const INK='#141814';

export function HeroHammer(){
 return <span className="dua-prop dua-prop--hammer"><svg viewBox="0 0 120 110" width="120" height="110" focusable="false">
  <rect x="18" y="86" width="84" height="16" rx="3" fill="#ECE388" stroke={INK} strokeWidth="3"/>
  <g className="dua-prop__nail"><rect x="57" y="70" width="6" height="18" fill="#FFFFFF" stroke={INK} strokeWidth="2.5"/><rect x="51" y="66" width="18" height="6" rx="2" fill="#FFFFFF" stroke={INK} strokeWidth="2.5"/></g>
  <g className="dua-prop__spark" fill="none" stroke="#D92A40" strokeWidth="3" strokeLinecap="round"><path d="M40 62 32 54M80 62 88 54M60 56V46"/></g>
  <g className="dua-prop__hammer-arm">
   <rect x="66" y="22" width="40" height="9" rx="4" fill="#F7875C" stroke={INK} strokeWidth="3"/>
   <rect x="50" y="8" width="20" height="34" rx="4" fill={INK} stroke={INK} strokeWidth="3"/>
   <rect x="54" y="12" width="5" height="12" rx="2" fill="#FFFFFF"/>
  </g>
 </svg></span>;
}

export function HeroBlocks(){
 return <span className="dua-prop dua-prop--blocks"><svg viewBox="0 0 120 170" width="120" height="170" focusable="false">
  <g className="dua-prop__flag"><path d="M60 8V60" stroke={INK} strokeWidth="3" strokeLinecap="round"/><path className="dua-prop__flag-cloth" d="M62 10 92 18 62 28Z" fill="#D92A40" stroke={INK} strokeWidth="2.5" strokeLinejoin="round"/></g>
  <rect x="14" y="128" width="92" height="34" rx="4" fill="#519AC5" stroke={INK} strokeWidth="3"/>
  <rect x="22" y="94" width="76" height="34" rx="4" fill="#53B576" stroke={INK} strokeWidth="3" className="dua-prop__block dua-prop__block--mid"/>
  <rect x="32" y="60" width="56" height="34" rx="4" fill="#ECE388" stroke={INK} strokeWidth="3" className="dua-prop__block dua-prop__block--top"/>
 </svg></span>;
}

export function HeroKey(){
 return <span className="dua-prop dua-prop--key"><svg viewBox="0 0 90 120" width="90" height="120" focusable="false">
  <g className="dua-prop__key-body">
   <path d="M45 10 22 30V52H68V30Z" fill="#D92A40" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
   <circle cx="45" cy="34" r="7" fill="#F8F6F0" stroke={INK} strokeWidth="3"/>
   <rect x="40" y="52" width="10" height="52" rx="3" fill="#ECE388" stroke={INK} strokeWidth="3"/>
   <path d="M50 78h12v8H50M50 92h8v8h-8" fill="#ECE388" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
  </g>
  <path className="dua-prop__glint" d="M74 14 77 22 85 25 77 28 74 36 71 28 63 25 71 22Z" fill="#FFFFFF" stroke={INK} strokeWidth="2" strokeLinejoin="round"/>
 </svg></span>;
}

export function HeroBrick(){
 return <span className="dua-prop dua-prop--brick"><svg viewBox="0 0 100 64" width="100" height="64" focusable="false">
  <g className="dua-prop__brick-body">
   <rect x="6" y="12" width="88" height="38" rx="3" fill="#CC4831" stroke={INK} strokeWidth="3"/>
   <path d="M6 31H94M36 12V31M68 31V50" stroke={INK} strokeWidth="2.5"/>
  </g>
  <path className="dua-prop__dust" d="M14 58h10M40 60h8M70 58h12" stroke={INK} strokeWidth="2.5" strokeLinecap="round"/>
 </svg></span>;
}
