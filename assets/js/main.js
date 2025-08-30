// main.js (patched to wait for dynamic header)
(function(){
  function init(){
    var nav = document.getElementById('nav');
    var list = document.getElementById('navList');
    var toggle = document.getElementById('menuToggle');
    if(!nav || !list) return; // header not ready

    // Clear list to avoid duplicates
    while(list.firstChild){ list.removeChild(list.firstChild); }

    var items = [
      ['intro.html','Intro'],
      ['programma.html','Programma'],
      ['veglia.html','Veglia'],
      ['guida-pompei.html','Guide'],
      ['canti.html','Canti'],
      ['preghiera.html','Preghiere']
    ];
    var current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    items.forEach(function(pair){
      var href = pair[0], label = pair[1];
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = href; a.textContent = label;
      if (current === href.toLowerCase()) a.setAttribute('aria-current','page');
      li.appendChild(a);
      list.appendChild(li);
    });

    if (toggle) {
      toggle.addEventListener('click', function(){
        var isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      list.addEventListener('click', function(){ nav.classList.remove('open'); });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('siteheader:ready', init);
})();