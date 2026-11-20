/* Vera Atelier: wishlist, collection filters, product page (metal, size, engraving), ring builder. Data: window.JW. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var JW = window.JW || [], by = {}; JW.forEach(function (x) { by[x.id] = x; });
  function ru() { return window.TPL ? TPL.lang() === 'ru' : false; }
  function money(rub) { return ru() ? Math.round(rub).toLocaleString('ru-RU') + ' ₽' : '$' + Math.round(rub / 90).toLocaleString('en-US'); }
  var K = { silver: 1, gold: 2.4, white: 2.8, plat: 3.6 };
  var COL = { gold: ['#F3D27A', '#C8A15A', '#8A6A2E'], white: ['#FFFFFF', '#D9DDE3', '#9AA1AB'], silver: ['#F4F6F8', '#C3C8CF', '#8A9099'], plat: ['#E9EEF2', '#B8C0C8', '#7D8792'] };
  var fav = []; try { fav = JSON.parse(localStorage.getItem('vera-fav')) || []; } catch (e) {}
  function saveFav() { try { localStorage.setItem('vera-fav', JSON.stringify(fav)); } catch (e) {} $$('[data-fav-n]').forEach(function (e) { e.textContent = fav.length; }); $$('[data-fav]').forEach(function (b) { b.setAttribute('aria-pressed', String(fav.indexOf(b.getAttribute('data-fav')) > -1)); b.textContent = fav.indexOf(b.getAttribute('data-fav')) > -1 ? '♥' : '♡'; }); }
  var tt; function toast(s) { var el = $('[data-toast]'); el.textContent = s; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 1600); }
  function toggleFav(id) { var i = fav.indexOf(id); if (i < 0) { fav.push(id); toast(ru() ? 'Добавлено в избранное' : 'Added to the wishlist'); } else { fav.splice(i, 1); toast(ru() ? 'Убрано из избранного' : 'Removed from the wishlist'); } saveFav(); filter(); }
  document.addEventListener('click', function (e) { var f = e.target.closest('[data-fav]'); if (f) { e.preventDefault(); toggleFav(f.getAttribute('data-fav')); } });
  /* ring drawing shared by the product page and the builder */
  function paintRing(metal, stoneColor, width, text) {
    var r = $('[data-ring]'); if (!r) return; var c = COL[metal] || COL.gold;
    $('[data-m1]', r).setAttribute('stop-color', c[0]); $('[data-m2]', r).setAttribute('stop-color', c[1]); $('[data-m3]', r).setAttribute('stop-color', c[2]);
    var st = $('[data-stone]', r); st.style.display = stoneColor ? '' : 'none'; if (stoneColor) $('[data-sc]', r).setAttribute('fill', stoneColor);
    if (width) $$('ellipse', r)[0].setAttribute('stroke-width', String(10 + width * 3));
    $('[data-engr]', r).textContent = text || '';
  }
  /* collections */
  var grid = $('[data-jgrid]'), st = { type: 'all', metal: 'all', sort: 'pop', fav: false };
  function filter() {
    if (!grid) return; var cards = $$('.jc', grid), n = 0;
    cards.forEach(function (c) { var id = (c.getAttribute('href').match(/id=(\w+)/) || [])[1]; var ok = (st.type === 'all' || c.getAttribute('data-type') === st.type) && (st.metal === 'all' || c.getAttribute('data-metal') === st.metal) && (!st.fav || fav.indexOf(id) > -1); c.hidden = !ok; if (ok) n++; });
    if (st.sort !== 'pop') cards.sort(function (a, b) { return (st.sort === 'asc' ? 1 : -1) * (+a.getAttribute('data-price') - +b.getAttribute('data-price')); }).forEach(function (c) { grid.appendChild(c); });
    $('[data-none]').hidden = n > 0;
    $$('[data-ftype] [data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-k') === st.type)); });
  }
  if (grid) {
    var h = location.hash.slice(1); if (h) st.type = h;
    $('[data-ftype]').addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (!b) return; st.type = b.getAttribute('data-k'); history.replaceState(null, '', st.type === 'all' ? location.pathname : '#' + st.type); filter(); });
    $('[data-fmetal]').addEventListener('change', function (e) { st.metal = e.target.value; filter(); });
    $('[data-fsort]').addEventListener('change', function (e) { st.sort = e.target.value; filter(); });
    $('[data-ffav]').addEventListener('change', function (e) { st.fav = e.target.checked; filter(); });
    filter();
  }
  /* product page */
  var pp = $('[data-pp]');
  if (pp) {
    var it = by[new URLSearchParams(location.search).get('id')] || JW[1], metal = it.metal;
    function renderP() {
      var name = ru() ? it.ru : it.en; document.title = name + ' - Vera Atelier';
      $('[data-ptitle]').textContent = name; $('[data-pname]').textContent = name;
      var img = $('[data-pimg]'); img.src = 'img/' + it.img + '.webp'; img.alt = name;
      var pr = $('[data-pprice]'); pr.textContent = money(Math.round(it.price * K[metal] / K[it.metal] / 100) * 100); pr.classList.add('bump'); setTimeout(function () { pr.classList.remove('bump'); }, 250);
      $$('[data-pmetal] [data-m]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === metal)); });
      $('[data-psize]').hidden = it.type !== 'rings';
      var eng = $('[data-engrave]'); paintRing(metal, it.type === 'rings' ? '#F4FBFF' : '', 0, eng.value || (ru() ? 'Навсегда твоя' : 'Forever yours'));
      var pf = $('[data-pfav]'); pf.setAttribute('data-fav', it.id);
      var rel = JW.filter(function (x) { return x.type === it.type && x.id !== it.id; }).concat(JW.filter(function (x) { return x.type !== it.type; })).slice(0, 3);
      $('[data-related]').innerHTML = rel.map(function (x) { return '<a class="jc" href="product.html?id=' + x.id + '"><span class="jc__im"><img src="img/' + x.img + '-sm.webp" alt="" loading="lazy"><button type="button" data-fav="' + x.id + '" aria-label="♡">♡</button></span><b>' + (ru() ? x.ru : x.en) + '</b><em>' + money(x.price) + '</em></a>'; }).join('');
      saveFav();
    }
    $('[data-pmetal]').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; metal = b.getAttribute('data-m'); renderP(); });
    $('[data-psize]').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $$('button', $('[data-psize]')).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    $('[data-engrave]').addEventListener('input', renderP);
    renderP(); document.addEventListener('langchange', renderP);
  }
  /* ring builder */
  var bm = $('[data-bmetal]');
  if (bm) {
    function sel(box) { return $('[aria-pressed="true"]', $(box)); }
    function renderB() {
      var m = sel('[data-bmetal]'), s = sel('[data-bstone]'), w = sel('[data-bwidth]'), eng = $('[data-engrave]').value;
      var price = 18000 * +m.getAttribute('data-k') + +s.getAttribute('data-p') + +w.getAttribute('data-p') + (eng ? 2500 : 0);
      $('[data-bprice]').textContent = (ru() ? 'от ' : 'from ') + money(Math.round(price / 500) * 500);
      paintRing(m.getAttribute('data-m'), s.getAttribute('data-c'), +w.getAttribute('data-w'), eng);
      var c = $('[data-form] textarea'); if (c && !c.dataset.touched) c.value = [m.textContent, s.textContent, w.textContent, eng ? '«' + eng + '»' : ''].filter(Boolean).join(', ');
    }
    ['[data-bmetal]', '[data-bstone]', '[data-bwidth]'].forEach(function (q) { $(q).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $$('button', $(q)).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderB(); }); });
    $('[data-engrave]').addEventListener('input', renderB); var ta = $('[data-form] textarea'); if (ta) ta.addEventListener('input', function () { ta.dataset.touched = '1'; });
    renderB(); document.addEventListener('langchange', renderB);
  }
  saveFav();
})();
