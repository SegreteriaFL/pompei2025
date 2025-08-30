// main.js — Unified header + subnav + anchor offset (2025-08-30)
(function () {
  // ===== utilities =====
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const getHeaderH = () => {
    const cssVar = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    const el = $('#siteHeader') || $('.site-header');
    return Math.max(cssVar, el ? el.offsetHeight : 0);
  };

  // normalizza path per confronto "pagina corrente"
  function normalizePath(href) {
    const a = document.createElement('a');
    a.href = href;
    let p = (a.pathname || '/').toLowerCase();
    // rimuovi /index.html o /index
    p = p.replace(/\/index(?:\.html?)?$/, '/');
    // togli doppi slash finali
    p = p.replace(/\/+$/, '/');
    return p;
  }

  // scroll con offset dell'header (per sticky header)
  function scrollWithOffset(targetEl, behavior, fromEl) {
  if (!targetEl) return;
  const headerH = getHeaderH();
  const subnav = (fromEl && fromEl.closest?.('.subnav, .programma-nav')) || document.querySelector('.subnav, .programma-nav');
  const subnavH = subnav ? subnav.offsetHeight : 0;
  const gap = 12; // cuscinetto
  const y = targetEl.getBoundingClientRect().top + window.scrollY - (headerH + subnavH + gap);
  window.scrollTo({ top: y, behavior: behavior || 'smooth' });
}


  // link #... con offset e URL pulito
  function enhanceHashLinks(root) {
    const links = $all('a[href^="#"]', root || document);
    if (!links.length) return;

    links.forEach(a => {
      a.addEventListener('click', (ev) => {
        const id = a.getAttribute('href').slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return; // fallback nativo
        ev.preventDefault();
        scrollWithOffset(target, 'smooth');
        history.pushState(null, '', id ? ('#' + id) : window.location.pathname);
      }, { passive: false });
    });
  }

  // correggi posizione se l’URL ha già un hash all’apertura
function fixInitialHashOffset() {
  if (location.hash.length > 1) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      requestAnimationFrame(() => scrollWithOffset(el, 'auto', null));
    }
  }
}


  // ===== Header + menu generale =====
  function initHeaderAndNav() {
    const header = $('#siteHeader') || $('.site-header');
    const nav = $('#nav') || $('.site-nav');
    const list = $('#navList') || $('.nav-list');
    const toggle = $('#menuToggle') || $('.menu-toggle');

    if (!header || !nav || !list) return; // header non ancora pronto

    // 1) Logo → index.html
    (function fixLogo() {
      const logoLink =
        $('.site-logo a', header) ||
        $('#siteLogo', header) ||
        $('a[rel="home"]', header) ||
        $('a.logo', header) ||
        $('a[aria-label="Home"]', header);
      if (logoLink) {
        logoLink.setAttribute('href', 'index.html');
        logoLink.setAttribute('aria-label', 'Vai alla Home');
      }
    })();

    // 2) Costruzione menu (idempotente)
    while (list.firstChild) list.removeChild(list.firstChild);

    const items = [
      ['intro.html',        'Per iniziare'],
      ['programma.html',    'Programma'],
      ['canti.html',        'Canti'],
      ['guida-pompei.html', 'Info'],
      ['staff.html',        'Staff'],
    ];

    const currentPath = normalizePath(window.location.pathname);

    items.forEach(([href, label]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;

      // attivo robusto: gestisce sottocartelle e index.html
      const itemPath = normalizePath(href);
      if (currentPath.endsWith(itemPath)) {
        a.setAttribute('aria-current', 'page');
      }

      li.appendChild(a);
      list.appendChild(li);
    });

    // 3) Toggle mobile + chiusure accessibili
    if (toggle) {
      const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      list.addEventListener('click', (e) => { if (e.target && e.target.tagName === 'A') closeMenu(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
      document.addEventListener('click', (e) => {
        if (!nav.classList.contains('open')) return;
        if (!nav.contains(e.target) && e.target !== toggle) closeMenu();
      });
    }
  }

  // ===== Subnav (riuso per Programma, Info, ecc.) =====
  function initSubnavs() {
    // evidenziazione attiva per *tutte* le subnav presenti
    $all('.subnav').forEach(subnav => {
      const links = $all('a[href^="#"]', subnav);
      if (!links.length) return;

      // click con offset (se non già gestito globalmente)
      enhanceHashLinks(subnav);

      const ids = links.map(a => a.getAttribute('href').slice(1)).filter(Boolean);
      const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
      if (!sections.length) return;

      const headerH = getHeaderH();
      const subnavH = subnav.offsetHeight || 56;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          links.forEach(a => {
            const active = a.getAttribute('href') === '#' + id;
            a.classList.toggle('active', active);
            a.setAttribute('aria-current', active ? 'true' : 'false');
          });
        });
      }, { rootMargin: `-${headerH + subnavH + 8}px 0px -60% 0px`, threshold: 0.1 });

      sections.forEach(sec => obs.observe(sec));
    });
  }

  // ===== progress bar =====
  (function () {
    const bar = $('.scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // ===== boot =====
  function boot() {
    document.documentElement.classList.add('is-loaded');
    initHeaderAndNav();
    enhanceHashLinks(document);
    initSubnavs();
    fixInitialHashOffset();
  }

  document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('siteheader:ready', boot);
})();

(function () {
  document.querySelectorAll('.subnav, .programma-nav').forEach((subnav) => {
    const links = subnav.querySelectorAll('a.tab, a.pill');
    if (!links.length) return;

    // scroll con offset sugli anchor (riusa già la tua enhanceHashLinks se c’è)
    links.forEach(a => {
      a.addEventListener('click', (ev) => {
        const id = a.getAttribute('href').slice(1);
        const t = id && document.getElementById(id);
        if (!t) return;
        ev.preventDefault();
        const header = document.getElementById('siteHeader') || document.querySelector('.site-header');
        const headerH = header ? header.offsetHeight : 64;
        const y = t.getBoundingClientRect().top + window.scrollY - (headerH + 8 + subnav.offsetHeight);
        window.scrollTo({ top: y, behavior: 'smooth' });
        links.forEach(l => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
        history.pushState(null, '', '#' + id);
      }, { passive: false });
    });

    // evidenziazione automatica mentre scorri
    const ids = Array.from(links).map(a => a.getAttribute('href').slice(1)).filter(Boolean);
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const header = document.getElementById('siteHeader') || document.querySelector('.site-header');
    const headerH = header ? header.offsetHeight : 64;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        links.forEach(a => {
          const on = a.getAttribute('href') === '#' + id;
          a.toggleAttribute('aria-current', on);
          a.classList.toggle('active', on);
        });
      });
    }, { rootMargin: `-${headerH + subnav.offsetHeight + 8}px 0px -60% 0px`, threshold: 0.1 });

    sections.forEach(sec => obs.observe(sec));
  });
})();

