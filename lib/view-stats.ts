import {database} from './storage';
import {taipeiDay} from './discovery';
import type {Project} from './model';
export function viewKeys(projectId:string,day:string,digest:string){return {hit:`view-hit:${day}:${projectId}:${digest}`,count:`view-count:${day}:${projectId}`}}
export async function recordView(projectId:string,visitor:string,now=new Date()){
 const day=taipeiDay(now),hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+':'+projectId+':'+visitor)),digest=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join(''),keys=viewKeys(projectId,day,digest),db=database();
 await db.batch([db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').bind(keys.hit,''),db.prepare("INSERT INTO settings (key,value) SELECT ?, '1' WHERE changes()=1 ON CONFLICT(key) DO UPDATE SET value=CAST(settings.value AS INTEGER)+1").bind(keys.count)]);
 const cutoff=taipeiDay(new Date(now.getTime()-35*86400000));await db.batch([db.prepare('DELETE FROM settings WHERE key>=? AND key<?').bind('view-hit:','view-hit:'+cutoff),db.prepare('DELETE FROM settings WHERE key>=? AND key<?').bind('view-count:','view-count:'+cutoff)]);
}
export async function viewStats(projects:Project[],now=new Date()){
 const since=taipeiDay(new Date(now.getTime()-29*86400000)),until=taipeiDay(new Date(now.getTime()+86400000));const r=await database().prepare('SELECT key,value FROM settings WHERE key>=? AND key<?').bind('view-count:'+since,'view-count:'+until).all<{key:string;value:string}>();const counts=new Map<string,number>();for(const row of r.results){const id=row.key.split(':')[2];counts.set(id,(counts.get(id)||0)+Math.max(0,Number(row.value)||0))}const ranked=projects.map(p=>({id:p.id,name:p.name,status:p.status,views:counts.get(p.id)||0})).sort((a,b)=>b.views-a.views||a.id.localeCompare(b.id));return {since,until:taipeiDay(now),total:ranked.reduce((sum,p)=>sum+p.views,0),projects:ranked}
}
