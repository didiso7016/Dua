import type {BasicFact,Project} from './model';
export const basicFactLabels={builder:'建商',rooms:'房型',area:'全案坪數',kind:'建案類型',sales:'銷售狀態'} as const;
export function defaultBasicFacts():BasicFact[]{return Object.entries(basicFactLabels).map(([source,label])=>({id:'fact-'+source,source:source as BasicFact['source'],label,value:'',visible:true,fullWidth:source==='builder'}))}
export function configuredFacts(project:Project){return project.facts??defaultBasicFacts()}
export function basicFactValue(project:Project,fact:BasicFact){return fact.source==='custom'?fact.value:fact.source==='kind'?[project.stage,project.type].filter(Boolean).join('・'):project[fact.source]}
export function visibleBasicFacts(project:Project){return configuredFacts(project).map(fact=>({...fact,label:fact.label.trim(),value:basicFactValue(project,fact).trim()})).filter(fact=>fact.visible&&fact.label&&fact.value)}
export function moveBasicFact(facts:BasicFact[],index:number,direction:-1|1){const target=index+direction;if(index<0||index>=facts.length||target<0||target>=facts.length)return facts;const result=[...facts];[result[index],result[target]]=[result[target],result[index]];return result}
