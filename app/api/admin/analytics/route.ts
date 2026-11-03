import {authorize,errorResponse} from '@/lib/api';
import {getProjects} from '@/lib/storage';
import {viewStats} from '@/lib/view-stats';
export async function GET(req:Request){const denied=await authorize(req);if(denied)return denied;try{return Response.json(await viewStats(await getProjects(true)),{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
