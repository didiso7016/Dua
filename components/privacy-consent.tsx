'use client';
import {Checkbox} from '@/components/ui/checkbox';
// 預約表單與洽詢表單共用的唯一一行同意勾選；「隱私權政策」另開新分頁到 /privacy。
// 連結位於 <label> 內：點連結只開新頁，不會切換勾選（HTML label 不會轉送互動元素上的點擊）。
export function PrivacyConsent({checked,onChange,className=''}:{checked:boolean;onChange:(v:boolean)=>void;className?:string}){
 return <label className={('check dua-consent '+className).trim()}><Checkbox checked={checked} onCheckedChange={v=>onChange(v===true)} aria-required="true"/><span>我已閱讀並同意<a href="/privacy" target="_blank" rel="noopener">隱私權政策</a></span></label>;
}
