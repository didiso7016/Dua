// 建案詳細頁模板（第 3 批）。模板只改變呈現方式，所有模板都顯示相同的資料與段落。
// 專案資料沒有 template 欄位（舊資料）時一律視為 classic，不需要資料庫遷移。
export const projectTemplateIds=['classic','gallery','compact'] as const;
export type ProjectTemplate=typeof projectTemplateIds[number];
export const defaultProjectTemplate:ProjectTemplate='classic';
export const projectTemplates:{id:ProjectTemplate;label:string;summary:string;description:string}[]=[
 {id:'classic',label:'經典',summary:'編輯排版・章節編號',description:'標題在上、大圖在下；各段落以編號章節與粗黑分隔線排列，周邊機能圖文左右交錯。適合資訊完整的建案。'},
 {id:'gallery',label:'圖像',summary:'照片優先・大圖滿版',description:'開場滿版大圖，標題卡片壓在照片上；周邊機能以照片卡片並排。適合照片多、外觀漂亮的建案。'},
 {id:'compact',label:'簡約',summary:'精簡卡片・快速瀏覽',description:'開場左文右圖，各段落收進白色卡片、版面較窄；周邊機能以小圖清單呈現。適合資料精簡或手機瀏覽為主的建案。'},
];
export function resolveProjectTemplate(value:unknown):ProjectTemplate{return projectTemplateIds.includes(value as ProjectTemplate)?value as ProjectTemplate:defaultProjectTemplate}
