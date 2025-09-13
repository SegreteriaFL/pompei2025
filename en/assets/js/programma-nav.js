(function(){
  function $id(id){ return document.getElementById(id); }

  function build(){
    var wrap = $id('programmaNav');
    if(!wrap) return;

    // mappa {id: etichetta}
    var giorni = [
      ['giovedi-18','Gio'],
      ['venerdi-19','Ven'],
      ['sabato-20','Sab'],
      ['veglia-itinerante','Veglia'],
      ['domenica-21','Dom']
    ].filter(function(it){ return document.getElementById(it[0]); });

    // render pills
    wrap.innerHTML = giorni.map(function(it){
      return '<a href="#'+it[0]+'" class="pill" data-target="'+it[0]+'">'+it[1]+'</a>';
    }).join('');

    // evidenziazione on scroll
    var pills = wrap.querySelectorAll('.pill');
    var articles = giorni.map(function(it){ return document.getElementById(it[0]); });

    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var id = e.target.id;
          pills.forEach(function(p){ p.setAttribute('aria-current', p.dataset.target===id ? 'true':'false'); });
        }
      });
    }, {rootMargin:'-50% 0px -50% 0px', threshold: 0});

    articles.forEach(function(a){ if(a) obs.observe(a); });

    // Prev/Next in fondo a ogni giornata
    articles.forEach(function(a, i){
      if(!a) return;
      var nav = document.createElement('div');
      nav.className = 'prevnext';
      var prev = i>0 ? '<a href="#'+articles[i-1].id+'">← Giorno precedente</a>' : '<span></span>';
      var next = i<articles.length-1 ? '<a href="#'+articles[i+1].id+'">Giorno successivo →</a>' : '<span></span>';
      nav.innerHTML = prev + next;
      a.appendChild(nav);
    });

    // smooth scroll nativo (comunque già hai html { scroll-behavior:smooth })
  }

  document.addEventListener('siteheader:ready', build);
  document.addEventListener('DOMContentLoaded', build);
})();
