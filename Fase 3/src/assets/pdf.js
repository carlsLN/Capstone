/* Descargas en PDF del portal (borrador, documento final y comprobante de pago).
   Son documentos de DEMOSTRACIÓN: llevan marca de agua y no tienen validez legal. Requiere jspdf.min.js. */
(function () {
  const VERDE = [26, 162, 75], TINTA = [14, 27, 20], GRIS = [100, 116, 139];

  function nuevo() {
    const { jsPDF } = window.jspdf;
    return new jsPDF({ unit: 'mm', format: 'letter' });
  }
  // el logo se agrega si el navegador permite leerlo (en file:// algunos navegadores lo bloquean)
  function logo() {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => { try { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); res({ data: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight }); } catch (e) { res(null); } };
      img.onerror = () => res(null);
      img.src = (document.querySelector('script[src*="pdf.js"]').src || '').replace(/pdf\.js.*$/, '') + 'img/logo-claro.png';
    });
  }
  function encabezado(doc, lg, titulo, folio) {
    if (lg) doc.addImage(lg.data, 'PNG', 20, 12, 22, 22 * lg.h / lg.w);
    else { doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...VERDE); doc.text('easy office', 20, 22); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...GRIS);
    doc.text(['Easy Office SpA', 'Vicuña Mackenna Poniente 7255, of. 707, La Florida', 'contacto@easyoffice.cl · +56 2 2277 7781'], 196, 16, { align: 'right' });
    doc.setDrawColor(...VERDE); doc.setLineWidth(0.6); doc.line(20, 36, 196, 36);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...TINTA);
    doc.text(titulo, 20, 46);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...GRIS);
    doc.text(`Folio ${folio} · emitido el ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 52);
    return 62;
  }
  function cierre(doc, leyenda) {
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      // marca de agua
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.setFont('helvetica', 'bold'); doc.setFontSize(64); doc.setTextColor(...TINTA);
      const w = doc.getTextWidth('DEMOSTRACIÓN'), r = 35 * Math.PI / 180; // centrada en la hoja
      doc.text('DEMOSTRACIÓN', 108 - w / 2 * Math.cos(r), 150 + w / 2 * Math.sin(r), { angle: 35 });
      doc.restoreGraphicsState();
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRIS);
      doc.text(leyenda, 20, 268);
      doc.text(`Página ${i} de ${n}`, 196, 268, { align: 'right' });
    }
  }
  // convierte el HTML de la plantilla del trámite en párrafos de texto para el PDF
  function parrafos(html) {
    const box = document.createElement('div');
    box.innerHTML = html;
    const out = [];
    box.querySelectorAll('p, li').forEach((el) => {
      const centrado = el.classList.contains('text-center');
      const txt = el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
      const tmp = document.createElement('textarea'); tmp.innerHTML = txt;
      out.push({ txt: (el.tagName === 'LI' ? '•  ' : '') + tmp.value.trim(), centrado, li: el.tagName === 'LI' });
    });
    return out;
  }
  function escribir(doc, y, items) {
    items.forEach(({ txt, centrado, li }) => {
      doc.setFont('helvetica', centrado ? 'bold' : 'normal'); doc.setFontSize(10.5); doc.setTextColor(...TINTA);
      const lines = doc.splitTextToSize(txt, li ? 168 : 176);
      lines.forEach((ln) => {
        if (y > 255) { doc.addPage(); y = 24; }
        doc.text(ln, centrado ? 108 : li ? 28 : 20, y, centrado ? { align: 'center' } : undefined);
        y += 5.2;
      });
      y += 2.6;
    });
    return y;
  }
  const datosDe = (s) => Object.assign({ razon: s.cliente, rut: s.rut, rep: s.contacto, run: s.run, email: s.email, fono: s.fono, sucursal: s.sucursal, duracion: '12 meses' }, s.datos || {});

  window.EO_PDF = {
    // borrador del documento o versión final (con constancia de firma simulada)
    async documento(s, t, final) {
      const doc = nuevo(), lg = await logo();
      let y = encabezado(doc, lg, (final ? 'Documento final · ' : 'Borrador · ') + t.titulo, s.folio);
      y = escribir(doc, y, parrafos(EO_FORMS.render(t.form, datosDe(s), t)));
      if (final) {
        if (y > 225) { doc.addPage(); y = 24; }
        y += 4;
        doc.setDrawColor(...VERDE); doc.setFillColor(240, 250, 244); doc.roundedRect(20, y, 176, 26, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...VERDE);
        doc.text('Firmado con firma electrónica avanzada (simulada)', 26, y + 8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...TINTA);
        doc.text([`Firmante: ${s.contacto || s.cliente} · RUN ${s.run || '—'}`, `Código de verificación: ${s.folio.replace(/\D/g, '').slice(-6)}-${(s.rut || '').replace(/\D/g, '').slice(0, 4)} · Ley 19.799`], 26, y + 15);
      }
      cierre(doc, final ? 'Documento final de demostración generado por el portal Easy Office. Sin validez legal.' : 'Borrador generado automáticamente. Un ejecutivo lo revisa antes de enviarlo a firma. Sin validez legal.');
      doc.save(`${s.folio}_${final ? 'documento-final' : 'borrador'}.pdf`);
    },
    // comprobante con el detalle de los pagos registrados
    async comprobante(s, t) {
      const doc = nuevo(), lg = await logo();
      let y = encabezado(doc, lg, 'Comprobante de pago', s.folio);
      const total = s.total || t.precio;
      const filas = [['Trámite', t.titulo], ['Cliente', `${s.cliente} · RUT ${s.rut}`], ['Modalidad', `${s.modalidad}% ${s.modalidad === 50 ? 'abono' : 'completo'}`], ['Costo total', EO.clp(total)], ['Pagado', EO.clp(s.pagado)], ['Saldo', EO.clp(Math.max(0, total - s.pagado))]];
      doc.setFontSize(10);
      filas.forEach(([k, v]) => { doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRIS); doc.text(k, 20, y); doc.setTextColor(...TINTA); doc.text(String(v), 70, y); y += 7; });
      y += 4; doc.setFont('helvetica', 'bold'); doc.setTextColor(...TINTA); doc.text('Pagos registrados', 20, y); y += 7;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      (s.pagos || [{ monto: s.pagado, metodo: s.metodo, estado: 'confirmado', fecha: s.fecha }]).filter((p) => p.estado === 'confirmado').forEach((p) => {
        doc.text(`${p.fecha} · ${EO.detallePago(p)}`, 20, y);
        doc.text(EO.clp(p.monto), 196, y, { align: 'right' }); y += 6;
      });
      cierre(doc, 'Comprobante de demostración generado por el portal Easy Office. No es una boleta ni una factura.');
      doc.save(`${s.folio}_comprobante.pdf`);
    },
  };
})();
