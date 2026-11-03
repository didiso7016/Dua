import {ProjectVideo} from './project-video';
import type {ContentBlock,CustomSection} from '@/lib/model';
import {customSectionsAfter} from '@/lib/custom-sections';
import {visibleBlocks} from '@/lib/content-blocks';
import {DetailGallery} from './detail-gallery';
export function ProjectBlocks({blocks,chapter}:{blocks:ContentBlock[];chapter:string}){
 const shown=visibleBlocks(blocks,chapter);if(!shown.length)return null;
 return <div className="project-extra-content">{shown.map(block=><section className={'project-content-block content-'+block.layout} key={block.id} id={'content-'+block.id} aria-label={block.title||'建案補充內容'}>
 {(block.layout==='image-left'||block.layout==='image-right')?<div className={'content-split'+(!block.photos.length?' content-no-image':'')}>{block.photos.length>0&&<div className="content-visual"><DetailGallery photos={block.photos} label={block.title||'建案補充照片'}/></div>}{(block.title||block.text)&&<div className="content-copy">{block.title&&<h3>{block.title}</h3>}{block.text&&<p className="text-block">{block.text}</p>}</div>}</div>:<>{(block.title||block.text)&&<div className="content-copy">{block.title&&<h3>{block.title}</h3>}{block.text&&<p className="text-block">{block.text}</p>}</div>}{block.layout==='video'&&<ProjectVideo url={block.video||''} title={block.title||'建案介紹影片'}/>} { !['text','video'].includes(block.layout)&&block.photos.length>0&&<DetailGallery photos={block.photos} label={block.title||'建案補充照片'} fullBleed={block.layout==='full-image'} captionless={block.layout==='full-image'&&!block.photos[0].caption}/>}</>}
 </section>)}</div>
}

/** 第 5 批：自訂章節。三個模板共用同一份 HTML（.pd-chapter--custom），樣式依 .pd-<template> 調整（styles/project-detail.css）。 */
export function CustomSections({sections,after,present,isLast=false}:{sections:CustomSection[]|undefined;after:string;present:string[];isLast?:boolean}){
 const shown=customSectionsAfter(sections,after,present,isLast);if(!shown.length)return null;
 return <>{shown.map(s=><section key={s.id} id={'custom-'+s.id} className={'pd-chapter pd-chapter--custom detail-section'+(s.image?' has-image':' text-only')} aria-label={s.title||'建案補充章節'}><div className="pd-chapter-inner">
  <div className={'pd-custom'+(s.image?'':' pd-custom--text')}>
   <div className="pd-custom-copy"><p className="pd-kicker">MORE ABOUT</p>{s.title&&<h2>{s.title}</h2>}{s.text&&<p className="text-block">{s.text}</p>}</div>
   {s.image&&<figure className="pd-custom-media"><img src={s.image} alt={s.caption||s.title||'建案補充照片'} loading="lazy" decoding="async"/>{s.caption&&<figcaption>{s.caption}</figcaption>}</figure>}
  </div>
 </div></section>)}</>;
}
