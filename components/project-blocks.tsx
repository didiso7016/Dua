import {ProjectVideo} from './project-video';
import type {ContentBlock} from '@/lib/model';
import {visibleBlocks} from '@/lib/content-blocks';
import {DetailGallery} from './detail-gallery';
export function ProjectBlocks({blocks,chapter}:{blocks:ContentBlock[];chapter:string}){
 const shown=visibleBlocks(blocks,chapter);if(!shown.length)return null;
 return <div className="project-extra-content">{shown.map(block=><section className={'project-content-block content-'+block.layout} key={block.id} id={'content-'+block.id} aria-label={block.title||'建案補充內容'}>
 {(block.layout==='image-left'||block.layout==='image-right')?<div className={'content-split'+(!block.photos.length?' content-no-image':'')}>{block.photos.length>0&&<div className="content-visual"><DetailGallery photos={block.photos} label={block.title||'建案補充照片'}/></div>}{(block.title||block.text)&&<div className="content-copy">{block.title&&<h3>{block.title}</h3>}{block.text&&<p className="text-block">{block.text}</p>}</div>}</div>:<>{(block.title||block.text)&&<div className="content-copy">{block.title&&<h3>{block.title}</h3>}{block.text&&<p className="text-block">{block.text}</p>}</div>}{block.layout==='video'&&<ProjectVideo url={block.video||''} title={block.title||'建案介紹影片'}/>} { !['text','video'].includes(block.layout)&&block.photos.length>0&&<DetailGallery photos={block.photos} label={block.title||'建案補充照片'} fullBleed={block.layout==='full-image'} captionless={block.layout==='full-image'&&!block.photos[0].caption}/>}</>}
 </section>)}</div>
}
