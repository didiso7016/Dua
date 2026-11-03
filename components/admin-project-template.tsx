'use client';
import type {Project} from '@/lib/model';
import {projectTemplates,resolveProjectTemplate} from '@/lib/project-templates';
// 後台「版面設定」→ 詳細頁模板選擇（單選卡片＋簡易版型示意）。存進專案資料的 template 欄位；「預覽目前編輯」即時套用。
export function ProjectTemplatePicker({project,onChange}:{project:Project;onChange:(template:NonNullable<Project['template']>)=>void}){
 const current=resolveProjectTemplate(project.template);
 return <section className="panel admin-template-picker"><h2>詳細頁模板</h2><p className="muted">三種模板顯示相同的資料與段落，只改變排版。未選擇時使用「經典」。可按下方「預覽目前編輯」查看效果。</p>
 <div className="admin-template-options" role="radiogroup" aria-label="詳細頁模板">{projectTemplates.map(t=><label key={t.id} className={'admin-template-option'+(current===t.id?' is-selected':'')}>
  <input type="radio" name="project-template" value={t.id} checked={current===t.id} onChange={()=>onChange(t.id)}/>
  <span className={'admin-template-thumb thumb-'+t.id} aria-hidden="true"><i/><i/><i/><i/></span>
  <span className="admin-template-text"><strong>{t.label}<small>{t.summary}</small></strong><span>{t.description}</span></span>
 </label>)}</div></section>;
}
