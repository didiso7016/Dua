import {getProjects,getSettings,getHomeSettings} from '@/lib/storage';
import {Header,Footer,Unavailable} from '@/components/site';
import {ProjectSearch} from '@/components/project-search';
import {publicProject,parseSearch} from '@/lib/discovery';
export const dynamic='force-dynamic';export const metadata={title:'找建案'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){try{const [projects,settings,home,params]=await Promise.all([getProjects(),getSettings(),getHomeSettings(),searchParams]);const query=new URLSearchParams();for(const [key,value] of Object.entries(params||{}))if(typeof value==='string')query.set(key,value);return <><Header compact/><main className="dua-listing"><header className="pl-head"><div><span className="pl-eyebrow" lang="en">FIND YOUR PLACE</span><h1>找到<mark>家的方向</mark></h1></div><p>你的選擇都在這裡<br/>調整條件就能繼續探索</p></header><ProjectSearch projects={projects.map(publicProject)} budgets={home.budgetRanges} initial={parseSearch(query.toString(),home.budgetRanges)} listing/></main><Footer settings={settings}/></>}catch(e){console.error(e);return <main className="container"><Unavailable/></main>}}
