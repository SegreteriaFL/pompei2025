// init fade once DOM is ready and header/footer (if async) are in.
(function () {
  function markReady() {
    document.body.classList.add('is-ready');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markReady, { once: true });
  } else {
    markReady();
  }

  // Utility per far animare anche contenuti aggiunti dopo (es. liste dinamiche)
  window.fadeInChildren = function (root) {
    var els = (root || document).querySelectorAll('[data-fade]:not(.fade-seen)');
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i * 40) + 'ms';
      // forza ricalcolo e poi mostra con transizione
      el.getBoundingClientRect();
      el.classList.add('fade-seen');
    });
  };
})();


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
      ['programma-sintetico.html',    'Programma'],
      ['canti.html',        'Canti'],
      ['guida-pompei.html', 'Info'],
      ['staff.html',        'Staff'],
      ['pellegrinaggi.html','Letture']
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
  // RIMOSSO: conflitto con sistema più completo sotto

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
    // initSubnavs(); // RIMOSSO: conflitto con sistema più completo
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
      // Trova la sezione più visibile
      let mostVisible = null;
      let maxVisibility = 0;
      
      entries.forEach(e => {
        if (e.isIntersecting) {
          const rect = e.boundingClientRect;
          const visibility = Math.min(rect.height, window.innerHeight - rect.top, rect.bottom);
          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            mostVisible = e.target;
          }
        }
      });
      
      // Aggiorna solo se c'è una sezione visibile
      if (mostVisible) {
        const id = mostVisible.id;
        links.forEach(a => {
          const on = a.getAttribute('href') === '#' + id;
          a.setAttribute('aria-current', on ? 'true' : 'false');
          a.classList.toggle('active', on);
        });
      }
    }, { rootMargin: `-${headerH + subnav.offsetHeight + 8}px 0px -60% 0px`, threshold: 0.1 });

    sections.forEach(sec => obs.observe(sec));
  });
})();

// === Sticky System Unificato ===
(function(){
  const $doc = document.documentElement;

  function getHeaderEl(){
    // Adatta il selettore al tuo header reale (es. '.site-header' o '#siteHeader .site-header')
    return document.querySelector('.site-header') || document.querySelector('#siteHeader') || null;
  }

  function setHeaderHeightVar(){
    const h = getHeaderEl();
    const hh = h ? Math.ceil(h.getBoundingClientRect().height) : 0;
    $doc.style.setProperty('--header-height', hh + 'px');
  }

  // Attiva ombra e calcola altezza sticky attiva
  function attachStickyObserver(el){
    // sentinella prima della barra
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.position = 'relative';
    sentinel.style.height = '1px';
    el.parentNode.insertBefore(sentinel, el);

    const updateActiveSticky = () => {
      if (el.classList.contains('is-stuck')){
        const h = Math.ceil(el.getBoundingClientRect().height);
        $doc.style.setProperty('--active-sticky', h + 'px');
      } else {
        // Se ci sono più sticky, prendiamo la maggiore
        const all = Array.from(document.querySelectorAll('.sticky-bar.is-stuck'));
        const maxH = all.reduce((m, n) => Math.max(m, Math.ceil(n.getBoundingClientRect().height)), 0);
        $doc.style.setProperty('--active-sticky', (maxH || 0) + 'px');
      }
    };

    // L’header occupa spazio: spostiamo la rootMargin in alto di header-height
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        // quando la sentinella esce dall’area visibile, la barra è "stuck"
        if (entry.isIntersecting){
          el.classList.remove('is-stuck');
        } else {
          el.classList.add('is-stuck');
        }
        updateActiveSticky();
      });
    },{
      root: null,
      rootMargin: `-${getVarPx('--header-height')}px 0px 0px 0px`,
      threshold: [1]
    });

    obs.observe(sentinel);

    // Aggiorna su resize/layout changes
    const ro = new ResizeObserver(()=>{ setHeaderHeightVar(); updateActiveSticky(); });
    ro.observe(el);
  }

  function getVarPx(name){
    const v = getComputedStyle($doc).getPropertyValue(name).trim();
    return parseInt(v || '0', 10);
  }

  function initAllStickyBars(){
    setHeaderHeightVar();
    const bars = document.querySelectorAll('.sticky-bar');
    bars.forEach(attachStickyObserver);
    // set iniziale per scroll-margin-top coerente
    $doc.style.setProperty('--active-sticky',
      String(Math.max(0, ...Array.from(bars).map(b=>Math.ceil(b.getBoundingClientRect().height)))) + 'px'
    );
  }

  // Anchor offset FIX (click e page-load con hash)
  function offsetScrollTo(target){
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY
            - getVarPx('--header-height') - getVarPx('--active-sticky') - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function initAnchorFix(){
    // Click su link interni
    document.addEventListener('click', function(e){
      const a = e.target.closest('a[href^="#"]:not([href="#"])');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      history.pushState(null, '', '#' + id);
      offsetScrollTo(target);
    });

    // Se la pagina apre già con hash
    if (location.hash && location.hash.length > 1){
      const target = document.getElementById(location.hash.slice(1));
      if (target){
        // aspetta un frame per calcolare header/sticky esatti
        requestAnimationFrame(()=>offsetScrollTo(target));
      }
    }
  }

  // Init on ready + su resize
  function onReady(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }

  onReady(function(){
    initAllStickyBars();
    initAnchorFix();
  });

  window.addEventListener('resize', setHeaderHeightVar);
})();

