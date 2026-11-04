'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Dialog as DialogPrimitive} from 'radix-ui';
import {PrivacyConsent} from './privacy-consent';
import {inquiryTypeLabels,inquiryTypes,isInquiryType,type InquiryType} from '@/lib/inquiry';

/** Thank-you art: dua.4 (falls back to dua.5 if the file is ever removed). */
const DONE_ART='/assets/characters/dua.4.png',DONE_ART_FALLBACK='/assets/characters/dua.5.png';

/**
 * 洽詢表單（一般洽詢／合作洽詢）。/contact 頁內嵌使用，也放在 InquiryLauncher 的彈窗裡。
 * 每次開啟產生一次 UUID 作為冪等鍵（與預約表單相同），重送不會重複建立名單。
 */
export function InquiryForm({defaultType='general',sourcePage,onClose,headingId}:{defaultType?:InquiryType;sourcePage?:string;onClose?:()=>void;headingId?:string}){
 const [type,setType]=useState<InquiryType>(defaultType),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false),[done,setDone]=useState(false);
 const id=useRef('');
 const [art,setArt]=useState(DONE_ART);
 if(done)return <div className="dua-inquiry-done" role="status">
  <div className="dua-inquiry-done__art"><img src={art} alt="" onError={()=>setArt(DONE_ART_FALLBACK)} decoding="async"/><span className="dua-sticker dua-sticker--yellow dua-sticker--tilt-right dua-inquiry-done__good" aria-hidden="true">Good!</span></div>
  <p className="dua-inquiry-done__title">感謝 (^ᴗ^)</p>
  <p className="dua-inquiry-done__text">我們已收到你的{inquiryTypeLabels[type]}，會盡快以電話或 Email 與你聯絡。</p>
  {onClose?<button type="button" className="dua-btn dua-btn--secondary" onClick={onClose}>關閉</button>:<button type="button" className="dua-btn dua-btn--secondary" onClick={()=>{id.current='';setConsent(false);setMessage('');setDone(false)}}>再填一筆</button>}
 </div>;
 const partner=type==='partner';
 return <form className="dua-inquiry-form" aria-labelledby={headingId} onSubmit={async e=>{
  e.preventDefault();
  if(!consent){setError(true);setMessage('請先閱讀並同意隱私權政策。');return}
  const data=new FormData(e.currentTarget);
  if(!id.current)id.current=crypto.randomUUID();
  setBusy(true);setMessage('');setError(false);
  try{
   const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id.current,type,name:data.get('name')||'',phone:data.get('phone')||'',email:data.get('email')||'',company:data.get('company')||'',message:data.get('message')||'',sourcePage:(sourcePage??window.location.pathname).slice(0,200),website:data.get('website')||'',consent})});
   const result=await r.json() as {error?:string};
   if(!r.ok)throw Error(result.error||'送出失敗，請稍後重試。');
   setDone(true);
  }catch(err){setError(true);setMessage(err instanceof Error?err.message:'送出失敗，請稍後重試。')}
  finally{setBusy(false)}
 }}>
  <fieldset className="dua-inquiry-form__fields" disabled={busy}>
   <div className="dua-inquiry-type" role="radiogroup" aria-label="洽詢類型">
    <span className="dua-inquiry-type__label" aria-hidden="true">洽詢類型</span>
    <div className="dua-inquiry-type__options">{inquiryTypes.map(t=><label key={t} className={'dua-option dua-option--md dua-inquiry-type--'+t+(type===t?' is-selected':'')}><input className="dua-visually-hidden" type="radio" name="type" value={t} checked={type===t} onChange={()=>{setType(t);id.current=''}}/>{inquiryTypeLabels[t]}</label>)}</div>
   </div>
   <div className="dua-inquiry-form__grid">
    <label className="dua-field"><span className="dua-field__label">姓名<em>必填</em></span><input name="name" required maxLength={50} autoComplete="name"/></label>
    <label className="dua-field"><span className="dua-field__label">電話<em>必填</em></span><input name="phone" required type="tel" inputMode="tel" pattern="[0-9+\(\) \-]{8,20}" title="請輸入 8–20 碼數字，可含 + ( ) -" maxLength={20} autoComplete="tel"/></label>
    <label className="dua-field"><span className="dua-field__label">Email<small>選填</small></span><input name="email" type="email" maxLength={120} autoComplete="email"/></label>
    <label className="dua-field"><span className="dua-field__label">公司名稱{partner?<em>必填</em>:<small>選填</small>}</span><input name="company" required={partner} maxLength={100} autoComplete="organization"/></label>
    <label className="dua-field dua-field--full"><span className="dua-field__label">內容<em>必填</em></span><textarea name="message" required maxLength={1000} rows={5} placeholder={partner?'想刊登的建案、地區或合作方式':'想詢問的建案或問題'}/></label>
   </div>
   <div hidden><input name="website" tabIndex={-1} autoComplete="off"/></div>
   <PrivacyConsent checked={consent} onChange={v=>{setConsent(v);if(v&&error&&message.includes('隱私權')){setMessage('');setError(false)}}}/>
   <button type="submit" className="dua-btn dua-btn--primary dua-btn--lg dua-inquiry-form__submit">{busy?'送出中…':'送出洽詢'}</button>
  </fieldset>
  <p role="status" className={'dua-inquiry-form__message'+(error?' is-error':'')}>{message}</p>
 </form>;
}

