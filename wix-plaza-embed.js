<script>
(function(){
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if(path !== '/plaza') return;

  document.body.classList.add('dc-custom-page');

  var IMG_LOGO = 'https://cemi-rum.vercel.app/img/destileria-coqui-logo-v2.svg';
  var IMG_PLAZA = 'https://cemi-rum.vercel.app/img/coqui-plaza-bar.webp';
  var IMG_TASTE = 'https://cemi-rum.vercel.app/img/event-taste-of-rum.jpg';
  var IMG_ELECTRIC = 'https://cemi-rum.vercel.app/img/electric-420-fest.jpg';
  var AR = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5H12M6.5 1L12 6.5L6.5 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var noise = document.createElement('div');
  noise.className = 'noise-layer';
  noise.setAttribute('aria-hidden','true');
  document.body.appendChild(noise);

  var app = document.createElement('div');
  app.id = 'dc-app';
  var h = '';

  h += '<nav id="dc-nav"><a href="/" class="nav-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></a><ul class="nav-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li><li><a href="/#eventos">Events</a></li></ul></nav>';

  h += '<section class="page-hero"><div class="page-hero-bg"><img src="' + IMG_PLAZA + '" alt="Coquí Plaza bar in Mayagüez, Puerto Rico"></div><div class="page-hero-content"><div class="page-hero-left"><p class="page-hero-eyebrow">Mayagüez, Puerto Rico  ·  Coquí Plaza</p><h1 class="page-hero-h1">Coquí<em>Plaza.</em></h1></div><div class="page-hero-right"><p class="page-hero-sub">A welcoming place to taste our spirits, gather with friends, and celebrate in Mayagüez.</p><div class="page-hero-scroll" aria-hidden="true"><div class="scroll-line"></div><span>Explore</span></div></div></div></section>';

  h += '<section class="plaza-intro"><div class="plaza-intro-inner"><div><p class="eyebrow reveal">Coquí Plaza</p><h2 class="h2 reveal d1" style="font-size:clamp(3rem,5.5vw,5.8rem);">Taste. Gather.<br><em>Celebrate.</em></h2></div><div><p class="body-text reveal d2">Coquí Plaza welcomes visitors for guided tastings, private gatherings, and a closer look at the spirits of Destiler\xEDa Coqu\xED, Inc.</p></div></div>';

  h += '<div class="plaza-panorama reveal"><img class="plaza-panorama-img" src="' + IMG_PLAZA + '" alt="Coquí Plaza bar in Mayagüez" loading="lazy"><div class="plaza-panorama-tint"></div>';
  h += '<div class="plaza-pin" style="left:27%;top:42%;"><div class="plaza-pin-dot"></div><div class="plaza-pin-ring"></div><div class="plaza-pin-ring r2"></div><div class="plaza-pin-label">Guided Tastings</div></div>';
  h += '<div class="plaza-pin" style="left:51%;top:58%;"><div class="plaza-pin-dot"></div><div class="plaza-pin-ring"></div><div class="plaza-pin-ring r2"></div><div class="plaza-pin-label">Private Events</div></div>';
  h += '<div class="plaza-pin" style="left:75%;top:36%;"><div class="plaza-pin-dot"></div><div class="plaza-pin-ring"></div><div class="plaza-pin-ring r2"></div><div class="plaza-pin-label">Distillery Shop</div></div>';
  h += '<div class="plaza-panorama-caption"><span class="plaza-panorama-title">Coqu\xED Plaza</span><span class="plaza-panorama-sub">Mayagüez  ·  Puerto Rico</span></div></div>';

  h += '<div class="plaza-spaces"><div class="plaza-space reveal"><span class="plaza-space-num">I</span><h3 class="plaza-space-name">Guided Tastings</h3><p class="plaza-space-body">Discover the flavors and stories behind our spirits with a guided tasting. Children under 18 are welcome with a paying adult; tasting is for adults only.</p></div>';
  h += '<div class="plaza-space reveal d1"><span class="plaza-space-num">II</span><h3 class="plaza-space-name">Events &amp; Gatherings</h3><p class="plaza-space-body">Host birthdays, food gatherings, company outings, and private celebrations for up to 100 guests. Call 787-805-1000 to plan your event.</p></div>';
  h += '<div class="plaza-space reveal d2"><span class="plaza-space-num">III</span><h3 class="plaza-space-name">The Distillery Shop</h3><p class="plaza-space-body">The best selection of Destiler\xEDa Coqu\xED, Inc. products on the island — including distillery-exclusive bottlings, branded merchandise, and gift sets not available anywhere else. Open during all visiting hours. Free parking on site.</p></div></div></section>';

  h += '<div class="plaza-gallery"><div class="gallery-item reveal"><img src="' + IMG_TASTE + '" alt="Destilería Coquí tasting gathering" loading="lazy"></div><div class="gallery-item reveal d1"><img src="' + IMG_ELECTRIC + '" alt="Live music gathering at Coquí Plaza" loading="lazy"></div></div>';

  h += '<section class="visit-cta"><div class="visit-cta-inner"><h2 class="visit-cta-h2 reveal">Come as you are.<br><em>Leave knowing more.</em></h2><div class="visit-cta-body"><div class="visit-detail reveal d1"><span class="visit-label">Address</span><span class="visit-val">Parque Industrial Mar\xEDa L. Arcelay<br>Edificio 2, Módulo 2, Suite 103<br>Mayagüez, PR 00682</span></div><div class="visit-detail reveal d2"><span class="visit-label">Hours</span><span class="visit-val">Monday – Friday<br>9:30 AM – 5:30 PM<br>Saturday<br>9:30 AM – 4:30 PM</span></div><div class="visit-detail reveal d3"><span class="visit-label">Phone</span><span class="visit-val">787-805-1000</span></div><a href="/tours" class="btn-primary reveal d4">Book a Visit ' + AR + '</a></div></div></section>';

  h += '<footer><span class="footer-logo"><img src="' + IMG_LOGO + '" alt="Destilería Coquí"></span><p class="footer-copy">© 2026 Destiler\xEDa Coqu\xED, Inc. — Mayagüez, Puerto Rico.<br>Drink responsibly. Must be of legal drinking age.</p><ul class="footer-links"><li><a href="/historia">Our Story</a></li><li><a href="/our-rums">Our Rums</a></li><li><a href="/tours">Tours</a></li></ul></footer>';

  app.innerHTML = h;
  document.body.prepend(app);

  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target); }});
  }, {threshold:0.08, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('#dc-app .reveal').forEach(function(el){ revealObs.observe(el); });

  var nav = document.getElementById('dc-nav');
  var heroEl = document.querySelector('#dc-app .page-hero');
  var heroH = heroEl ? heroEl.offsetHeight : 600;
  function handleScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > heroH * 0.78); }
  window.addEventListener('scroll', handleScroll, {passive:true});
  handleScroll();

  var heroImg = document.querySelector('#dc-app .page-hero-bg img');
  window.addEventListener('scroll', function(){
    if(window.scrollY < window.innerHeight && heroImg)
      heroImg.style.transform = 'translateY(' + (window.scrollY * 0.22) + 'px)';
  }, {passive:true});
})();
</script>
