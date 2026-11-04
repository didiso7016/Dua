// 第 6 批：後台清單排序（拖曳或上移／下移）共用。from／to 超出範圍或相同時回傳原陣列的複本。
export function moveItem<T>(items:readonly T[],from:number,to:number):T[]{
 const out=[...items];
 if(!Number.isInteger(from)||!Number.isInteger(to)||from===to||from<0||to<0||from>=out.length||to>=out.length)return out;
 const [item]=out.splice(from,1);out.splice(to,0,item);return out;
}
