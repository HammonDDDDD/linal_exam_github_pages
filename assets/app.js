
(function(){const root=document.documentElement,saved=localStorage.getItem('la-theme');if(saved)root.setAttribute('data-theme',saved);const btn=document.getElementById('themeToggle');if(btn)btn.onclick=()=>{const next=root.getAttribute('data-theme')==='dark'?'light':'dark';root.setAttribute('data-theme',next);localStorage.setItem('la-theme',next)}})();function getDone(){try{return JSON.parse(localStorage.getItem('la-done')||'{}')}catch(e){return{}}}function setDone(n,v){const d=getDone();d[n]=v;localStorage.setItem('la-done',JSON.stringify(d))}function refreshDone(){const d=getDone();document.querySelectorAll('[data-ticket-card]').forEach(c=>c.classList.toggle('done',!!d[c.dataset.ticketCard]));const b=document.querySelector('[data-mark-ticket]');if(b){const done=!!d[b.dataset.markTicket];b.textContent=done?'Снять отметку':'Отметить как выученный';b.classList.toggle('primary',!done)}}document.addEventListener('DOMContentLoaded',()=>{refreshDone();document.querySelectorAll('[data-toggle-done]').forEach(el=>el.onclick=e=>{e.preventDefault();const d=getDone(),n=el.dataset.toggleDone;setDone(n,!d[n]);refreshDone()});const mark=document.querySelector('[data-mark-ticket]');if(mark)mark.onclick=()=>{const d=getDone(),n=mark.dataset.markTicket;setDone(n,!d[n]);refreshDone()};const q=document.getElementById('ticketSearch'),topic=document.getElementById('topicFilter');function filt(){const query=(q?.value||'').toLowerCase(),tv=topic?.value||'all';document.querySelectorAll('[data-ticket-card]').forEach(c=>{const ok=(!query||c.textContent.toLowerCase().includes(query))&&(tv==='all'||c.dataset.topic===tv);c.style.display=ok?'':'none'})}if(q)q.oninput=filt;if(topic)topic.onchange=filt;const ss=document.getElementById('siteSearch'),res=document.getElementById('siteSearchResults');if(ss&&res)fetch('search-index.json').then(r=>r.json()).then(idx=>{ss.oninput=()=>{const terms=ss.value.toLowerCase().trim().split(/\s+/).filter(Boolean);res.innerHTML='';if(!terms.length)return;idx.filter(it=>terms.every(t=>it.text.toLowerCase().includes(t)||it.title.toLowerCase().includes(t))).slice(0,10).forEach(it=>{const a=document.createElement('a');a.className='ticket-card';a.href=it.url;a.innerHTML=`<span class="num">Билет ${it.num}</span><h3>${it.title.replace(/^Билет \d+\.\s*/,'')}</h3><p class="topic">${it.topic}</p>`;res.appendChild(a)})}})});


// v3 restored: full/oral mode on ticket pages
function setupTicketModes(){
  const page=document.querySelector('.ticket-page');
  if(!page) return;
  const fullBtn=document.getElementById('showFull');
  const oralBtn=document.getElementById('showOral');
  function setMode(mode){
    page.classList.toggle('full-active',mode==='full');
    page.classList.toggle('oral-active',mode==='oral');
    fullBtn?.classList.toggle('active',mode==='full');
    oralBtn?.classList.toggle('active',mode==='oral');
    localStorage.setItem('la-ticket-mode',mode);
    if(window.MathJax) MathJax.typesetPromise([page]).catch(()=>{});
  }
  fullBtn?.addEventListener('click',()=>setMode('full'));
  oralBtn?.addEventListener('click',()=>setMode('oral'));
  setMode(localStorage.getItem('la-ticket-mode') || 'full');
}
async function loadFullTicket(){
  const holder=document.getElementById('fullContent');
  if(!holder || !holder.dataset.oldUrl) return;
  try{
    const res=await fetch(holder.dataset.oldUrl,{cache:'force-cache'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    let txt=await res.text();
    txt=txt.replace(/\\relax/g,'\\mathbb{C}');
    txt=txt.replace(/Режим устного ответа/g,'');
    const doc=new DOMParser().parseFromString(txt,'text/html');
    let article=doc.querySelector('article.article') || doc.querySelector('main') || doc.body;
    article.querySelectorAll('.ticket-tools,#examMode,script,style,header,footer,.topbar,.sidebar').forEach(e=>e.remove());
    holder.innerHTML=article.innerHTML;
    holder.querySelectorAll('a[href^="../"]').forEach(a=>{ /* keep local links reasonable */ });
    if(window.MathJax) await MathJax.typesetPromise([holder]);
  }catch(e){
    holder.innerHTML='<div class="loading-full">Не удалось автоматически загрузить полный конспект из первого коммита. Используй вкладку «Устный ответ» ниже или обнови страницу. Ошибка: '+String(e).replace(/[<>]/g,'')+'</div>';
  }
}
document.addEventListener('DOMContentLoaded',()=>{setupTicketModes();loadFullTicket();});
