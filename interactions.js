const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('[data-year]').textContent = new Date().getFullYear();
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.matchMedia('(min-width:801px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
const track = document.querySelector('.student-track');
const slides = Array.from(track.querySelectorAll('.student-slide'));
const previous = document.querySelector('.carousel-prev');
const next = document.querySelector('.carousel-next');
const position = document.querySelector('.carousel-position');
const pad = value => String(value).padStart(2, '0');
function stepSize() {
  return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
}
function updateCarousel() {
  const max = Math.max(0, track.scrollWidth - track.clientWidth);
  const current = Math.min(slides.length - 1, Math.round(track.scrollLeft / stepSize()));
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= max - 2;
  position.textContent = pad(current + 1) + ' / ' + pad(slides.length);
}
function moveCarousel(direction) {
  const max = track.scrollWidth - track.clientWidth;
  const left = Math.max(0, Math.min(max, track.scrollLeft + direction * stepSize()));
  track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
previous.addEventListener('click', () => moveCarousel(-1));
next.addEventListener('click', () => moveCarousel(1));
track.addEventListener('scroll', updateCarousel, { passive:true });
track.addEventListener('keydown', event => {
  if(event.target !== track) return;
  if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); moveCarousel(event.key === 'ArrowRight' ? 1 : -1);
  }
  if(event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  }
});
if('ResizeObserver' in window) new ResizeObserver(updateCarousel).observe(track);
else window.addEventListener('resize', updateCarousel);
updateCarousel();
const lightbox = document.querySelector('.lightbox');
const gallery = Array.from(document.querySelectorAll('.gallery-open'));
const boxImage = lightbox.querySelector('img');
const boxCaption = lightbox.querySelector('p');
const boxCount = lightbox.querySelector('.lightbox-count');
const boxPrev = lightbox.querySelector('.lightbox-prev');
const boxNext = lightbox.querySelector('.lightbox-next');
let currentPhoto = 0;
let opener;
function showPhoto(index) {
  currentPhoto = Math.max(0, Math.min(gallery.length - 1,index));
  const button = gallery[currentPhoto];
  boxImage.src = button.querySelector('img').getAttribute('src');
  boxImage.alt = button.dataset.caption;
  boxCaption.textContent = button.dataset.caption;
  boxCount.textContent = pad(currentPhoto + 1) + ' / ' + pad(gallery.length);
  boxPrev.disabled = currentPhoto === 0;
  boxNext.disabled = currentPhoto === gallery.length - 1;
}
gallery.forEach((button,index) => button.addEventListener('click', () => {
  opener = button;
  showPhoto(index);
  lightbox.showModal();
  document.body.classList.add('lightbox-open');
}));
boxPrev.addEventListener('click', () => showPhoto(currentPhoto - 1));
boxNext.addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('keydown', event => {
  if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
lightbox.addEventListener('click', event => {
  if(event.target !== lightbox) return;
  const box=lightbox.getBoundingClientRect();
  if(event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  opener?.focus();
});
document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });

// Reveal headings line by line without duplicating their accessible text.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.querySelectorAll('.hero-copy, .section-copy, .students-heading, .faq-heading').forEach(el => el.classList.remove('reveal'));
  document.querySelectorAll('h1, h2').forEach(heading => {
    const nodes = Array.from(heading.childNodes);
    const fragment = document.createDocumentFragment();
    let lines = [];
    let current = [];
    nodes.forEach(node => {
      if(node.nodeName === 'BR') { lines.push(current); current=[]; }
      else current.push(node);
    });
    if(current.length) lines.push(current);
    lines.forEach((nodes,index) => {
      const line=document.createElement('span');
      line.className='title-line';
      const inner=document.createElement('span');
      inner.className='title-line-inner';
      inner.style.setProperty('--line-delay',index*90+'ms');
      nodes.forEach(node=>inner.appendChild(node));
      if(index<lines.length-1) inner.appendChild(document.createTextNode(' '));
      line.appendChild(inner);fragment.appendChild(line);
    });
    heading.replaceChildren(fragment);
    heading.classList.add('title-motion');
  });
  document.querySelectorAll('.eyebrow, .lead, .hero-line, .section-copy > p, .section-copy > blockquote, .students-intro > p, .photo-message, .method-strip p').forEach((el,index) => {
    el.classList.add('motion-text');
    el.style.setProperty('--text-delay', (index%3)*70+'ms');
  });
  const textObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) {entry.target.classList.add('text-visible');textObserver.unobserve(entry.target);}
    });
  },{threshold:.12});
  document.querySelectorAll('.title-motion,.motion-text').forEach(el=>textObserver.observe(el));
}
const testimonialDialog=document.querySelector('.testimonial-dialog');
const testimonialOpen=document.querySelector('.testimonial-open');
testimonialOpen.addEventListener('click',()=>{
  testimonialDialog.showModal();
  document.body.classList.add('lightbox-open');
});
testimonialDialog.querySelector('.testimonial-close').addEventListener('click',()=>testimonialDialog.close());
testimonialDialog.addEventListener('close',()=>{
  document.body.classList.remove('lightbox-open');
  testimonialOpen.focus();
});
testimonialDialog.addEventListener('click',event=>{
  if(event.target!==testimonialDialog)return;
  const bounds=testimonialDialog.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)testimonialDialog.close();
});


