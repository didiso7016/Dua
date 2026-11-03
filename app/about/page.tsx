import {permanentRedirect} from 'next/navigation';
// 「關於我們」已併入刊登合作頁的公司介紹段落。主要轉址在 next.config.ts（308）；此頁僅作為備援。
export default function Page(){permanentRedirect('/partner#about')}
