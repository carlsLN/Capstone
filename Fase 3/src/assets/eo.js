/* Componentes y utilidades compartidas del prototipo Easy Office */
(function () {
  const D = window.EO_DATA;
  // carpeta assets/ resuelta desde la ubicación de este script (sirve en portal/, crm/ y la raíz)
  const ASSETS = ((document.currentScript && document.currentScript.src) || '').replace(/eo\.js(\?.*)?$/, '');
  try { const ov = JSON.parse(localStorage.getItem('eo_roles') || 'null'); if (ov) Object.keys(ov).forEach((r) => { if (D.roles[r]) D.roles[r].permisos = ov[r]; }); } catch (e) { /* sin almacenamiento */ }
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } },
  };

  const EO = {
    store,
    icon: (n, c = 'w-4 h-4') => `<i data-lucide="${n}" class="${c}"></i>`,
    refreshIcons() { if (window.lucide) window.lucide.createIcons(); },
    clp: (n) => '$' + Math.round(n || 0).toLocaleString('es-CL'),
    param: (k) => new URLSearchParams(location.search).get(k),
    esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    tramite: (id) => D.tramites.find((t) => t.id === id),
    categoria: (id) => D.categorias.find((c) => c.id === id),
    usuario: (id) => D.equipo.find((u) => u.id === id),
    estado: (id) => D.estados.find((e) => e.id === id),
    cicloTxt: (c) => ({ anual: '/ año', mensual: '/ mes', 'único': '' }[c] || ''),
  };

  /* ---------- RUT chileno (Módulo 11) ---------- */
  EO.rut = {
    clean: (r) => String(r || '').replace(/[^0-9kK]/g, '').toUpperCase(),
    valid(r) {
      const c = EO.rut.clean(r);
      if (c.length < 8) return false;
      const body = c.slice(0, -1), dv = c.slice(-1);
      let sum = 0, mul = 2;
      for (let i = body.length - 1; i >= 0; i--) { sum += parseInt(body[i], 10) * mul; mul = mul === 7 ? 2 : mul + 1; }
      const res = 11 - (sum % 11);
      const exp = res === 11 ? '0' : res === 10 ? 'K' : String(res);
      return exp === dv;
    },
    format(r) {
      const c = EO.rut.clean(r);
      if (c.length < 2) return c;
      const body = c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return body + '-' + c.slice(-1);
    },
  };

  /* ---------- Toast ---------- */
  EO.toast = function (msg, icon = 'check-circle-2') {
    let t = document.getElementById('eo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'eo-toast';
      t.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
      document.body.appendChild(t);
    }
    t.innerHTML = `<div class="flex items-center gap-2.5 rounded-xl bg-eo-ink text-white px-4 py-3 text-sm shadow-lift">${EO.icon(icon, 'w-4 h-4 text-eo-bright')}<span>${msg}</span></div>`;
    EO.refreshIcons();
    requestAnimationFrame(() => t.classList.remove('opacity-0', 'translate-y-4'));
    clearTimeout(EO._tt);
    EO._tt = setTimeout(() => t.classList.add('opacity-0', 'translate-y-4'), 2800);
  };

  /* ---------- Logo ---------- */
  EO.logo = function (opts = {}) {
    const { size = 'md', dark = false, sub = true } = opts;
    // logo oficial: completo (con «easy office») o solo la marca
    const h = sub ? { sm: 'h-9', md: 'h-12', lg: 'h-20' }[size] : { sm: 'h-6', md: 'h-8', lg: 'h-12' }[size];
    const file = (sub ? 'logo' : 'marca') + (dark ? '-oscuro' : '-claro') + '.png';
    return `<img src="${ASSETS}img/${file}" alt="Easy Office" class="${h} w-auto shrink-0 select-none" draggable="false">`;
  };

  /* ---------- Sesión cliente (simulada) ---------- */
  EO.session = () => store.get('eo_session', null);
  EO.login = (s) => store.set('eo_session', s);
  EO.logout = () => { store.del('eo_session'); location.href = 'index.html'; };
  EO.initials = (n) => String(n || '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  /* ---------- Solicitudes ----------
     Con Firebase (nube.js) los cambios se guardan en Firestore; sin conexión quedan en este navegador. */
  const N = window.EO_NUBE;
  if (!N) { const u = store.get('eo_users', null); if (u) D.equipo = u; }
  EO.solicitudes = function () {
    // se omiten solicitudes de trámites que ya no están en el catálogo
    if (N) return D.solicitudes.filter((s) => EO.tramite(s.tramite)).map((s) => Object.assign({}, s));
    const patches = store.get('eo_sol_patch', {});
    const nuevas = store.get('eo_sol_new', []);
    return [...nuevas, ...D.solicitudes].map((s) => Object.assign({}, s, patches[s.folio] || {}));
  };
  EO.solicitud = (folio) => EO.solicitudes().find((s) => s.folio === folio);
  EO.updateSolicitud = function (folio, patch) {
    if (N) {
      const s = D.solicitudes.find((x) => x.folio === folio);
      if (s) Object.assign(s, patch);
      N.actualizar('solicitudes', folio, patch);
      return;
    }
    const nuevas = store.get('eo_sol_new', []);
    const i = nuevas.findIndex((s) => s.folio === folio);
    if (i >= 0) { Object.assign(nuevas[i], patch); store.set('eo_sol_new', nuevas); return; }
    const p = store.get('eo_sol_patch', {});
    p[folio] = Object.assign(p[folio] || {}, patch);
    store.set('eo_sol_patch', p);
  };
  EO.addSolicitud = function (s) {
    if (N) { D.solicitudes.unshift(s); N.guardar('solicitudes', s.folio, s); return; }
    const nuevas = store.get('eo_sol_new', []);
    nuevas.unshift(s);
    store.set('eo_sol_new', nuevas);
  };
  // trámites del cliente con sesión en el portal
  EO.misSolicitudes = (ses) => EO.solicitudes().filter((s) => (s.titularRun ? EO.rut.clean(s.titularRun) === EO.rut.clean(ses.run) : s.propio));
  EO.nextFolio = function () {
    const max = EO.solicitudes().reduce((m, s) => Math.max(m, parseInt(s.folio.split('-')[2], 10)), 0);
    return 'EO-2026-' + String(max + 1).padStart(6, '0');
  };

  /* Estado visto por el cliente */
  EO.estadoCliente = {
    ingresado: ['Recibido', 'pill-gray'], validacion: ['En revisión', 'pill-blue'], notaria: ['En notaría', 'pill-amber'],
    firma: ['Pendiente de firma', 'pill-amber'], completado: ['Completado', 'pill-green'],
  };
  EO.estadoPill = function (id) {
    const e = EO.estado(id);
    const cls = { gray: 'pill-gray', blue: 'pill-blue', amber: 'pill-amber', green: 'pill-green' }[e.color];
    return `<span class="${cls}"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>${e.nombre}</span>`;
  };

  /* ---------- Rol CRM (RBAC simulado) ---------- */
  // con una cuenta real (Firebase Auth) el rol sale de su ficha en el equipo; si no, del selector demo
  EO.role = () => { const u = store.get('eo_uid', null) && EO.usuario(store.get('eo_uid', null)); return (u && D.roles[u.rol]) ? u.rol : store.get('eo_role', 'Administrador'); };
  EO.crmUser = () => store.get('eo_uid', null) || ({ Administrador: 'u1', Ejecutivo: 'u2', Finanzas: 'u4', Freelance: 'u5' }[EO.role()]);
  EO.can = (perm) => D.roles[EO.role()].permisos.includes(perm);
  EO.mask = (v, keep = 3) => { const s = String(v || ''); return s.length <= keep ? '•••' : s.slice(0, keep) + '•'.repeat(Math.max(3, s.length - keep - 2)) + s.slice(-2); };
  EO.audit = function (accion, folio, detalle, quien) {
    const log = store.get('eo_audit', []);
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const row = [ts, quien || EO.crmUser(), accion, folio || '—', detalle, '186.10.24.3'];
    if (N) {
      row.push(ts.replace(/\D/g, '') + '-' + Math.random().toString(36).slice(2, 7));
      D.auditoria.unshift(row);
      N.guardar('auditoria', row[6], N.auditDoc(row));
      return;
    }
    log.unshift(row);
    store.set('eo_audit', log.slice(0, 200));
  };
  // guarda cambios del equipo y de la matriz de permisos
  EO.saveUsuario = function (u) {
    if (N) { if (!D.equipo.includes(u)) D.equipo.push(u); N.guardar('usuarios', u.id, u); return; }
    store.set('eo_users', D.equipo);
  };
  EO.savePermisos = function () {
    const ov = {}; Object.keys(D.roles).forEach((k) => { ov[k] = D.roles[k].permisos; });
    if (N) { N.guardar('config', 'roles', { permisos: ov }); return; }
    store.set('eo_roles', ov);
  };

  /* ---------- Seguridad de cuentas del portal ---------- */
  EO.maskEmail = (e) => { const [u, d] = String(e || '').split('@'); return d ? u.slice(0, 1) + '•••' + (u.length > 4 ? u.slice(-1) : '') + '@' + d : e; };
  EO.maskFono = (f) => { const n = String(f || '').replace(/\D/g, ''); return n.length >= 4 ? '+56 9 •••• ' + n.slice(-4) : f; };
  EO.edad = (iso) => { const b = new Date(iso + 'T12:00:00'), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
  // N° de documento de la cédula chilena: 9 dígitos (ej. 527.893.125); las antiguas pueden empezar con una letra
  EO.docValido = (v) => /^[A-Za-z]?\d{9}$/.test(String(v || '').replace(/[.\s-]/g, ''));
  EO.docFormat = (v) => { const c = String(v || '').replace(/[.\s-]/g, '').toUpperCase(); const m = c.match(/^([A-Z]?)(\d{3})(\d{3})(\d{3})$/); return m ? `${m[1]}${m[2]}.${m[3]}.${m[4]}` : v; };

  /* Código de verificación de 6 dígitos (simulado: en producción lo envía el servidor por correo o SMS) */
  EO.codigo = {
    enviar(destino) {
      const c = String(Math.floor(100000 + Math.random() * 900000));
      EO._codigos = EO._codigos || {};
      EO._codigos[destino] = { c, exp: Date.now() + 5 * 60000 };
      return c;
    },
    verificar(destino, v) { const x = (EO._codigos || {})[destino]; return !!x && Date.now() < x.exp && x.c === String(v).trim(); },
    caja(destino, c) {
      return `<div class="rounded-xl border border-dashed border-orange-300 bg-orange-50/70 px-4 py-3 text-xs text-slate-700 flex gap-2.5">${EO.icon('flask-conical', 'w-4 h-4 text-eo-amber shrink-0 mt-0.5')}
        <span><b class="text-eo-amber">Modo demo:</b> en la versión final el código llega a ${EO.esc(destino)}. Para probar, usa <b class="font-mono tracking-widest text-eo-ink">${c}</b>. Vence en 5 minutos.</span></div>`;
    },
  };

  /* Captcha anti-bots (simulado). En producción: Cloudflare Turnstile o reCAPTCHA + Firebase App Check. */
  EO.captcha = function (el) {
    const st = { ok: false, t0: Date.now() };
    el.innerHTML = `<div class="flex items-center justify-between gap-3 rounded-xl border border-eo-line bg-eo-bg px-4 py-3">
        <label class="flex items-center gap-3 cursor-pointer select-none text-sm font-medium">
          <span data-cb class="w-6 h-6 rounded-md border-2 border-slate-300 bg-white grid place-items-center transition"></span>No soy un robot</label>
        <span class="text-right leading-tight text-[10px] text-eo-muted">${EO.icon('shield-check', 'w-5 h-5 text-eo-green inline')}<br>Anti-bots · demo</span>
      </div><input type="text" name="sitio_web" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">`;
    const cb = el.querySelector('[data-cb]');
    el.querySelector('label').onclick = () => {
      if (st.ok || st.busy) return;
      st.busy = true; cb.className = 'w-6 h-6 rounded-full border-2 border-eo-mint border-t-eo-green animate-spin';
      setTimeout(() => { st.busy = false; st.ok = true; cb.className = 'w-6 h-6 rounded-md bg-eo-green text-white grid place-items-center'; cb.innerHTML = EO.icon('check', 'w-4 h-4'); EO.refreshIcons(); }, 900);
    };
    EO.refreshIcons();
    // pasa si se marcó, el campo trampa sigue vacío y no fue instantáneo (los bots completan en milisegundos)
    st.valido = () => st.ok && !el.querySelector('[name="sitio_web"]').value && Date.now() - st.t0 > 1500;
    st.reset = () => { st.ok = false; cb.className = 'w-6 h-6 rounded-md border-2 border-slate-300 bg-white grid place-items-center transition'; cb.innerHTML = ''; };
    return st;
  };

  /* Bloqueo tras 5 intentos fallidos de contraseña (por correo, 15 minutos) */
  EO.intentos = {
    MAX: 5, MIN: 15,
    get(email) { const a = store.get('eo_intentos', {})[String(email).toLowerCase()] || { n: 0, hasta: 0 }; if (a.hasta && Date.now() > a.hasta) return { n: 0, hasta: 0 }; return a; },
    fallo(email) {
      const all = store.get('eo_intentos', {}), k = String(email).toLowerCase(), a = EO.intentos.get(k);
      a.n++; if (a.n >= EO.intentos.MAX) a.hasta = Date.now() + EO.intentos.MIN * 60000;
      all[k] = a; store.set('eo_intentos', all); return a;
    },
    limpiar(email) { const all = store.get('eo_intentos', {}); delete all[String(email).toLowerCase()]; store.set('eo_intentos', all); },
  };

  /* ---------- Cuentas del portal ---------- */
  // la cuenta se verifica al registrarse con un código al correo y otro al celular (sin revisión de un ejecutivo)
  EO.cuentaDe = (run) => (D.clientes || []).find((c) => EO.rut.clean(c.run) === EO.rut.clean(run));

  /* ---------- Pago por transferencia ---------- */
  // datos de la cuenta de Easy Office (con botón copiar); el folio va como referencia
  EO.datosBanco = function (folio) {
    const b = D.banco;
    const row = (n, v) => `<div class="flex items-center justify-between gap-3 py-1.5"><span class="text-eo-muted">${n}</span><span class="flex items-center gap-2 font-medium text-right">${EO.esc(v)}<button type="button" data-copy="${EO.esc(v)}" class="text-slate-400 hover:text-eo-green" aria-label="Copiar">${EO.icon('copy', 'w-3.5 h-3.5')}</button></span></div>`;
    return `<div class="rounded-xl bg-eo-bg p-4 text-xs divide-y divide-eo-line">
      ${row('Titular', b.titular)}${row('RUT', b.rut)}${row('Banco', b.banco)}${row('Tipo de cuenta', b.tipo)}${row('N° de cuenta', b.numero)}${row('Correo', b.correo)}${row('Asunto / referencia', folio || 'Tu folio (lo verás al confirmar)')}
      ${b.ejemplo ? '<p class="pt-2 text-[10px] text-eo-amber">Datos de ejemplo para la demo.</p>' : ''}</div>`;
  };
  document.addEventListener('click', (e) => { const c = e.target.closest('[data-copy]'); if (c) { navigator.clipboard?.writeText(c.dataset.copy); EO.toast('Copiado: ' + c.dataset.copy, 'copy'); } });

  // 2% de descuento al pagar por transferencia (acordado con Easy Office el 30-10-2026).
  // Cada pago guarda lo que paga el cliente (monto) y el descuento; al trámite se le abona la suma de ambos.
  EO.DESC_TRANSF = 0.02;
  EO.descTransf = (m) => Math.round(m * EO.DESC_TRANSF);
  EO.abono = (p) => (p.monto || 0) + (p.descuento || 0);

  /* Pago con tarjeta de débito o crédito tipo Webpay (SIMULADO). Devuelve una promesa con los datos de la autorización. */
  EO.webpay = function ({ monto, glosa }) {
    return new Promise((resolve, reject) => {
      const ov = document.createElement('div');
      ov.id = 'webpayOverlay';
      ov.className = 'fixed inset-0 z-[60] bg-eo-ink/70 backdrop-blur-sm grid place-items-center p-4';
      document.body.appendChild(ov);
      const S = { paso: 'tipo', tipo: '', num: '', cuotas: 1 };
      const cerrar = (ok, data) => { ov.remove(); ok ? resolve(data) : reject(new Error('cancelado')); };
      const marco = (body) => `<div class="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl fade-in">
          <div class="flex items-center justify-between px-5 py-4 border-b border-eo-line">
            <p class="flex items-center gap-2 font-bold">${EO.icon('credit-card', 'w-5 h-5 text-eo-blue')} Pago con tarjeta <span class="pill bg-orange-50 text-eo-amber !text-[10px] uppercase tracking-wider">Simulado</span></p>
            <button data-x class="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Cerrar">${EO.icon('x', 'w-5 h-5')}</button></div>
          <div class="px-5 py-3 bg-eo-bg text-xs flex justify-between"><span class="text-eo-muted">${EO.esc(glosa)}</span><b>${EO.clp(monto)}</b></div>
          <div class="p-5">${body}</div></div>`;
      const tipoBtn = (k, n, d, ic) => `<button data-t="${k}" class="w-full rounded-xl border border-eo-line px-4 py-3 text-left flex items-center gap-3 hover:border-eo-green hover:bg-eo-mint2">
          <span class="w-9 h-9 rounded-lg bg-eo-mint text-eo-green grid place-items-center shrink-0">${EO.icon(ic, 'w-[18px] h-[18px]')}</span>
          <span><span class="block text-sm font-semibold">${n}</span><span class="block text-[11px] text-eo-muted">${d}</span></span></button>`;
      const pintar = () => {
        if (S.paso === 'tipo') ov.innerHTML = marco(`<p class="text-sm font-semibold mb-3">¿Con qué tarjeta pagas?</p>
          <div class="space-y-2">${tipoBtn('Débito', 'Tarjeta de débito', 'Cuenta corriente, vista o RUT', 'wallet')}${tipoBtn('Crédito', 'Tarjeta de crédito', 'Visa, Mastercard o American Express', 'credit-card')}</div>
          <p class="text-[11px] text-eo-muted mt-4">Los datos de tu tarjeta los procesa la pasarela de pago. Easy Office no los guarda.</p>`);
        if (S.paso === 'datos') ov.innerHTML = marco(`<p class="text-sm font-semibold mb-3">Tarjeta de ${S.tipo.toLowerCase()}</p>
          <form data-f class="space-y-3">
            <input name="num" class="input tracking-wider" inputmode="numeric" placeholder="Número de tarjeta" required value="4051 8856 0044 6623">
            ${S.tipo === 'Crédito' ? `<div class="grid grid-cols-2 gap-3"><input class="input" placeholder="MM/AA" required value="12/29"><input class="input" placeholder="CVV" maxlength="4" required value="123"></div>
            <select name="cuotas" class="input">${[1, 3, 6, 12].map((n) => `<option value="${n}">${n === 1 ? 'Sin cuotas' : n + ' cuotas'}</option>`).join('')}</select>` : ''}
            <button class="btn-primary w-full">Continuar</button></form>
          <p class="text-[11px] text-eo-muted mt-3">Demo: ya viene una tarjeta de prueba.</p>`);
        if (S.paso === 'confirmar') ov.innerHTML = marco(`<p class="text-sm font-semibold mb-3">Autoriza el pago</p>
          <div class="rounded-xl bg-eo-bg p-4 text-xs space-y-2"><div class="flex justify-between"><span class="text-eo-muted">Comercio</span><span>${D.banco.titular}</span></div><div class="flex justify-between"><span class="text-eo-muted">Tarjeta</span><span>${S.tipo} •••• ${S.num.slice(-4)}</span></div>${S.tipo === 'Crédito' ? `<div class="flex justify-between"><span class="text-eo-muted">Cuotas</span><span>${S.cuotas === 1 ? 'Sin cuotas' : S.cuotas}</span></div>` : ''}<div class="flex justify-between"><span class="text-eo-muted">Monto</span><b>${EO.clp(monto)}</b></div></div>
          <p class="text-xs text-eo-muted mt-4 mb-2">${S.tipo === 'Débito' ? 'Clave de tu banco o código de tu app (cualquier número en la demo)' : 'Código enviado por tu banco (cualquier número en la demo)'}</p>
          <form data-f class="space-y-3"><input class="input text-center tracking-[.4em] font-semibold" maxlength="6" inputmode="numeric" required value="123456"><button class="btn-primary w-full">${EO.icon('lock', 'w-4 h-4')} Pagar ${EO.clp(monto)}</button></form>`);
        if (S.paso === 'proc') ov.innerHTML = marco(`<div class="text-center py-6"><div class="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-eo-mint border-t-eo-green animate-spin"></div><p class="font-semibold">Procesando el pago…</p></div>`);
        ov.querySelector('[data-x]').onclick = () => cerrar(false);
        ov.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { S.tipo = b.dataset.t; S.paso = 'datos'; pintar(); });
        const f = ov.querySelector('[data-f]');
        if (f) f.onsubmit = (e) => {
          e.preventDefault();
          if (S.paso === 'datos') {
            S.num = f.num.value.replace(/\D/g, '');
            if (S.num.length < 13 || S.num.length > 19) return EO.toast('Revisa el número de la tarjeta.', 'alert-circle');
            S.cuotas = f.cuotas ? +f.cuotas.value : 1; S.paso = 'confirmar'; return pintar();
          }
          S.paso = 'proc'; pintar();
          setTimeout(() => cerrar(true, { tarjeta: S.tipo, ultimos: S.num.slice(-4), cuotas: S.cuotas, autorizacion: String(Math.floor(100000 + Math.random() * 900000)) }), 1500);
        };
        EO.refreshIcons();
      };
      pintar();
    });
  };
  // texto corto de un pago, para el portal, el CRM y los PDF
  EO.detallePago = (p) => p.metodo === 'Tarjeta'
    ? `Tarjeta de ${String(p.tarjeta || '').toLowerCase()} •••• ${p.ultimos || ''} · aut. ${p.autorizacion || ''}${p.cuotas > 1 ? ' · ' + p.cuotas + ' cuotas' : ''}`
    : `${p.metodo}${p.banco ? ' · ' + p.banco : ''}${p.operacion ? ' · op. ' + p.operacion : ''}${p.comprobante ? ' · ' + p.comprobante : ''}${p.descuento ? ' · desc. 2% ' + EO.clp(p.descuento) : ''}`;

  /* ---------- Header portal ---------- */
  EO.portalHeader = function (active) {
    const s = EO.session();
    const links = [['index.html', 'Inicio', 'inicio'], ['catalogo.html', 'Catálogo', 'catalogo'], ['mis-tramites.html', 'Mis trámites', 'mis'], ['index.html#contacto', 'Contacto', 'contacto']];
    const nav = links.map(([h, t, k]) => `<a href="${h}" class="nav-link ${active === k ? 'active' : ''}">${t}</a>`).join('');
    const right = s
      ? `<div class="relative" id="userMenuWrap">
          <button id="userMenuBtn" class="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-eo-mint transition">
            <span class="w-8 h-8 rounded-full bg-eo-ink text-white text-xs font-bold grid place-items-center">${EO.initials(s.nombre)}</span>
            <span class="hidden sm:flex flex-col items-start leading-tight"><span class="text-sm font-semibold">${EO.esc(s.nombre.split(' ')[0])}</span><span class="text-[11px] text-eo-muted">Sesión segura</span></span>
            ${EO.icon('chevron-down', 'w-4 h-4 text-slate-400')}
          </button>
          <div id="userMenu" class="hidden absolute right-0 mt-2 w-52 card p-1.5 text-sm">
            <a href="mis-tramites.html" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-eo-mint">${EO.icon('folder-open')} Mis trámites</a>
            <button onclick="EO.logout()" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-eo-red">${EO.icon('log-out')} Cerrar sesión</button>
          </div>
        </div>`
      : `<a href="ingresar.html" class="btn-blue btn-sm !py-2.5">${EO.icon('fingerprint')} Iniciar sesión</a>`;
    return `<header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-eo-line">
      <div class="container-eo h-[72px] flex items-center justify-between gap-4">
        <a href="index.html" class="flex items-center gap-3 shrink-0">
          ${EO.logo({ size: 'md' })}
          <span class="hidden lg:flex flex-col border-l border-eo-line pl-3 leading-tight">
            <span class="font-display font-bold text-[15px]">Easy Office</span>
            <span class="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Portal de trámites corporativos</span>
          </span>
        </a>
        <nav class="hidden md:flex items-center gap-8">${nav}</nav>
        <div class="flex items-center gap-3">
          <span class="hidden sm:inline text-xs font-semibold text-slate-500">ES</span>
          ${right}
          <button id="mobileBtn" class="md:hidden p-2 rounded-lg hover:bg-eo-mint" aria-label="Menú">${EO.icon('menu', 'w-5 h-5')}</button>
        </div>
      </div>
      <div id="mobileNav" class="hidden md:hidden border-t border-eo-line bg-white">
        <div class="container-eo py-3 flex flex-col gap-1">${links.map(([h, t]) => `<a href="${h}" class="py-2 text-sm font-medium text-slate-700">${t}</a>`).join('')}</div>
      </div>
    </header>`;
  };

  EO.footer = function () {
    return `<footer class="bg-eo-ink text-slate-400">
      <div class="container-eo py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div class="space-y-4 max-w-xs">
          <div>${EO.logo({ size: 'lg', dark: true })}</div>
          <p class="text-sm leading-relaxed">Hacemos simple crear, ordenar y hacer crecer tu empresa en Chile. Más de 15 años acompañando a emprendedores y Pymes.</p>
        </div>
        <div><h4 class="text-white text-sm font-semibold mb-4">Servicios</h4><ul class="space-y-2.5 text-sm">
          <li><a class="hover:text-white" href="catalogo.html?cat=domicilio">Domicilio Tributario</a></li>
          <li><a class="hover:text-white" href="catalogo.html?cat=constitucion">Constitución de Empresa</a></li>
          <li><a class="hover:text-white" href="catalogo.html?cat=documental">Gestión Documental</a></li>
          <li><a class="hover:text-white" href="catalogo.html?cat=contable">Asesoría Contable</a></li></ul></div>
        <div><h4 class="text-white text-sm font-semibold mb-4">Portal</h4><ul class="space-y-2.5 text-sm">
          <li><a class="hover:text-white" href="catalogo.html">Catálogo de trámites</a></li>
          <li><a class="hover:text-white" href="mis-tramites.html">Estado de mi trámite</a></li>
          <li><a class="hover:text-white" href="index.html#faq">Preguntas frecuentes</a></li>
          <li><a class="hover:text-white" href="ingresar.html">Iniciar sesión</a></li></ul></div>
        <div><h4 class="text-white text-sm font-semibold mb-4">Contacto</h4><ul class="space-y-2.5 text-sm">
          <li>La Florida · Valparaíso · San Antonio</li>
          <li>ayuda@easyoffice.cl</li><li>+56 2 2277 7781</li><li>Lun a jue 08:30–17:30 · Vie 08:30–14:30</li></ul></div>
      </div>
      <div class="border-t border-white/10"><div class="container-eo py-5 flex flex-col sm:flex-row gap-3 justify-between text-xs">
        <span>© 2026 Easy Office SpA. Todos los derechos reservados.</span>
        <span class="flex gap-5"><a href="#" class="hover:text-white">Términos</a><a href="#" class="hover:text-white">Privacidad (Ley 21.719)</a><a href="#" class="hover:text-white">Ley 19.799</a></span>
      </div></div>
    </footer>
    <a href="https://wa.me/56222777781" target="_blank" rel="noopener" class="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-eo-green text-white grid place-items-center shadow-lift hover:bg-eo-hover" aria-label="WhatsApp">${EO.icon('message-circle', 'w-5 h-5')}</a>`;
  };

  EO.mountPortal = function (active) {
    const h = document.getElementById('header');
    const f = document.getElementById('footer');
    if (h) h.outerHTML = EO.portalHeader(active);
    if (f) f.outerHTML = EO.footer();
    document.getElementById('mobileBtn')?.addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('hidden'));
    const ub = document.getElementById('userMenuBtn');
    if (ub) {
      ub.addEventListener('click', (e) => { e.stopPropagation(); document.getElementById('userMenu').classList.toggle('hidden'); });
      document.addEventListener('click', () => document.getElementById('userMenu')?.classList.add('hidden'));
    }
    EO.refreshIcons();
  };

  /* ---------- Tarjeta de trámite ---------- */
  EO.tramiteCard = function (t) {
    const c = EO.categoria(t.categoria);
    return `<article class="tramite-card card p-6 flex flex-col justify-between hover:shadow-lift hover:-translate-y-0.5 transition" data-cat="${t.categoria}" data-text="${EO.esc((t.titulo + ' ' + t.resumen + ' ' + c.nombre).toLowerCase())}">
      <div>
        <div class="flex items-center justify-between gap-3 mb-4">
          <span class="pill-green uppercase tracking-wide !text-[10px]">${c.nombre}</span>
          <span class="text-[11px] text-eo-muted flex items-center gap-1">${EO.icon('clock', 'w-3.5 h-3.5')} ${t.plazo}</span>
        </div>
        <h3 class="text-[17px] font-bold leading-snug mb-2">${t.titulo}</h3>
        <p class="text-sm text-eo-muted leading-relaxed mb-5">${t.resumen}</p>
      </div>
      <div class="pt-4 border-t border-eo-line flex items-end justify-between gap-3">
        <div><span class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Desde</span>
          <span class="font-display text-lg font-extrabold">${EO.clp(t.precio)} <span class="text-xs font-semibold text-eo-muted">CLP ${EO.cicloTxt(t.ciclo)}</span></span></div>
        <a href="tramite.html?id=${t.id}" class="btn-primary btn-sm">Ver detalle</a>
      </div>
    </article>`;
  };

  /* ---------- Flujo de contratación: header + stepper ---------- */
  EO.flowSteps = ['Autenticación', 'Datos', 'Documentos', 'Pago', 'Confirmación'];
  EO.flowHeader = function (titulo) {
    const s = EO.session();
    return `<header class="bg-white border-b border-eo-line">
      <div class="container-eo h-[76px] flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <a href="index.html" class="shrink-0">${EO.logo()}</a>
          <div class="border-l border-eo-line pl-4 min-w-0">
            <span class="eyebrow">Trámite digital</span>
            <p class="font-display font-semibold truncate">${titulo}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a href="https://wa.me/56222777781" target="_blank" rel="noopener" class="hidden sm:inline-flex pill-green !py-1.5 !px-3 !text-xs">${EO.icon('help-circle', 'w-3.5 h-3.5')} ¿Necesitas ayuda?</a>
          ${s ? `<span class="flex items-center gap-2"><span class="w-9 h-9 rounded-full bg-eo-ink text-white text-xs font-bold grid place-items-center">${EO.initials(s.nombre)}</span>
          <span class="hidden md:flex flex-col leading-tight"><span class="text-sm font-semibold">${EO.esc(s.nombre.split(' ').slice(0, 2).join(' '))}</span><span class="text-[11px] text-eo-muted">Sesión segura</span></span></span>` : ''}
        </div>
      </div>
    </header>`;
  };
  EO.stepper = function (step) {
    const items = EO.flowSteps.map((n, i) => {
      const k = i + 1, done = k < step, cur = k === step;
      const dot = done
        ? `<span class="w-8 h-8 rounded-full bg-eo-green text-white grid place-items-center">${EO.icon('check', 'w-4 h-4')}</span>`
        : cur ? `<span class="w-8 h-8 rounded-full bg-eo-green text-white grid place-items-center text-xs font-bold ring-4 ring-eo-mint">${k}</span>`
          : `<span class="w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-500 grid place-items-center text-xs font-bold">${k}</span>`;
      const line = k < 5 ? `<span class="absolute top-4 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 ${done ? 'bg-eo-green' : 'bg-slate-200'}"></span>` : '';
      return `<li class="relative flex-1 flex flex-col items-center gap-2">${line}${dot}<span class="text-[11px] sm:text-xs text-center ${cur ? 'font-bold text-eo-ink' : done ? 'text-eo-green' : 'text-slate-400'}"><span class="hidden sm:inline">${k}. </span>${n}</span></li>`;
    }).join('');
    return `<div class="bg-white border-b border-eo-line"><ol class="container-eo max-w-5xl py-5 flex">${items}</ol></div>`;
  };

  /* ---------- CRM shell ---------- */
  EO.crmNav = [
    ['tablero.html', 'Tablero', 'layout-dashboard', 'tablero', 'ver_tramites'],
    ['clientes.html', 'Clientes', 'users', 'clientes', 'ver_datos_cliente'],
    ['pagos.html', 'Pagos', 'wallet', 'pagos', 'ver_pagos'],
    ['usuarios.html', 'Usuarios y roles', 'shield-check', 'usuarios', 'usuarios'],
    ['auditoria.html', 'Auditoría', 'scroll-text', 'auditoria', 'auditoria'],
  ];
  /* Sesión del CRM: se crea solo después de la contraseña y el segundo factor (login.html) y dura 8 horas.
     Mejora derivada de las pruebas CP-11 y CP-12 (Fase 3): antes el tablero se abría sin iniciar sesión. */
  EO.CRM_HORAS = 8;
  EO.crmSesion = () => { const x = store.get('eo_crm_sesion', null); return !!x && x.exp > Date.now(); };
  EO.crmIniciar = () => store.set('eo_crm_sesion', { exp: Date.now() + EO.CRM_HORAS * 3600000 });
  EO.crmSalir = () => { store.del('eo_crm_sesion'); store.del('eo_uid'); };

  EO.mountCrm = function (active, title, subtitle) {
    if (!EO.crmSesion()) {
      location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
      throw new Error('Sesión del CRM requerida');
    }
    const role = EO.role();
    const real = !!store.get('eo_uid', null);
    const me = EO.usuario(EO.crmUser()) || { nombre: 'Usuario', iniciales: 'EO' };
    const nav = EO.crmNav.map(([h, t, ic, k, perm]) => EO.can(perm)
      ? `<a href="${h}" class="side-link ${active === k ? 'active' : ''}">${EO.icon(ic, 'w-[18px] h-[18px]')} ${t}</a>`
      : `<span class="side-link opacity-40 cursor-not-allowed" title="Tu rol no tiene acceso">${EO.icon(ic, 'w-[18px] h-[18px]')} ${t} ${EO.icon('lock', 'w-3.5 h-3.5 ml-auto')}</span>`).join('');
    const counts = EO.solicitudes().filter((s) => s.estado === 'ingresado').length;
    document.getElementById('sidebar').innerHTML = `
      <div class="h-full flex flex-col">
        <a href="tablero.html" class="flex items-center gap-3 px-5 h-[72px] border-b border-white/10">${EO.logo({ size: 'sm', dark: true, sub: false })}
          <span class="leading-tight"><span class="block font-display text-white font-bold">Easy Office</span><span class="text-[10px] uppercase tracking-wider text-slate-400">CRM interno</span></span></a>
        <nav class="flex-1 p-3 space-y-1">${nav}
          <div class="pt-5 px-3 text-[10px] uppercase tracking-wider text-slate-500">Accesos</div>
          <a href="../portal/index.html" class="side-link">${EO.icon('globe', 'w-[18px] h-[18px]')} Ver portal público</a>
        </nav>
        <div class="m-3 rounded-xl bg-white/5 p-3.5">
          <p class="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5">${EO.icon('inbox', 'w-3.5 h-3.5')} ${counts} trámites sin asignar</p>
          <a href="tablero.html" class="text-xs font-semibold text-eo-bright">Revisar ahora →</a>
        </div>
      </div>`;
    document.getElementById('topbar').innerHTML = `
      <div class="h-[72px] px-4 sm:px-8 flex items-center justify-between gap-4 bg-white border-b border-eo-line">
        <div class="flex items-center gap-3 min-w-0">
          <button id="sideBtn" class="lg:hidden p-2 rounded-lg hover:bg-eo-mint" aria-label="Menú">${EO.icon('menu', 'w-5 h-5')}</button>
          <div class="min-w-0"><h1 class="font-display text-lg sm:text-xl font-bold truncate">${title}</h1>${subtitle ? `<p class="text-xs text-eo-muted truncate hidden sm:block">${subtitle}</p>` : ''}</div>
        </div>
        <div class="flex items-center gap-3">
          <label class="${real ? 'hidden' : 'hidden md:flex'} items-center gap-2 text-xs text-eo-muted">Ver como
            <select id="roleSel" class="input !py-1.5 !w-auto !text-xs">${Object.keys(D.roles).map((r) => `<option ${r === role ? 'selected' : ''}>${r}</option>`).join('')}</select>
          </label>
          <button class="relative p-2 rounded-lg hover:bg-eo-mint" aria-label="Notificaciones">${EO.icon('bell', 'w-5 h-5 text-slate-600')}<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-eo-red"></span></button>
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-full bg-eo-ink text-white text-xs font-bold grid place-items-center">${me.iniciales}</span>
            <span class="hidden sm:flex flex-col leading-tight"><span class="text-sm font-semibold">${me.nombre}</span><span class="text-[11px] text-eo-muted">${role}</span></span>
            <a href="login.html" onclick="EO.crmSalir()" class="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-eo-red" title="Cerrar sesión">${EO.icon('log-out', 'w-4 h-4')}</a>
          </div>
        </div>
      </div>`;
    document.getElementById('roleSel')?.addEventListener('change', (e) => { store.set('eo_role', e.target.value); location.reload(); });
    document.getElementById('sideBtn')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('-translate-x-full'));
    EO.refreshIcons();
  };

  /* Página sin permiso para el rol actual */
  EO.denied = function (el, perm) {
    el.innerHTML = `<div class="card p-10 text-center max-w-lg mx-auto mt-10">
      <span class="w-12 h-12 rounded-full bg-red-50 text-eo-red grid place-items-center mx-auto mb-4">${EO.icon('shield-x', 'w-6 h-6')}</span>
      <h2 class="text-lg font-bold mb-1">Acceso restringido</h2>
      <p class="text-sm text-eo-muted">El rol <b>${EO.role()}</b> no tiene el permiso «${(D.permisos.find((p) => p[0] === perm) || [, perm])[1]}». El intento quedó registrado en la auditoría.</p>
    </div>`;
    EO.audit('Acceso denegado', '—', 'Permiso requerido: ' + perm);
    EO.refreshIcons();
  };

  window.EO = EO;
})();
