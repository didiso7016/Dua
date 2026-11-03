import {getProject,getSettings} from '@/lib/storage';
import {notFound} from 'next/navigation';
import {projectMetadata} from '@/lib/geo';
import {ProjectDetail} from '@/components/project-detail';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await getProject(id);return p?.status==='published'?projectMetadata(p):{title:'建案資訊',robots:{index:false,follow:false}}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const [p,s]=await Promise.all([getProject(id),getSettings()]);if(!p||p.status!=='published')notFound();return <ProjectDetail project={p} settings={s}/>}
