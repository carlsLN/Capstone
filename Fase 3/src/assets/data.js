/* Datos de ejemplo del prototipo Easy Office (catálogo, trámites, clientes, usuarios).
   En la versión productiva estos datos vienen de la API / base de datos. */
window.EO_DATA = (function () {
  const categorias = [
    { id: 'domicilio', nombre: 'Domicilio Tributario', icono: 'map-pin', desc: 'Dirección comercial y tributaria autorizada ante el SII y municipalidades, sin arrendar una oficina.' },
    { id: 'constitucion', nombre: 'Constitución de Empresa', icono: 'briefcase', desc: 'Creamos tu empresa desde cero, modificamos estatutos y acompañamos cada firma.' },
    { id: 'documental', nombre: 'Gestión Documental', icono: 'file-signature', desc: 'Contratos, poderes y declaraciones listos para firma electrónica avanzada.' },
    { id: 'contable', nombre: 'Asesoría Contable', icono: 'bar-chart-3', desc: 'Contabilidad mensual, IVA, balances y planificación tributaria.' },
  ];

  const sucursales = [
    { id: 'LF', comuna: 'La Florida', direccion: 'Vicuña Mackenna Poniente #7255, oficina 707', region: 'Metropolitana', rol: '271-147' },
    { id: 'VL', comuna: 'Valparaíso', direccion: 'Blanco N°1215, oficina 405', region: 'Valparaíso', rol: '15-12' },
    { id: 'SA', comuna: 'San Antonio', direccion: 'El Potrerillo N°8, oficina C, Algarrobo', region: 'Valparaíso', rol: '267-56' },
  ];

  const tramites = [
    {
      id: 'domicilio-oficina', categoria: 'domicilio', titulo: 'Domicilio Tributario – Oficina Virtual',
      resumen: 'Una dirección formal para iniciar actividades, recibir correspondencia y emitir facturas.',
      precio: 59990, ciclo: 'anual', plazo: '24 horas', tipo: '100% online', form: 'domicilio', firma: true, popular: true,
      requisitos: [
        ['Rol Único Tributario de la empresa', 'RUT de la sociedad o persona natural que usará el domicilio.'],
        ['Cédula del representante legal', 'Vigente, por ambos lados.'],
        ['Estatuto actualizado', 'Copia del estatuto o escritura (Empresa en un Día o notaría).'],
      ],
      incluye: ['Domicilio tributario, postal y comercial', 'Recepción de correspondencia fiscal', 'Escaneo de 1 página diaria de correspondencia fiscal', 'Uso de 1 hora semanal de estación de trabajo', 'Apoyo en el inicio de actividades'],
      documentos: [['Cédula de identidad del representante', 'Anverso y reverso en un único archivo.'], ['Estatuto actualizado', 'Documento completo con sus modificaciones.']],
    },
    {
      id: 'domicilio-bodega', categoria: 'domicilio', titulo: 'Domicilio Tributario – Bodega Virtual',
      resumen: 'Domicilio tributario habilitado como bodega de almacenaje para tu giro.',
      precio: 59990, ciclo: 'anual', plazo: '24 horas', tipo: '100% online', form: 'domicilio', firma: true,
      requisitos: [['RUT de la empresa', 'Identificador de la sociedad.'], ['Cédula del representante legal', 'Vigente, por ambos lados.']],
      incluye: ['Domicilio tributario con uso de bodega', 'Recepción de correspondencia fiscal', 'Autorización de uso del domicilio ante el SII'],
      documentos: [['Cédula de identidad del representante', 'Anverso y reverso en un único archivo.'], ['Estatuto actualizado', 'Documento completo con sus modificaciones.']],
    },
    {
      id: 'inicio-actividades', categoria: 'domicilio', titulo: 'Iniciación de Actividades y Firma de RUT',
      resumen: 'Formaliza tu negocio ante el SII y comienza a facturar de manera oficial.',
      precio: 45000, ciclo: 'único', plazo: '48 horas', tipo: '100% online', form: 'sociedad', firma: true, popular: true,
      requisitos: [
        ['Estatutos sociales vigentes', 'Copia simple de la escritura de constitución (SpA, Limitada, etc.).'],
        ['Cuenta Easy Office verificada', 'Verificada con código a tu correo y celular; la usamos para la firma de mandatos.'],
        ['Cédula de identidad vigente', 'De los representantes legales y socios activos.'],
        ['Datos de la sociedad', 'Domicilio tributario, razón social y giros autorizados.'],
      ],
      incluye: ['Formulario 4415 completado, validado y enviado ante el SII', 'Certificado oficial de Iniciación de Actividades', 'Firma electrónica del RUT de la empresa', 'Timbraje electrónico de tus primeros documentos'],
      documentos: [['Estatutos de la sociedad vigentes', 'Documento completo, firmado y con todas sus modificaciones.'], ['Cédula de identidad del representante', 'Anverso y reverso en un único archivo; la fotografía debe ser visible.']],
    },
    {
      id: 'creacion-empresa', categoria: 'constitucion', titulo: 'Creación de Empresa en un Día',
      resumen: 'Constituimos tu SpA en el Registro de Empresas y Sociedades, con RUT e inicio de actividades.',
      precio: 49990, ciclo: 'único', plazo: '5 días hábiles', tipo: '100% online', form: 'sociedad', firma: true, popular: true,
      requisitos: [['Correo y celular de cada socio', 'Hasta 3 socios; cada uno recibe el documento para firmar.'], ['Cédula de identidad de los socios', 'Vigente.'], ['Datos de la sociedad', 'Razón social, objeto social y capital.']],
      incluye: ['Constitución de empresa en un día, hasta 3 socios', 'Obtención de RUT', 'Domicilio tributario por 3 meses', 'Inicio de actividades ante el SII', 'Inscripción de factura electrónica', 'Gestión de cuenta emprendedor BancoEstado'],
      documentos: [['Cédula de identidad de los socios', 'Un archivo por socio, anverso y reverso.']],
    },
    {
      id: 'acuerdo-accionistas', categoria: 'constitucion', titulo: 'Acuerdo de Accionistas SpA',
      resumen: 'Modifica razón social, nombre de fantasía, representante legal o accionistas de tu SpA.',
      precio: 15000, ciclo: 'único', plazo: '72 horas', tipo: '100% online', form: 'accionistas', firma: true,
      requisitos: [['Estatuto actualizado', 'Desde el Registro de Empresas y Sociedades.'], ['Datos de los accionistas', 'Nombre, RUN, nacionalidad, estado civil y domicilio.']],
      incluye: ['Redacción del acuerdo según los cambios solicitados', 'Firma electrónica avanzada de los accionistas', 'Ingreso de la modificación en el Registro de Empresas'],
      documentos: [['Estatuto actualizado', 'Documento completo con sus modificaciones.']],
    },
    {
      id: 'termino-giro', categoria: 'constitucion', titulo: 'Término de Giro Comercial',
      resumen: 'Cierra tu empresa ante el SII con acompañamiento de principio a fin.',
      precio: 80000, ciclo: 'único', plazo: '10 días hábiles', tipo: 'Online y remoto', form: 'sociedad', firma: true,
      requisitos: [['Clave SII de la empresa', 'Para revisar la situación tributaria.'], ['Libros contables al día', 'Últimos 3 años.']],
      incluye: ['Revisión de la situación tributaria', 'Presentación del aviso de término de giro', 'Seguimiento hasta el certificado final'],
      documentos: [['Estatuto actualizado', 'Documento completo.']],
    },
    {
      id: 'contrato-vehiculo', categoria: 'documental', titulo: 'Contrato de Arriendo de Vehículo',
      resumen: 'Contrato entre propietario y empresa arrendataria, listo para firma electrónica.',
      precio: 15000, ciclo: 'único', plazo: '24 horas', tipo: '100% online', form: 'vehiculo', firma: true, popular: true,
      requisitos: [['Datos del propietario', 'Nombre, RUT y domicilio.'], ['Datos de la empresa arrendataria', 'Razón social, RUT y representante.'], ['Padrón del vehículo', 'Marca, modelo, año, patente y VIN.']],
      incluye: ['Borrador generado con tus datos en minutos', 'Revisión por un ejecutivo', 'Firma electrónica avanzada de ambas partes'],
      documentos: [['Padrón o certificado de inscripción del vehículo', 'PDF o imagen legible.']],
    },
    {
      id: 'contrato-estacionamiento', categoria: 'documental', titulo: 'Contrato de Arriendo de Estacionamiento',
      resumen: 'Arrienda un estacionamiento con un contrato claro y firmado en línea.',
      precio: 15000, ciclo: 'único', plazo: '24 horas', tipo: '100% online', form: 'estacionamiento', firma: true,
      requisitos: [['Datos del arrendador y arrendatario', 'Nombre, RUN, estado civil y domicilio.'], ['Datos del inmueble', 'Número de estacionamiento, piso y dirección.']],
      incluye: ['Borrador generado con tus datos', 'Revisión por un ejecutivo', 'Firma electrónica avanzada de ambas partes'],
      documentos: [['Certificado de dominio vigente', 'Del inmueble donde se ubica el estacionamiento.']],
    },
    {
      id: 'poder-simple', categoria: 'documental', titulo: 'Poder Simple ante el SII',
      resumen: 'Autoriza a un tercero para actuar en representación de tu empresa ante el SII.',
      precio: 15000, ciclo: 'único', plazo: '24 horas', tipo: '100% online', form: 'sociedad', firma: true,
      requisitos: [['Datos de la empresa', 'Razón social y RUT.'], ['Datos del representante', 'Nombre y RUN de quien actuará.']],
      incluye: ['Redacción del poder con formato estándar', 'Firma electrónica avanzada'],
      documentos: [['Cédula de identidad del otorgante', 'Anverso y reverso.']],
    },
    {
      id: 'firma-fea', categoria: 'documental', titulo: 'Firma Electrónica Avanzada Anual',
      resumen: 'Tu certificado de firma electrónica avanzada para firmar documentos con validez legal.',
      precio: 12900, ciclo: 'anual', plazo: '15 minutos', tipo: '100% online', form: 'sociedad', firma: false,
      requisitos: [['Validación biométrica', 'Desde tu celular.'], ['Cédula de identidad vigente', 'Chilena.']],
      incluye: ['Certificado FEA por 12 meses', 'Validez legal bajo la Ley 19.799', 'Soporte en la instalación'],
      documentos: [['Cédula de identidad', 'Anverso y reverso.']],
    },
    {
      id: 'contabilidad-mensual', categoria: 'contable', titulo: 'Contabilidad Mensual Pyme',
      resumen: 'Llevamos tu contabilidad, declaramos el IVA (F29) y te preparamos el balance anual.',
      precio: 49990, ciclo: 'mensual', plazo: 'Mensual', tipo: 'Online y remoto', form: 'sociedad', firma: true,
      requisitos: [['Clave SII de la empresa', 'Para declarar en tu nombre.'], ['Documentos tributarios del mes', 'Facturas de compra y venta.']],
      incluye: ['Declaración mensual de IVA (F29)', 'Liquidación de sueldos hasta 3 trabajadores', 'Balance financiero anual', 'Ejecutivo contable asignado'],
      documentos: [['Carpeta tributaria', 'Descargada desde el SII.']],
    },
    {
      id: 'rebaja-tributaria', categoria: 'contable', titulo: 'Planificación y Rebaja Tributaria',
      resumen: 'Evaluamos oportunidades para optimizar legalmente tu carga tributaria.',
      precio: 35000, ciclo: 'único', plazo: '5 días hábiles', tipo: 'Online y remoto', form: 'sociedad', firma: false,
      requisitos: [['Carpeta tributaria', 'Últimos 12 meses.']],
      incluye: ['Diagnóstico tributario', 'Informe con recomendaciones', 'Reunión de 30 minutos con un asesor'],
      documentos: [['Carpeta tributaria', 'Descargada desde el SII.']],
    },
  ];

  // Estados operativos del CRM (RF-05.2)
  const estados = [
    { id: 'ingresado', nombre: 'Ingresado', color: 'gray' },
    { id: 'validacion', nombre: 'En validación SII', color: 'blue' },
    { id: 'notaria', nombre: 'En notaría', color: 'amber' },
    { id: 'firma', nombre: 'Esperando firma', color: 'amber' },
    { id: 'completado', nombre: 'Completado', color: 'green' },
  ];

  const equipo = [
    { id: 'u1', nombre: 'Marcela Rojas', iniciales: 'MR', rol: 'Administrador', email: 'mrojas@easyoffice.cl', estado: 'Activo', ultimo: 'Hace 5 min' },
    { id: 'u2', nombre: 'Diego Fuentes', iniciales: 'DF', rol: 'Ejecutivo', email: 'dfuentes@easyoffice.cl', estado: 'Activo', ultimo: 'Hace 12 min' },
    { id: 'u3', nombre: 'Valentina Soto', iniciales: 'VS', rol: 'Ejecutivo', email: 'vsoto@easyoffice.cl', estado: 'Activo', ultimo: 'Hace 1 h' },
    { id: 'u4', nombre: 'Andrés Pizarro', iniciales: 'AP', rol: 'Finanzas', email: 'apizarro@easyoffice.cl', estado: 'Activo', ultimo: 'Hace 3 h' },
    { id: 'u5', nombre: 'Carolina Vega', iniciales: 'CV', rol: 'Freelance', email: 'cvega.gestora@gmail.com', estado: 'Activo', ultimo: 'Ayer' },
    { id: 'u6', nombre: 'Felipe Araya', iniciales: 'FA', rol: 'Freelance', email: 'faraya.docs@gmail.com', estado: 'Suspendido', ultimo: 'Hace 12 días' },
  ];

  const roles = {
    Administrador: { desc: 'Configura catálogo, usuarios y permisos. Acceso total y auditoría.', permisos: ['ver_tramites', 'editar_tramites', 'ver_datos_cliente', 'descargar_docs', 'exportar', 'ver_pagos', 'conciliar', 'usuarios', 'auditoria', 'catalogo'] },
    Ejecutivo: { desc: 'Gestiona tickets, valida documentos y cambia estados.', permisos: ['ver_tramites', 'editar_tramites', 'ver_datos_cliente', 'descargar_docs', 'ver_pagos'] },
    Finanzas: { desc: 'Revisa pagos, conciliaciones y facturación.', permisos: ['ver_tramites', 'ver_pagos', 'conciliar', 'exportar'] },
    Freelance: { desc: 'Solo ve los tickets asignados, con datos sensibles enmascarados.', permisos: ['ver_tramites', 'editar_tramites'] },
  };

  const permisos = [
    ['ver_tramites', 'Ver trámites'], ['editar_tramites', 'Cambiar estado de trámites'], ['ver_datos_cliente', 'Ver datos completos del cliente'],
    ['descargar_docs', 'Descargar documentos'], ['exportar', 'Exportar bases de datos'], ['ver_pagos', 'Ver pagos'],
    ['conciliar', 'Conciliar pagos manualmente'], ['usuarios', 'Gestionar usuarios y roles'], ['auditoria', 'Ver registro de auditoría'], ['catalogo', 'Editar catálogo y tarifas'],
  ];

  // Trámites/tickets de ejemplo (alimentan CRM y "Mis trámites" del cliente demo)
  const solicitudes = [
    { folio: 'EO-2026-000482', tramite: 'inicio-actividades', cliente: 'Servicios Digitales Cordillera SpA', rut: '77.845.320-7', contacto: 'Camila Muñoz Silva', run: '15.842.931-4', email: 'camila.munoz@cordillera.cl', fono: '+56 9 6328 1142', sucursal: 'LF', estado: 'firma', modalidad: 50, pagado: 22500, metodo: 'Tarjeta', asignado: 'u2', fecha: '2026-10-22', prioridad: 'Alta', propio: true, titularRun: '15.842.931-4',
      datos: { calle: 'Av. Providencia 1234, oficina 605', comuna: 'Providencia', region: 'Metropolitana', giro: 'Servicios de consultoría en tecnologías de la información' },
      docs: [{ nombre: 'Estatutos de la sociedad vigentes', archivo: 'Estatutos_Cordillera_SpA.pdf', st: 'cargado' }, { nombre: 'Cédula de identidad del representante', archivo: 'Cedula_Camila_Munoz.pdf', st: 'cargado' }] },
    { folio: 'EO-2026-000481', tramite: 'contrato-vehiculo', cliente: 'Altus & Company SpA', rut: '78.112.540-7', contacto: 'Rodrigo Altamirano', run: '16.204.118-5', email: 'contacto@altusandcompany.cl', fono: '+56 9 3236 5169', sucursal: 'LF', estado: 'ingresado', modalidad: 100, pagado: 15000, metodo: 'Tarjeta', asignado: null, fecha: '2026-10-25', prioridad: 'Media', propio: true, titularRun: '15.842.931-4' },
    { folio: 'EO-2026-000479', tramite: 'domicilio-oficina', cliente: 'Promar Servicios SpA', rut: '78.420.871-0', contacto: 'Miguel Baeza Maulén', run: '10.970.598-5', email: 'mfbaezamaule@gmail.com', fono: '+56 9 8252 7023', sucursal: 'LF', estado: 'completado', modalidad: 100, pagado: 59990, metodo: 'Tarjeta', asignado: 'u3', fecha: '2026-10-12', prioridad: 'Media', propio: true, titularRun: '15.842.931-4' },
    { folio: 'EO-2026-000478', tramite: 'creacion-empresa', cliente: 'Panadería Los Andes SpA', rut: '78.501.233-K', contacto: 'Josefa Carrasco', run: '18.330.721-5', email: 'josefa@losandes.cl', fono: '+56 9 7711 2044', sucursal: 'VL', estado: 'validacion', modalidad: 50, pagado: 24995, metodo: 'Tarjeta', asignado: 'u2', fecha: '2026-10-21', prioridad: 'Alta' },
    { folio: 'EO-2026-000477', tramite: 'acuerdo-accionistas', cliente: 'Sandy y CH SpA', rut: '77.993.402-0', contacto: 'Ricardo Bravo Henríquez', run: '11.135.415-4', email: 'rbravo@sandych.cl', fono: '+56 9 5521 8840', sucursal: 'LF', estado: 'notaria', modalidad: 100, pagado: 15000, metodo: 'Transferencia', asignado: 'u5', fecha: '2026-10-20', prioridad: 'Media' },
    { folio: 'EO-2026-000476', tramite: 'domicilio-bodega', cliente: 'Airon Soldiering Ltda.', rut: '76.884.120-9', contacto: 'Luis Morales', run: '14.552.019-3', email: 'aironsoldiering@gmail.com', fono: '+56 9 5748 2381', sucursal: 'LF', estado: 'firma', modalidad: 100, pagado: 59990, metodo: 'Transferencia', asignado: 'u3', fecha: '2026-10-19', prioridad: 'Baja' },
    { folio: 'EO-2026-000475', tramite: 'contabilidad-mensual', cliente: 'Kinesis Salud SpA', rut: '77.210.665-3', contacto: 'Tamara Ibáñez', run: '17.009.443-3', email: 'tamara@kinesis.cl', fono: '+56 9 4410 9087', sucursal: 'VL', estado: 'validacion', modalidad: 100, pagado: 49990, metodo: 'Tarjeta', asignado: 'u3', fecha: '2026-10-18', prioridad: 'Media' },
    { folio: 'EO-2026-000474', tramite: 'contrato-estacionamiento', cliente: 'Inversiones Pacífico Ltda.', rut: '76.330.118-4', contacto: 'Gonzalo Reyes', run: '12.874.330-8', email: 'greyes@pacifico.cl', fono: '+56 9 6602 3318', sucursal: 'SA', estado: 'ingresado', modalidad: 50, pagado: 0, metodo: 'Transferencia', asignado: null, fecha: '2026-10-25', prioridad: 'Media' },
    { folio: 'EO-2026-000473', tramite: 'termino-giro', cliente: 'Comercial Ñuble SpA', rut: '77.552.890-7', contacto: 'Patricio Leiva', run: '9.884.201-2', email: 'pleiva@nuble.cl', fono: '+56 9 9012 4471', sucursal: 'VL', estado: 'notaria', modalidad: 50, pagado: 40000, metodo: 'Tarjeta', asignado: 'u2', fecha: '2026-10-14', prioridad: 'Baja' },
    { folio: 'EO-2026-000472', tramite: 'poder-simple', cliente: 'Estudio Norte SpA', rut: '77.640.218-4', contacto: 'Daniela Pérez', run: '19.221.640-0', email: 'dperez@estudionorte.cl', fono: '+56 9 7340 1189', sucursal: 'LF', estado: 'completado', modalidad: 100, pagado: 15000, metodo: 'Tarjeta', asignado: 'u5', fecha: '2026-10-10', prioridad: 'Baja' },
    { folio: 'EO-2026-000471', tramite: 'inicio-actividades', cliente: 'Verde Brote SpA', rut: '78.005.312-7', contacto: 'Martín González', run: '20.118.554-8', email: 'martin@verdebrote.cl', fono: '+56 9 5003 7712', sucursal: 'LF', estado: 'validacion', modalidad: 50, pagado: 22500, metodo: 'Tarjeta', asignado: 'u5', fecha: '2026-10-17', prioridad: 'Alta' },
  ];

  const auditoria = [
    ['2026-10-26 08:42:11', 'u2', 'Cambio de estado', 'EO-2026-000482', 'En notaría → Esperando firma', '186.10.24.3'],
    ['2026-10-26 08:39:02', 'u2', 'Descarga de documento', 'EO-2026-000482', 'Estatutos_Cordillera_SpA.pdf', '186.10.24.3'],
    ['2026-10-26 08:15:47', 'sys', 'Pago conciliado', 'EO-2026-000481', 'Webpay · tarjeta de crédito •••• 4421 · aut. 482913 · $15.000', 'webpay'],
    ['2026-10-26 08:15:45', 'sys', 'Ticket creado', 'EO-2026-000481', 'Origen: portal transaccional', 'webhook'],
    ['2026-10-25 19:03:20', 'u5', 'Lectura de datos del cliente', 'EO-2026-000477', 'Vista ficha (datos enmascarados)', '190.161.4.77'],
    ['2026-10-25 17:48:09', 'u4', 'Conciliación manual', 'EO-2026-000476', 'Transferencia BancoEstado · $59.990', '186.10.24.9'],
    ['2026-10-25 16:30:55', 'u1', 'Cambio de permisos', '—', 'Rol Freelance: quitado "Descargar documentos"', '186.10.24.1'],
    ['2026-10-25 12:11:31', 'u3', 'Solicitud de subsanación', 'EO-2026-000475', 'Carpeta tributaria ilegible', '186.10.24.5'],
    ['2026-10-25 11:02:14', 'u6', 'Intento de exportación bloqueado', '—', 'Permiso "exportar" denegado', '201.214.3.80'],
    ['2026-10-25 09:20:00', 'u1', 'Usuario suspendido', '—', 'Felipe Araya (Freelance)', '186.10.24.1'],
  ];

  // Cuenta para transferencias: DATOS DE EJEMPLO hasta tener los reales de Easy Office
  const banco = { titular: 'Easy Office SpA', rut: '76.543.210-3', banco: 'Banco de Chile', tipo: 'Cuenta Corriente', numero: '00-123-45678-09', correo: 'pagos@easyoffice.cl', ejemplo: true };
  const bancos = ['BancoEstado', 'Banco de Chile', 'Santander', 'BCI', 'Scotiabank', 'Itaú', 'Banco Falabella', 'Banco Security', 'Banco Ripley', 'Mercado Pago (cuenta)'];

  return { categorias, sucursales, tramites, estados, equipo, roles, permisos, solicitudes, auditoria, banco, bancos, clientes: [] };
})();
