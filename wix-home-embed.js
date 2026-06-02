<script>
(function(){
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if(path !== '/' && path !== '/home') return;

  document.body.classList.add('dc-custom-page');

  var IMG_CAMPO = 'https://static.wixstatic.com/media/f04508_4c736d9258b046718273b89c963c99ba~mv2.jpeg';
  var IMG_PLAYA = 'https://static.wixstatic.com/media/f04508_656a56188bc04b039df4430627f084d6~mv2.jpeg';
  var IMG_ELECTRIC = 'https://static.wixstatic.com/media/f04508_1d8d5acfdaf34adaacb2fc9379bf05fc~mv2.jpeg';
  var IMG_BARRICAS = 'https://static.wixstatic.com/media/f04508_8b8b22ca1ceb4491a489aeeedc92f70f~mv2.webp';
  var IMG_LOGO = 'https://cemi-rum.vercel.app/img/destileria-coqui-logo.png';
  var IMG_FERIA = 'https://cemi-rum.vercel.app/img/event-feria-pitorro.jpg';
  var IMG_TASTE = 'https://cemi-rum.vercel.app/img/event-taste-of-rum.jpg';
  var IMG_ELECTRIC_LIVE = 'https://cemi-rum.vercel.app/img/electric-420-fest.jpg';
  var IMG_FANGO = 'https://cemi-rum.vercel.app/img/event-fango-fest.png';

  var AR = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5H12M6.5 1L12 6.5L6.5 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var AD = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 1L6.5 12M1 6.5L6.5 12L12 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var AS = '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5H12M6.5 1L12 6.5L6.5 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var noise = document.createElement('div');
  noise.className = 'noise-layer';
  noise.setAttribute('aria-hidden','true');
  document.body.appendChild(noise);

  var app = document.createElement('div');
  app.id = 'dc-app';
  var h = '';

  h += '<nav id="dc-nav"><a href="/" class="nav-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></a><ul class="nav-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="#tours">Tours</a></li><li><a href="#eventos">Events</a></li></ul></nav>';

  h += '<section class="hero" id="home"><div class="hero-img"><img src="' + IMG_CAMPO + '" alt="Destilería Coquí, Inc."></div><div class="hero-content"><p class="hero-eyebrow">Destilería Coquí, Inc. · Mayagüez, Puerto Rico · Est. 2006</p><h1 class="hero-h1">Sabor<br>a Puerto<br><em>Rico.</em></h1><p class="hero-sub">Home of Pitorro®. One of Puerto Rico’s earliest and leading artisan distilleries, honoring the island’s heritage through a traditional spirit born from culture, memory, and celebration. Handcrafted in Mayagüez since 2006.</p><div class="hero-actions"><a href="/our-rums" class="btn-primary">Discover Our Rum ' + AR + '</a><a href="/historia" class="btn-text">Our Story ' + AD + '</a></div></div><div class="hero-scroll-indicator" aria-hidden="true"><div class="scroll-line"></div><span>Scroll</span></div></section>';

  h += '<section class="home-feature"><div class="home-feature-bg"><img src="' + IMG_CAMPO + '" alt="Sugarcane harvest in Puerto Rico" loading="lazy"></div><div class="home-feature-overlay"></div><div class="home-feature-inner"><span class="home-feature-eyebrow reveal">Est. 2006</span><h2 class="home-feature-title reveal d1">Our<br><em>Story</em></h2><p class="home-feature-body reveal d2">In 2006, Héctor Augusto and María Cristina founded Destilería Coquí, Inc. with a mission as bold as it was clear: to legalize Puerto Rico’s centuries-old Pitorro® tradition and bring it into the light. From Mayagüez, they built the island’s leading artisan distillery — and proved that heritage and craft belong together.</p><a href="/historia" class="home-feature-cta reveal d3">Read Our Story ' + AR + '</a></div></section>';

  h += '<section class="home-feature"><div class="home-feature-bg"><img src="' + IMG_PLAYA + '" alt="Pitorro® Blends lineup on the beach" loading="lazy"></div><div class="home-feature-overlay"></div><div class="home-feature-inner"><span class="home-feature-eyebrow reveal">18 Spirits</span><h2 class="home-feature-title reveal d1">Our<br><em>Rums</em></h2><p class="home-feature-body reveal d2">From our signature Ron Coquí white rum to Puerto Rico’s cherished Pitorro®, every bottle is hand-distilled in Mayagüez with purpose and tradition. Across eighteen spirits, each sip carries the flavors, heritage, and soul of the island.</p><a href="/our-rums" class="home-feature-cta reveal d3">See All Expressions ' + AR + '</a></div></section>';

  h += '<section class="events-section" id="eventos"><div class="events-inner"><div class="events-header"><div><p class="eyebrow reveal">Events &amp; Collaborations</p><h2 class="h2 reveal d1" style="font-size:clamp(3.6rem,5.8vw,6.5rem);">Evenings<br>worth <em>remembering.</em></h2></div><div><p class="body-text reveal d2">From cultural festivals to live music collaborations, Destilería Coquí, Inc. celebrates the people and traditions that bring Puerto Rico together.</p></div></div>';

  h += '<div class="events-grid">';
  h += '<article class="event-card reveal" data-event="feria-pitorro" role="button" tabindex="0"><div class="event-bg"><img src="' + IMG_FERIA + '" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Cultural Festival</span><span class="event-date">Annual Celebration</span><h3 class="event-title">Feria Nacional del Pitorro</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d1" data-event="taste-of-rum" role="button" tabindex="0"><div class="event-bg"><img src="' + IMG_TASTE + '" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Spirits Expo</span><span class="event-date">Event Archive</span><h3 class="event-title">Taste of Rum</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d2" data-event="electric-420" role="button" tabindex="0"><div class="event-bg"><img src="' + IMG_ELECTRIC_LIVE + '" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Festival Collaboration</span><span class="event-date">Event Archive</span><h3 class="event-title">420 Fest × Efecto Secundario Fest</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d3" data-event="fango-fest" role="button" tabindex="0"><div class="event-bg"><img src="' + IMG_FANGO + '" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Music &amp; Culture</span><span class="event-date">Event Archive</span><h3 class="event-title">Fango Fest</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '</div></div></section>';

  h += '<section class="awards"><div class="awards-inner"><div class="award-item reveal"><span class="award-score">2006</span><div class="award-sep"></div><p class="award-note">Founded in<br>Mayagüez, Puerto Rico</p></div><div class="award-item reveal d1"><span class="award-score" style="font-size:2.3rem;letter-spacing:-0.01em;">50k+</span><div class="award-sep"></div><p class="award-note">Cases produced<br>per year</p></div><div class="award-item reveal d2"><span class="award-score">25</span><div class="award-sep"></div><p class="award-note">Team members<br>on the island</p></div><div class="award-item reveal d3"><span class="award-score" style="font-size:2.1rem;letter-spacing:-0.01em;">No. 1</span><div class="award-sep"></div><p class="award-note">Largest artisan<br>distillery in Puerto Rico</p></div></div></section>';

  h += '<section class="tours-section" id="tours"><div class="tours-inner"><div class="tours-split"><div class="tours-text"><p class="eyebrow reveal">Tours &amp; Tastings</p><h2 class="h2 reveal d1">The Distillery<br><em>Tour.</em></h2><p class="body-text reveal d2" style="margin-top:2.25rem;">Walk through Puerto Rico’s leading artisan distillery and see how Pitorro® is made. Our team in Mayagüez guides you through the full production process and finishes with a tasting of our spirits. Children under 18 enter free.</p><a href="/tours" class="btn-primary reveal d3" style="margin-top:3.25rem;display:inline-flex;align-self:flex-start;">View Available Dates ' + AR + '</a><span class="tours-tag reveal d4">Call 787-805-1000 · $45/person · Mon – Fri, 9:30am – 5:30pm · Sat until 4:30pm</span></div><div class="tours-img-wrap reveal d2"><img class="tours-img" src="' + IMG_BARRICAS + '" alt="Destileria Coqui aging barrels" loading="lazy"></div></div></div></section>';

  h += '<footer><span class="footer-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></span><p class="footer-copy">© 2026 Destilería Coquí, Inc. — Mayagüez, Puerto Rico.<br>Drink responsibly. Must be of legal drinking age.</p><ul class="footer-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li></ul></footer>';

  h += '<div class="event-modal-overlay" id="eventModal" role="dialog" aria-modal="true"><div class="event-modal"><button class="modal-close" id="eventModalClose" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button><img class="event-modal-img" id="eventModalImg" src="" alt=""><div class="event-modal-body"><span class="event-modal-type" id="eventModalType"></span><span class="event-modal-date" id="eventModalDate"></span><h2 class="event-modal-title" id="eventModalTitle"></h2><p class="event-modal-location" id="eventModalLocation"></p><p class="event-modal-desc" id="eventModalDesc"></p></div></div></div>';

  app.innerHTML = h;
  document.body.prepend(app);

  /* === INTERACTIONS === */

  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target); }});
  }, {threshold:0.08, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('#dc-app .reveal').forEach(function(el){ revealObs.observe(el); });

  var nav = document.getElementById('dc-nav');
  var heroEl = document.querySelector('#dc-app .hero');
  var heroH = heroEl ? heroEl.offsetHeight : 600;
  function handleScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > heroH * 0.75); }
  window.addEventListener('scroll', handleScroll, {passive:true});
  handleScroll();

  var features = document.querySelectorAll('#dc-app .home-feature');
  function parallax(){
    features.forEach(function(s){
      var r = s.getBoundingClientRect();
      if(r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      s.style.setProperty('--py', ((p - 0.5) * 55).toFixed(2) + 'px');
    });
  }
  window.addEventListener('scroll', parallax, {passive:true});
  parallax();

  document.querySelectorAll('#dc-app .home-feature-cta').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width/2) * 0.14;
      var y = (e.clientY - r.top - r.height/2) * 0.14;
      btn.style.transition = 'transform 0.18s ease';
      btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    btn.addEventListener('mouseleave', function(){
      btn.style.transition = 'transform 0.65s cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform = '';
    });
  });

  var EVENTS = {
    'feria-pitorro': {type:'Cultural Festival', date:'Annual Celebration', title:'Feria Nacional del Pitorro', location:'Puerto Rico', imgSrc:IMG_FERIA, desc:'Feria Nacional del Pitorro celebrates one of Puerto Rico’s most cherished spirit traditions with Pitorro® tastings, live music, and community pride. Destilería Coquí, Inc. joins the celebration with its Pitorro® lineup.'},
    'taste-of-rum': {type:'Spirits Expo', date:'Event Archive', title:'Taste of Rum', location:'Puerto Rico', imgSrc:IMG_TASTE, desc:'A showcase of Puerto Rico’s spirits scene. Meet the makers, taste the Coquí lineup, and discover the craft behind each bottle.'},
    'electric-420': {type:'Festival Collaboration', date:'Event Archive', title:'420 Fest × Efecto Secundario Fest', location:'Puerto Rico', imgSrc:IMG_ELECTRIC_LIVE, desc:'A live music collaboration with Efecto Secundario Fest featuring PJ, Young Miko, RaiNao, and other performers. Destilería Coquí, Inc. joined the celebration with the crowd.'},
    'fango-fest': {type:'Music & Culture', date:'Event Archive', title:'Fango Fest', location:'Puerto Rico', imgSrc:IMG_FANGO, desc:'An outdoor gathering where music, culture, and community meet.'}
  };

  var modal = document.getElementById('eventModal');
  var modalClose = document.getElementById('eventModalClose');

  function openModal(id){
    var ev = EVENTS[id]; if(!ev) return;
    document.getElementById('eventModalImg').src = ev.imgSrc || IMG_FERIA;
    document.getElementById('eventModalImg').alt = ev.title;
    document.getElementById('eventModalType').textContent = ev.type;
    document.getElementById('eventModalDate').textContent = ev.date;
    document.getElementById('eventModalTitle').textContent = ev.title;
    document.getElementById('eventModalLocation').textContent = ev.location;
    document.getElementById('eventModalDesc').textContent = ev.desc;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){ modal.classList.remove('open'); document.body.style.overflow = ''; }

  document.querySelectorAll('#dc-app .event-card').forEach(function(card){
    card.addEventListener('click', function(){ openModal(card.dataset.event); });
    card.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') openModal(card.dataset.event); });
  });
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
})();
</script>
