/* Section-system preview runtime (/preview/pm-<slug>/ only): theme toggle, chapter nav spy + progress,
   and a Chart.js plugin that re-tints axes, legends, tooltips and ink-coloured series for the active theme. */
(function () {
  const d = document.documentElement, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => d.getAttribute('data-theme') === 'dark';

  // ---- charts: Chart.js arrives lazily (runtime.js loads it when a canvas scrolls near). Catch the global as it
  // lands, register a plugin so every chart is themed before its first draw, and re-run on toggle. ----
  const PAL = {
    light: { grid: '#E3D9C4', tick: '#5F554A', text: '#1B1815', paper: '#FCFBF8', border: '#CDC1A6', fill: 'rgba(27,24,21,.06)' },
    dark: { grid: '#3D3631', tick: '#B3A896', text: '#F3EBDC', paper: '#2E2925', border: '#52493F', fill: 'rgba(243,235,220,.09)' }
  };
  // series colours as charts.js writes them (mirrors of tokens.css) -> this preview's light / dark values
  const SERIES = {
    '#16161a': ['#1B1815', '#F3EBDC'], '#c2412d': ['#C2412D', '#EF8468'], '#3b6ea8': ['#3B6EA8', '#86ABE3'], '#3f8a5a': ['#3F8A5A', '#79C68F'],
    '#a9781f': ['#A9781F', '#DDB45A'], '#7b5ea7': ['#6B7F2E', '#B8C86A'], '#2c8c8c': ['#2C8C8C', '#6CCFBA'], '#8b8b94': ['#8B8B94', '#A39D96'],
    '#63636b': ['#5F554A', '#B3A896'], '#b9b8b2': ['#B9B8B2', '#6A6158'], '#dddcd8': ['#DDDCD8', '#4A433D'], '#ecbae5': ['#ECEAE5', '#3D3631'],
    '#ffffff': ['#FCFBF8', '#2E2925'], '#fff': ['#FCFBF8', '#2E2925'], 'rgba(22,22,26,.05)': ['rgba(27,24,21,.06)', 'rgba(243,235,220,.09)']
  };
  const brands = new Set(); // every value --brand has had, so series painted in it can follow the theme
  const brandNow = () => { const v = getComputedStyle($('main') || d).getPropertyValue('--brand').trim(); if (v) brands.add(v.toLowerCase()); return v; };
  const recolor = (v, dark, brand) => {
    if (typeof v !== 'string') return v;
    const k = v.toLowerCase().replace(/\s+/g, '');
    if (brands.has(k)) return brand;
    return SERIES[k] ? SERIES[k][dark ? 1 : 0] : v;
  };
  const themeChart = c => {
    const dark = isDark(), P = PAL[dark ? 'dark' : 'light'], brand = brandNow(), o = c.config.options || (c.config.options = {});
    if (o.scales) for (const k in o.scales) { const s = o.scales[k]; s.grid = Object.assign(s.grid || {}, { color: P.grid }); s.ticks = Object.assign(s.ticks || {}, { color: P.tick }); if (s.title) s.title.color = P.tick; s.border = Object.assign(s.border || {}, { color: P.grid }); }
    o.color = P.tick;
    const pl = o.plugins || (o.plugins = {});
    pl.legend = pl.legend || {}; pl.legend.labels = Object.assign(pl.legend.labels || {}, { color: P.text });
    pl.tooltip = Object.assign(pl.tooltip || {}, { backgroundColor: P.paper, titleColor: P.text, bodyColor: P.text, footerColor: P.tick, borderColor: P.border });
    (c.config.data.datasets || []).forEach(ds => {
      const o0 = ds.__pm || (ds.__pm = {});
      ['borderColor', 'backgroundColor', 'pointBackgroundColor', 'pointBorderColor', 'hoverBackgroundColor'].forEach(k => {
        if (!(k in ds)) return;
        if (!(k in o0)) o0[k] = ds[k];
        const v = o0[k];
        ds[k] = Array.isArray(v) ? v.map(x => recolor(x, dark, brand)) : recolor(v, dark, brand);
      });
    });
  };
  let ChartLib = null;
  const register = C => { ChartLib = C; try { C.register({ id: 'pmTheme', beforeInit: themeChart }); } catch (e) { /* older build */ } };
  if (window.Chart) register(window.Chart);
  else Object.defineProperty(window, 'Chart', { configurable: true, enumerable: true, get: () => ChartLib || undefined, set: v => { if (v) register(v); } });
  const tintCharts = () => { if (!ChartLib || !ChartLib.instances) return; Object.values(ChartLib.instances).forEach(c => { try { themeChart(c); c.update('none'); } catch (e) { /* ignore */ } }); };

  // ---- theme toggle: html[data-theme], localStorage 'sb-theme', follows the OS until the person chooses ----
  const btns = $$('.pm-theme-btn'), mq = matchMedia('(prefers-color-scheme: dark)'), META = { light: '#F6EFE0', dark: '#221E1B' };
  const apply = t => {
    d.setAttribute('data-theme', t);
    const dark = t === 'dark', label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    btns.forEach(b => { b.setAttribute('aria-pressed', String(dark)); b.setAttribute('aria-label', label); b.title = label; const tx = $('.pm-theme-txt', b); if (tx) tx.textContent = dark ? 'Light' : 'Dark'; });
    const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', META[t]);
    brandNow(); tintCharts();
  };
  apply(isDark() ? 'dark' : 'light');
  btns.forEach(b => b.addEventListener('click', () => { const t = isDark() ? 'light' : 'dark'; try { localStorage.setItem('sb-theme', t); } catch (e) { /* storage may be blocked */ } apply(t); }));
  if (mq.addEventListener) mq.addEventListener('change', e => { let s = null; try { s = localStorage.getItem('sb-theme'); } catch (x) { /* ignore */ } if (s !== 'light' && s !== 'dark') apply(e.matches ? 'dark' : 'light'); });

  // ---- chapter nav: section spy with IntersectionObserver, aria-current on the active link, the active item
  // kept in view in the mobile bar, and a tape-coloured progress line ----
  const toc = $('#pm-toc');
  if (toc) {
    const links = $$('a[data-pm]', toc), targets = links.map(a => document.getElementById(a.dataset.pm)).filter(Boolean);
    const bar = matchMedia('(max-width:1279.98px)');
    let cur = null;
    const set = id => {
      if (id === cur) return; cur = id;
      links.forEach(a => {
        const on = a.dataset.pm === id;
        a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && bar.matches) { const ol = a.parentNode.parentNode, R = ol.getBoundingClientRect(), r = a.getBoundingClientRect(); if (r.left < R.left + 8 || r.right > R.right - 8) ol.scrollTo({ left: a.offsetLeft - R.width / 2 + r.width / 2, behavior: reduce ? 'auto' : 'smooth' }); }
      });
    };
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(e.target.id); }), { rootMargin: '-35% 0px -60% 0px' });
      targets.forEach(t => spy.observe(t));
    }
    // fallback + initial state: the last chapter whose top is above 40% of the viewport
    const byScroll = () => { const y = innerHeight * .4; let id = targets[0] && targets[0].id; targets.forEach(t => { if (t.getBoundingClientRect().top <= y) id = t.id; }); set(id); };
    byScroll();
    links.forEach(a => a.addEventListener('click', () => set(a.dataset.pm)));
    let raf = 0;
    const paint = () => { raf = 0; const max = d.scrollHeight - innerHeight; toc.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : 0); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(paint); });
    paint();
  }
})();
