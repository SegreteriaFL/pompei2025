// Language selector with dropdown
(function() {
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
  }

  function getLanguageFromPath() {
    const path = window.location.pathname;
    if (path.includes('/en/')) return 'en';
    if (path.includes('/fr/')) return 'fr';
    return 'it';
  }

  function getLanguageInfo(lang) {
    const languages = {
      'it': { name: 'IT', icon: '🇮🇹' },
      'en': { name: 'EN', icon: '🇬🇧' },
      'fr': { name: 'FR', icon: '🇫🇷' }
    };
    return languages[lang] || languages['it'];
  }

  function createLangSelector() {
    const currentPage = getCurrentPage();
    const currentLang = getLanguageFromPath();
    const currentLangInfo = getLanguageInfo(currentLang);
    
    // Create dropdown HTML
    const dropdownHTML = `
      <div class="lang-selector">
        <div class="lang-trigger" id="langTrigger">
          <svg class="lang-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.68089 8.39286L5.1372 10H3.75L6.07724 3.75H7.68293L10 10H8.54167L7.99797 8.39286H5.68089ZM7.72358 7.47253L6.875 4.94506H6.81402L5.96545 7.47253H7.72358Z" fill="currentColor"/>
            <path d="M0 2.5C0 1.11929 1.11929 0 2.5 0H11.25C12.6307 0 13.75 1.11929 13.75 2.5V6.25H17.5C18.8807 6.25 20 7.36929 20 8.75V17.5C20 18.8807 18.8807 20 17.5 20H8.75C7.36929 20 6.25 18.8807 6.25 17.5V13.75H2.5C1.11929 13.75 0 12.6307 0 11.25V2.5ZM2.5 1.25C1.80964 1.25 1.25 1.80964 1.25 2.5V11.25C1.25 11.9404 1.80964 12.5 2.5 12.5H11.25C11.9404 12.5 12.5 11.9404 12.5 11.25V2.5C12.5 1.80964 11.9404 1.25 11.25 1.25H2.5ZM11.4221 13.7442C11.6633 14.1202 11.925 14.4727 12.2093 14.8012C11.2751 15.5203 10.1189 16.0526 8.75 16.4167C8.97199 16.6876 9.31422 17.2105 9.44371 17.5C10.8496 17.0518 12.0428 16.4448 13.051 15.6323C14.0222 16.4634 15.2246 17.0891 16.7138 17.472C16.8803 17.1545 17.2318 16.6315 17.5 16.3607C16.0941 16.0432 14.9286 15.4923 13.976 14.7545C14.8269 13.8207 15.5021 12.6908 16.0016 11.3087H17.5V10H13.75V11.25C13.75 11.2696 13.7498 11.2892 13.7493 11.3087H14.7067C14.3089 12.3639 13.7817 13.2417 13.1158 13.9701C12.9318 13.7748 12.759 13.5701 12.5969 13.3565C12.2535 13.5765 11.8528 13.7149 11.4221 13.7442Z" fill="currentColor"/>
          </svg>
          <span>${currentLangInfo.name}</span>
          <svg class="lang-arrow" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41009 6.91009C4.73553 6.58466 5.26317 6.58466 5.5886 6.91009L9.99935 11.3208L14.4101 6.91009C14.7355 6.58466 15.2632 6.58466 15.5886 6.91009C15.914 7.23553 15.914 7.76317 15.5886 8.0886L10.5886 13.0886C10.2632 13.414 9.73553 13.414 9.41009 13.0886L4.41009 8.0886C4.08466 7.76317 4.08466 7.23553 4.41009 6.91009Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="lang-dropdown">
          ${['it', 'en', 'fr'].filter(lang => lang !== currentLang).map(lang => {
            const langInfo = getLanguageInfo(lang);
            let href = '';
            
            if (currentPage === 'index.html') {
              href = 'index.html';
            } else {
              if (lang === 'it') {
                href = currentLang === 'it' ? currentPage : `../${currentPage}`;
              } else if (lang === 'en') {
                href = currentLang === 'en' ? currentPage : `../en/${currentPage}`;
              } else if (lang === 'fr') {
                href = currentLang === 'fr' ? currentPage : `../fr/${currentPage}`;
              }
            }
            
            return `<a href="${href}" class="lang-dropdown-item">
              <span>${langInfo.name}</span>
            </a>`;
          }).join('')}
        </div>
      </div>
    `;
    
    return dropdownHTML;
  }

  function initLangSelector() {
    // Replace old lang selector with new dropdown
    const oldSelector = document.querySelector('.lang-selector');
    if (oldSelector) {
      oldSelector.outerHTML = createLangSelector();
    }
    
    // Add click handler for dropdown
    const trigger = document.getElementById('langTrigger');
    const selector = document.querySelector('.lang-selector');
    
    if (trigger && selector) {
      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;
      
      if (!isMobile) {
        // Desktop: toggle dropdown on click
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          selector.classList.toggle('open');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!selector.contains(e.target)) {
            selector.classList.remove('open');
          }
        });
      } else {
        // Mobile: always open, no click handler needed
        selector.classList.add('open');
      }
      
      // Handle window resize
      window.addEventListener('resize', () => {
        const isMobileNow = window.innerWidth <= 768;
        if (isMobileNow && !isMobile) {
          // Switched to mobile: always open
          selector.classList.add('open');
        } else if (!isMobileNow && isMobile) {
          // Switched to desktop: remove open class
          selector.classList.remove('open');
        }
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangSelector);
  } else {
    initLangSelector();
  }
})();
