'use client';
/** /projects 結果：筆數、卡片格線、價格待確認分組（details.pl-unknown）與空結果。樣式：styles/listing.css（.pl-*）。 */
import type {BudgetRange} from '@/lib/model';
import type {DiscoveryProject} from '@/lib/discovery';
import {priceMatch} from '@/lib/discovery';
import {ProjectCard} from './site';
function PriceNote({project:p,budget}:{project:DiscoveryProject;budget?:BudgetRange}){if(!budget)return null;const match=priceMatch(p.price,budget);return <p className={'pl-price pl-price--'+match}>{match==='unknown'?'總價待確認，未列入預算符合結果':match==='partial'?'部分房型或起價可能符合，請確認實際總價':'刊登總價符合所選預算'}{match!=='unknown'&&<small>{p.price?.parking==='included'?'含車位':p.price?.parking==='excluded'?'車位另計，需另加購車位費用':'車位計價待確認'}{p.price?.verifiedOn?' · 資料確認 '+p.price.verifiedOn:''}</small>}</p>}
function Grid({projects,budget,limit}:{projects:DiscoveryProject[];budget?:BudgetRange;limit?:number}){return <div className="pl-grid">{projects.slice(0,limit).map(p=><div className="pl-result" key={p.id}><ProjectCard project={p}/><PriceNote project={p} budget={budget}/></div>)}</div>}
export function DiscoveryResults({matched,unknown,budget,limit,expandUnknown=false,onReset}:{matched:DiscoveryProject[];unknown:DiscoveryProject[];budget?:BudgetRange;limit?:number;expandUnknown?:boolean;onReset?:()=>void}){return <>
 <p className="pl-count" aria-live="polite"><span>符合條件的建案</span> <strong lang="en">{matched.length}</strong> <span>個</span>{budget&&<span className="pl-count__budget">{budget.label}</span>}</p>
 {matched.length?<Grid projects={matched} budget={budget} limit={limit}/>:<div className="pl-empty"><span className="pl-empty__face" aria-hidden="true">(•_•)?</span><h3>目前沒有符合全部條件的建案</h3><p>可以試著放寬地區、預算或房型，看看更多選擇。</p>{onReset&&<button type="button" className="dua-btn dua-btn--primary" onClick={onReset}>重設條件，看全部建案</button>}</div>}
 {budget&&unknown.length>0&&<details className="pl-unknown" open={expandUnknown||undefined}><summary>另有 <strong>{unknown.length}</strong> 個建案價格待確認，點此查看</summary><p>以下建案符合其他條件，但未提供總價，無法判定是否符合你的預算。</p><Grid projects={unknown} budget={budget} limit={limit}/></details>}
</>}
