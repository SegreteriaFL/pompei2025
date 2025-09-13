// fr/assets/js/renderPellegrinaggi.js
(async function () {
  // PATH relativi alla pagina (come in intro.html)
  const DATA_URL    = '../data/pellegrinaggi.json';
  const OG_ENDPOINT = '../api/og-image.php?url=';
  const PLACEHOLDER = '../assets/img/placeholder-og.svg'; // deve esistere

  // Hook elementi pagina
  const $list     = document.getElementById('list');
  const $filter   = document.getElementById('filter');
  const $search   = document.getElementById('q');
  const $timeline = document.getElementById('timeline');
  const $count    = document.getElementById('count');
  const $sortNew  = document.getElementById('sort-new');
  const $sortOld  = document.getElementById('sort-old');

  if (!$list) {
    console.error('[pellegrinaggi] #list non trouvé: vérifiez les ID dans pellegrinaggi.html');
    return;
  }

  // Carica JSON dati
  let items = [];
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    items = Array.isArray(data.items) ? data.items : [];
  } catch (e) {
    console.error('[pellegrinaggi] erreur de chargement JSON:', e);
    $list.innerHTML = `<p class="meta">Impossible de charger <code>${DATA_URL}</code>.</p>`;
    if ($count) $count.textContent = '0 articles affichés';
    return;
  }

  // Popola filtro pellegrinaggio
  if ($filter) {
    const uniquePilgrims = [...new Set(items.map(i => i.pellegrinaggio).filter(Boolean))].sort();
    $filter.innerHTML = `<option value="tutti">Tous les pèlerinages</option>` +
      uniquePilgrims.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  // Utilità
  function parseDate(d) {
    if (!d) return null;
    const parts = d.split('-').map(x => parseInt(x, 10));
    const y = parts[0], m = (parts[1] || 1) - 1, da = parts[2] || 1;
    return new Date(y, m, da);
  }

  async function resolveImage(url) {
    // prova via endpoint PHP; se fallisce => null
    try {
      const r = await fetch(OG_ENDPOINT + encodeURIComponent(url), { cache: 'no-store' });
      if (!r.ok) return null;
      const j = await r.json();
      return j && j.image ? j.image : null;
    } catch {
      return null;
    }
  }

  function cardTemplate(item, imgUrl) {
    const dateFmt = item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '';
    const meta    = [item.author, dateFmt].filter(Boolean).join(' · ');
    const tag     = item.pellegrinaggio ? `<span class="tag">${item.pellegrinaggio}</span>` : '';

    return `
      <article class="pellegrinaggio-card" role="listitem">
        <a href="${item.url}" class="thumb" aria-label="${item.title}">
          <img loading="lazy" src="${imgUrl}" alt="${item.title}">
        </a>
        ${tag}
        <div class="content">
          <h3 class="title"><a href="${item.url}">${item.title}</a></h3>
          ${item.why ? `<p class="why">${item.why}</p>` : ''}
          ${meta ? `<p class="meta">${meta}</p>` : ''}
        </div>
      </article>
    `;
  }

  // Stato ordinamento
  let sortMode = 'new'; // 'new' | 'old'

  function filtered() {
    const f = $filter ? $filter.value : 'tutti';
    const q = ($search?.value || '').trim().toLowerCase();
    return items.filter(i => {
      const matchPil = (f === 'tutti') || (i.pellegrinaggio === f);
      if (!matchPil) return false;
      if (!q) return true;
      const hay = `${i.title || ''} ${i.subtitle || ''} ${i.why || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function yearFrom(label, dateStr) {
    const m = label && label.match(/(\d{4})/);
    if (m) return m[1];
    if (dateStr) {
      const d = parseDate(dateStr);
      if (!isNaN(d)) return String(d.getFullYear());
    }
    return '—';
  }

  function renderTimeline(arr) {
    if (!$timeline) return;
    const groups = {};
    for (const i of arr) {
      const key = i.pellegrinaggio || '—';
      const year = yearFrom(i.pellegrinaggio, i.date);
      if (!groups[key]) groups[key] = { year, items: [] };
      groups[key].items.push(i);
    }
    const ordered = Object.entries(groups).sort((a, b) => {
      const ay = parseInt(a[1].year) || 0;
      const by = parseInt(b[1].year) || 0;
      return ay - by;
    });
    $timeline.innerHTML = ordered.map(([label, g]) => `
      <div class="timeline-group">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4>${label}${g.year && g.year !== '—' ? ` <span class="year">${g.year}</span>` : ''}</h4>
          <ul class="timeline-ul">
            ${g.items.map(i => `<li><a href="${i.url}">${i.title}</a></li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  async function renderList() {
    let arr = filtered();

    // ordinamento
    arr = arr.sort((a, b) => {
      const da = parseDate(a.date); const db = parseDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return sortMode === 'new' ? (db - da) : (da - db);
    });

    // render con immagine robusta (og-image o placeholder)
    const htmlParts = await Promise.all(arr.map(async (i) => {
      let img = null;
      if (i.image && i.image !== 'null') {
        if (i.image === 'auto') {
          img = await resolveImage(i.url);
        } else {
          img = i.image;
        }
      }
      if (!img) img = PLACEHOLDER; // SEMPRE un fallback
      return cardTemplate(i, img);
    }));

    $list.innerHTML = htmlParts.join('') || `<p class="meta">Aucun article trouvé.</p>`;

    if ($count) {
      const n = arr.length;
      const nFmt = n.toLocaleString('fr-FR');
      const label = n === 1 ? 'article affiché' : 'articles affichés';
      $count.textContent = `${nFmt} ${label}`;
      $count.setAttribute('aria-live', 'polite');
    }

    renderTimeline(arr);
  }

  // Eventi UI
  $filter?.addEventListener('change', renderList);
  $search?.addEventListener('input', renderList);
  $sortNew?.addEventListener('click', () => {
    sortMode = 'new';
    $sortNew.setAttribute('aria-pressed', 'true');
    $sortOld?.setAttribute('aria-pressed', 'false');
    renderList();
  });
  $sortOld?.addEventListener('click', () => {
    sortMode = 'old';
    $sortOld.setAttribute('aria-pressed', 'true');
    $sortNew?.setAttribute('aria-pressed', 'false');
    renderList();
  });

  // Avvio
  renderList();
})();