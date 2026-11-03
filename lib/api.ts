import {isAdmin} from './admin-auth';
export async function authorize(request:Request){if(!await isAdmin())return Response.json({error:'請先使用管理者帳號登入'},{status:401,headers:{'Cache-Control':'no-store'}});if(request.method!=='GET'&&request.method!=='HEAD'&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'不允許此操作來源'},{status:403});return null}
export function errorResponse(error:unknown){console.error(error instanceof Error?error.name:'Request failed');return Response.json({error:'暫時無法完成操作，請稍後重試。'},{status:503,headers:{'Cache-Control':'no-store'}})}
