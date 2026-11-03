import {getProjects} from '@/lib/storage';export const dynamic='force-dynamic';
// /about 已轉址至 /partner#about，不列入 sitemap。
export default async function sitemap(){const origin='https://dua-plus-platform.userforall.chatgpt.site';const p=await getProjects();return [{url:origin},{url:origin+'/projects'},{url:origin+'/partner'},{url:origin+'/contact'},{url:origin+'/privacy'},...p.map(x=>({url:origin+'/projects/'+x.id,lastModified:x.updatedAt}))]}
