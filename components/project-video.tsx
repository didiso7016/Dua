'use client';
import {useState} from 'react';
import {youtubeId} from '@/lib/video';
export function ProjectVideo({url,title}:{url:string;title:string}){const [playing,setPlaying]=useState(false),id=youtubeId(url);if(!id)return null;return <div className="project-video">{playing?<iframe src={'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0'} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button type="button" className="video-cover" onClick={()=>setPlaying(true)} aria-label={'播放'+title}><span className="video-play" aria-hidden="true">▷</span><strong>{title}</strong><span>點選播放影片</span></button>}</div>}
