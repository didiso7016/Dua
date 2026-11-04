import {getProjects,getSettings,getHomeSettings} from '@/lib/storage';
import {Header,Footer,Unavailable} from '@/components/site';
import {HomeFinder} from '@/components/home-discovery';
import {HomeHero} from '@/components/home-hero';
import {HomeLatest,HomePopular,HomeAds} from '@/components/home-sections';
import {activeBanners,latestProjects,publicProject,popularExcluding} from '@/lib/discovery';
import {viewStats} from '@/lib/view-stats';
export const dynamic='force-dynamic';
// 首頁由上而下：Hero → 開始找房 Q&A → 最新建案（最多 6）→ 熱門區塊（排除已在最新出現者，沒有就隱藏）→ 精選與廣告。
export default async function Home(){try{const [projects,settings,home]=await Promise.all([getProjects(),getSettings(),getHomeSettings()]);const data=latestProjects(projects).map(publicProject),banners=activeBanners(home),latest=data.slice(0,6);
 // 熱門訊號：後台開啟「大家都在看」且近 30 天至少 3 案有瀏覽、合計 10 次以上（沿用原規則）。
 const stats=home.popularEnabled?await viewStats(projects).catch(()=>null):null;const ranked=stats&&stats.total>=10&&stats.projects.filter(p=>p.views>0).length>=3?stats.projects.filter(p=>p.views>0).map(r=>data.find(p=>p.id===r.id)!).filter(Boolean):[];const popular=popularExcluding(ranked,latest);
 return <><Header compact/><main className="dua-home">
 <HomeHero/>
 <HomeFinder projects={data} budgets={home.budgetRanges}/>
 <HomeLatest projects={latest}/>
 <HomePopular projects={popular}/>
 <HomeAds banners={banners}/>
 </main><Footer settings={settings}/></>
 }catch(e){console.error(e);return <main className="container"><Unavailable/></main>}}
