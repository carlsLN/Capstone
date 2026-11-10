/* Conexión con Firebase (proyecto easy-office-97ace) vía API REST de Firestore y Auth.
   Se carga después de data.js y antes de eo.js. Mantiene una copia local (localStorage)
   para que las páginas pinten al instante; luego sincroniza con Firestore en segundo plano
   y, si hubo cambios, vuelve a pintar la página. */
(function () {
  const CFG = { projectId: 'easy-office-97ace', apiKey: 'AIzaSyCV4b86nFt7ucmGZnUMlSvlXlL7aElyiuE' };
  const BASE = `https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents`;
  const D = window.EO_DATA;
  const CACHE = 'eo_nube', COLA = 'eo_nube_cola';
  const ls = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  /* ---------- Conversión de valores Firestore ---------- */
  function enc(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string') return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
    return { mapValue: { fields: encFields(v) } };
  }
  function encFields(o) {
    const f = {};
    Object.keys(o).forEach((k) => { if (o[k] !== undefined && k[0] !== '_') f[k] = enc(o[k]); });
    return f;
  }
  function dec(v) {
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return parseInt(v.integerValue, 10);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('nullValue' in v) return null;
    if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('mapValue' in v) return decFields(v.mapValue.fields || {});
    return null;
  }
  function decFields(f) { const o = {}; Object.keys(f).forEach((k) => { o[k] = dec(f[k]); }); return o; }
  const fromDoc = (d) => Object.assign(decFields(d.fields || {}), { _id: decodeURIComponent(d.name.split('/').pop()) });
  const docUrl = (col, id) => `${BASE}/${col}/${encodeURIComponent(id)}`;

  /* ---------- Normalización del catálogo ----------
     La colección "tramites" la comparten la página original (titulo, categoria, plazo, requisitos,
     tipo, costo, es_frecuente) y las páginas nuevas (campos extendidos). Los trámites que solo
     traen los campos básicos se completan aquí con valores razonables. */
  const sinTilde = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  function catId(t) {
    if (t.categoriaId) return t.categoriaId;
    const c = D.categorias.find((x) => sinTilde(x.nombre) === sinTilde(t.categoria));
    return c ? c.id : 'documental';
  }
  function normTramite(t) {
    const reqs = Array.isArray(t.requisitosDetalle) && t.requisitosDetalle.length
      ? t.requisitosDetalle.map((r) => [r.nombre, r.detalle || ''])
      : String(t.requisitos || '').split(/[,;]/).map((s) => s.trim()).filter(Boolean).map((s) => [s, 'Requisito indicado por Easy Office.']);
    const docs = Array.isArray(t.documentos) && t.documentos.length
      ? t.documentos.map((r) => [r.nombre, r.detalle || ''])
      : reqs.slice(0, 2).map(([n]) => [n, 'Archivo PDF o imagen legible.']);
    return {
      id: t._id, categoria: catId(t), titulo: t.titulo || t._id,
      resumen: t.resumen || `${t.titulo}. Gestión ${String(t.tipo || '100% online').toLowerCase()} con seguimiento en línea.`,
      precio: +(t.precio ?? t.costo ?? 0), ciclo: t.ciclo || 'único', plazo: t.plazo || 'A convenir', tipo: t.tipo || '100% online',
      form: t.form || 'generico', firma: !!t.firma, popular: !!(t.popular ?? t.es_frecuente),
      requisitos: reqs.length ? reqs : [['Cédula de identidad vigente', 'Del titular o representante legal.']],
      incluye: Array.isArray(t.incluye) && t.incluye.length ? t.incluye : ['Gestión completa del trámite', 'Seguimiento en línea desde «Mis trámites»', 'Asesoría de un ejecutivo'],
      documentos: docs.length ? docs : [['Cédula de identidad', 'Anverso y reverso en un único archivo.']],
      orden: t.orden ?? 999,
    };
  }
  // Trámite de las páginas nuevas → documento compatible con la página original
  function tramiteDoc(t, i) {
    const c = D.categorias.find((x) => x.id === t.categoria);
    return {
      titulo: t.titulo, categoria: (c ? c.nombre : t.categoria).toUpperCase(), plazo: t.plazo, tipo: t.tipo,
      costo: t.precio, es_frecuente: !!t.popular, requisitos: t.requisitos.map((r) => r[0]).join(', '),
      categoriaId: t.categoria, precio: t.precio, ciclo: t.ciclo, resumen: t.resumen, form: t.form, firma: !!t.firma, popular: !!t.popular,
      requisitosDetalle: t.requisitos.map(([nombre, detalle]) => ({ nombre, detalle })),
      documentos: (t.documentos || []).map(([nombre, detalle]) => ({ nombre, detalle })),
      incluye: t.incluye || [], orden: t.orden ?? i,
    };
  }
  const auditRow = (a) => [a.ts, a.usuario, a.accion, a.folio || '—', a.detalle || '', a.ip || '', a._id];
  const auditDoc = (r) => ({ ts: r[0], usuario: r[1], accion: r[2], folio: r[3], detalle: r[4], ip: r[5] });

  /* ---------- Copia local ---------- */
  function snapshotFromD() {
    const permisos = {}; Object.keys(D.roles).forEach((r) => { permisos[r] = D.roles[r].permisos; });
    return { tramites: D.tramites, solicitudes: D.solicitudes, auditoria: D.auditoria, equipo: D.equipo, permisos, clientes: D.clientes || [] };
  }
  function apply(s) {
    if (!s) return;
    if (s.tramites && s.tramites.length) D.tramites = s.tramites;
    if (s.solicitudes) D.solicitudes = s.solicitudes;
    if (s.auditoria) D.auditoria = s.auditoria;
    if (s.equipo && s.equipo.length) D.equipo = s.equipo;
    if (s.clientes) D.clientes = s.clientes;
    if (s.permisos) Object.keys(s.permisos).forEach((r) => { if (D.roles[r]) D.roles[r].permisos = s.permisos[r]; });
  }
  // JSON con llaves ordenadas: Firestore no garantiza el orden de los campos
  // la auditoría se compara por los id de sus registros (el orden de registros del mismo segundo varía)
  const firma = (o) => JSON.stringify(Object.assign({}, o, { auditoria: (o.auditoria || []).map((r) => r[6] || r.join('|')).sort() }), (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => { r[x] = v[x]; return r; }, {}) : v));
  const persist = () => ls.set(CACHE, Object.assign(snapshotFromD(), { at: Date.now() }));
  const cached = ls.get(CACHE, null);
  apply(cached);

  /* ---------- Llamadas REST ---------- */
  async function req(method, url, body, token) {
    const headers = body ? { 'Content-Type': 'application/json' } : {};
    if (token) headers.Authorization = 'Bearer ' + token;
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'key=' + CFG.apiKey, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(method + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
    return r.json();
  }
  async function listar(col) {
    let out = [], token = '';
    do {
      const j = await req('GET', `${BASE}/${col}?pageSize=300${token ? '&pageToken=' + token : ''}`);
      out = out.concat((j.documents || []).map(fromDoc));
      token = j.nextPageToken || '';
    } while (token);
    return out;
  }
  async function ultimos(col, campo, n) {
    const j = await req('POST', `${BASE}:runQuery`, { structuredQuery: { from: [{ collectionId: col }], orderBy: [{ field: { fieldPath: campo }, direction: 'DESCENDING' }], limit: n } });
    return j.filter((x) => x.document).map((x) => fromDoc(x.document));
  }
  // escribe (crea o reemplaza) un documento; con "campos" solo actualiza esos campos
  function escribirDoc(col, id, obj, campos, token) {
    const mask = campos ? campos.map((c) => 'updateMask.fieldPaths=' + encodeURIComponent(c)).join('&') : '';
    return req('PATCH', docUrl(col, id) + (mask ? '?' + mask : ''), { fields: encFields(obj) }, token);
  }

  /* Cola de escrituras pendientes (si no hay conexión se reintenta en la próxima carga) */
  const cola = () => ls.get(COLA, []);
  // una sola vaciada de la cola a la vez, para no enviar dos veces el mismo cambio
  let vaciando = null;
  function flush() {
    if (!vaciando) vaciando = vaciar().finally(() => { vaciando = null; });
    return vaciando;
  }
  async function vaciar() {
    let q = cola();
    while (q.length) {
      const op = q[0];
      try { await escribirDoc(op.col, op.id, op.obj, op.campos); } catch (e) {
        // rechazado por las reglas de seguridad: se descarta para no bloquear la cola
        if (!/ (400|403) /.test(e.message)) { NUBE.estado = 'sin-conexion'; return false; }
        console.warn('[Easy Office] Firestore rechazó un cambio:', e.message);
      }
      q = cola(); q.shift(); ls.set(COLA, q);
    }
    return true;
  }
  function encolar(col, id, obj, campos) {
    const q = cola(); q.push({ col, id, obj, campos }); ls.set(COLA, q);
    persist();
    return flush();
  }

  /* ---------- Sincronización ---------- */
  async function leerTodo() {
    const [tr, so, au, us, cfg, cl] = await Promise.all([
      listar('tramites'), listar('solicitudes'), ultimos('auditoria', 'ts', 300), listar('usuarios'),
      req('GET', docUrl('config', 'roles')).then(fromDoc).catch(() => null),
      listar('clientes').catch(() => []),
    ]);
    return {
      tramites: tr.map(normTramite).sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo)),
      solicitudes: so.map((s) => { delete s._id; return s; }).sort((a, b) => b.folio.localeCompare(a.folio)),
      auditoria: au.map(auditRow).sort((a, b) => b[0].localeCompare(a[0]) || b[2].localeCompare(a[2])),
      equipo: us.map((u) => { delete u._id; return u; }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
      permisos: cfg ? cfg.permisos : null,
      clientes: cl.map((c) => { delete c._id; return c; }).sort((a, b) => String(b.creado).localeCompare(String(a.creado))),
    };
  }
  async function sync() {
    if (NUBE._sync) return NUBE._sync;
    NUBE._sync = (async () => {
      try {
        await flush();
        const s = await leerTodo();
        if (cola().length) return; // llegó una escritura mientras leíamos; se sincroniza en la próxima vuelta
        const antes = firma(snapshotFromD());
        apply(s); persist();
        NUBE.estado = 'conectado';
        if (firma(snapshotFromD()) !== antes) refrescar();
      } catch (e) {
        NUBE.estado = 'sin-conexion';
        console.warn('[Easy Office] No se pudo sincronizar con Firebase:', e.message);
      } finally { NUBE._sync = null; }
    })();
    return NUBE._sync;
  }
  // Vuelve a pintar la página cuando llegan datos nuevos (sin interrumpir a quien está escribiendo)
  function refrescar() {
    if (typeof window.EO_ALREFRESCAR === 'function') return window.EO_ALREFRESCAR();
    if (window.EO_NO_RECARGAR) return;
    const ocupado = () => document.querySelector('input:focus, textarea:focus, select:focus, .dragging') ||
      [...document.querySelectorAll('[id$="Modal"], [id$="Overlay"]')].some((m) => !m.classList.contains('hidden'));
    if (!ocupado()) return location.reload();
    NUBE._pend = true;
  }

  /* ---------- Firebase Auth (correo y contraseña) ---------- */
  async function login(email, password) {
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + CFG.apiKey, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || 'ERROR');
    return { uid: j.localId, email: j.email, idToken: j.idToken };
  }
  // crea la cuenta en Firebase Authentication (registro del portal)
  async function registrar(email, password) {
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + CFG.apiKey, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || 'ERROR');
    return { uid: j.localId, email: j.email, idToken: j.idToken };
  }
  const leerDoc = (col, id) => req('GET', docUrl(col, id)).then(fromDoc).catch(() => null);
  // escritura directa con la sesión del usuario (las reglas exigen que sea su propio documento)
  const guardarComo = (token, col, id, obj) => escribirDoc(col, id, obj, null, token);

  const NUBE = {
    activo: true, estado: cached ? 'cache' : 'iniciando', sync, login, registrar, leerDoc, guardarComo, persist,
    guardar: (col, id, obj) => encolar(col, id, obj),
    actualizar: (col, id, patch) => encolar(col, id, patch, Object.keys(patch)),
    auditDoc, tramiteDoc,
    // usado una sola vez para poblar Firestore con los datos de las páginas nuevas
    _escribirDoc: escribirDoc, _listar: listar,
  };
  window.EO_NUBE = NUBE;

  const arrancar = () => {
    sync();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
    document.addEventListener('focusout', () => setTimeout(() => { if (NUBE._pend) { NUBE._pend = false; refrescar(); } }, 300));
    // en el CRM, revisa cambios de otros usuarios cada 30 s
    if (/\/crm\//.test(location.pathname)) setInterval(() => { if (!document.hidden) sync(); }, 30000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
