export const roomCategories=['1房','1+1房','2房','2+1房','3房','3+1房','4房','4+1房'] as const;
export function planCategory(plan:{category?:string;rooms:string}){if(plan.category)return plan.category;const normalized=plan.rooms.replace(/\s/g,'').replace(/＋/g,'+');return roomCategories.slice().reverse().find(category=>normalized.startsWith(category))||'其他房型'}
