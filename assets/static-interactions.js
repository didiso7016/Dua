/* DUA+ 靜態預覽版：輪播與格局切換（不依賴框架） */
(function(){
 'use strict';
 var pad=function(n){return String(n).padStart(2,'0')};
 var dataEl=document.getElementById('dua-static-data');
 var data=dataEl?JSON.parse(dataEl.textContent):{galleries:{},plans:[]};
 function setEnds(prev,next,i,n){if(prev)prev.disabled=i<=0;if(next)next.disabled=i>=n-1}

 // 照片輪播（主視覺、周邊機能）
 function gallery(fig,photos){
  if(!photos||photos.length<2)return;
  var img=fig.querySelector('.detail-gallery-image img'),cap=fig.querySelector('.detail-gallery-caption span'),
   arrows=fig.querySelectorAll('.detail-gallery-arrows button'),count=fig.querySelector('.detail-gallery-arrows span'),
   steps=fig.querySelectorAll('.detail-gallery-steps button'),i=0;
  function show(n){i=Math.max(0,Math.min(n,photos.length-1));var p=photos[i];img.src=p.url;img.alt=p.caption||'';if(cap)cap.textContent=p.caption||'';
   if(count)count.textContent=pad(i+1)+' / '+pad(photos.length);steps.forEach(function(b,k){b.setAttribute('aria-pressed',k===i)});setEnds(arrows[0],arrows[1],i,photos.length)}
  if(arrows[0])arrows[0].addEventListener('click',function(){show(i-1)});
  if(arrows[1])arrows[1].addEventListener('click',function(){show(i+1)});
  steps.forEach(function(b,k){b.addEventListener('click',function(){show(k)})});
  fig.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
  photos.forEach(function(p){new Image().src=p.url});
  show(0);
 }
 document.querySelectorAll('figure.detail-gallery').forEach(function(f){gallery(f,data.galleries[f.getAttribute('aria-label')])});

 // 建案優勢 01／05
 document.querySelectorAll('.project-advantages').forEach(function(sec){
  var track=sec.querySelector('.advantages-track'),caps=[].slice.call(sec.querySelectorAll('.advantage-capsule')),
   ctl=sec.querySelectorAll('.advantages-controls button'),count=sec.querySelector('.advantages-controls span'),n=caps.length,i=0;
  if(!n)return;var h=Math.floor(n/2);
  function show(k){i=Math.max(0,Math.min(k,n-1));if(track)track.style.setProperty('--adv-index',i);
   caps.forEach(function(c,j){c.style.setProperty('--adv-offset',((j-i+n+h)%n)-h);c.classList.toggle('is-current',j===i);var b=c.querySelector('button');if(b)b.setAttribute('aria-pressed',j===i)});
   if(count)count.textContent=pad(i+1)+'／'+pad(n);setEnds(ctl[0],ctl[1],i,n)}
  if(ctl[0])ctl[0].addEventListener('click',function(){show(i-1)});
  if(ctl[1])ctl[1].addEventListener('click',function(){show(i+1)});
  caps.forEach(function(c,j){var b=c.querySelector('button');if(b)b.addEventListener('click',function(){show(j)})});
  show(0);
 });

 // 首頁「最新刊登建案」橫向列表
 document.querySelectorAll('.home-rail').forEach(function(rail){
  var track=rail.querySelector('.home-rail-track'),ctl=rail.querySelectorAll('.home-rail-controls button'),count=rail.querySelector('.home-rail-controls span');
  if(!track)return;var cards=[].slice.call(track.children),n=cards.length,i=0;
  function sync(){if(count)count.textContent=pad(i+1)+'／'+pad(n);setEnds(ctl[0],ctl[1],i,n)}
  function go(k){i=Math.max(0,Math.min(k,n-1));track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:'smooth'});sync()}
  if(ctl[0])ctl[0].addEventListener('click',function(){go(i-1)});
  if(ctl[1])ctl[1].addEventListener('click',function(){go(i+1)});
  var t;track.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var best=0;cards.forEach(function(c,k){if(Math.abs(c.offsetLeft-cards[0].offsetLeft-track.scrollLeft)<Math.abs(cards[best].offsetLeft-cards[0].offsetLeft-track.scrollLeft))best=k});i=best;sync()},80)});
  sync();
 });

 // 格局：房型／戶別切換
 var box=document.querySelector('.detail-plans'),plans=data.plans||[];
 if(box&&plans.length){
  var cats=[];plans.forEach(function(p){if(cats.indexOf(p.category)<0)cats.push(p.category)});
  var cat=cats[0],idx=0,art=box.querySelector('.jp-floor-plan');
  function render(){
   var list=plans.filter(function(p){return p.category===cat}),p=list[idx];
   box.querySelectorAll('.detail-room-switch button').forEach(function(b){b.setAttribute('aria-pressed',b.textContent.trim()===cat)});
   var sw=box.querySelector('.detail-plan-switch');
   if(list.length>1){if(!sw){sw=document.createElement('div');sw.className='detail-plan-switch';sw.setAttribute('role','group');sw.setAttribute('aria-label','選擇戶別');box.insertBefore(sw,art)}
    sw.innerHTML='';list.forEach(function(q,k){var b=document.createElement('button');b.type='button';b.textContent=(q.name||k+1)+' 戶';b.setAttribute('aria-pressed',k===idx);b.addEventListener('click',function(){idx=k;render()});sw.appendChild(b)})}
   else if(sw)sw.remove();
   var h3=art.querySelector('.jp-plan-copy h3');if(h3)h3.innerHTML='';if(h3){h3.appendChild(document.createTextNode(p.name));var s=document.createElement('small');s.textContent='戶';h3.appendChild(s)}
   var rooms=art.querySelector('.jp-plan-rooms');if(rooms){rooms.textContent=p.rooms||'';var ar=rooms.nextElementSibling;if(ar)ar.textContent=p.area||'本戶坪數待確認'}
   var fig=art.querySelector('.jp-plan-image figure'),label=p.name+'戶格局圖';
   if(fig&&p.image){fig.setAttribute('aria-label',label);var im=fig.querySelector('img');im.src=p.image;im.alt=label;var c=fig.querySelector('.detail-gallery-caption span');if(c)c.textContent=label;var zb=fig.querySelector('.detail-gallery-image');if(zb)zb.setAttribute('aria-label','放大'+label)}
  }
  box.querySelectorAll('.detail-room-switch button').forEach(function(b){b.addEventListener('click',function(){cat=b.textContent.trim();idx=0;render()})});
  box.querySelectorAll('.detail-plan-switch button').forEach(function(b,k){b.addEventListener('click',function(){idx=k;render()})});
 }
})();
