
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('la-theme');
  if (saved) root.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('la-theme', next);
  });
})();

function getDone(){
  try { return JSON.parse(localStorage.getItem('la-done') || '{}'); } catch(e){ return {}; }
}
function setDone(n, value){
  const d = getDone(); d[n] = value; localStorage.setItem('la-done', JSON.stringify(d));
}
function refreshDone(){
  const d = getDone();
  document.querySelectorAll('[data-ticket-card]').forEach(card => {
    const n = card.getAttribute('data-ticket-card');
    card.classList.toggle('done', !!d[n]);
  });
  const mark = document.querySelector('[data-mark-ticket]');
  if (mark) {
    const n = mark.getAttribute('data-mark-ticket');
    const done = !!d[n];
    mark.textContent = done ? 'Снять отметку' : 'Отметить как выученный';
    mark.classList.toggle('primary', !done);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  refreshDone();
  document.querySelectorAll('[data-toggle-done]').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const n = el.getAttribute('data-toggle-done');
      const d = getDone();
      setDone(n, !d[n]); refreshDone();
    });
  });
  const mark = document.querySelector('[data-mark-ticket]');
  if (mark) mark.addEventListener('click', () => {
    const n = mark.getAttribute('data-mark-ticket');
    const d = getDone(); setDone(n, !d[n]); refreshDone();
  });
  const exam = document.getElementById('examMode');
  if (exam) exam.addEventListener('click', () => document.body.classList.toggle('exam-mode'));
  const q = document.getElementById('ticketSearch');
  const topic = document.getElementById('topicFilter');
  function applyFilters(){
    const query = (q?.value || '').toLowerCase();
    const tv = topic?.value || 'all';
    document.querySelectorAll('[data-ticket-card]').forEach(card => {
      const hay = card.textContent.toLowerCase();
      const ct = card.getAttribute('data-topic');
      card.style.display = (!query || hay.includes(query)) && (tv === 'all' || ct === tv) ? '' : 'none';
    });
  }
  if (q) q.addEventListener('input', applyFilters);
  if (topic) topic.addEventListener('change', applyFilters);

  const siteSearch = document.getElementById('siteSearch');
  const results = document.getElementById('siteSearchResults');
  if (siteSearch && results) {
    fetch('search-index.json').then(r=>r.json()).then(index => {
      siteSearch.addEventListener('input', () => {
        const terms = siteSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        results.innerHTML = '';
        if (!terms.length) return;
        index.filter(item => terms.every(t => item.text.toLowerCase().includes(t) || item.title.toLowerCase().includes(t))).slice(0,8).forEach(item => {
          const a = document.createElement('a');
          a.className = 'ticket-card';
          a.href = item.url;
          a.innerHTML = `<span class="num">Билет ${item.num}</span><h3>${item.title.replace(/^Билет \d+\.\s*/, '')}</h3><p class="topic">${item.topic}</p>`;
          results.appendChild(a);
        });
      });
    });
  }
});
