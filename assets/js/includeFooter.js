// assets/js/includeFooter.js  — minimal, reusable
(function () {
  var URL = 'partials/footer.html?cb=' + Date.now(); // cache-buster semplice

  function inject(html){
    var mount = document.getElementById('footer-root');
    if(!mount) return;
    mount.innerHTML = html;
    document.dispatchEvent(new Event('sitefooter:ready'));
  }

  function fallback(reason){
    console.error('[footer] fallback:', reason);
    inject('<footer class="site-footer"><div class="container"><p>© Fede e Luce</p></div></footer>');
  }

  function init(){
    var mount = document.getElementById('footer-root');
    if(!mount){ console.error('[footer] #footer-root mancante'); return; }
    fetch(URL, { cache: 'no-store' })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
      .then(inject)
      .catch(fallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
