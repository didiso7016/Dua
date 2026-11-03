import {getProjects,getSettings,getHomeSettings} from '@/lib/storage';
import {Header,Footer,Unavailable} from '@/components/site';
import {HomeFinder} from '@/components/home-discovery';
import {ExploreShowcase} from '@/components/explore-showcase';
import {HomeHero} from '@/components/home-hero';
import {activeBanners,latestProjects,publicProject} from '@/lib/discovery';
import {viewStats} from '@/lib/view-stats';
export const dynamic='force-dynamic';
export default async function Home(){try{const [projects,settings,home]=await Promise.all([getProjects(),getSettings(),getHomeSettings()]);const data=latestProjects(projects).map(publicProject),banners=activeBanners(home);const stats=home.popularEnabled?await viewStats(projects).catch(()=>null):null;const popular=stats&&stats.total>=10&&stats.projects.filter(p=>p.views>0).length>=3?stats.projects.filter(p=>p.views>0).slice(0,3).map(r=>data.find(p=>p.id===r.id)!).filter(Boolean):[];
 return <><Header compact/><main className="discovery-home explore-home editorial-home">
 <HomeHero/>
 {banners.some(b=>b.kind==='editorial')&&<aside className="explore-news" aria-label="最新消息"><span>最新消息</span><div>{banners.filter(b=>b.kind==='editorial').map(b=><a key={b.id} href={b.url} {...(b.url.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{b.title} ↗</a>)}</div></aside>}
 <div className="explore-layout"><aside className="editorial-motto" aria-label="品牌標語"><span>從生活找到家的方向</span><small>DUA+ / FIND YOUR PLACE</small></aside><div className="explore-main" id="home-finder"><HomeFinder projects={data} budgets={home.budgetRanges}/></div>
 <ExploreShowcase projects={data.slice(0,6)} popular={popular} banners={banners}/></div>
 </main><Footer settings={settings}/></>
 }catch(e){console.error(e);return <main className="container"><Unavailable/></main>}}