// === BACK TO TOP BUTTON ===
(function() {
  // Crea il pulsante back2top se non esiste
  function createBack2TopButton() {
    let back2topBtn = document.getElementById('back2top');
    
    if (!back2topBtn) {
      back2topBtn = document.createElement('button');
      back2topBtn.id = 'back2top';
      back2topBtn.className = 'btn back2top';
      back2topBtn.setAttribute('aria-label', 'Torna all\'inizio');
      back2topBtn.setAttribute('title', 'Torna all\'inizio');
      
      back2topBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      `;
      
      document.body.appendChild(back2topBtn);
    }
    
    return back2topBtn;
  }
  
  const back2topBtn = createBack2TopButton();

  // Mostra/nascondi il pulsante in base allo scroll
  function toggleBack2Top() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const showThreshold = 300; // Mostra dopo 300px di scroll
    
    if (scrollTop > showThreshold) {
      back2topBtn.classList.add('visible');
    } else {
      back2topBtn.classList.remove('visible');
    }
  }

  // Scroll to top quando si clicca il pulsante
  back2topBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Ascolta lo scroll per mostrare/nascondere il pulsante
  window.addEventListener('scroll', toggleBack2Top, { passive: true });
  
  // Controllo iniziale
  toggleBack2Top();
})();

// === SOCIAL APP LINKS ===
(function() {
  // Funzione per rilevare se siamo su mobile
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Gestisce i click sui link social per aprire l'app se disponibile
  function handleSocialLinks() {
    const socialLinks = document.querySelectorAll('a[data-app-url]');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const appUrl = this.getAttribute('data-app-url');
        const webUrl = this.getAttribute('href');
        
        if (!appUrl) return;
        
        // Su mobile: prova app prima, poi browser
        if (isMobile()) {
        e.preventDefault();
        
        // Prova ad aprire l'app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);
        
        // Se l'app non si apre entro 2.5 secondi, apri la pagina web
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }, 2500);
        }
        // Su desktop: lascia che il browser gestisca normalmente (target="_blank")
      });
    });
  }

  // Inizializza quando il DOM è pronto e quando il footer è caricato
  function initSocialLinks() {
    handleSocialLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSocialLinks);
  } else {
    initSocialLinks();
  }
  
  // Re-inizializza quando il footer è caricato (per i link social nel footer)
  document.addEventListener('sitefooter:ready', initSocialLinks);
})();

// === NAVIGAZIONE AVATAR AUTORI INTRO ===
(function() {
  const avatarNav = document.querySelector('.programma-nav[aria-label="Navigazione per autore"]');
  if (!avatarNav) return; // Solo su intro.html

  const avatarLinks = Array.from(avatarNav.querySelectorAll('.pill'));
  const sections = avatarLinks.map(link => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);

  if (!sections.length) return;

  // Evidenzia il link attivo in base alla sezione visibile
  function updateActiveAvatar() {
    const headerHeight = 64; // Altezza header
    const offset = headerHeight + 100; // Offset per considerare la sezione "attiva"
    
    let activeSection = null;
    let minDistance = Infinity;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top - offset);
      
      if (rect.top <= offset && rect.bottom > offset) {
        activeSection = section;
      } else if (rect.top > offset && distance < minDistance) {
        minDistance = distance;
        activeSection = section;
      }
    });

    // Aggiorna i link attivi
    avatarLinks.forEach(link => {
      const sectionId = link.getAttribute('href').slice(1);
      const isActive = activeSection && activeSection.id === sectionId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  // Ascolta lo scroll per aggiornare la navigazione
  window.addEventListener('scroll', function() {
    updateActiveAvatar();
  }, { passive: true });

  // Controllo iniziale
  updateActiveAvatar();
})();


