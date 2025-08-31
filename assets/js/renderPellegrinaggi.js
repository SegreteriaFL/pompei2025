// assets/js/renderPellegrinaggi.js
(async function () {
  // Path RELATIVI alla root del progetto (come intro.html)
  const DATA_URL = 'data/pellegrinaggi.json';
  const OG_ENDPOINT = 'api/og-image.php?url='; // in locale (python server) non c'è PHP: useremo placeholder

  // Hook agli ID usati in pellegrinaggi.html
  const $list     = document.getElementById('list');
  const $filter   = document.getElementById('filter');
  const $search   = document.getElementById('q');
  const $timeline = document.getElementById('timeline');
  const $count    = document.getElementById('count');
  const $sortNew  = document.getElementById('sort-new');
  const $sortOld  = document.getElementById('sort-old');

  if (!$list) {
    console.error('[pellegrinaggi] #list non trovato. Controlla gli ID in pellegrinaggi.html');
    return;
  }

  // Placeholder immagine (funziona anche senza PHP)
  const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#222"/><stop offset="100%" stop-color="#111"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#ffd166"
        font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="28">
        Ombre e Luci · Pellegrinaggi
      </text>
    </svg>
  `);

  // Carica JSON
  let items = [];
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    items = data.items || [];
  } catch (e) {
    console.error('[pellegrinaggi] errore caricamento JSON:', e);
    $list.innerHTML = `<p class="meta">Impossibile caricare <code>${DATA_URL}</code>. Verifica il percorso.</p>`;
    return;
  }

  // Popola filtro pellegrinaggio
  const uniquePilgrims = [...new Set(items.map(i => i.pellegrinaggio).filter(Boolean))].sort();
  if ($filter) {
    $filter.innerHTML = `<option value="tutti">Tutti i pellegrinaggi</option>` +
      uniquePilgrims.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  // Risoluzione og:image (funziona solo su server PHP; in locale torniamo null)
  async function resolveImage(url) {
    try {
      const r = await fetch(OG_ENDPOINT + encodeURIComponent(url));
      if (!r.ok) return null;
      const j = await r.json();
      return j.image || null;
    } catch {
      return null;
    }
  }

  // Utilità
  function parseDate(d){
    if(!d) return null;
    const parts = d.split('-').map(x=>parseInt(x,10));
    const y=parts[0], m=(parts[1]||1)-1, da=parts[2]||1;
    return new Date(y, m, da);
  }

  function cardTemplate(item, imgUrl) {
    const dateFmt = item.date ? new Date(item.date).toLocaleDateString('it-IT') : '';
    const meta = [item.author, dateFmt].filter(Boolean).join(' · ');
    return `
      <article class="pellegrinaggio-card">
        ${imgUrl ? `<a href="${item.url}" class="thumb" aria-label="${item.title}">
          <img loading="lazy" src="${imgUrl}" alt="${item.title}">
        </a>` : ''}
        <div class="content">
          <h3 class="title"><a href="${item.url}">${item.title}</a></h3>
          ${item.subtitle ? `<p class="subtitle">${item.subtitle}</p>` : ''}
          ${item.why ? `<p class="why">${item.why}</p>` : ''}
          ${meta ? `<p class="meta">${meta}</p>` : ''}
          ${item.pellegrinaggio ? `<p class="tag"><strong>${item.pellegrinaggio}</strong></p>` : ''}
        </div>
      </article>
    `;
  }

  let sortMode = 'new'; // 'new' | 'old'

  function filtered(){
    const f = $filter ? $filter.value : 'tutti';
    const q = ($search?.value || '').trim().toLowerCase();
    return items.filter(i => {
      const matchPil = (f === 'tutti') || (i.pellegrinaggio === f);
      if (!matchPil) return false;
      if (!q) return true;
      const hay = `${i.title||''} ${i.subtitle||''} ${i.why||''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function yearFromLabelOrDate(label, dateStr){
    const m = label && label.match(/(\d{4})/);
    if (m) return m[1];
    if (dateStr){ const d = parseDate(dateStr); if(!isNaN(d)) return String(d.getFullYear()); }
    return '—';
  }

  function renderTimeline(list){
    if (!$timeline) return;
    const groups = {};
    for (const i of list){
      const key = i.pellegrinaggio || '—';
      const year = yearFromLabelOrDate(i.pellegrinaggio, i.date);
      if (!groups[key]) groups[key] = { year, items: [] };
      groups[key].items.push(i);
    }
    const ordered = Object.entries(groups).sort((a,b)=>{
      const ay = parseInt(a[1].year)||0, by = parseInt(b[1].year)||0;
      return ay - by;
    });
    $timeline.innerHTML = ordered.map(([label,g]) => `
      <div class="timeline-group">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4>${label}${g.year && g.year!=='—' ? ` <span class="year">${g.year}</span>` : ''}</h4>
          <ul class="timeline-ul">
            ${g.items.map(i => `<li><a href="${i.url}">${i.title}</a></li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  async function renderList(){
    let arr = filtered();

    // ordinamento
    arr = arr.sort((a,b)=>{
      const da = parseDate(a.date); const db = parseDate(b.date);
      if(!da && !db) return 0;
      if(!da) return 1;
      if(!db) return -1;
      return sortMode === 'new' ? (db - da) : (da - db);
    });

    // render con immagini (auto -> og-image su server; in locale -> placeholder)
    const htmlParts = await Promise.all(arr.map(async (i) => {
      let img = null;
      if (i.image && i.image !== 'null') {
        if (i.image === 'auto') {
          // tenta server PHP; se fallisce usa placeholder
          img = await resolveImage(i.url);
          if (!img) img = PLACEHOLDER;
        } else {
          img = i.image;
        }
      }
      return cardTemplate(i, img);
    }));

    $list.innerHTML = htmlParts.join('') || `<p class="meta">Nessun articolo trovato.</p>`;

if ($count) {
  const n = arr.length;
  const nFmt = n.toLocaleString('it-IT');
  const label = n === 1 ? 'articolo mostrato' : 'articoli mostrati';
  $count.textContent = `${nFmt} ${label}`;
  $count.setAttribute('aria-live', 'polite');
}

renderTimeline(arr);
  }

  // Eventi UI
  $filter?.addEventListener('change', renderList);
  $search?.addEventListener('input', renderList);
  $sortNew?.addEventListener('click', ()=>{
    sortMode = 'new';
    $sortNew.setAttribute('aria-pressed','true');
    $sortOld?.setAttribute('aria-pressed','false');
    renderList();
  });
  $sortOld?.addEventListener('click', ()=>{
    sortMode = 'old';
    $sortOld.setAttribute('aria-pressed','true');
    $sortNew?.setAttribute('aria-pressed','false');
    renderList();
  });

  // Avvio
  renderList();
})();
