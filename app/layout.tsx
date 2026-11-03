import type {Metadata} from 'next';import './globals.css';import '../styles/dua.css';
export const metadata:Metadata={title:{default:'DUA+ 建案導覽平台',template:'%s｜DUA+'},description:'從地區開始，查看建案房型、格局與周邊機能，預約賞屋。築里整合行銷有限公司。',icons:{icon:'/favicon.svg'}};
const fontsHref='https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Huninn&family=Outfit:wght@500..800&family=Space+Mono:wght@400;700&display=swap';
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link rel="stylesheet" href={fontsHref}/></head><body>{children}</body></html>}
