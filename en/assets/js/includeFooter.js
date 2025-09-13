// assets/js/includeFooter.js  — include footer + social CTA
(function () {
  var FOOTER_URL = 'partials/footer.html?cb=' + Date.now();
  var CTA_URL = 'partials/social-cta.html?cb=' + Date.now();

  function injectFooter(html){
    var mount = document.getElementById('footer-root');
    if(!mount) return;
    mount.innerHTML = html;
    document.dispatchEvent(new Event('sitefooter:ready'));
  }

  function injectCTA(html){
    var mount = document.getElementById('footer-root');
    if(!mount) return;
    mount.innerHTML = html + mount.innerHTML;
  }

  function fallback(reason){
    console.error('[footer] fallback:', reason);
    injectFooter('<footer class="site-footer"><div class="container"><p>© Fede e Luce</p></div></footer>');
  }

  function init(){
    var mount = document.getElementById('footer-root');
    if(!mount){ console.error('[footer] #footer-root mancante'); return; }
    
    // Carica prima la CTA social, poi il footer
    Promise.all([
      fetch(CTA_URL, { cache: 'no-store' })
        .then(function(r){ if(!r.ok) throw new Error('CTA HTTP '+r.status); return r.text(); }),
      fetch(FOOTER_URL, { cache: 'no-store' })
        .then(function(r){ if(!r.ok) throw new Error('Footer HTTP '+r.status); return r.text(); })
    ])
    .then(function([ctaHtml, footerHtml]){
      mount.innerHTML = ctaHtml + footerHtml;
      document.dispatchEvent(new Event('sitefooter:ready'));
    })
    .catch(fallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
