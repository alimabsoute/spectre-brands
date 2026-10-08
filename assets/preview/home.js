// Progressive enhancement: all cards remain available without JavaScript.
(() => {
  const wall = document.getElementById('preview-wall');
  if (!wall) return;
  const cards = [...wall.children], expand = document.querySelector('.gallery-expand');
  const extras = cards.filter(c => c.hasAttribute('data-extra'));
  extras.forEach(c => c.hidden = true);
  expand.hidden = false;
  const controls = document.querySelector('.gallery-controls');
  controls.hidden = false;
  const position = document.getElementById('rail-position');
  function update() {
    const visible = cards.filter(c => !c.hidden);
    const left = wall.getBoundingClientRect().left;
    const index = Math.max(0, visible.findIndex(c => c.getBoundingClientRect().right > left + 40));
    position.textContent = `${index+1} / ${visible.length} on display`;
    controls.querySelector('[data-rail="prev"]').disabled = wall.scrollLeft < 2;
    controls.querySelector('[data-rail="next"]').disabled = wall.scrollLeft + wall.clientWidth >= wall.scrollWidth - 2;
  }
  expand.addEventListener('click', () => {
    const open = expand.getAttribute('aria-expanded') !== 'true';
    extras.forEach(c => c.hidden = !open);
    expand.setAttribute('aria-expanded', String(open));
    expand.innerHTML = open ? 'Show fewer brands ↑' : `Show all ${cards.length} brands ↗`;
    update();
  });
  const move = direction => wall.scrollBy({left: direction * (cards[0].getBoundingClientRect().width+16), behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  controls.querySelectorAll('button').forEach(b => b.addEventListener('click', () => move(b.dataset.rail==='next'?1:-1)));
  wall.addEventListener('keydown', e => {if(e.target!==wall)return; if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  wall.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
})();
