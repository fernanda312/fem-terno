/* FEM TERNO — Carrinho + Acesso (área da cliente)
   Tudo guardado só neste telemóvel/navegador (localStorage).
   Sem pagamento online: a encomenda regista-se e combina-se com a estilista. */
(function () {
  'use strict';

  var PRODUCTS = [
    { name: 'Terno Castanho', price: 14500, img: 'images/terno-1.jpg' },
    { name: 'Terno Castanho Escuro', price: 15900, img: 'images/terno-2.jpg' },
    { name: 'Terno Castanho Riscado', price: 16500, img: 'images/loja-15.jpg' },
    { name: 'Terno Xadrez', price: 15500, img: 'images/terno-4.jpg' },
    { name: 'Terno Creme', price: 17500, img: 'images/terno-5.jpg' },
    { name: 'Terno Rosa Riscado', price: 14900, img: 'images/terno-6.jpg' },
    { name: 'Terno Azul Claro', price: 12900, img: 'images/terno-7.jpg' },
    { name: 'Terno Bege 3 Peças', price: 18500, img: 'images/terno-8.jpg' },
    { name: 'Terno Bordô Longo', price: 17500, img: 'images/loja-2.jpg' },
    { name: 'Terno Vermelho', price: 14900, img: 'images/loja-3.jpg' },
    { name: 'Terno Rosa Claro', price: 13500, img: 'images/loja-4.jpg' },
    { name: 'Terno Bordô com Gravata', price: 16200, img: 'images/loja-5.jpg' },
    { name: 'Terno Bordô com Lenço', price: 15800, img: 'images/loja-6.jpg' },
    { name: 'Terno Branco com Gravata Preta', price: 18500, img: 'images/loja-8.jpg' },
    { name: 'Terno Branco com Faixa', price: 17900, img: 'images/loja-9.jpg' },
    { name: 'Terno Amarelo', price: 14500, img: 'images/loja-10.jpg' },
    { name: 'Terno Branco Smoking', price: 19500, img: 'images/loja-11.jpg' },
    { name: 'Terno Bege com Gravata Vermelha', price: 16900, img: 'images/loja-12.jpg' },
    { name: 'Terno Preto Riscado', price: 15500, img: 'images/loja-14.jpg' }
  ];
  var SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  var CART_KEY = 'femterno_cart_v1';
  var CLIENT_KEY = 'femterno_cliente_v1';
  var ORDERS_KEY = 'femterno_encomendas_v1';

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MT'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; } catch (e) { return fallback; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; } return 'h' + (h >>> 0).toString(16); }
  function firstName(n) { return (n || '').trim().split(/\s+/)[0] || 'Cliente'; }

  /* ---------- CSS ---------- */
  var css = [
    '.fem-count{display:inline-block;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:999px;background:#111;color:#fff;font-size:11px;padding:0 5px;margin-left:4px}',
    '.fem-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:90;display:none}',
    '.fem-overlay.open{display:block}',
    '.fem-drawer{position:fixed;top:0;right:0;bottom:0;width:min(430px,100%);background:#fff;color:#1a1a1a;z-index:95;transform:translateX(105%);transition:transform .28s ease;display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(0,0,0,.25)}',
    '.fem-drawer.open{transform:translateX(0)}',
    '.fem-dhead{display:flex;justify-content:space-between;align-items:center;padding:18px 18px 12px;border-bottom:1px solid #eee}',
    '.fem-dhead h2{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:26px}',
    '.fem-dclose{border:1px solid #111;background:#fff;border-radius:999px;padding:9px 16px;cursor:pointer;font-size:13px}',
    '.fem-dbody{flex:1;overflow-y:auto;padding:14px 18px;-webkit-overflow-scrolling:touch}',
    '.fem-empty{text-align:center;color:#777;padding:40px 10px;line-height:1.7}',
    '.fem-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee}',
    '.fem-item img{width:64px;height:84px;object-fit:cover;border-radius:10px;background:#f2efe9;flex:none}',
    '.fem-item .fem-info{flex:1;min-width:0}',
    '.fem-item h3{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:19px;line-height:1.2}',
    '.fem-item .fem-price{font-size:15px;margin-top:3px}',
    '.fem-row{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}',
    '.fem-row select,.fem-row button{font-size:14px;padding:8px 10px;border:1px solid #ccc;border-radius:10px;background:#fff;min-height:36px}',
    '.fem-row .fem-qty{min-width:36px;text-align:center}',
    '.fem-remove{border:none;background:none;color:#a00;cursor:pointer;font-size:13px;padding:8px 4px}',
    '.fem-dfoot{border-top:1px solid #eee;padding:16px 18px 20px}',
    '.fem-total{display:flex;justify-content:space-between;font-size:18px;margin-bottom:12px}',
    '.fem-total b{font-size:20px}',
    '.fem-primary{display:block;width:100%;padding:15px;border-radius:999px;border:1px solid #111;background:#111;color:#fff;cursor:pointer;letter-spacing:.18em;text-transform:uppercase;font-size:13px;min-height:48px}',
    '.fem-primary:hover{background:#fff;color:#111}',
    '.fem-ghost{display:block;width:100%;padding:13px;border-radius:999px;border:1px solid #111;background:#fff;color:#111;cursor:pointer;letter-spacing:.18em;text-transform:uppercase;font-size:12px;margin-top:10px;min-height:46px}',
    '.fem-note{font-size:12px;color:#777;line-height:1.6;text-align:center;margin-top:12px}',
    '.fem-modal{position:fixed;inset:0;z-index:96;display:none;align-items:flex-end;justify-content:center;padding:0}',
    '.fem-modal.open{display:flex}',
    '.fem-modal .fem-sheet{background:#fff;color:#1a1a1a;border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:92vh;overflow-y:auto;padding:22px 20px 26px;-webkit-overflow-scrolling:touch}',
    '@media(min-width:640px){.fem-modal{align-items:center;padding:20px}.fem-modal .fem-sheet{border-radius:20px}}',
    '.fem-sheet h2{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:28px;margin-bottom:4px}',
    '.fem-sheet .fem-sub{color:#777;font-size:14px;line-height:1.6;margin-bottom:16px}',
    '.fem-field{margin-bottom:12px}',
    '.fem-field label{display:block;font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}',
    '.fem-field input,.fem-field textarea,.fem-field select{width:100%;font-size:16px;padding:13px 12px;border:1px solid #ccc;border-radius:12px;background:#fff;font-family:inherit}',
    '.fem-field textarea{min-height:74px;resize:vertical}',
    '.fem-tabs{display:flex;gap:8px;margin-bottom:16px}',
    '.fem-tabs button{flex:1;padding:12px;border-radius:999px;border:1px solid #111;background:#fff;color:#111;cursor:pointer;font-size:13px;letter-spacing:.1em;text-transform:uppercase;min-height:44px}',
    '.fem-tabs button.active{background:#111;color:#fff}',
    '.fem-error{color:#a00;font-size:13px;line-height:1.5;margin:4px 0 10px;display:none}',
    '.fem-ok{background:#f2efe9;border-radius:14px;padding:16px;line-height:1.7;margin:10px 0}',
    '.fem-ok b{font-size:18px}',
    '.fem-order{border:1px solid #eee;border-radius:12px;padding:12px;margin-bottom:10px;line-height:1.6;font-size:14px}',
    '.fem-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,140%);background:#111;color:#fff;padding:14px 20px;border-radius:20px;z-index:120;font-size:14px;display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;transition:transform .3s ease;max-width:calc(100vw - 32px);box-shadow:0 10px 30px rgba(0,0,0,.35)}',
    '.fem-toast.show{transform:translate(-50%,0)}',
    '.fem-toast button{background:#fff;color:#111;border:none;border-radius:999px;padding:9px 14px;cursor:pointer;font-size:13px;white-space:nowrap}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- HTML injectado ---------- */
  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="fem-overlay" id="femOverlay"></div>' +
    '<aside class="fem-drawer" id="femDrawer" aria-label="Carrinho">' +
      '<div class="fem-dhead"><h2>O teu carrinho</h2><button type="button" class="fem-dclose" id="femDrawerClose">Fechar ×</button></div>' +
      '<div class="fem-dbody" id="femDrawerBody"></div>' +
      '<div class="fem-dfoot" id="femDrawerFoot"></div>' +
    '</aside>' +
    '<div class="fem-modal" id="femAccessModal" role="dialog" aria-label="Acesso">' +
      '<div class="fem-sheet" id="femAccessSheet"></div>' +
    '</div>' +
    '<div class="fem-toast" id="femToast"><span id="femToastText"></span><button type="button" id="femToastBtn" style="display:none">Ver carrinho</button></div>';
  document.body.appendChild(wrap);

  var overlay = document.getElementById('femOverlay');
  var drawer = document.getElementById('femDrawer');
  var drawerBody = document.getElementById('femDrawerBody');
  var drawerFoot = document.getElementById('femDrawerFoot');
  var accessModal = document.getElementById('femAccessModal');
  var accessSheet = document.getElementById('femAccessSheet');
  var toast = document.getElementById('femToast');
  var toastText = document.getElementById('femToastText');
  var toastBtn = document.getElementById('femToastBtn');
  var toastTimer = null;

  /* ---------- Carrinho ---------- */
  function cart() { return load(CART_KEY, []); }
  function saveCart(c) { save(CART_KEY, c); updateBadge(); }
  function cartCount() { var n = 0; cart().forEach(function (it) { n += it.qty; }); return n; }
  function cartTotal() { var t = 0; cart().forEach(function (it) { t += PRODUCTS[it.i].price * it.qty; }); return t; }

  function updateBadge() {
    var el = document.getElementById('cartCount');
    if (el) el.textContent = String(cartCount());
    var btn = document.getElementById('accessBtn');
    var c = load(CLIENT_KEY, null);
    if (btn) btn.textContent = c ? firstName(c.nome) : 'Acesso';
  }

  function showToast(msg, showCartBtn) {
    toastText.textContent = msg;
    toastBtn.style.display = showCartBtn ? '' : 'none';
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3800);
  }
  toastBtn.addEventListener('click', function () { toast.classList.remove('show'); openDrawer(); });

  function addToCart(i, size) {
    if (!PRODUCTS[i]) return;
    var c = cart();
    var found = null;
    c.forEach(function (it) { if (it.i === i && it.size === size) found = it; });
    if (found) { if (found.qty < 9) found.qty += 1; }
    else c.push({ i: i, size: size || 'M', qty: 1 });
    saveCart(c);
    showToast(PRODUCTS[i].name + ' no carrinho.', true);
  }

  function renderDrawer() {
    var c = cart();
    if (!c.length) {
      drawerBody.innerHTML = '<p class="fem-empty">O teu carrinho está vazio.<br>Escolhe um terno na loja e carrega em <b>Comprar</b>.</p>';
      drawerFoot.innerHTML = '<button type="button" class="fem-primary" id="femGoShop">Ver a loja</button>';
      var go = document.getElementById('femGoShop');
      if (go) go.addEventListener('click', function () { closeAll(); if (location.pathname.indexOf('loja.html') < 0) location.href = 'loja.html'; });
      return;
    }
    var h = '';
    c.forEach(function (it, k) {
      var p = PRODUCTS[it.i];
      h += '<div class="fem-item"><img src="' + esc(p.img) + '" alt="">' +
        '<div class="fem-info"><h3>' + esc(p.name) + '</h3><div class="fem-price">' + fmt(p.price) + '</div>' +
        '<div class="fem-row"><label>Tamanho <select data-k="' + k + '" class="fem-size">' +
        SIZES.map(function (s) { return '<option' + (s === it.size ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select></label>' +
        '<button type="button" data-k="' + k + '" class="fem-minus" aria-label="Menos">−</button><span class="fem-qty">' + it.qty + '</span><button type="button" data-k="' + k + '" class="fem-plus" aria-label="Mais">+</button>' +
        '<button type="button" data-k="' + k + '" class="fem-remove">Remover</button></div></div></div>';
    });
    drawerBody.innerHTML = h;
    drawerFoot.innerHTML = '<div class="fem-total"><span>Total</span><b>' + fmt(cartTotal()) + '</b></div>' +
      '<button type="button" class="fem-primary" id="femCheckout">Finalizar encomenda</button>' +
      '<p class="fem-note">Pagamento e entrega combinam-se com a estilista depois da encomenda.</p>';
    drawerBody.querySelectorAll('.fem-size').forEach(function (sel) {
      sel.addEventListener('change', function () { var cc = cart(); cc[+sel.dataset.k].size = sel.value; saveCart(cc); });
    });
    drawerBody.querySelectorAll('.fem-plus').forEach(function (b) {
      b.addEventListener('click', function () { var cc = cart(); if (cc[+b.dataset.k].qty < 9) cc[+b.dataset.k].qty += 1; saveCart(cc); renderDrawer(); });
    });
    drawerBody.querySelectorAll('.fem-minus').forEach(function (b) {
      b.addEventListener('click', function () { var cc = cart(); if (cc[+b.dataset.k].qty > 1) cc[+b.dataset.k].qty -= 1; saveCart(cc); renderDrawer(); });
    });
    drawerBody.querySelectorAll('.fem-remove').forEach(function (b) {
      b.addEventListener('click', function () { var cc = cart(); cc.splice(+b.dataset.k, 1); saveCart(cc); renderDrawer(); });
    });
    document.getElementById('femCheckout').addEventListener('click', renderOrderForm);
  }

  function renderOrderForm() {
    var c = load(CLIENT_KEY, null);
    drawerBody.innerHTML =
      '<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:24px;font-weight:500;margin-bottom:4px">Finalizar encomenda</h3>' +
      '<p class="fem-sub" style="color:#777;font-size:14px;line-height:1.6;margin-bottom:16px">Deixa os teus dados. A estilista confirma o tamanho, o pagamento e a entrega contigo.</p>' +
      '<div class="fem-field"><label for="femOrdName">O teu nome</label><input id="femOrdName" type="text" autocomplete="name" value="' + (c ? esc(c.nome) : '') + '"></div>' +
      '<div class="fem-field"><label for="femOrdPhone">Telemóvel</label><input id="femOrdPhone" type="tel" autocomplete="tel" placeholder="84 ou 85…" value="' + (c ? esc(c.telefone) : '') + '"></div>' +
      '<div class="fem-field"><label for="femOrdNotes">Notas (opcional)</label><textarea id="femOrdNotes" placeholder="Ex.: quero provar no atelier antes de pagar"></textarea></div>' +
      '<p class="fem-error" id="femOrdErr"></p>';
    drawerFoot.innerHTML = '<button type="button" class="fem-primary" id="femOrdConfirm">Confirmar encomenda</button>' +
      '<button type="button" class="fem-ghost" id="femOrdBack">Voltar ao carrinho</button>';
    document.getElementById('femOrdBack').addEventListener('click', renderDrawer);
    document.getElementById('femOrdConfirm').addEventListener('click', function () {
      var nome = document.getElementById('femOrdName').value.trim();
      var tel = document.getElementById('femOrdPhone').value.replace(/[^0-9+]/g, '');
      var notas = document.getElementById('femOrdNotes').value.trim();
      var err = document.getElementById('femOrdErr');
      if (nome.length < 2) { err.textContent = 'Escreve o teu nome.'; err.style.display = 'block'; return; }
      if (tel.replace(/\D/g, '').length < 9) { err.textContent = 'Escreve um telemóvel válido (9 números).'; err.style.display = 'block'; return; }
      var orders = load(ORDERS_KEY, []);
      var code = 'FT-' + String(1000 + orders.length + 1);
      var order = { code: code, nome: nome, telefone: tel, notas: notas, itens: cart(), total: cartTotal(), quando: new Date().toISOString().slice(0, 10) };
      orders.push(order);
      save(ORDERS_KEY, orders);
      saveCart([]);
      var lines = order.itens.map(function (it) { var p = PRODUCTS[it.i]; return '• ' + p.name + ' (' + it.size + ') x' + it.qty + ' — ' + fmt(p.price * it.qty); }).join('\n');
      var resumo = 'Encomenda ' + code + ' — FEM TERNO\n' + lines + '\nTotal: ' + fmt(order.total) + '\nNome: ' + nome + '\nTelemóvel: ' + tel + (notas ? '\nNotas: ' + notas : '');
      drawerBody.innerHTML = '<div class="fem-ok"><b>Encomenda registada.</b><br>Código: <b>' + esc(code) + '</b><br><br>' + esc(lines).replace(/\n/g, '<br>') + '<br>Total: <b>' + fmt(order.total) + '</b></div>' +
        '<p style="line-height:1.7;color:#555">A estilista vai contactar-te para confirmar o tamanho, o pagamento e a entrega. Guarda o código da encomenda.</p>';
      drawerFoot.innerHTML = '<button type="button" class="fem-primary" id="femCopyOrder">Copiar resumo</button>' +
        '<button type="button" class="fem-ghost" id="femOrderDone">Fechar</button>';
      document.getElementById('femCopyOrder').addEventListener('click', function () { copyText(resumo, 'Resumo copiado.'); });
      document.getElementById('femOrderDone').addEventListener('click', closeAll);
    });
  }

  function copyText(text, okMsg) {
    function done() { showToast(okMsg || 'Copiado.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); }); }
    else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Acesso / área da cliente ---------- */
  function client() { return load(CLIENT_KEY, null); }

  function renderAccess() {
    var c = client();
    if (c) {
      var orders = load(ORDERS_KEY, []).filter(function (o) { return o.telefone === c.telefone; });
      var oh = orders.length ? orders.slice().reverse().map(function (o) {
        return '<div class="fem-order"><b>' + esc(o.code) + '</b> — ' + esc(o.quando) + '<br>' +
          o.itens.map(function (it) { return esc(PRODUCTS[it.i].name) + ' (' + esc(it.size) + ') x' + it.qty; }).join('<br>') +
          '<br>Total: <b>' + fmt(o.total) + '</b></div>';
      }).join('') : '<p style="color:#777;line-height:1.6">Ainda não tens encomendas neste telemóvel.</p>';
      accessSheet.innerHTML =
        '<h2>Olá, ' + esc(firstName(c.nome)) + '</h2>' +
        '<p class="fem-sub">A tua área — ' + esc(c.nome) + ' · ' + esc(c.telefone) + '</p>' +
        '<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:500;margin-bottom:10px">As minhas encomendas</h3>' +
        oh +
        '<button type="button" class="fem-ghost" id="femLogout">Sair</button>' +
        '<button type="button" class="fem-ghost" id="femAccessClose">Fechar</button>' +
        '<p class="fem-note">A tua conta fica guardada só neste telemóvel.</p>';
      document.getElementById('femLogout').addEventListener('click', function () { save(CLIENT_KEY, null); updateBadge(); renderAccess(); showToast('Saíste da tua conta.'); });
      document.getElementById('femAccessClose').addEventListener('click', closeAll);
      return;
    }
    accessSheet.innerHTML =
      '<h2>Acesso</h2>' +
      '<p class="fem-sub">Entra na tua área para veres as tuas encomendas. A tua conta fica guardada só neste telemóvel.</p>' +
      '<div class="fem-tabs"><button type="button" id="femTabLogin" class="active">Entrar</button><button type="button" id="femTabNew">Criar conta</button></div>' +
      '<div id="femAccessForm"></div>' +
      '<button type="button" class="fem-ghost" id="femAccessClose2">Fechar</button>';
    document.getElementById('femAccessClose2').addEventListener('click', closeAll);
    var mode = 'login';
    var form = document.getElementById('femAccessForm');
    function drawForm() {
      var isNew = mode === 'new';
      form.innerHTML =
        (isNew ? '<div class="fem-field"><label for="femAccName">O teu nome</label><input id="femAccName" type="text" autocomplete="name"></div>' : '') +
        '<div class="fem-field"><label for="femAccPhone">Telemóvel</label><input id="femAccPhone" type="tel" autocomplete="tel" placeholder="84 ou 85…"></div>' +
        '<div class="fem-field"><label for="femAccPass">Palavra-passe</label><input id="femAccPass" type="password" autocomplete="current-password" placeholder="Escolhe uma palavra-passe"></div>' +
        (isNew ? '<div class="fem-field"><label for="femAccPass2">Repetir palavra-passe</label><input id="femAccPass2" type="password" autocomplete="new-password"></div>' : '') +
        '<p class="fem-error" id="femAccErr"></p>' +
        '<button type="button" class="fem-primary" id="femAccGo">' + (isNew ? 'Criar a minha conta' : 'Entrar') + '</button>';
      document.getElementById('femAccGo').addEventListener('click', function () {
        var err = document.getElementById('femAccErr');
        function fail(msg) { err.textContent = msg; err.style.display = 'block'; }
        var tel = document.getElementById('femAccPhone').value.replace(/[^0-9+]/g, '');
        var pass = document.getElementById('femAccPass').value;
        if (tel.replace(/\D/g, '').length < 9) { fail('Escreve um telemóvel válido (9 números).'); return; }
        if (pass.length < 4) { fail('A palavra-passe tem de ter pelo menos 4 letras ou números.'); return; }
        if (isNew) {
          var nome = document.getElementById('femAccName').value.trim();
          var pass2 = document.getElementById('femAccPass2').value;
          if (nome.length < 2) { fail('Escreve o teu nome.'); return; }
          if (pass !== pass2) { fail('As palavras-passe não são iguais.'); return; }
          var existing = load(CLIENT_KEY, null);
          if (existing && existing.telefone === tel) { fail('Já existe uma conta com este telemóvel neste aparelho. Entra com a palavra-passe.'); return; }
          save(CLIENT_KEY, { nome: nome, telefone: tel, pass: hash(pass) });
          updateBadge(); renderAccess(); showToast('Conta criada. Bem-vinda, ' + firstName(nome) + '.');
        } else {
          var me = load(CLIENT_KEY, null);
          if (!me || me.telefone !== tel) { fail('Não há conta com este telemóvel neste aparelho. Cria uma conta.'); return; }
          if (me.pass !== hash(pass)) { fail('Palavra-passe errada. Tenta de novo.'); return; }
          updateBadge(); renderAccess(); showToast('Bem-vinda de volta, ' + firstName(me.nome) + '.');
        }
      });
    }
    document.getElementById('femTabLogin').addEventListener('click', function () { mode = 'login'; this.classList.add('active'); document.getElementById('femTabNew').classList.remove('active'); drawForm(); });
    document.getElementById('femTabNew').addEventListener('click', function () { mode = 'new'; this.classList.add('active'); document.getElementById('femTabLogin').classList.remove('active'); drawForm(); });
    drawForm();
  }

  /* ---------- Abrir / fechar ---------- */
  function openDrawer() { renderDrawer(); drawer.classList.add('open'); overlay.classList.add('open'); }
  function openAccess() { renderAccess(); accessModal.classList.add('open'); overlay.classList.add('open'); }
  function closeAll() { drawer.classList.remove('open'); accessModal.classList.remove('open'); overlay.classList.remove('open'); }

  document.getElementById('femDrawerClose').addEventListener('click', closeAll);
  overlay.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openDrawer);
  var accessBtn = document.getElementById('accessBtn');
  if (accessBtn) accessBtn.addEventListener('click', openAccess);

  document.addEventListener('click', function (e) {
    var buy = e.target.closest ? e.target.closest('.buy[data-i]') : null;
    if (buy) {
      var sizeSel = document.getElementById('mSize');
      var modal = document.getElementById('modal');
      var size = 'M';
      if (buy.id === 'mBuy' && sizeSel) size = sizeSel.value;
      else if (modal && modal.classList.contains('open') && buy.closest('#modal') && sizeSel) size = sizeSel.value;
      addToCart(parseInt(buy.dataset.i, 10), size);
      return;
    }
    var mBuy = e.target.closest ? e.target.closest('#mBuy') : null;
    if (mBuy) {
      var modalEl = document.getElementById('modal');
      var idx = modalEl && modalEl.dataset.i !== undefined ? parseInt(modalEl.dataset.i, 10) : NaN;
      if (!isNaN(idx)) {
        var s = document.getElementById('mSize');
        addToCart(idx, s ? s.value : 'M');
      }
    }
  });

  updateBadge();
  window.FEMTERNO = { add: addToCart, openCart: openDrawer, openAccess: openAccess, products: PRODUCTS };
})();
