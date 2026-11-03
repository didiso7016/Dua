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
  function show(n){i=Math.max(0,Math.min(n,photos.length-1));fig._i=i;fig._photos=photos;var p=photos[i];img.src=p.url;img.alt=p.caption||'';if(cap)cap.textContent=p.caption||'';
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
 var PROJECTS=[{"id": "huayi-yoyogi-5", "city": "桃園市", "district": "中壢區", "type": "大樓", "rooms": ["2房"], "min": 1100, "max": 1450, "life": ["交通通勤", "綠意休閒"]}, {"id": "demo-taipei-qingtian", "city": "臺北市", "district": "文山區", "type": "大樓", "rooms": ["3房", "3+1房"], "min": 2800, "max": 3600, "life": ["學區生活", "綠意休閒"]}, {"id": "demo-newtaipei-yuesen", "city": "新北市", "district": "板橋區", "type": "大樓", "rooms": ["1房", "1+1房", "2房"], "min": 900, "max": 1450, "life": ["交通通勤", "日常採買"]}, {"id": "demo-taichung-hikari", "city": "臺中市", "district": "西屯區", "type": "大樓", "rooms": ["2+1房", "3房"], "min": 1600, "max": 2100, "life": ["日常採買", "學區生活"]}, {"id": "demo-kaohsiung-hele", "city": "高雄市", "district": "鳳山區", "type": "透天", "rooms": ["4房", "4+1房"], "min": 1800, "max": 2600, "life": ["綠意休閒", "學區生活"]}],BUDGETS=[{"id": "under-1000", "label": "1,000 萬以下", "min": 0, "max": 1000}, {"id": "1000-1500", "label": "1,000–1,500 萬", "min": 1000, "max": 1500}, {"id": "1500-2000", "label": "1,500–2,000 萬", "min": 1500, "max": 2000}, {"id": "2000-3000", "label": "2,000–3,000 萬", "min": 2000, "max": 3000}, {"id": "over-3000", "label": "3,000 萬以上", "min": 3000, "max": null}],ROOMS=['1房','1+1房','2房','2+1房','3房','3+1房','4房','4+1房'];
 var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
 var uniq=function(a){return a.filter(function(v,i){return a.indexOf(v)===i}).sort()};
 function query(f){var q=new URLSearchParams();['city','district','type','budget','life'].forEach(function(k){if(f[k])q.set(k,f[k])});if(f.rooms.length)q.set('rooms',f.rooms.join(','));return q.toString()}
 function summary(f){var b=BUDGETS.filter(function(x){return x.id===f.budget})[0];return [f.city,f.district,b&&b.label].concat(f.rooms,[f.type,f.life]).filter(Boolean)}
 function match(p,f){if(f.life&&p.life.indexOf(f.life)<0)return false;if(f.city&&p.city!==f.city)return false;if(f.district&&p.district!==f.district)return false;if(f.type&&p.type!==f.type)return false;
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
  var p=new URLSearchParams(location.search),F={city:p.get('city')||'',district:p.get('district')||'',budget:p.get('budget')||'',life:p.get('life')||'',rooms:(p.get('rooms')||'').split(',').filter(Boolean),type:p.get('type')||''};
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
  var more=ed&&ed.querySelector('.filter-actions button'),lifeLine=null;
  function lifeRender(){if(!lifeLine)return;lifeLine.querySelectorAll('button').forEach(function(b){var t=b.textContent.trim();b.setAttribute('aria-pressed',t==='不限'?!F.life:F.life===t)})}
  if(more)more.addEventListener('click',function(){
   if(!lifeLine){lifeLine=document.createElement('div');lifeLine.className='filter-line';lifeLine.innerHTML='<span>生活機能</span><div class="discovery-chips">'+['不限','交通通勤','日常採買','綠意休閒','學區生活'].map(function(t){return '<button type="button">'+t+'</button>'}).join('')+'</div>';
    more.parentNode.parentNode.insertBefore(lifeLine,more.parentNode);lifeLine.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=b.textContent.trim();F.life=t==='不限'?'':t;apply();lifeRender()});lifeLine.hidden=true}
   lifeLine.hidden=!lifeLine.hidden;more.setAttribute('aria-expanded',!lifeLine.hidden);more.innerHTML=(lifeLine.hidden?'更多篩選 ＋':'收合篩選 －');lifeRender()});
  if(F.life&&more)more.click();
  apply();
 }
})();

