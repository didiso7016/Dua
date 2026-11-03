import {isAdmin} from '@/lib/admin-auth';
import {redirect} from 'next/navigation';
import {googleSheetScript} from '@/lib/google-sheet-script';
import {SheetsSetup} from './ui';
export const dynamic='force-dynamic';
export const metadata={title:'Google Sheets 串接設定',robots:{index:false,follow:false}};
export default async function Page(){if(!await isAdmin())redirect('/admin/login');return <SheetsSetup script={googleSheetScript}/>}
