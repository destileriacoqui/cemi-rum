<script>
(function(){
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if(path !== '/historia') return;

  document.body.classList.add('dc-custom-page');

  var IMG_CAMPO = 'https://static.wixstatic.com/media/f04508_4c736d9258b046718273b89c963c99ba~mv2.jpeg';
  var IMG_MUJER = 'https://static.wixstatic.com/media/f04508_ccc2821cd65643babed7b553cedec3ca~mv2.jpg';
  var IMG_LOGO = 'https://cemi-rum.vercel.app/img/destileria-coqui-logo-v2.svg';
  var IMG_STORY_02 = 'https://cemi-rum.vercel.app/img/story-coqui-02.jpeg';
  var IMG_STORY_03 = 'https://cemi-rum.vercel.app/img/story-coqui-03.jpeg';
  var IMG_STORY_04 = 'https://cemi-rum.vercel.app/img/story-coqui-04.webp';
  var IMG_PLAZA = 'https://cemi-rum.vercel.app/img/coqui-plaza-bar.webp';
  var AR = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5H12M6.5 1L12 6.5L6.5 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var noise = document.createElement('div');
  noise.className = 'noise-layer';
  noise.setAttribute('aria-hidden','true');
  document.body.appendChild(noise);

  var app = document.createElement('div');
  app.id = 'dc-app';
  var h = '';

  h += '<nav id="dc-nav"><a href="/" class="nav-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></a><ul class="nav-links"><li><a href="/historia" aria-current="page">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li><li><a href="/#eventos">Events</a></li></ul></nav>';

  h += '<section class="hero"><div class="hero-img"><img src="' + IMG_CAMPO + '" alt="Sugarcane harvest in Puerto Rico"></div><div class="hero-content"><p class="hero-eyebrow">Destilería Coquí, Inc. · Est. 2006</p><h1 class="hero-h1">Our<br><em>Story.</em></h1><p class="hero-sub">Two founders, one conviction, and a mission to bring Puerto Rico’s centuries-old spirit tradition into the light — legally, proudly, from Mayagüez.</p></div></section>';

  h += '<section class="foundation"><div class="foundation-visual"><img src="' + IMG_MUJER + '" alt="Harvesting sugarcane in Puerto Rico" loading="lazy"></div><div class="foundation-text"><p class="eyebrow reveal">The Beginning</p><h2 class="h2 reveal d1" style="font-size:clamp(2.6rem,4.5vw,5rem);">Born from a<br>tradition <em>forgotten.</em></h2><blockquote class="foundation-pull reveal d2">“Pitorro® was always made here — in every barrio, in every family’s backyard. We simply refused to let that tradition disappear.”</blockquote><p class="foundation-body reveal d2">In 2006, Héctor Augusto and María Cristina founded Destilería Coquí, Inc. in Mayagüez, Puerto Rico — with a mission as bold as it was clear: to legalize and dignify the island’s centuries-old tradition of Ron Caña, the handmade sugarcane spirit that Puerto Ricans have always known as Pitorro®.</p><p class="foundation-body reveal d3" style="margin-top:1.35rem;">Before Coquí, Pitorro® existed only in the shadows — homemade, untaxed, and technically illegal. Héctor Augusto and María Cristina fought to change that. They built Puerto Rico’s largest artisan distillery, trademarked Pitorro®, and brought the island’s most beloved spirit into the light.</p><div class="foundation-stats"><div class="fstat reveal d2"><span class="fstat-num">2006</span><span class="fstat-label">Year of founding</span></div><div class="fstat reveal d3"><span class="fstat-num">50<span style="font-size:1.4rem;font-weight:200;">k+</span></span><span class="fstat-label">Cases produced per year</span></div><div class="fstat reveal d3"><span class="fstat-num">1<span style="font-size:1.4rem;font-weight:200;">st</span></span><span class="fstat-label">To legally produce Pitorro® in PR</span></div><div class="fstat reveal d4"><span class="fstat-num">#1</span><span class="fstat-label">Largest artisan distillery in Puerto Rico</span></div></div></div></section>';

  h += '<section class="process"><div class="process-head"><div><p class="eyebrow reveal" style="color:#C49348;opacity:0.88;">The Process</p><h2 class="process-h2 reveal d1">Made by hand,<br><em>not by machine.</em></h2></div><div><p class="process-intro reveal d2">Every bottle from Destilería Coquí, Inc. is distilled the traditional way — using methods handed down through Puerto Rican culture for generations. Our distillery in Mayagüez is where heritage meets craft, where Pitorro® became legal, and where the island’s character is poured into every batch.</p></div></div><div class="process-steps"><div class="process-step"><span class="step-num reveal">01</span><h3 class="step-title reveal d1">The Vision</h3><p class="step-body reveal d2">Héctor Augusto and María Cristina didn’t set out to build a rum company. They set out to preserve a culture. Pitorro® had been made in Puerto Rican homes for centuries — they simply gave it a home it could be proud of.</p></div><div class="process-step"><span class="step-num reveal">02</span><h3 class="step-title reveal d1">The Distillation</h3><p class="step-body reveal d2">From Pitorro® to Ron Coquí™ Blanco, every spirit is distilled using sugarcane-based recipes. Our Pitorro® line follows the traditional island method — bold, full-bodied, and crafted with the character that made it legendary.</p></div><div class="process-step"><span class="step-num reveal">03</span><h3 class="step-title reveal d1">The Craft</h3><p class="step-body reveal d2">We have grown into Puerto Rico’s leading artisan distillery, yet every bottle is still treated as a work of craft. With patience, tradition, and purpose, we honor the process that gives our spirits their soul.</p></div></div></section>';

  h += '<section class="archive"><div class="archive-inner"><div class="archive-header"><h2 class="archive-h2 reveal">Nearly twenty years<br><em>of proving them wrong.</em></h2><p class="archive-sub reveal d2">Two founders. A tradition worth fighting for. From the first legal bottle of Pitorro® to 50,000 cases a year — Coquí was never built to be a factory. It was built to be an answer.</p></div><div class="archive-grid"><div class="arch-wrap arch-1 reveal"><img class="arch-img" src="' + IMG_STORY_02 + '" alt="Pitorro® bottles from Destilería Coquí arranged on the coast" loading="lazy"></div><div class="arch-wrap arch-2 reveal d1"><img class="arch-img" src="' + IMG_STORY_03 + '" alt="Live music gathering hosted by Destilería Coquí" loading="lazy"></div><div class="arch-wrap arch-3 reveal d2"><img class="arch-img" src="' + IMG_STORY_04 + '" alt="Coquí aging barrels at the distillery" loading="lazy"></div><div class="arch-wrap arch-4 reveal d3"><img class="arch-img" src="' + IMG_PLAZA + '" alt="Coquí Plaza bar in Mayagüez, Puerto Rico" loading="lazy"></div></div></div></section>';

  h += '<div class="cta-band reveal"><p class="cta-text">Ready to taste<br><em>what history made?</em></p><a href="/our-rums" class="btn-primary">Explore Our Rum ' + AR + '</a></div>';

  h += '<footer><span class="footer-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></span><p class="footer-copy">© 2026 Destilería Coquí, Inc. — Mayagüez, Puerto Rico.<br>Drink responsibly. Must be of legal drinking age.</p><ul class="footer-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li></ul></footer>';

  app.innerHTML = h;
  document.body.prepend(app);

  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target); }});
  }, {threshold:0.08, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('#dc-app .reveal').forEach(function(el){ revealObs.observe(el); });

  var nav = document.getElementById('dc-nav');
  var heroEl = document.querySelector('#dc-app .hero');
  var heroH = heroEl ? heroEl.offsetHeight : 600;
  function handleScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > heroH * 0.72); }
  window.addEventListener('scroll', handleScroll, {passive:true});
  handleScroll();

  var heroImg = document.querySelector('#dc-app .hero-img img');
  window.addEventListener('scroll', function(){
    if(window.scrollY < window.innerHeight * 1.2 && heroImg)
      heroImg.style.transform = 'translateY(' + (window.scrollY * 0.24) + 'px)';
  }, {passive:true});
})();
</script>
