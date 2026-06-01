<script>
(function(){
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if(path !== '/' && path !== '/home') return;

  document.body.classList.add('dc-custom-page');

  var IMG_CAMPO = 'https://static.wixstatic.com/media/f04508_4c736d9258b046718273b89c963c99ba~mv2.jpeg';
  var IMG_PLAYA = 'https://static.wixstatic.com/media/f04508_656a56188bc04b039df4430627f084d6~mv2.jpeg';
  var IMG_ELECTRIC = 'https://static.wixstatic.com/media/f04508_1d8d5acfdaf34adaacb2fc9379bf05fc~mv2.jpeg';
  var IMG_BARRICAS = 'https://static.wixstatic.com/media/f04508_8b8b22ca1ceb4491a489aeeedc92f70f~mv2.webp';

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

  h += '<nav id="dc-nav"><a href="/" class="nav-logo">Coquí</a><ul class="nav-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="#tours">Tours</a></li><li><a href="#eventos">Events</a></li></ul></nav>';

  h += '<section class="hero" id="home"><div class="hero-img"><img src="' + IMG_CAMPO + '" alt="Destilería Coquí"></div><div class="hero-content"><p class="hero-eyebrow">Destilería Coquí · Mayagüez, Puerto Rico · Est. 2006</p><h1 class="hero-h1">Sabor<br>a Puerto<br><em>Rico.</em></h1><p class="hero-sub">Puerto Rico’s largest artisan distillery. Creators of Pitorro® — the island’s traditional spirit, now legal. Distilled by hand in Mayagüez since 2006.</p><div class="hero-actions"><a href="/our-rums" class="btn-primary">Discover Our Rum ' + AR + '</a><a href="/historia" class="btn-text">Our Story ' + AD + '</a></div></div><div class="hero-scroll-indicator" aria-hidden="true"><div class="scroll-line"></div><span>Scroll</span></div></section>';

  h += '<section class="home-feature"><div class="home-feature-bg"><img src="' + IMG_CAMPO + '" alt="Sugarcane harvest in Puerto Rico" loading="lazy"></div><div class="home-feature-overlay"></div><div class="home-feature-inner"><span class="home-feature-eyebrow reveal">Est. 2006</span><h2 class="home-feature-title reveal d1">Our<br><em>Story</em></h2><p class="home-feature-body reveal d2">In 2006, Héctor Augusto and María Cristina founded Destilería Coquí with a mission as bold as it was clear: to legalize Puerto Rico’s centuries-old Pitorro tradition and bring it into the light. From Mayagüez, they built the island’s largest artisan distillery — and proved that heritage and craft belong together.</p><a href="/historia" class="home-feature-cta reveal d3">Read Our Story ' + AR + '</a></div></section>';

  h += '<section class="home-feature"><div class="home-feature-bg"><img src="' + IMG_PLAYA + '" alt="Pitorro Blends lineup on the beach" loading="lazy"></div><div class="home-feature-overlay"></div><div class="home-feature-inner"><span class="home-feature-eyebrow reveal">18 Spirits</span><h2 class="home-feature-title reveal d1">Our<br><em>Rums</em></h2><p class="home-feature-body reveal d2">From Ron Coquí™ Blanco to nine Pitorro® Original expressions, six Pitorro® Blends, and Carjaker’s at 120 proof. Eighteen spirits, all handmade in Mayagüez. All distinctly Puerto Rico.</p><a href="/our-rums" class="home-feature-cta reveal d3">See All Expressions ' + AR + '</a></div></section>';

  h += '<section class="events-section" id="eventos"><div class="events-inner"><div class="events-header"><div><p class="eyebrow reveal">Upcoming Events</p><h2 class="h2 reveal d1" style="font-size:clamp(3.6rem,5.8vw,6.5rem);">Evenings<br>worth <em>remembering.</em></h2></div><div><p class="body-text reveal d2">From music festivals to rum expos, Destilería Coquí shows up across Puerto Rico throughout the year. Check back here for updates on where to find us next.</p></div></div>';

  h += '<div class="events-grid">';
  h += '<article class="event-card reveal" data-event="feria-pitorro" role="button" tabindex="0"><div class="event-bg"><img src="https://picsum.photos/seed/coquiev1/600/800" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Cultural Festival</span><span class="event-date">October 12–14, 2026</span><h3 class="event-title">Feria del Pitorro</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d1" data-event="taste-of-rum" role="button" tabindex="0"><div class="event-bg"><img src="https://picsum.photos/seed/coquiev2/600/800" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Spirits Expo</span><span class="event-date">March 2026</span><h3 class="event-title">Taste of Rum</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d2" data-event="electric-420" role="button" tabindex="0"><div class="event-bg"><img src="' + IMG_ELECTRIC + '" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Music Festival</span><span class="event-date">March 2026</span><h3 class="event-title">Electric 420</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '<article class="event-card reveal d3" data-event="fango-fest" role="button" tabindex="0"><div class="event-bg"><img src="https://picsum.photos/seed/coquiev4/600/800" alt="" loading="lazy"></div><div class="event-overlay"></div><div class="event-info"><span class="event-type">Music &amp; Culture</span><span class="event-date">November 2026</span><h3 class="event-title">Fango Fest</h3><span class="event-expand-hint">Details ' + AS + '</span></div></article>';
  h += '</div></div></section>';

  h += '<section class="awards"><div class="awards-inner"><div class="award-item reveal"><span class="award-score">2006</span><div class="award-sep"></div><p class="award-note">Founded in<br>Mayagüez, Puerto Rico</p></div><div class="award-item reveal d1"><span class="award-score" style="font-size:2.3rem;letter-spacing:-0.01em;">50k+</span><div class="award-sep"></div><p class="award-note">Cases produced<br>per year</p></div><div class="award-item reveal d2"><span class="award-score">25</span><div class="award-sep"></div><p class="award-note">Team members<br>on the island</p></div><div class="award-item reveal d3"><span class="award-score" style="font-size:2.1rem;letter-spacing:-0.01em;">No. 1</span><div class="award-sep"></div><p class="award-note">Largest artisan<br>distillery in Puerto Rico</p></div></div></section>';

  h += '<section class="tours-section" id="tours"><div class="tours-inner"><div class="tours-split"><div class="tours-text"><p class="eyebrow reveal">Tours &amp; Tastings</p><h2 class="h2 reveal d1">The Distillery<br><em>Tour.</em></h2><p class="body-text reveal d2" style="margin-top:2.25rem;">Walk through Puerto Rico’s largest artisan distillery and see how Pitorro® is made. Our team in Mayagüez guides you through the full production process and finishes with a tasting of our spirits. Children under 18 enter free.</p><a href="/tours" class="btn-primary reveal d3" style="margin-top:3.25rem;display:inline-flex;align-self:flex-start;">View Available Dates ' + AR + '</a><span class="tours-tag reveal d4">Call 787-805-1000 · $45/person · Mon – Sat, 9:30am – 5:30pm</span></div><div class="tours-img-wrap reveal d2"><img class="tours-img" src="' + IMG_BARRICAS + '" alt="Destileria Coqui aging barrels" loading="lazy"></div></div></div></section>';

  h += '<footer><span class="footer-logo">Destilería Coquí</span><p class="footer-copy">© 2026 Destilería Coquí — Mayagüez, Puerto Rico.<br>Drink responsibly. Must be of legal drinking age.</p><ul class="footer-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li></ul></footer>';

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
    'feria-pitorro': {type:'Cultural Festival', date:'October 12–14, 2026', title:'Feria del Pitorro', location:'Puerto Rico', seed:'coquiev1', desc:'The Feria del Pitorro is Puerto Rico’s premier celebration of the island’s traditional moonshine. Three days of Pitorro tasting, live music, and cultural pride. Destilería Coquí pours the full Pitorro® lineup.'},
    'taste-of-rum': {type:'Spirits Expo', date:'March 2026', title:'Taste of Rum', location:'Puerto Rico', seed:'coquiev2', desc:'Puerto Rico’s premier rum industry showcase. Meet the makers, taste the full Coquí lineup, and discover what makes the island’s spirits scene one of the most exciting in the Caribbean.'},
    'electric-420': {type:'Music Festival', date:'March 2026', title:'Electric 420', location:'Puerto Rico', imgSrc:IMG_ELECTRIC, desc:'One of Puerto Rico’s biggest outdoor music events. Destilería Coquí is on the ground with Carjaker’s Rum and Ron Coquí™ Limón. Find the Coquí tent and join the crowd.'},
    'fango-fest': {type:'Music & Culture', date:'November 2026', title:'Fango Fest', location:'Puerto Rico', seed:'coquiev4', desc:'Fango Fest — a mud-soaked outdoor music festival where the crowd, the dirt, and the beats are all part of the experience. Carjaker’s Rum was made for moments like this.'}
  };

  var modal = document.getElementById('eventModal');
  var modalClose = document.getElementById('eventModalClose');

  function openModal(id){
    var ev = EVENTS[id]; if(!ev) return;
    document.getElementById('eventModalImg').src = ev.imgSrc || 'https://picsum.photos/seed/' + ev.seed + '/800/500';
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
