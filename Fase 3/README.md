# Entregas Fase 3 — Capstone Easy Office (Equipo 11)

Presentación final del Proyecto APT ante la comisión (20 minutos con preguntas), con su documentación, las evidencias de pruebas y el código del MVP.

- **Sitio publicado:** https://easy-office-97ace.web.app
- **Integrantes:** Carlos Lienan (Scrum Master, CRM y reuniones con el cliente) · Juan Castillo (GitHub, base de datos y web) · Nicolás Barraza (web y base de datos)
- **Product Owner:** Natanael Escobar (Easy Office)

## Documentos de la fase

| Archivo | Contenido |
| :--- | :--- |
| `Presentacion_Final_EasyOffice.pptx` / `.pdf` | Presentación de 17 diapositivas. Problema, solución, caso de uso y arquitectura van en inglés; cada diapositiva indica quién la presenta y trae el guion en las notas. |
| `Guion_Presentacion_Final.docx` | Reparto, tiempos (unos 15 minutos de exposición) y guion completo, con pronunciación de apoyo para las partes en inglés. |
| `Banco_Preguntas_Comision.docx` | Preguntas probables de la comisión con respuestas cortas, ordenadas por competencia del perfil de egreso. |
| `Informe_Pruebas_EasyOffice.docx` | Plan e informe de pruebas: 19 casos, resultados de dos ejecuciones, defectos encontrados y mejoras aplicadas. |
| `3.1_APT122_DiarioReflexionFase3.docx` | Pauta oficial del diario de reflexión. |
| `3.2_APT122_AutoevaluacionFase3.docx` | Pauta oficial de autoevaluación. |
| `3.3_Estudiante_Fase3_Presentacion_Proyecto_APT.docx` | Orientaciones oficiales de la presentación. |
| `3.4_APT122_Sumativa_Fase3.pdf` | Rúbrica sumativa de la fase. |

### Entregables individuales

| Integrante | Diario de reflexión 3.1 | Autoevaluación 3.2 |
| :--- | :--- | :--- |
| Juan Castillo | `Castillo_Juan_3.1_APT122_DiarioReflexionFase3.docx` | Pendiente (tras el ensayo grabado) |
| Carlos Lienan | Pendiente: `Lienan_Carlos_3.1_APT122_DiarioReflexionFase3.docx` | Pendiente |
| Nicolás Barraza | Pendiente: `Barraza_Nicolas_3.1_APT122_DiarioReflexionFase3.docx` | Pendiente |

## Evidencias

- `Evidencias/Capturas_Sistema/`: capturas del portal y del CRM publicados (inicio, catálogo, contratación, pago, estado, tablero, ficha, pagos, usuarios y auditoría).
- `Evidencias/Pruebas/`: suite automatizada (`suite-e2e.js`), resultados de la 1ª y 2ª ejecución (`resultados_r1.json`, `resultados_r2.json`) y una captura por caso (`capturas/r1_*`, `capturas/r2_*`).

### Resumen de las pruebas

| | 1ª ejecución | 2ª ejecución |
| :--- | :---: | :---: |
| Casos | 19 | 19 |
| Fallas del producto | 2 (CP-11, CP-12) | 0 |
| Aprobados | 16 | 19 |

Las dos fallas eran de seguridad en el CRM: el tablero se abría sin iniciar sesión y el segundo factor aceptaba cualquier código. Se corrigieron en `src/assets/eo.js` y `src/crm/login.html` y la segunda ejecución completa las confirmó. CP-05 falló en la 1ª ejecución por un error del script de prueba, no del producto.

Para repetirlas: servir `src/` en local (por ejemplo `npx serve src -l 8765`) y ejecutar `BASE=http://localhost:8765/ RUN=r3 node Evidencias/Pruebas/suite-e2e.js` (Node 18+ y Playwright).

## Código del MVP (`src/`)

Portal del cliente (`portal/`, 7 páginas) y CRM interno (`crm/`, 7 páginas) en HTML, Tailwind CSS y JavaScript, conectados a Firebase (Hosting, Authentication y Cloud Firestore). Las reglas de seguridad están en `src/fuente/firestore.rules`. Detalle de la estructura, los acuerdos con el cliente y la conexión con Firebase en `src/LEEME.md`.
