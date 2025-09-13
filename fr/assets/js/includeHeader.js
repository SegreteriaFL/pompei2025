\
// includeHeader.js
// Injects /partials/header.html into #header-root. Works offline with a JS fallback.
(function(){
  function inject(html){
    console.debug('[includeHeader] injecting header...');
    var mount = document.getElementById('header-root');
    if (!mount) return;
    mount.innerHTML = html;
    document.dispatchEvent(new Event('siteheader:ready'));
  }

// includeHeader.js (estratto)
// Fallback markup (kept in sync with partials/header.html)
var FALLBACK = '<header class="site-header" role="banner">\
  <div class="container header-inner">\
    <div class="brand">\
      <a class="logo" href="index.html">\
        <img src="../../assets/img/logo_pompei_2025.png" alt="" role="presentation" class="logo-img" />\
        <span class="sr-only">Fede e Luce – Pellegrinaggio Pompei 2025</span>\
      </a>\
    </div>\
    <button id="menuToggle" class="menu-toggle" aria-expanded="false" aria-controls="nav">menu</button>\
    <nav id="nav" class="site-nav" role="navigation" aria-label="principale">\
      <ul id="navList" class="nav-list"></ul>\
    </nav>\
  </div>\
</header>';


  // Try to fetch the external partial (works when served over http/https)
  try{
    fetch('partials/header.html?v=2', {cache:'no-cache'})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
      .then(function(html){ inject(html); })
      .catch(function(){ inject(FALLBACK); });
  }catch(e){
    // Some environments (older browsers / file://) may throw on fetch
    inject(FALLBACK);
  }
})();
