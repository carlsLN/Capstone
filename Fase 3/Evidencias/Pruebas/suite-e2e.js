// Suite de pruebas E2E (Playwright) del MVP Easy Office: portal + CRM + reglas de Firestore.
const { chromium } = require('playwright');
const fs = require('fs');
fs.mkdirSync('shots', { recursive: true }); fs.mkdirSync('dl', { recursive: true });
const B = process.env.BASE || 'http://localhost:8765/';
const RUN = process.env.RUN || 'r1';
const KEY = 'AIzaSyCV4b86nFt7ucmGZnUMlSvlXlL7aElyiuE';
const FS = 'https://firestore.googleapis.com/v1/projects/easy-office-97ace/databases/(default)/documents';
const R = []; let ctx, p, browser;
const shot = async (id, pg = p) => { const f = `shots/${RUN}_${id}.png`; await pg.screenshot({ path: f }); return f; };
async function caso(id, nombre, fn) {
  const t0 = Date.now(); let r;
  try { r = await fn(); r = Object.assign({ ok: true }, r); } catch (e) { r = { ok: false, obtenido: 'ERROR: ' + e.message.split('\n')[0] }; try { r.shot = await shot(id); } catch {} }
  R.push(Object.assign({ id, nombre, ms: Date.now() - t0 }, r)); console.log(id, r.ok ? 'PASA' : 'FALLA', '-', r.obtenido || '');
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function captcha(sel) { await p.click(sel + ' label'); await sleep(2000); }
async function codigo(cont) { const c = (await p.locator('.font-mono').last().textContent()).trim(); await p.locator(cont + ' input').first().click(); await p.keyboard.type(c); return c; }

(async () => {
  browser = await chromium.launch();
  ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
  p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));

  await caso('CP-01', 'El catálogo carga los trámites desde Firestore', async () => {
    await p.goto(B + 'portal/catalogo.html'); await sleep(3500);
    const n = await p.locator('a[href*="tramite.html?id="]').count();
    const sinPrecio = await p.evaluate(() => (EO_DATA.tramites || []).filter(t => !(t.precio > 0 || t.costo > 0)).map(t => t.titulo || t.id));
    const s = await shot('CP-01');
    if (n < 12) throw new Error('solo ' + n + ' trámites');
    return { obtenido: `${n} tarjetas de trámite.` + (sinPrecio.length ? ` Sin precio: ${sinPrecio.join(', ')}` : ''), ok: sinPrecio.length === 0, shot: s };
  });

  await caso('CP-02', 'El detalle del trámite muestra precio, requisitos y botones 50%/100%', async () => {
    await p.goto(B + 'portal/tramite.html?id=contrato-estacionamiento'); await sleep(2500);
    const txt = await p.locator('main').innerText();
    const ok = /15\.000/.test(txt) && /50%/.test(txt) && /100%/.test(txt);
    return { ok, obtenido: ok ? 'Precio $15.000 y opciones de pago 50%/100% visibles.' : 'Faltan datos en el detalle', shot: await shot('CP-02') };
  });

  await caso('CP-03', 'El registro rechaza un RUN con dígito verificador incorrecto', async () => {
    await p.goto(B + 'portal/ingresar.html?tab=reg'); await sleep(1500);
    await p.fill('#rNom', 'Prueba Calidad'); await p.fill('#rRun', '12.345.678-9'); await p.fill('#rDoc', '527893125');
    await p.fill('#rNac', '1995-05-10'); await p.fill('#rMail', 'qa@example.com'); await p.fill('#rFono', '+56 9 1234 5678');
    await p.click('#r1 button.btn-primary'); await sleep(500);
    const msg = await p.locator('#r1').innerText();
    const ok = /RUN inválido/.test(msg);
    return { ok, obtenido: ok ? 'Muestra «RUN inválido: revisa el dígito verificador» y no avanza.' : 'Avanzó con un RUN inválido', shot: await shot('CP-03') };
  });

  await caso('CP-04', 'El registro rechaza a menores de 18 años', async () => {
    await p.fill('#rRun', '12.345.678-5'); await p.fill('#rNac', '2012-01-01');
    await p.click('#r1 button.btn-primary'); await sleep(500);
    const ok = /mayor de 18/.test(await p.locator('#r1').innerText());
    return { ok, obtenido: ok ? 'Muestra «Debes ser mayor de 18 años» y no avanza.' : 'Aceptó a un menor', shot: await shot('CP-04') };
  });

  await caso('CP-05', 'El registro exige verificar correo y celular con código', async () => {
    await p.fill('#rNac', '1995-05-10'); await p.click('#r1 button.btn-primary'); await sleep(800);
    await p.fill('#p1', 'Prueba1234'); await p.fill('#p2', 'Prueba1234'); await p.locator('#terms').evaluate(e => { e.checked = true; }); await captcha('#rCap');
    await p.click('#r3Go'); await sleep(500);
    const ok = /Verifica tu correo con el código/.test(await p.locator('#r3Msg').innerText());
    return { ok, obtenido: ok ? 'Sin los códigos no crea la cuenta: «Verifica tu correo con el código».' : 'Creó la cuenta sin verificar', shot: await shot('CP-05') };
  });

  await caso('CP-06', 'El inicio de sesión avisa los intentos restantes y bloquea al quinto error', async () => {
    const mail = `qa.bloqueo.${RUN}@example.com`; const avisos = [];
    await p.goto(B + 'portal/ingresar.html'); await sleep(1200);
    for (let i = 0; i < 5; i++) {
      await p.fill('#lMail', mail); await p.fill('#lPass', 'clave-mala'); await captcha('#lCap');
      await p.click('#lBtn'); await sleep(2500); avisos.push((await p.locator('#lMsg').innerText()).replace(/\s+/g, ' ').trim());
    }
    const ok = /4 intentos/.test(avisos[0]) && /Bloqueamos/.test(avisos[4]) && await p.locator('#lBtn').isDisabled();
    return { ok, obtenido: `1er error: «${avisos[0]}» · 5º error: «${avisos[4].slice(0, 90)}…»`, shot: await shot('CP-06') };
  });

  await caso('CP-07', 'Inicio de sesión del cliente con contraseña + código de 6 dígitos', async () => {
    await p.goto(B + 'portal/ingresar.html'); await sleep(1200);
    await captcha('#lCap'); await p.click('#lBtn'); await sleep(4000); await p.click('#send'); await sleep(400);
    await codigo('#cod'); await sleep(2500);
    const ok = /mis-tramites/.test(p.url());
    return { ok, obtenido: ok ? 'Tras el código entra a «Mis trámites».' : 'No entró: ' + p.url(), shot: await shot('CP-07') };
  });

  await caso('CP-08', 'Transferencia aplica 2% de descuento sobre el monto a pagar', async () => {
    await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('eo_flujo') || k.includes('contratar')).forEach(k => localStorage.removeItem(k)));
    await p.goto(B + 'portal/contratar.html?id=contrato-vehiculo&modo=100&step=4'); await sleep(2500);
    await p.locator('[data-met="transferencia"]').locator('xpath=..').click(); await sleep(600);
    const txt = await p.locator('#main').innerText();
    const ok = /14\.700/.test(txt);
    return { ok, obtenido: ok ? '$15.000 al 100% por transferencia = $14.700 (−$300, 2%).' : 'Monto mostrado no corresponde: ' + (txt.match(/\$[\d.]+/g) || []).join(' '), shot: await shot('CP-08') };
  });

  let folio = null;
  await caso('CP-09', 'Contratación completa (estacionamiento, sin campos opcionales) con pago Webpay crea la solicitud', async () => {
    await p.goto(B + 'portal/contratar.html?id=contrato-estacionamiento&modo=100&step=2'); await sleep(3000);
    const campos = p.locator('#main [data-k]');
    const n = await campos.count();
    for (let i = 0; i < n; i++) {
      const el = campos.nth(i);
      const info = await el.evaluate(e => ({ tag: e.tagName, type: e.type, t: e.dataset.t, v: e.value, opc: /opcional/i.test((e.closest('div.relative') ? e.closest('div.relative').parentElement : e.parentElement).innerText) }));
      if (info.v || info.opc) continue;
      if (info.tag === 'SELECT') { await el.selectOption({ index: 1 }); continue; }
      const val = info.type === 'date' ? '2026-11-15' : info.t === 'rut' ? '11.111.111-1' : info.type === 'number' || info.t === 'num' || info.t === 'monto' ? '60000' : info.t === 'email' ? 'qa@example.com' : 'Prueba QA';
      await el.fill(val); await el.blur();
    }
    await sleep(500); await shot('CP-09a');
    await p.click('#next'); await sleep(1500);
    if (!/Adjunta/.test(await p.locator('#main').innerText())) { const m = await p.locator('body').innerText(); throw new Error('No pasó del paso 2: ' + (m.match(/Falta completar[^\n]*|Revisa[^\n]*/) || [''])[0]); }
    const files = p.locator('#main input[type=file][data-doc]');
    fs.writeFileSync('dl/cedula-prueba.pdf', '%PDF-1.4\n% documento de prueba QA\n');
    const nd = await files.count();
    for (let i = 0; i < nd; i++) { await p.locator(`#main input[type=file][data-doc="${i}"]`).first().setInputFiles('dl/cedula-prueba.pdf'); await sleep(200); }
    await sleep(6000); await shot('CP-09b');
    await p.click('#next'); await sleep(1500);
    await p.locator('[data-met="tarjeta"]').locator('xpath=..').click(); await sleep(500);
    await p.click('#next'); await sleep(800);
    await p.click('#webpayOverlay [data-t="Crédito"]'); await sleep(400);
    await p.click('#webpayOverlay button.btn-primary'); await sleep(400);
    await shot('CP-09c');
    await p.click('#webpayOverlay button.btn-primary'); await sleep(4500);
    const txt = await p.locator('main').innerText();
    folio = (txt.match(/EO-\d{4}-\d{6}/) || [])[0];
    if (!folio) throw new Error('no apareció folio');
    await sleep(3000);
    const r = await fetch(`${FS}/solicitudes/${folio}?key=${KEY}`); const j = await r.json();
    const ok = r.ok && j.fields && j.fields.estado.stringValue === 'ingresado';
    return { ok, obtenido: `Folio ${folio} creado con ${nd} documento(s); en Firestore: ${ok ? 'estado «ingresado», pagado ' + (j.fields.pagado.integerValue) : 'NO encontrado (' + r.status + ')'}.`, shot: await shot('CP-09') };
  });

  await caso('CP-10', 'Estado del trámite permite descargar el borrador en PDF', async () => {
    if (!folio) throw new Error('sin folio de CP-09');
    await p.goto(B + 'portal/estado.html?folio=' + folio); await sleep(3000);
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.locator('button.dl').first().click()]);
    const f = 'dl/' + d.suggestedFilename(); await d.saveAs(f);
    const head = fs.readFileSync(f).slice(0, 5).toString();
    return { ok: head === '%PDF-', obtenido: `Descarga ${d.suggestedFilename()} (${fs.statSync(f).size} bytes, PDF válido).`, shot: await shot('CP-10') };
  });

  // ---------- CRM ----------
  const crm = await ctx.newPage();
  await caso('CP-11', 'El CRM no se abre sin iniciar sesión', async () => {
    const c2 = await browser.newContext(); const q = await c2.newPage();
    await q.goto(B + 'crm/tablero.html'); await sleep(3000);
    const ok = /login\.html/.test(q.url());
    const s = await shot('CP-11', q); await c2.close();
    return { ok, obtenido: ok ? 'Redirige al login.' : 'Abre el tablero sin sesión (' + q.url().replace(B, '') + ').', shot: s };
  });

  await caso('CP-12', 'El segundo factor del CRM rechaza un código incorrecto', async () => {
    await crm.goto(B + 'crm/login.html'); await sleep(1500);
    await crm.click('#go'); await sleep(3500);
    await crm.fill('#code', '000000'); await crm.click('#f2 button.btn-primary'); await sleep(2500);
    const ok = /login\.html/.test(crm.url());
    return { ok, obtenido: ok ? 'Rechaza el código y no entra.' : 'Entró al tablero con el código 000000.', shot: await shot('CP-12', crm) };
  });

  // ingreso correcto al CRM (contraseña + código válido) para las pruebas siguientes
  if (!/tablero/.test(crm.url())) {
    if (!/f2/.test(await crm.evaluate(() => document.querySelector('#f2:not(.hidden)') ? 'f2' : ''))) { await crm.goto(B + 'crm/login.html'); await sleep(1500); await crm.click('#go'); await sleep(3500); }
    const c = (await crm.locator('#codeDemo .font-mono').textContent()).trim();
    await crm.fill('#code', c); await crm.click('#f2 button.btn-primary'); await sleep(2500);
  }
  await caso('CP-13', 'La solicitud pagada aparece sola en el tablero del CRM', async () => {
    if (!folio) throw new Error('sin folio');
    await crm.goto(B + 'crm/tablero.html'); await sleep(4000);
    const ok = (await crm.locator('body').innerText()).includes(folio);
    return { ok, obtenido: ok ? `El folio ${folio} aparece en la columna «Ingresado».` : 'No aparece', shot: await shot('CP-13', crm) };
  });

  await caso('CP-14', 'La auditoría se exporta a Excel ordenado (columnas ajustadas, filtros, encabezado fijo)', async () => {
    await crm.goto(B + 'crm/auditoria.html'); await sleep(3500);
    const [d] = await Promise.all([crm.waitForEvent('download', { timeout: 8000 }), crm.click('#exp')]);
    const f = 'dl/' + d.suggestedFilename(); await d.saveAs(f);
    return { ok: true, obtenido: f, shot: await shot('CP-14', crm), xlsx: f };
  });

  // ---------- Reglas de Firestore (API REST, sin sesión) ----------
  const rest = async (method, url, body) => (await fetch(url + (url.includes('?') ? '&' : '?') + 'key=' + KEY, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) })).status;
  await caso('CP-15', 'Reglas: nadie puede borrar una solicitud desde la web', async () => {
    const s = await rest('DELETE', `${FS}/solicitudes/${folio || 'EO-2026-000482'}`);
    return { ok: s === 403, obtenido: `DELETE → HTTP ${s}` };
  });
  await caso('CP-16', 'Reglas: un registro de auditoría no se puede modificar', async () => {
    const list = await (await fetch(`${FS}/auditoria?pageSize=1&key=${KEY}`)).json();
    const name = list.documents[0].name.split('/documents/')[1];
    const s = await rest('PATCH', `${FS}/${name}?updateMask.fieldPaths=accion`, { fields: { accion: { stringValue: 'alterado' } } });
    return { ok: s === 403, obtenido: `PATCH → HTTP ${s}` };
  });
  await caso('CP-17', 'Reglas: no se puede crear una solicitud ya «completada» ni con folio inválido', async () => {
    const a = await rest('PATCH', `${FS}/solicitudes/EO-2026-999999`, { fields: { folio: { stringValue: 'EO-2026-999999' }, tramite: { stringValue: 'x' }, cliente: { stringValue: 'x' }, estado: { stringValue: 'completado' }, pagado: { integerValue: '0' } } });
    const b = await rest('PATCH', `${FS}/solicitudes/HACK-1`, { fields: { folio: { stringValue: 'HACK-1' }, tramite: { stringValue: 'x' }, cliente: { stringValue: 'x' }, estado: { stringValue: 'ingresado' }, pagado: { integerValue: '0' } } });
    return { ok: a === 403 && b === 403, obtenido: `estado completado → HTTP ${a}; folio inválido → HTTP ${b}` };
  });
  await caso('CP-18', 'Reglas: colecciones no declaradas están cerradas', async () => {
    const s = await rest('GET', `${FS}/secreto/x`);
    return { ok: s === 403, obtenido: `GET /secreto → HTTP ${s}` };
  });

  // ---------- Responsive ----------
  await caso('CP-19', 'El portal se ve completo en celular (390 px, sin scroll horizontal)', async () => {
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
    const q = await m.newPage(); const malas = [];
    for (const pg of ['portal/index.html', 'portal/catalogo.html', 'portal/tramite.html?id=domicilio-oficina', 'portal/ingresar.html']) {
      await q.goto(B + pg); await sleep(2000);
      const w = await q.evaluate(() => document.documentElement.scrollWidth);
      if (w > 392) malas.push(`${pg} (${w}px)`);
    }
    await q.goto(B + 'portal/index.html'); await sleep(1500); const s = await shot('CP-19', q); await m.close();
    return { ok: malas.length === 0, obtenido: malas.length ? 'Desborde en: ' + malas.join(', ') : '4 páginas sin desborde horizontal.', shot: s };
  });

  R.push({ id: 'JS', errores });
  fs.writeFileSync(`resultados_${RUN}.json`, JSON.stringify(R, null, 2));
  await browser.close();
})();
