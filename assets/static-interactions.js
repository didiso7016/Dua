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

/* 找房問答與建案列表篩選（靜態示範資料） */
(function(){
 'use strict';
 var PROJECTS=[{"id": "huayi-yoyogi-5", "city": "桃園市", "district": "中壢區", "type": "大樓", "rooms": ["2房"], "min": 1100, "max": 1450}, {"id": "demo-taipei-qingtian", "city": "臺北市", "district": "文山區", "type": "大樓", "rooms": ["3房", "3+1房"], "min": 2800, "max": 3600}, {"id": "demo-newtaipei-yuesen", "city": "新北市", "district": "板橋區", "type": "大樓", "rooms": ["1房", "1+1房", "2房"], "min": 900, "max": 1450}, {"id": "demo-taichung-hikari", "city": "臺中市", "district": "西屯區", "type": "大樓", "rooms": ["2+1房", "3房"], "min": 1600, "max": 2100}, {"id": "demo-kaohsiung-hele", "city": "高雄市", "district": "鳳山區", "type": "透天", "rooms": ["4房", "4+1房"], "min": 1800, "max": 2600}],BUDGETS=[{"id": "under-1000", "label": "1,000 萬以下", "min": 0, "max": 1000}, {"id": "1000-1500", "label": "1,000–1,500 萬", "min": 1000, "max": 1500}, {"id": "1500-2000", "label": "1,500–2,000 萬", "min": 1500, "max": 2000}, {"id": "2000-3000", "label": "2,000–3,000 萬", "min": 2000, "max": 3000}, {"id": "over-3000", "label": "3,000 萬以上", "min": 3000, "max": null}],ROOMS=['1房','1+1房','2房','2+1房','3房','3+1房','4房','4+1房'];
 var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
 var uniq=function(a){return a.filter(function(v,i){return a.indexOf(v)===i}).sort()};
 function query(f){var q=new URLSearchParams();['city','district','type','budget'].forEach(function(k){if(f[k])q.set(k,f[k])});if(f.rooms.length)q.set('rooms',f.rooms.join(','));return q.toString()}
 function summary(f){var b=BUDGETS.filter(function(x){return x.id===f.budget})[0];return [f.city,f.district,b&&b.label].concat(f.rooms,[f.type]).filter(Boolean)}
 function match(p,f){if(f.city&&p.city!==f.city)return false;if(f.district&&p.district!==f.district)return false;if(f.type&&p.type!==f.type)return false;
  if(f.rooms.length&&!f.rooms.some(function(r){return p.rooms.indexOf(r)>=0}))return false;
  var b=BUDGETS.filter(function(x){return x.id===f.budget})[0];if(b){var hi=b.max===null?Infinity:b.max;if(!(p.min<=hi&&p.max>=b.min))return false}return true}
 function districts(city){return uniq(PROJECTS.filter(function(p){return !city||p.city===city}).map(function(p){return p.district}))}
 function sel(name,blank,opts,val){return '<select data-f="'+name+'"><option value="">'+blank+'</option>'+opts.map(function(o){return '<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select>'}

 // 首頁找房問答
 var ws=document.querySelector('#home-finder .finder-workspace');
 if(ws){
  var Q=[['你想住在','哪裡？','選擇縣市與行政區，也可以先不限地區。'],['這次買房','預算多少？','購屋總價以萬元計；車位另計時仍須加計費用。'],['理想的新家','需要幾房？','可以複選，也可以先不限房型。'],['喜歡哪一種','住宅類型？','選擇大樓、透天，或先不設限。']];
  var duo=(ws.querySelector('.finder-conversation img')||{}).getAttribute?ws.querySelector('.finder-conversation img').getAttribute('src'):'assets/duo.png';
  var step=0,f={city:'',district:'',budget:'',rooms:[],type:''};
  var open=function(){var q=query(f);location.href='projects/'+(q?'?'+q:'')};
  var chip=function(attr,val,on,label){return '<button type="button" data-'+attr+'="'+esc(val)+'" aria-pressed="'+on+'">'+esc(label)+'</button>'};
  function choices(){
   if(step===0)return '<div class="finder-location"><label>縣市'+sel('city','不限縣市',uniq(PROJECTS.map(function(p){return p.city})),f.city)+'</label><label>行政區'+sel('district','不限行政區',districts(f.city),f.district)+'</label></div>';
   if(step===1)return '<div class="discovery-chips">'+chip('budget','',!f.budget,'預算不限')+BUDGETS.map(function(b){return chip('budget',b.id,f.budget===b.id,b.label)}).join('')+'</div>';
   if(step===2)return '<div class="discovery-chips">'+chip('room','',!f.rooms.length,'房型不限')+ROOMS.map(function(r){return chip('room',r,f.rooms.indexOf(r)>=0,r)}).join('')+'</div>';
   return '<div class="finder-home-types">'+['','大樓','透天'].map(function(t){return '<button type="button" data-type="'+t+'" aria-pressed="'+(f.type===t)+'"><span aria-hidden="true">'+(t==='大樓'?'▥':t==='透天'?'⌂':'＋')+'</span>'+(t||'先不設限')+'</button>'}).join('')+'</div>';
  }
  function render(focus){
   var s=summary(f);
   ws.innerHTML='<div class="finder-progress" aria-label="第 '+(step+1)+' 步，共 4 步">'+Q.map(function(_,i){return '<span class="'+(i<=step?'active':'')+'"></span>'}).join('')+'</div>'
    +'<div class="finder-step-line"><span class="finder-step">0'+(step+1)+' <small>／ 04</small></span><span>地區 → 預算 → 房型 → 類型</span></div>'
    +'<div class="finder-conversation"><img src="'+esc(duo)+'" alt="DUA+ 角色陪你找家"/><div class="finder-speech"><h2 tabindex="-1" class="finder-question"><span>'+Q[step][0]+'</span><strong>'+Q[step][1]+'</strong></h2><p class="finder-hint">'+Q[step][2]+'</p></div></div>'
    +'<div class="finder-choices">'+choices()+'</div>'
    +(s.length?'<div class="finder-summary" aria-label="已選條件">'+s.map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>':'')
    +'<div class="finder-navigation"><button type="button" class="discovery-text-button" data-act="prev"'+(step===0?' disabled':'')+'>← 上一步</button><button type="button" class="discovery-primary" data-act="next">'+(step===3?'查看符合建案':'下一步')+' →</button></div>'
    +'<div class="finder-shortcuts"><button class="discovery-text-button" data-act="open">先看目前結果 ↗</button>'+(step<3?'<button class="discovery-text-button" data-act="skip">略過這題 →</button>':'')+'</div>'
    +(s.length?'<button type="button" class="discovery-text-button finder-reset" data-act="reset">清除條件重新開始</button>':'');
   if(focus){var h=ws.querySelector('.finder-question');if(h)h.focus({preventScroll:true})}
  }
  ws.addEventListener('change',function(e){var k=e.target.getAttribute('data-f');if(!k)return;f[k]=e.target.value;if(k==='city')f.district='';render()});
  ws.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.getAttribute('data-act');
   if(b.hasAttribute('data-budget'))f.budget=b.getAttribute('data-budget');
   else if(b.hasAttribute('data-room')){var r=b.getAttribute('data-room');f.rooms=!r?[]:f.rooms.indexOf(r)>=0?f.rooms.filter(function(v){return v!==r}):f.rooms.concat(r)}
   else if(b.hasAttribute('data-type'))f.type=b.getAttribute('data-type');
   else if(a==='prev'){step=Math.max(0,step-1);return render(true)}
   else if(a==='next'){if(step===3)return open();step++;return render(true)}
   else if(a==='open')return open();
   else if(a==='skip'){if(step===0){f.city='';f.district=''}else if(step===1)f.budget='';else f.rooms=[];step++;return render(true)}
   else if(a==='reset'){f={city:'',district:'',budget:'',rooms:[],type:''};step=0;return render(true)}
   else return;
   render()});
  render(false);
 }

 // 建案列表篩選
 var grid=document.querySelector('.discovery-grid');
 if(grid){
  var p=new URLSearchParams(location.search),F={city:p.get('city')||'',district:p.get('district')||'',budget:p.get('budget')||'',rooms:(p.get('rooms')||'').split(',').filter(Boolean),type:p.get('type')||''};
  var ed=document.getElementById('search-editor'),toggle=document.querySelector('.summary-actions button'),selects=ed?ed.querySelectorAll('.discovery-filter-top select'):[],lines=ed?ed.querySelectorAll('.filter-line .discovery-chips'):[];
  function apply(){
   var n=0;grid.querySelectorAll('.discovery-result').forEach(function(c){var a=c.querySelector('a'),id=a?a.getAttribute('href').replace(/\/$/,'').split('/').pop():'',pr=PROJECTS.filter(function(x){return x.id===id})[0],ok=!pr||match(pr,F);c.hidden=!ok;c.style.display=ok?'':'none';if(ok)n++});
   var cnt=document.querySelector('.result-count strong');if(cnt)cnt.textContent=n;
   var s=summary(F),box=document.querySelector('.selected-filters');if(box)box.innerHTML=s.length?s.map(function(x){return '<span>'+esc(x)+'</span>'}).join(''):'<span>不限條件・看看所有可能</span>';
   if(selects[0])selects[0].value=F.city;
   if(selects[1]){selects[1].innerHTML='<option value="">不限行政區</option>'+districts(F.city).map(function(d){return '<option>'+esc(d)+'</option>'}).join('');selects[1].value=F.district}
   if(selects[2])selects[2].value=F.budget;
   if(lines[0])lines[0].querySelectorAll('button').forEach(function(b){var t=b.textContent.trim();b.setAttribute('aria-pressed',t==='不限'?!F.rooms.length:F.rooms.indexOf(t)>=0)});
   if(lines[1])lines[1].querySelectorAll('button').forEach(function(b){var t=b.textContent.trim();b.setAttribute('aria-pressed',t==='不限'?!F.type:F.type===t)});
   var q=query(F);history.replaceState(null,'',location.pathname+(q?'?'+q:''));
  }
  if(toggle&&ed)toggle.addEventListener('click',function(){ed.hidden=!ed.hidden;toggle.setAttribute('aria-expanded',!ed.hidden)});
  if(selects[0])selects[0].addEventListener('change',function(){F.city=this.value;F.district='';apply()});
  if(selects[1])selects[1].addEventListener('change',function(){F.district=this.value;apply()});
  if(selects[2])selects[2].addEventListener('change',function(){F.budget=this.value;apply()});
  if(lines[0])lines[0].addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=b.textContent.trim();F.rooms=t==='不限'?[]:F.rooms.indexOf(t)>=0?F.rooms.filter(function(v){return v!==t}):F.rooms.concat(t);apply()});
  if(lines[1])lines[1].addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=b.textContent.trim();F.type=t==='不限'?'':t;apply()});
  var fin=ed&&ed.querySelector('.filter-finish');if(fin)fin.addEventListener('click',function(){ed.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false')});
  apply();
 }
})();
