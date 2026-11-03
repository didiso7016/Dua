import {youtubeId} from './video';
import {z} from 'zod';
import type {ContentBlock,Project} from './model';
export const chapterLabels={basic:'認識建案',plan:'空間格局',surrounding:'周邊生活',location:'位置與預約'} as const;
export const blockLayoutLabels={'full-image':'滿版大圖','image-left':'左圖右文','image-right':'右圖左文',carousel:'照片輪播＋說明',text:'純文字',video:'影片＋說明'} as const;
export const blockPhotoSchema=z.object({url:z.string().max(2000).refine(v=>/^\/(assets|api\/media)\/[a-zA-Z0-9_./%-]+$/.test(v)&&!v.split('/').includes('..')),caption:z.string().max(500)});
export const contentBlockSchema=z.object({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),chapter:z.enum(['basic','plan','surrounding','location']),layout:z.enum(['full-image','image-left','image-right','carousel','text','video']),video:z.string().max(2000).refine(v=>!v||!!youtubeId(v),{message:'請輸入有效的 YouTube HTTPS 影片網址'}).default(''),visible:z.boolean(),title:z.string().max(200),text:z.string().max(10000),photos:z.array(blockPhotoSchema).max(20)}).refine(b=>b.layout!=='full-image'||b.photos.length<=1,{message:'滿版大圖限一張照片；多張請選輪播。',path:['photos']});
export const contentBlocksSchema=z.array(contentBlockSchema).max(30).refine(a=>new Set(a.map(b=>b.id)).size===a.length,{message:'段落編號不可重複。'}).default([]);
export function blockHasContent(block:ContentBlock){if(block.layout==='video')return !!youtubeId(block.video||'');if(block.layout==='text')return !!(block.title.trim()||block.text.trim());return ['full-image','carousel'].includes(block.layout)?block.photos.length>0:!!(block.title.trim()||block.text.trim()||block.photos.length)}
export function visibleBlocks(blocks:ContentBlock[],chapter:string){return blocks.filter(b=>b.chapter===chapter&&b.visible&&blockHasContent(b))}
export function moveContentBlock(blocks:ContentBlock[],id:string,direction:-1|1){const current=blocks.findIndex(b=>b.id===id);if(current<0)return blocks;const peers=blocks.map((b,i)=>({b,i})).filter(x=>x.b.chapter===blocks[current].chapter);const target=peers[peers.findIndex(x=>x.i===current)+direction]?.i;if(target===undefined)return blocks;const result=[...blocks];[result[current],result[target]]=[result[target],result[current]];return result}

export function publishedBlockPhotos(project:Project){const chapters=Object.keys(chapterLabels).filter(key=>project.sections.some(s=>s.key===key&&s.visible)||(key==='location'&&project.sections.some(s=>['faq','appointment'].includes(s.key)&&s.visible)));return chapters.flatMap(chapter=>visibleBlocks(project.contentBlocks||[],chapter).filter(b=>!['text','video'].includes(b.layout)).flatMap(b=>b.photos));}
