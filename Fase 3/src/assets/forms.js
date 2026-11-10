/* Formularios dinámicos por trámite (RF-02.1) y plantillas de borrador (vista previa en vivo) */
(function () {
  const regiones = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'];
  const civil = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Conviviente civil'];
  // campo: [clave, etiqueta, tipo, opciones/placeholder, requerido, ancho completo]
  const F = (k, l, t = 'text', o = '', r = true, full = false) => ({ k, l, t, o, r, full });
  // campo opcional de texto, con ayuda opcional bajo el campo
  const O = (k, l, o = '', h = '') => Object.assign(F(k, l, 'text', o, false), { h });

  const schemas = {
    sociedad: [
      { titulo: 'Datos de la sociedad', desc: 'Información que aparecerá en el trámite ante el SII.', icono: 'building-2', campos: [F('razon', 'Nombre o razón social', 'text', 'Ej: Servicios Digitales Cordillera SpA', true, true), F('rut', 'RUT de la sociedad', 'rut', '77.845.320-7'), F('giro', 'Giro comercial principal', 'text', 'Actividad que generará mayores ingresos')] },
      { titulo: 'Dirección tributaria', desc: 'Domicilio que registrarás ante el Servicio de Impuestos Internos.', icono: 'map-pin', campos: [F('calle', 'Calle y número', 'text', 'Av. Providencia 1234, of. 605'), F('comuna', 'Comuna', 'text', 'Providencia'), F('region', 'Región', 'select', regiones)] },
      { titulo: 'Representante legal', desc: 'Persona autorizada para firmar y recibir comunicaciones.', icono: 'user-round', campos: [F('rep', 'Nombre completo', 'text', ''), F('run', 'RUN', 'rut', ''), F('email', 'Correo electrónico', 'email', 'nombre@empresa.cl'), F('fono', 'Teléfono móvil', 'phone', '+56 9 1234 5678')] },
      { socios: true, titulo: 'Socios de la sociedad', desc: 'Agrega a todas las personas con participación. La suma debe ser 100%.', icono: 'users' },
    ],
    domicilio: [
      { titulo: 'Sucursal y plan', desc: 'Elige dónde quedará registrado tu domicilio tributario.', icono: 'map-pinned', campos: [F('sucursal', 'Sucursal', 'sucursal', '', true, true), F('duracion', 'Duración del contrato', 'select', ['12 meses', '6 meses', '4 meses', '3 meses']), F('inicio', 'Fecha de inicio', 'date', '')] },
      { extras: true, titulo: 'Servicios adicionales', desc: 'Opcional. Se suman al total del contrato.', icono: 'plus-circle' },
      { titulo: 'Datos de la empresa', desc: 'Empresa que usará el domicilio.', icono: 'building-2', campos: [F('razon', 'Razón social', 'text', 'Ej: Promar Servicios SpA', true, true), F('rut', 'RUT de la empresa', 'rut', '78.420.871-0'), F('giro', 'Giro principal', 'text', 'Servicios')] },
      { titulo: 'Representante legal', desc: 'Firmará el contrato de servicios con firma electrónica avanzada.', icono: 'user-round', campos: [F('rep', 'Nombre completo', 'text', ''), F('run', 'RUN', 'rut', ''), F('dom', 'Domicilio particular', 'text', 'Calle y número'), F('comuna', 'Comuna', 'text', ''), F('region', 'Región', 'select', regiones), F('email', 'Correo electrónico', 'email', ''), F('fono', 'Celular', 'phone', '+56 9 1234 5678')] },
    ],
    vehiculo: [
      { titulo: 'Contrato', desc: 'Lugar y fecha de suscripción.', icono: 'file-text', campos: [F('comuna_c', 'Comuna de suscripción', 'text', 'La Florida'), F('fecha', 'Fecha del contrato', 'date', '')] },
      { titulo: 'Arrendador', desc: 'Propietario del vehículo.', icono: 'user-round', campos: [F('arr_nombre', 'Nombre del propietario', 'text', ''), F('arr_rut', 'RUT del propietario', 'rut', '12.345.678-5'), F('arr_dom', 'Domicilio del propietario', 'text', '', true, true)] },
      { titulo: 'Arrendataria', desc: 'Empresa que arrienda el vehículo.', icono: 'building-2', campos: [F('razon', 'Razón social de la empresa', 'text', ''), F('rut', 'RUT empresa', 'rut', ''), F('rep', 'Representante legal', 'text', ''), F('run', 'RUT representante', 'rut', ''), F('emp_dom', 'Domicilio de la empresa', 'text', '', true, true)] },
      { titulo: 'Vehículo', desc: 'Datos según el padrón.', icono: 'car', campos: [F('marca', 'Marca', 'text', 'Kia'), F('modelo', 'Modelo', 'text', 'Sportage'), F('anio', 'Año', 'number', '2022'), F('patente', 'Patente', 'text', 'AB-CD-12'), F('color', 'Color', 'text', 'Blanco'), F('vin', 'VIN / Chasis', 'text', '')] },
      { titulo: 'Renta y plazo', desc: 'Condiciones económicas del arriendo.', icono: 'calendar-range', campos: [F('plazo', 'Plazo (meses)', 'number', '6'), F('f_ini', 'Fecha de inicio', 'date', ''), F('f_fin', 'Fecha de término', 'date', ''), F('renta', 'Renta mensual ($)', 'money', '500.000'), F('dia_pago', 'Pago dentro de los primeros (días)', 'number', '5'), F('medio', 'Medio de pago', 'select', ['Transferencia bancaria', 'Depósito', 'Efectivo'])] },
    ],
    estacionamiento: [
      { titulo: 'Contrato', desc: 'Fecha de suscripción.', icono: 'file-text', campos: [F('fecha', 'Fecha del contrato', 'date', ''), F('comuna_c', 'Comuna', 'text', 'Santiago')] },
      { titulo: 'Arrendador', desc: 'Dueño del estacionamiento.', icono: 'user-round', campos: [F('arr_nombre', 'Nombre completo', 'text', ''), F('arr_civil', 'Estado civil', 'select', civil), F('arr_rut', 'RUN', 'rut', ''), F('arr_dom', 'Domicilio', 'text', '')] },
      { titulo: 'Arrendatario', desc: 'Quien arrienda el estacionamiento.', icono: 'user-round-check', campos: [F('rep', 'Nombre completo', 'text', ''), F('civil', 'Estado civil', 'select', civil), F('run', 'RUN', 'rut', ''), F('dom', 'Domicilio', 'text', '')] },
      { titulo: 'Inmueble', desc: 'Ubicación del estacionamiento. Si es una parcela o el espacio no está numerado, deja en blanco los campos opcionales.', icono: 'square-parking', campos: [F('direccion', 'Dirección del inmueble', 'text', 'Calle y número, o nombre de la parcela', true, true), F('comuna', 'Comuna', 'text', ''), O('depto', 'Departamento, casa o parcela N°', 'Ej: 1203 o Parcela 14'), O('est_n', 'Estacionamiento N°', 'Ej: E-45', 'Déjalo en blanco si no está numerado.'), O('piso', 'Piso / nivel', 'Ej: -2')] },
      { titulo: 'Renta y vigencia', desc: 'Condiciones del arriendo.', icono: 'calendar-range', campos: [F('renta', 'Renta mensual ($)', 'money', '60.000'), F('vigencia', 'Vigencia (meses)', 'number', '12'), F('f_ini', 'Desde el día', 'date', ''), F('garantia', 'Garantía ($)', 'money', '60.000')] },
    ],
    accionistas: [
      { titulo: 'Sociedad', desc: 'SpA cuyo estatuto se modificará.', icono: 'building-2', campos: [F('razon', 'Razón social actual', 'text', 'Gestión Integral SpA', true, true), F('rut', 'RUT de la sociedad', 'rut', ''), F('acciones', 'N° total de acciones', 'number', '10000')] },
      { titulo: 'Accionista que suscribe', desc: 'Datos de quien firma el acuerdo.', icono: 'user-round', campos: [F('rep', 'Nombre completo', 'text', ''), F('run', 'RUN', 'rut', ''), F('civil', 'Estado civil', 'select', civil), F('profesion', 'Profesión u oficio', 'text', 'Comerciante'), F('dom', 'Domicilio', 'text', '', true, true)] },
      { mods: true, titulo: 'Modificaciones del acuerdo', desc: 'Marca los cambios que quieres incorporar al estatuto.', icono: 'list-checks' },
    ],
  };

  const mods = [
    ['m_razon', 'Cambio de razón social', 'Nueva razón social'],
    ['m_fantasia', 'Cambio de nombre de fantasía', 'Nuevo nombre de fantasía'],
    ['m_rep', 'Cambio de representante legal', 'Nombre del nuevo representante'],
    ['m_elim', 'Eliminar a un accionista', 'Nombre del accionista que sale'],
    ['m_capital', 'Ajustar el capital', 'Nuevo capital ($)'],
  ];
  const extras = [['x_bodega', 'Bodega virtual', 59990, 'anual'], ['x_mail', 'Web mail + dominio', 14990, 'anual']];

  /* ---------- Plantillas ---------- */
  const hoy = () => new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  const fdate = (s) => s ? new Date(s + 'T12:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  function mk(v, labels) {
    return (k, fmt) => {
      let val = v[k];
      if (val && fmt === 'date') val = fdate(val);
      if (val && fmt === 'up') val = String(val).toUpperCase();
      return val ? `<span class="fill">${EO.esc(val)}</span>` : `<span class="empty">[${labels[k] || k}]</span>`;
    };
  }

  const templates = {
    domicilio(f, v, t) {
      const s = EO_DATA.sucursales.find((x) => x.id === v.sucursal) || EO_DATA.sucursales[0];
      const rows = [[t.titulo.includes('Bodega') ? 'DOMICILIO TRIBUTARIO (BODEGA)' : 'DOMICILIO TRIBUTARIO', t.precio, 'ANUAL'], ...extras.filter(([k]) => v[k]).map(([, n, p]) => [n.toUpperCase(), p, 'ANUAL'])];
      return `<p class="text-center font-bold">CONTRATO DE SERVICIOS EASY OFFICE Nro. ${s.id}-<span class="empty">[folio]</span>-2026</p>
      <p>En Santiago, a ${hoy()}, entre <b>EASY OFFICE SpA</b>, rol único tributario número 76.767.272-1, representada por don Marco Antonio Escobar Donoso, en adelante «EASY OFFICE», y ${f('razon', 'up')}, RUT ${f('rut')}, representada por ${f('rep', 'up')}, cédula de identidad número ${f('run')}, domiciliado en ${f('dom', 'up')}, comuna de ${f('comuna', 'up')}, región ${f('region', 'up')}, en adelante «EL CLIENTE», se ha convenido el siguiente contrato de servicios:</p>
      <p><b>PRIMERO:</b> EASY OFFICE entrega el servicio de DOMICILIO TRIBUTARIO en <span class="fill">${s.direccion.toUpperCase()}</span>, comuna de <span class="fill">${s.comuna.toUpperCase()}</span>, región <span class="fill">${s.region.toUpperCase()}</span>, rol de propiedad ${s.rol}, en las condiciones de este contrato y su Anexo 1.</p>
      <p><b>SEGUNDO:</b> El domicilio solo podrá usarse como ${t.titulo.includes('Bodega') ? 'BODEGA DE ALMACENAJE' : 'oficina administrativa'} para el giro ${f('giro', 'up')}. A EL CLIENTE le está prohibido ceder a cualquier título el presente contrato.</p>
      <p><b>TERCERO:</b> El precio de cada servicio y su ciclo de pago será:</p>
      <table class="w-full text-xs border border-slate-300 my-2"><tr class="bg-slate-50"><th class="text-left p-1.5">SERVICIO</th><th class="text-left p-1.5">PRECIO</th><th class="text-left p-1.5">CICLO</th></tr>
      ${rows.map(([n, p, c]) => `<tr class="border-t border-slate-200"><td class="p-1.5">${n}</td><td class="p-1.5">${EO.clp(p)}</td><td class="p-1.5">${c}</td></tr>`).join('')}</table>
      <p><b>CUARTO:</b> Las partes fijan como medios válidos de notificación: ayuda@easyoffice.cl, +56 2 2277 7781, y por EL CLIENTE ${f('email')}, ${f('fono')}.</p>
      <p><b>QUINTO:</b> El presente contrato entrará en vigencia el ${f('inicio', 'date')} por un período de ${f('duracion')}, renovándose automáticamente por igual período salvo aviso escrito.</p>`;
    },
    vehiculo(f) {
      return `<p class="text-center font-bold">CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</p>
      <p>En ${f('comuna_c')}, a ${f('fecha', 'date')}, comparecen: por una parte, don/doña ${f('arr_nombre')}, RUT N.º ${f('arr_rut')}, domiciliado/a en ${f('arr_dom')}, en adelante el «Arrendador»; y por otra parte, ${f('razon')}, RUT N.º ${f('rut')}, representada legalmente por don/doña ${f('rep')}, RUT N.º ${f('run')}, ambos domiciliados en ${f('emp_dom')}, en adelante la «Arrendataria».</p>
      <p><b>PRIMERO: VEHÍCULO.</b> El Arrendador entrega en arrendamiento a la Arrendataria el vehículo marca ${f('marca')}, modelo ${f('modelo')}, año ${f('anio')}, patente ${f('patente', 'up')}, color ${f('color')}, VIN/chasis ${f('vin', 'up')}.</p>
      <p><b>SEGUNDO: DESTINO.</b> El vehículo será utilizado por la Arrendataria para el desarrollo de sus actividades comerciales y administrativas.</p>
      <p><b>TERCERO: PLAZO.</b> El contrato tendrá una duración de ${f('plazo')} meses, comenzando el ${f('f_ini', 'date')} y terminando el ${f('f_fin', 'date')}.</p>
      <p><b>CUARTO: RENTA.</b> La Arrendataria pagará una renta mensual de $${f('renta')} dentro de los primeros ${f('dia_pago')} días de cada mes, mediante ${f('medio')}.</p>
      <p><b>QUINTO: GASTOS.</b> Serán de cargo de la Arrendataria los gastos asociados al uso del vehículo, tales como combustible, peajes, TAG y mantenciones ordinarias.</p>
      <p><b>DÉCIMO: FIRMA.</b> En señal de aceptación, las partes firman el presente contrato mediante firma electrónica avanzada.</p>`;
    },
    estacionamiento(f, v) {
      return `<p class="text-center font-bold">CONTRATO DE ARRIENDO DE ESTACIONAMIENTO</p>
      <p>Con fecha ${f('fecha', 'date')}, comparecen: por una parte, ${f('arr_nombre')}, ${f('arr_civil')}, cédula nacional de identidad número ${f('arr_rut')}, domiciliado(a) en ${f('arr_dom')}, en adelante «el arrendador(a)»; y por la otra, ${f('rep')}, ${f('civil')}, cédula nacional de identidad número ${f('run')}, domiciliado(a) en ${f('dom')}, en adelante «el arrendatario(a)».</p>
      <p><b>PRIMERO.</b> El arrendador(a) es dueño del inmueble ubicado en ${f('direccion')}${v.depto ? `, unidad ${f('depto')}` : ''}, comuna de ${f('comuna')}.</p>
      <p><b>SEGUNDO.</b> Por el presente instrumento, el arrendador(a) da en arriendo ${v.est_n ? `el estacionamiento número ${f('est_n')}` : 'un espacio de estacionamiento'}${v.piso ? `, piso o nivel ${f('piso')}` : ''}, ubicado en el inmueble indicado${v.est_n ? '' : ', el cual no cuenta con numeración asignada y se individualiza por su ubicación dentro del mismo'}.</p>
      <p><b>CUARTO.</b> La renta de arrendamiento es la cantidad de $${f('renta')}, pagadera dentro de los primeros cinco días de cada mes, en forma anticipada.</p>
      <p><b>SEXTO.</b> El presente contrato tendrá una vigencia de ${f('vigencia')} mes(es), comenzando a regir desde el día ${f('f_ini', 'date')}, renovándose tácitamente por períodos iguales.</p>
      <p><b>DECIMOCTAVO.</b> A fin de garantizar la conservación del estacionamiento, el arrendatario(a) entrega en garantía la suma de $${f('garantia')}.</p>`;
    },
    accionistas(f, v) {
      const items = mods.filter(([k]) => v[k]).map(([k, n], i) => {
        const val = v[k + '_v'] ? `<span class="fill">${EO.esc(v[k + '_v']).toUpperCase()}</span>` : '<span class="empty">[dato]</span>';
        const txt = { m_razon: `Se elimina la razón social antigua de ${f('razon', 'up')} y se agrega la nueva razón social: ${val}.`, m_fantasia: `Se reemplaza el nombre de fantasía por: ${val}.`, m_rep: `Se elimina al actual representante legal y gerente. En su reemplazo asume ${val}.`, m_elim: `Se elimina como accionista a ${val}.`, m_capital: `Se ajusta el capital social a $${val}.` }[k];
        return `<p>${i + 1}.- ${txt}</p>`;
      }).join('') || '<p><span class="empty">[Selecciona al menos una modificación]</span></p>';
      return `<p class="text-center font-bold">ACUERDO DE ACCIONISTAS<br>DE<br>${f('razon', 'up')}</p>
      <p>En SANTIAGO, a ${hoy()}, la sociedad ${f('razon', 'up')}, RUT ${f('rut')}, constituida por ${f('acciones')} acciones, cuyo accionista don/doña ${f('rep', 'up')}, cédula nacional de identidad número ${f('run')}, ${f('civil', 'up')}, ${f('profesion', 'up')}, domiciliado en ${f('dom', 'up')}, acuerda lo siguiente:</p>
      ${items}
      <p>Finalmente, se faculta a EASY OFFICE SpA para que efectúe las modificaciones y suscripciones ante el Registro de Empresas y Sociedades.</p>`;
    },
    sociedad(f, v, t) {
      const socios = (v._socios || []).filter((s) => s.nombre).map((s) => `<li>${EO.esc(s.nombre)}, RUN ${EO.esc(s.run || '—')}, ${EO.esc(s.pct || 0)}%</li>`).join('');
      return `<p class="text-center font-bold">MANDATO Y SOLICITUD DE SERVICIO<br>${t.titulo.toUpperCase()}</p>
      <p>En Santiago, a ${hoy()}, ${f('rep', 'up')}, RUN ${f('run')}, en representación de ${f('razon', 'up')}, RUT ${f('rut')}, con domicilio tributario en ${f('calle')}, comuna de ${f('comuna')}, región ${f('region')}, otorga mandato especial a <b>EASY OFFICE SpA</b>, RUT 76.767.272-1, para que en su nombre gestione ante el Servicio de Impuestos Internos y demás organismos el trámite de <b>${t.titulo}</b>.</p>
      <p><b>Giro declarado:</b> ${f('giro')}.</p>
      ${socios ? `<p><b>Socios y participación:</b></p><ul class="list-disc pl-5">${socios}</ul>` : ''}
      <p>Las notificaciones se enviarán a ${f('email')} y al teléfono ${f('fono')}. El mandante declara que la información entregada es fidedigna y autoriza su tratamiento conforme a la Ley 21.719.</p>
      <p>El presente mandato se suscribe mediante firma electrónica avanzada conforme a la Ley 19.799.</p>`;
    },
  };

  function labels(form) {
    const m = {};
    schemas[form].forEach((s) => (s.campos || []).forEach((c) => (m[c.k] = c.l)));
    return m;
  }

  window.EO_FORMS = {
    schemas, mods, extras, regiones,
    render(form, v, t) { return templates[form](mk(v, labels(form)), v, t); },
    extrasTotal(v) { return extras.filter(([k]) => v[k]).reduce((a, [, , p]) => a + p, 0); },
  };
})();
