'use client';
import {useState} from 'react';

// 第 6 批：後台「帳號設定」在右側內容區顯示（與其他後台頁面一致），不另開頁面。
// 只顯示帳號資訊、修改密碼入口與登出；不是帳號管理功能（不能新增或刪除帳號）。
export function AdminAccountPanel({account}:{account:{username:string;email:string}|null}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){setBusy(true);setError('');try{const r=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error();location.assign('/admin/login')}catch{setError('暫時無法登出，請稍後重試。');setBusy(false)}}
 return <><h1>帳號設定</h1><section className="panel admin-account">
  <dl className="facts"><div><dt>管理者帳號</dt><dd>{account?.username||'—'}</dd></div><div><dt>Email（密碼重設使用）</dt><dd>{account?.email||'—'}</dd></div><div><dt>權限</dt><dd>公司管理者</dd></div></dl>
  <div className="small-actions admin-account-actions"><a className="button-link" href="/admin/change">修改密碼</a><button type="button" disabled={busy} onClick={logout}>登出</button></div>
  {error&&<p role="alert" className="save-message">{error}</p>}
 </section></>;
}
