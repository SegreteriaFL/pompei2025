\
// includeFooter.js
(function(){
  function injectFooter(html){
    var mount = document.getElementById('footer-root');
    if (!mount) return;
    mount.innerHTML = html;
    document.dispatchEvent(new Event('sitefooter:ready'));
  }

  var FALLBACK = '<footer class="site-footer">\
  <div class="container">\
    <p><strong>Fede e Luce</strong> — Pellegrinaggio a Pompei 2025</p>\
    <p class="small">Progetto statico ottimizzato per funzionare anche in locale senza build o include esterni.</p>\
  </div>\
</footer>';

  try{
    fetch('partials/footer.html?v=1', {cache:'no-cache'})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
      .then(function(html){ injectFooter(html); })
      .catch(function(){ injectFooter(FALLBACK); });
  }catch(e){
    injectFooter(FALLBACK);
  }
})();