/* 共用：頁首捲動樣式、回到頂端、區塊導覽、燈箱、表單、手機預約列 */
(function(){
 'use strict';
 var header=document.querySelector('.dua-header'),top=document.querySelector('.dua-back-to-top'),nav=document.querySelector('.detail-navigation'),frame=0;
 function update(){frame=0;var y=window.scrollY;if(header)header.setAttribute('data-scrolled',y>8?'true':'false');
  if(top){var v=y>400;top.setAttribute('data-visible',v);top.tabIndex=v?0:-1;if(v)top.removeAttribute('aria-hidden');else top.setAttribute('aria-hidden','true')}
  if(nav){var cur='',pad=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0,max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   nav.querySelectorAll('a').forEach(function(a){var s=document.getElementById(a.getAttribute('href').slice(1));if(!s)return;var m=(parseFloat(getComputedStyle(s).scrollMarginTop)||0)+pad,t=Math.max(0,Math.min(s.getBoundingClientRect().top+y-m,max));if(y>=t-2)cur=a.getAttribute('href')});
   nav.querySelectorAll('a').forEach(function(a){if(a.getAttribute('href')===cur)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}
 var schedule=function(){if(!frame)frame=requestAnimationFrame(update)};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
 if(top)top.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});var a=document.querySelector('.dua-header a');if(a)a.focus({preventScroll:true})});

 // 手機底部「預約賞屋」列：預約區不在畫面中時顯示
 var mb=document.querySelector('.mobile-booking'),ap=document.getElementById('appointment');
 if(mb&&ap&&'IntersectionObserver' in window)new IntersectionObserver(function(e){mb.hidden=e[0].isIntersecting}).observe(ap);

 // 預約表單：同意勾選框與送出提示
 document.querySelectorAll('button[role="checkbox"]').forEach(function(c){c.addEventListener('click',function(){var on=c.getAttribute('aria-checked')!=='true';c.setAttribute('aria-checked',on);c.setAttribute('data-state',on?'checked':'unchecked');c.innerHTML=on?'<span data-slot="checkbox-indicator" style="display:grid;place-content:center;font-size:12px;line-height:1">✓</span>':''})});
 document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();alert('示範版暫不接收送出')})});

 // 燈箱：點照片放大，可左右切換
 var lb=null,list=[],idx=0;
 function build(){lb=document.createElement('div');lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(10,12,10,.92);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;color:#fff';
  lb.innerHTML='<div style="display:flex;width:min(1100px,100%);justify-content:space-between;align-items:center;gap:12px"><strong data-lb="cap" style="font-weight:600"></strong><button type="button" data-lb="close" style="background:#fff;color:#141814;border:0;border-radius:999px;padding:8px 14px;cursor:pointer">關閉 ✕</button></div><img data-lb="img" alt="" style="max-width:min(1100px,100%);max-height:78vh;object-fit:contain"/><div data-lb="nav" style="display:flex;gap:16px;align-items:center"><button type="button" data-lb="prev" style="background:#fff;color:#141814;border:0;border-radius:999px;padding:8px 14px;cursor:pointer">← 上一張</button><span data-lb="count"></span><button type="button" data-lb="next" style="background:#fff;color:#141814;border:0;border-radius:999px;padding:8px 14px;cursor:pointer">下一張 →</button></div>';
  document.body.appendChild(lb);
  lb.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-lb');if(a==='close'||e.target===lb)close();if(a==='prev')go(idx-1);if(a==='next')go(idx+1)});
  addEventListener('keydown',function(e){if(lb.style.display==='none')return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')go(idx-1);if(e.key==='ArrowRight')go(idx+1)})}
 function q(n){return lb.querySelector('[data-lb="'+n+'"]')}
 function go(n){idx=Math.max(0,Math.min(n,list.length-1));var p=list[idx];q('img').src=p.url;q('img').alt=p.caption||'';q('cap').textContent=p.caption||'';q('nav').style.display=list.length>1?'flex':'none';q('count').textContent=(idx+1)+' / '+list.length;q('prev').disabled=idx===0;q('next').disabled=idx===list.length-1;q('prev').style.opacity=idx===0?.4:1;q('next').style.opacity=idx===list.length-1?.4:1}
 function close(){lb.style.display='none';document.body.style.overflow=''}
 document.querySelectorAll('.detail-gallery-image').forEach(function(b){b.addEventListener('click',function(){var fig=b.closest('figure'),img=b.querySelector('img');
  if(fig&&fig._photos){list=fig._photos;idx=fig._i||0}else{var c=fig&&fig.querySelector('.detail-gallery-caption span');list=[{url:img.getAttribute('src'),caption:c?c.textContent:img.alt}];idx=0}
  if(!lb)build();lb.style.display='flex';document.body.style.overflow='hidden';go(idx);q('close').focus()})});
})();
