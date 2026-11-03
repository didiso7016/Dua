import {defaultHome} from './discovery';
import {env} from 'cloudflare:workers';
import {Project,Settings,sample,defaultSettings,blankProject} from './model';
export function database(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw Error('資料服務暫時無法使用');return db}
export function bucket(){const b=(env as unknown as {BUCKET:R2Bucket}).BUCKET;if(!b)throw Error('圖片服務暫時無法使用');return b}
export function hydrateProject(data:any):Project{return {...blankProject(data.id),...(data.id===sample.id?{facebook:sample.facebook,advantages:sample.advantages,phone:sample.phone}:{}),...data}}
async function initialize(){const db=database();await db.batch([db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').bind('company',JSON.stringify(defaultSettings)),db.prepare('INSERT OR IGNORE INTO projects (id,data,status,updated_at) VALUES (?,?,?,?)').bind(sample.id,JSON.stringify(sample),'published',new Date().toISOString())])}
export async function getProjects(all=false):Promise<Project[]>{await initialize();const r=await database().prepare(all?'SELECT * FROM projects ORDER BY updated_at DESC':"SELECT * FROM projects WHERE status = 'published' ORDER BY updated_at DESC").all<{data:string;updated_at:string}>();return r.results.map(r=>({...hydrateProject(JSON.parse(r.data)),updatedAt:r.updated_at}))}
export async function getProject(id:string){await initialize();const r=await database().prepare('SELECT data,updated_at FROM projects WHERE id = ?').bind(id).first<{data:string;updated_at:string}>();return r?{...hydrateProject(JSON.parse(r.data)),updatedAt:r.updated_at} as Project:null}
export async function getSettings():Promise<Settings>{await initialize();const r=await database().prepare('SELECT value FROM settings WHERE key = ?').bind('company').first<{value:string}>();return r?{...defaultSettings,...JSON.parse(r.value)}:defaultSettings}

export async function getHomeSettings():Promise<import('./model').HomeSettings>{const r=await database().prepare('SELECT value FROM settings WHERE key = ?').bind('home').first<{value:string}>();return r?{...defaultHome,...JSON.parse(r.value)}:structuredClone(defaultHome)}
