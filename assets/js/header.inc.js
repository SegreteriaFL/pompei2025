// header.inc.js
// Single source of truth for the header markup, friendly to file:// usage.
window.HEADER_HTML = `<header class="site-header" role="banner">
  <div class="container header-inner">
    <div class="brand">
      <a href="index.html" class="brand-link" aria-label="Vai alla home">
        <img src="assets/img/favicon.png" alt="" width="28" height="28" class="logo" />
        <span class="brand-text">Pellegrinaggio Pompei 2025</span>
      </a>
    </div>
    <button id="menuToggle" class="menu-toggle" aria-expanded="false" aria-controls="nav">menu</button>
    <nav id="nav" class="site-nav" role="navigation" aria-label="principale">
      <ul id="navList" class="nav-list"><!-- costruito da JS --></ul>
    </nav>
  </div>
</header>
`;

(function(){
  function mount(){
    var el = document.getElementById('siteHeader') || document.getElementById('header-root');
    if (!el) return;
    el.outerHTML = window.HEADER_HTML;
    document.dispatchEvent(new Event('siteheader:ready'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
