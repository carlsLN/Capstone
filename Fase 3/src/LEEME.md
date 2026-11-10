# Easy Office: portal transaccional y CRM (prototipo)

Prototipo navegable del MVP. Abre `index.html` para ver el mapa de páginas y el recorrido sugerido para la demo.

## Cómo abrirlo
- Haz doble clic en `index.html`. Funciona sin internet: los estilos, la tipografía y los íconos vienen en `assets/`.
- Las páginas están conectadas a Firebase (proyecto `easy-office-97ace`): todo lo que se hace (trámites nuevos, estados, notas, firmas, pagos, usuarios, permisos y auditoría) se guarda en Firestore y lo ve cualquier persona que abra las páginas. Se necesita internet; sin conexión las páginas muestran la última copia guardada y suben los cambios al volver la conexión. El botón «Borrar datos locales» del mapa solo limpia la copia del navegador.
- Integraciones simuladas (modo Sandbox): ClaveÚnica, Webpay/Khipu, firma electrónica avanzada y notificaciones. Código de firma para la demo: cualquier número de 6 dígitos (por ejemplo, 123456).

## Estructura
```
index.html            Mapa del prototipo
portal/               Sitio del cliente
  index.html          Inicio
  catalogo.html       Catálogo con buscador y filtros
  tramite.html        Detalle del trámite (?id=...)
  ingresar.html       Ingreso con ClaveÚnica, correo o registro
  contratar.html      Contratación en 5 pasos (?id=...&modo=50|100)
  mis-tramites.html   Listado privado del cliente
  estado.html         Estado, firma FEA, pago de saldo y descargas (?folio=...)
crm/                  Sistema interno
  login.html          Ingreso del equipo con segundo factor
  tablero.html        Kanban y lista de tickets
  ticket.html         Ficha del trámite (?folio=...)
  clientes.html       Base de clientes
  pagos.html          Pagos y conciliación
  usuarios.html       Usuarios y matriz de permisos
  auditoria.html      Registro de auditoría
assets/
  eo.css              Estilos compilados (Tailwind)
  eo.js               Componentes compartidos (header, footer, stepper, roles, auditoría)
  data.js             Catálogo, sucursales, trámites, equipo y roles de ejemplo
  xlsx.js             Exportación a Excel (.xlsx) con formato
  forms.js            Formularios por trámite y plantillas de los borradores
```

## Acuerdos con Easy Office (29 y 30 oct 2026)
- Sin ClaveÚnica. Registro propio en 2 pasos: (1) datos personales (nombre, RUN, N° de documento, fecha de nacimiento, correo y celular) y (2) verificación con un código al correo y otro al celular, contraseña y captcha. No se pide foto de la cédula al registrarse y no hay revisión de un ejecutivo: la cuenta queda verificada al confirmar ambos códigos. Las cuentas se crean en Firebase Authentication y el perfil en la colección `clientes`.
- Inicio de sesión: contraseña, captcha y luego un código de 6 dígitos al correo o por SMS (el cliente elige). Tras 5 intentos fallidos se bloquea el ingreso con ese correo por 15 minutos, avisando cuántos intentos quedan. Cuenta de prueba: camila.munoz@cordillera.cl / demo1234.
- En la demo los códigos se muestran en pantalla y el captcha es simulado. En producción: envío de correo/SMS desde el servidor (Cloud Functions) y Cloudflare Turnstile o reCAPTCHA.
- Pagos: tarjeta de débito o crédito con una pasarela tipo Webpay (simulada, `EO.webpay` en `assets/eo.js`), o transferencia manual con los datos bancarios (DE EJEMPLO, en `assets/data.js` → `banco`) y comprobante, que Finanzas valida o rechaza en Pagos. La transferencia tiene 2% de descuento (`EO.DESC_TRANSF`): cada pago guarda lo transferido (`monto`) y el descuento (`descuento`), y al trámite se le abona la suma. Fintoc se eliminó (cobra comisión).
- Exportaciones del CRM (Auditoría y Clientes) en Excel .xlsx ya ordenado: título, encabezado destacado, columnas ajustadas, filtros y encabezado inmovilizado (`assets/xlsx.js`, sin librerías externas).
- Estacionamiento: N° de estacionamiento, piso y unidad son opcionales; el contrato se adapta.
- PDF: el estado del trámite descarga el borrador, el comprobante y, al completar, el documento final (`assets/pdf.js`, con marca de agua de demostración).
- Pendiente: foto de la cédula por ambos lados solo en los trámites de mayor riesgo (la empresa validará la evaluación de riesgo); prefijos de folio por sucursal y datos bancarios reales (la empresa enviará los documentos).

## Firebase
- `assets/nube.js` conecta con Firestore y Firebase Authentication (API REST, sin instalar nada). Se carga en todas las páginas después de `data.js`.
- Colecciones: `tramites` (catálogo, compartido con el `index.html` original: los campos `titulo`, `categoria`, `plazo`, `requisitos`, `tipo`, `costo`, `es_frecuente` se mantienen y se agregan campos extendidos como `resumen`, `incluye`, `requisitosDetalle`, `documentos`, `ciclo`, `firma`), `solicitudes` (id = folio), `usuarios` (equipo del CRM), `auditoria` y `config/roles` (matriz de permisos).
- Un trámite creado solo con los campos básicos (como los de la página original) aparece igual en el catálogo nuevo; lo que falte se completa con textos por defecto.
- CRM: el ingreso usa Firebase Authentication (correo y contraseña). Si la cuenta no está en `usuarios`, se agrega al equipo con el rol elegido la primera vez; después el rol se cambia en «Usuarios y roles». Las cuentas `@easyoffice.cl` de ejemplo (contraseña demo1234) siguen sirviendo para probar cada rol.
- `EO.addSolicitud`, `EO.updateSolicitud`, `EO.audit`, `EO.saveUsuario` y `EO.savePermisos` en `assets/eo.js` son los puntos que escriben en Firestore.
- Las plantillas de `assets/forms.js` siguen los documentos reales (contrato de servicios, arriendo de vehículo y estacionamiento, acuerdo de accionistas); al generar el PDF definitivo se usan los mismos campos.
- Los colores están en `fuente/tailwind.config.js` (prefijo `eo-`): verde `#1AA24B`, verde brillante `#22C55E`, negro verdoso `#0E1B14`, fondo `#F4F7F5`, azul ClaveÚnica `#0B63E5`. Para recompilar los estilos después de cambiar clases: `cd fuente && npx tailwindcss@3 -i input.css -o ../assets/eo.css --minify`.
