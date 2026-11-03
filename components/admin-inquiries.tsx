'use client';
import {useCallback,useEffect,useState} from 'react';
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from '@/components/ui/table';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {inquiryTypeLabels,type InquiryRow,type InquiryType} from '@/lib/inquiry';

const time=(iso:string)=>{const d=new Date(iso);return Number.isNaN(d.getTime())?iso:d.toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})};

/** 後台「洽詢名單」：最近 200 筆，可切換 全部／一般洽詢／合作洽詢，顯示 Google 試算表寫入狀態。 */
export function InquiriesAdmin(){
 const [rows,setRows]=useState<InquiryRow[]|null>(null),[filter,setFilter]=useState<'all'|InquiryType>('all'),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/inquiries',{cache:'no-store'});const data=await r.json() as {inquiries?:InquiryRow[];error?:string};if(!r.ok)throw Error(data.error||'載入失敗');setRows(data.inquiries||[])}catch(e){setError(e instanceof Error?e.message:'載入失敗')}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const count=(t:'all'|InquiryType)=>rows?(t==='all'?rows.length:rows.filter(r=>r.type===t).length):0;
 const shown=(rows||[]).filter(r=>filter==='all'||r.type===filter);
 const pending=(rows||[]).filter(r=>r.sheetStatus!=='sent').length;
 return <div className="admin-inquiries">
  <div className="row"><h1>洽詢名單</h1><button type="button" onClick={()=>void load()} disabled={loading}>{loading?'載入中…':'重新整理'}</button></div>
  <p className="muted">來自「聯絡我們」頁與全站洽詢彈窗，顯示最近 200 筆。{pending>0&&<> 有 {pending} 筆尚未寫入試算表，可至 <a href="/admin/sheets">Google Sheets 串接與補送</a> 補送。</>}</p>
  <Tabs value={filter} onValueChange={v=>setFilter(v as 'all'|InquiryType)}>
   <TabsList className="admin-tabs">{(['all','general','partner'] as const).map(t=><TabsTrigger key={t} value={t}>{t==='all'?'全部':inquiryTypeLabels[t]}（{count(t)}）</TabsTrigger>)}</TabsList>
  </Tabs>
  {error&&<p className="notice" role="alert">{error}</p>}
  <section className="panel">
   {rows===null?<p>{loading?'載入中…':'尚未載入。'}</p>:shown.length?<div className="admin-inquiries__scroll"><Table>
    <TableHeader><TableRow><TableHead>時間</TableHead><TableHead>類型</TableHead><TableHead>姓名</TableHead><TableHead>電話</TableHead><TableHead>Email</TableHead><TableHead>公司</TableHead><TableHead>內容</TableHead><TableHead>來源頁</TableHead><TableHead>試算表</TableHead></TableRow></TableHeader>
    <TableBody>{shown.map(r=><TableRow key={r.id}>
     <TableCell className="admin-inquiries__nowrap">{time(r.createdAt)}</TableCell>
     <TableCell><span className={'admin-inquiry-type admin-inquiry-type--'+r.type}>{inquiryTypeLabels[r.type]||r.type}</span></TableCell>
     <TableCell>{r.name}</TableCell>
     <TableCell className="admin-inquiries__nowrap"><a href={'tel:'+r.phone.replace(/[^\d+]/g,'')}>{r.phone}</a></TableCell>
     <TableCell>{r.email?<a href={'mailto:'+r.email}>{r.email}</a>:'—'}</TableCell>
     <TableCell>{r.company||'—'}</TableCell>
     <TableCell className="admin-inquiries__message">{r.message}</TableCell>
     <TableCell>{r.sourcePage||'—'}</TableCell>
     <TableCell className="admin-inquiries__nowrap">{r.sheetStatus==='sent'?<span className="admin-sheet-status admin-sheet-status--sent">已寫入</span>:<span className="admin-sheet-status admin-sheet-status--pending" title={r.sheetAttemptAt?'最後嘗試：'+time(r.sheetAttemptAt):'尚未嘗試（試算表可能尚未串接）'}>待補送{r.sheetAttempts?`（${r.sheetAttempts} 次）`:''}</span>}</TableCell>
    </TableRow>)}</TableBody>
   </Table></div>:<p>{filter==='all'?'目前尚未收到洽詢。':`目前沒有${inquiryTypeLabels[filter]}。`}</p>}
  </section>
 </div>;
}
