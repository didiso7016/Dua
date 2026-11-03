'use client';
import type {ReactNode} from 'react';
import type {Project} from '@/lib/model';
import {wizardSteps,validateStep,publishErrors,type WizardError} from '@/lib/project-wizard';
// 第 4 批：後台建案精靈外框（步驟列、錯誤提示、最後一步的檢查清單）。
// 各步驟的實際欄位由 app/admin/ui.tsx 的 panels 傳入（與「進階／全部欄位」分頁共用同一組編輯元件）。
export function ProjectWizard({step,project,errors,onStep,children}:{step:number;project:Project;errors:WizardError[];onStep:(i:number)=>void;children:ReactNode}){
 const current=wizardSteps[step];
 const last=step===wizardSteps.length-1;
 const status=wizardSteps.map((_,i)=>validateStep(project,i).length);
 const blockers=publishErrors(project);
 return <div className="admin-wizard">
  <nav aria-label="建案建立步驟"><ol className="admin-wizard-steps">{wizardSteps.map((s,i)=><li key={s.id}><button type="button" className={'admin-wizard-step'+(i===step?' is-current':i<step&&!status[i]?' is-done':'')+(i<step&&status[i]?' has-error':'')} aria-current={i===step?'step':undefined} onClick={()=>onStep(i)}>
   <span className="admin-wizard-num">{i<step&&!status[i]?'✓':String(i+1).padStart(2,'0')}</span><span className="admin-wizard-label">{s.label}</span>
  </button></li>)}</ol></nav>
  <header className="admin-wizard-head"><p className="admin-wizard-eyebrow">STEP {String(step+1).padStart(2,'0')} / {String(wizardSteps.length).padStart(2,'0')}</p><h2>{current.label}</h2><p className="muted">{current.hint}</p></header>
  {errors.length>0&&<div className="admin-wizard-errors" role="alert"><strong>請先修正以下欄位：</strong><ul>{errors.map(e=><li key={e.field}>{e.message}</li>)}</ul></div>}
  {children}
  {last&&<section className="panel admin-wizard-summary"><h2>發佈前檢查</h2><ul>{wizardSteps.slice(0,-1).map((s,i)=><li key={s.id} className={status[i]?'is-warn':'is-ok'}><span aria-hidden="true">{status[i]?'!':'✓'}</span>{s.label}{status[i]?`：${status[i]} 項需修正`:'：完成'}<button type="button" onClick={()=>onStep(i)}>前往</button></li>)}
   {blockers.map(b=><li key={b.field} className="is-warn"><span aria-hidden="true">!</span>{b.message}</li>)}
   {!blockers.length&&<li className="is-ok"><span aria-hidden="true">✓</span>刊登條件（縣市、行政區、至少一張照片）已符合</li>}</ul>
   <p className="muted">按「預覽目前編輯」可用前台樣式檢查（不會刊登）；確認後按「刊登建案」。草稿不會出現在前台。</p></section>}
 </div>;
}