/**
 * 全站共用的洽詢彈窗＋右下角「洽詢」浮動按鈕（由 Footer 在前台頁面渲染一次；後台不顯示）。
 * 任何帶 data-inquiry 屬性的連結都會改為開啟彈窗（無 JS 時照常前往 /contact）：
 *   data-inquiry="partner" → 預設合作洽詢；data-inquiry="" → 依所在頁面（/partner 為合作，其餘一般）。
 * 浮動按鈕與回到頂端按鈕的上下堆疊見 styles/contact.css（--dua-fab-offset）。
 */
export function InquiryLauncher(){
 const [open,setOpen]=useState(false),[type,setType]=useState<InquiryType>('general'),[session,setSession]=useState(0),[enabled,setEnabled]=useState(true);
 const openWith=useCallback((value:string|null)=>{
  setType(isInquiryType(value)?value:window.location.pathname.startsWith('/partner')?'partner':'general');
  setSession(s=>s+1);setOpen(true);
 },[]);
 useEffect(()=>{
  if(window.location.pathname.startsWith('/admin')){setEnabled(false);return}
  const onClick=(e:MouseEvent)=>{
   if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   const trigger=(e.target as Element|null)?.closest?.('[data-inquiry]');
   if(!trigger)return;
   e.preventDefault();openWith(trigger.getAttribute('data-inquiry'));
  };
  document.addEventListener('click',onClick);
  return()=>document.removeEventListener('click',onClick);
 },[openWith]);
 if(!enabled)return null;
 return <>
  {/* 第 6 批：右下角「洽詢」浮動按鈕已移除，改由頁首「聯絡我們」膠囊按鈕開啟這個彈窗。 */}
  <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
   <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="dua-inquiry-overlay"/>
    <DialogPrimitive.Content className="dua-inquiry-dialog">
     <div className="dua-inquiry-dialog__head">
      <div><span className="dua-eyebrow">CONTACT</span><DialogPrimitive.Title className="dua-inquiry-dialog__title">聯絡 DUA+</DialogPrimitive.Title></div>
      <DialogPrimitive.Close className="dua-inquiry-dialog__close" aria-label="關閉洽詢表單"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg></DialogPrimitive.Close>
     </div>
     <DialogPrimitive.Description className="dua-inquiry-dialog__lead">留下聯絡方式與想詢問的內容，我們會盡快回覆你。</DialogPrimitive.Description>
     <InquiryForm key={session} defaultType={type} onClose={()=>setOpen(false)}/>
    </DialogPrimitive.Content>
   </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
 </>;
}
