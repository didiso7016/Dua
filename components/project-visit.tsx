import type {Project} from '@/lib/model';
import {mapEmbedUrl} from '@/lib/geo';
import {Booking} from './project-interactions';
import {ContactIcon} from './contact-icon';
export function ProjectVisit({project:p,showLocation,showBooking,bookingLabel,preview=false}:{project:Project;showLocation:boolean;showBooking:boolean;bookingLabel:string;preview?:boolean}){
 const destination=p.reception||p.address;
 const navigation=p.receptionMap||(p.reception&&p.reception!==p.address?'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.reception):p.map)||(destination?'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination):'');
 // 第 5 批：章節標題即「預約賞屋」（project-detail.tsx），這裡只放說明；表單與地圖在桌機並排、頂端與高度對齊，手機上下堆疊。
 return <>{showBooking&&<p className="visit-lead">留下聯絡資訊，安排適合你的賞屋時間。</p>}<div className={'project-visit'+(!showBooking||!showLocation?' visit-single':'')}>
 {showBooking&&<div id="appointment" className="visit-booking detail-section" aria-label={bookingLabel}>{preview?<fieldset disabled className="booking-preview-fieldset"><Booking projectId={p.id}/></fieldset>:<Booking projectId={p.id}/>}</div>}
 {showLocation&&<aside className="visit-location" aria-label="賞屋位置與聯絡方式">{(p.address||p.map||p.mapEmbed)&&<a className="location-map visit-map" href={navigation||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.reception||p.address)} target="_blank" rel="noopener noreferrer" aria-label={p.name+'：開啟 Google 地圖導航'}><iframe title={p.name+'位置地圖'} src={mapEmbedUrl(p)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1}/><span className="map-navigation-label">點選地圖，開啟 Google 地圖導航 ↗</span></a>}<div className="visit-address"><div><h3>基地位置</h3><p>{p.address||'待確認'}</p></div><div><h3>接待中心地址</h3><p>{p.reception===p.address?'接待中心與基地同址':p.reception||'待確認'}</p></div>{p.hours&&<p className="visit-hours">服務時間：{p.hours}</p>}</div><div className="visit-actions">{navigation&&<a className="visit-action primary" href={navigation} target="_blank" rel="noopener noreferrer"><ContactIcon name="pin"/><span>接待中心導航</span></a>}{p.phone&&<a className="visit-action" href={'tel:'+p.phone.replace(/[^\d+]/g,'')} aria-label={'電話諮詢 '+p.phone}><ContactIcon name="phone"/><span>電話諮詢</span></a>}{p.facebook&&<a className="visit-action" href={p.facebook} target="_blank" rel="noopener noreferrer"><ContactIcon name="facebook"/><span>Facebook</span></a>}</div></aside>}
 </div></>
}
