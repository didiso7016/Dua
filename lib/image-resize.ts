// 第 6 批：後台上傳前在瀏覽器縮圖（伺服器仍限制 8MB 以內的 JPG／PNG／WebP，見 app/api/admin/upload）。
// 長邊超過 MAX_EDGE 或檔案超過 SKIP_BYTES 才處理；輸出 WebP（瀏覽器不支援時改 JPEG），結果比原檔大就沿用原檔。
export const MAX_EDGE=2400,SKIP_BYTES=1.5*1024*1024,QUALITY=0.85;

/** 等比例縮到長邊不超過 max；本來就夠小時原尺寸返回。 */
export function fitWithin(width:number,height:number,max=MAX_EDGE){
 const long=Math.max(width,height);if(!(long>max))return {width,height};
 const scale=max/long;return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}

export async function prepareUpload(file:File):Promise<File>{
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)||typeof createImageBitmap!=='function'||typeof document==='undefined')return file;
 try{
  const bitmap=await createImageBitmap(file);
  const size=fitWithin(bitmap.width,bitmap.height);
  if(size.width===bitmap.width&&file.size<=SKIP_BYTES){bitmap.close();return file}
  const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const ctx=canvas.getContext('2d');if(!ctx){bitmap.close();return file}
  ctx.drawImage(bitmap,0,0,size.width,size.height);bitmap.close();
  const encode=(type:string)=>new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,type,QUALITY));
  let blob=await encode('image/webp');if(!blob||blob.type!=='image/webp')blob=await encode('image/jpeg');
  if(!blob||blob.size>=file.size)return file;
  const ext=blob.type==='image/webp'?'.webp':'.jpg';
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+ext,{type:blob.type,lastModified:Date.now()});
 }catch{return file}
}
