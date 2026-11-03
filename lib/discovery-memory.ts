import {parseSearch,searchQuery,type SearchFilters} from './discovery';
import type {BudgetRange} from './model';
const key='dua-search-v1';
export function rememberFilters(filters:SearchFilters){try{localStorage.setItem(key,searchQuery(filters));window.dispatchEvent(new Event('dua-search-change'))}catch{}}
export function recalledFilters(budgets:BudgetRange[]){try{const q=localStorage.getItem(key);return q===null?null:parseSearch(q,budgets)}catch{return null}}
export function savedSearchHref(){try{const q=localStorage.getItem(key);return '/projects'+(q?'?'+q:'')}catch{return '/projects'}}
/**
 * True when the current document was reached with the browser's back/forward buttons
 * (e.g. returning to /projects from a project page). Saved filters and the list scroll
 * position are only restored in that case; links in the header/footer/home start fresh.
 * `popstate` events should be treated as history navigation by the caller as well.
 */
export function isHistoryNavigation(){
 try{
  if(typeof performance==='undefined'||typeof performance.getEntriesByType!=='function')return false;
  const entry=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
  return entry?.type==='back_forward';
 }catch{return false}
}
