const encoder=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>Uint8Array.from(value.match(/../g)||[],x=>parseInt(x,16));
export function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)))}
export async function tokenHash(value:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))))}
async function derive(password:string,pepper:string,salt:Uint8Array){if(!pepper)throw Error('Authentication not configured');const hmac=await crypto.subtle.importKey('raw',encoder.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);const input=await crypto.subtle.sign('HMAC',hmac,encoder.encode(password));const key=await crypto.subtle.importKey('raw',input,'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:salt as Uint8Array<ArrayBuffer>,iterations:100000,hash:'SHA-256'},key,256)))}
export async function hashPassword(password:string,pepper:string){const salt=crypto.getRandomValues(new Uint8Array(16));return `pbkdf2-hmac-v1:${hex(salt)}:${await derive(password,pepper,salt)}`}
export async function verifyPassword(password:string,stored:string,pepper:string){const [version,salt,expected]=stored.split(':');if(version!=='pbkdf2-hmac-v1'||!/^[a-f0-9]{32}$/.test(salt)||! /^[a-f0-9]{64}$/.test(expected))return false;const actual=await derive(password,pepper,unhex(salt));let difference=0;for(let i=0;i<64;i++)difference|=actual.charCodeAt(i)^expected.charCodeAt(i);return difference===0}
export function validNewPassword(value:string){return value.length>=12&&value.length<=128}
