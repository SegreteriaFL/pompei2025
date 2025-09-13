// assets/js/social-cta.js — Smart Social CTA handling for iOS/Android
(function() {
  'use strict';

  // Rileva se siamo su iOS
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  // Rileva se siamo su Android
  function isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  // Rileva se siamo su mobile
  function isMobile() {
    return isIOS() || isAndroid();
  }

  // Prova ad aprire l'app e fallback al web se non funziona
  function openSocialLink(event) {
    const link = event.currentTarget;
    const webUrl = link.href;
    const appUrl = link.getAttribute('data-app-url');
    
    // Se non c'è app URL, comportamento normale
    if (!appUrl) return;
    
    // Su desktop, comportamento normale
    if (!isMobile()) return;
    
    event.preventDefault();
    
    // Su iOS, usa la strategia "try app first, then web"
    if (isIOS()) {
      // Crea un iframe nascosto per provare l'app
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = appUrl;
      document.body.appendChild(iframe);
      
      // Timeout per il fallback al web
      const fallbackTimer = setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 2000);
      
      // Se l'iframe si carica (app non disponibile), vai al web
      iframe.onload = () => {
        clearTimeout(fallbackTimer);
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      };
      
      // Se l'iframe ha errore, vai al web
      iframe.onerror = () => {
        clearTimeout(fallbackTimer);
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      };
      
      // Su iOS, se l'utente torna alla pagina entro 2 secondi, l'app si è aperta
      const pageHideHandler = () => {
        clearTimeout(fallbackTimer);
        document.body.removeChild(iframe);
        document.removeEventListener('pagehide', pageHideHandler);
      };
      
      document.addEventListener('pagehide', pageHideHandler);
      
    } else if (isAndroid()) {
      // Su Android, prova prima l'app
      const intentUrl = appUrl.replace(/^([a-z]+):/, 'intent://').replace(/#Intent;end$/, '') + '#Intent;end';
      
      // Crea un link temporaneo per l'intent
      const tempLink = document.createElement('a');
      tempLink.href = intentUrl;
      tempLink.style.display = 'none';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      // Fallback al web dopo un breve delay
      setTimeout(() => {
        window.open(webUrl, '_blank');
      }, 1000);
    }
  }

  // Inizializza i social CTA
  function initSocialCTA() {
    const socialLinks = document.querySelectorAll('.social-link[data-app-url]');
    
    socialLinks.forEach(link => {
      // Rimuovi eventuali listener precedenti
      link.removeEventListener('click', openSocialLink);
      // Aggiungi il nuovo listener
      link.addEventListener('click', openSocialLink, { passive: false });
    });
  }

  // Inizializza quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSocialCTA);
  } else {
    initSocialCTA();
  }

  // Re-inizializza quando vengono aggiunti nuovi social CTA (per includeFooter.js)
  document.addEventListener('sitefooter:ready', initSocialCTA);

})();
