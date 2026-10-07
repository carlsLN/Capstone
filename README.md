# Easy Office — Portal Transaccional y CRM Interno

**Proyecto de Título Capstone 2026 — Duoc UC Sede San Bernardo**

Este repositorio contiene el código fuente y la documentación para el desarrollo del **Portal Web Transaccional** y el **CRM Interno** para la empresa **Easy Office**, orientados a la digitalización completa del proceso de gestión y contratación de trámites corporativos en Chile.

---

## 1. Integrantes del Equipo (Equipo 11)
* **Juan Castillo** — Desarrollo & Arquitectura
* **Carlos Lienan** — Backend & Seguridad
* **Nicolás Barraza** — Frontend & Experiencia de Usuario (UI/UX)

---

## 2. Diagnóstico y Problemática Actual
Easy Office cuenta con más de 15 años simplificando trámites de formalización de empresas en Chile. Sin embargo, su proceso operativo tradicional presenta severos cuellos de botella:

| Proceso Actual | Impacto y Vulnerabilidad |
| :--- | :--- |
| **Atención presencial** y recepción por WhatsApp manual | Filas de espera, falta de escalabilidad y atención limitada a horario hábil. |
| **Recolección de datos** mediante planillas Excel | Riesgos de seguridad de datos (Ley 21.719), falta de auditoría y controles de acceso por roles. |
| **Cobros manuales** por transferencia bancaria | Conciliación manual lenta, fricción en el pago e imposibilidad de procesamiento automático. |

---

## 3. Solución Propuesta
El proyecto reemplaza los flujos manuales por un ecosistema digital compuesto por dos aplicaciones integradas:
1. **Portal Web Transaccional (Cliente):** Permite seleccionar trámites (Domicilio Tributario, Constitución de SpA, Gestión Documental, Asesoría Contable), autenticarse vía ClaveÚnica, cargar documentos requeridos y realizar el pago en línea.
2. **CRM Interno (Ejecutivo):** Genera un ticket automático en un tablero Kanban para el seguimiento, asignación por roles (RBAC) y gestión de cada trámite sin uso de papel.

---

## 4. Arquitectura del Sistema
La arquitectura conecta dos portales cliente/ejecutivo hacia un backend de microservicios con integraciones clave:

### Módulos Backend
* **Autenticación y Sesiones:** Integración con portal ciudadano ClaveÚnica.
* **Catálogo y Trámites:** Gestión de requerimientos, formularios y precios.
* **Pagos:** Procesamiento con Webpay / Khipu (esquema 50% abono o 100% total).
* **Documentos y Firma:** Integración con proveedor de Firma Electrónica Avanzada (FEA) bajo la Ley 19.799.
* **Notificaciones:** API de WhatsApp y Correo Electrónico para alertas automáticas de estado.

### Seguridad y Cumplimiento Legal
* **Cifrado en tránsito:** TLS 1.3
* **Cifrado en reposo:** AES-256 para base de datos y almacenamiento de documentos.
* **Leyes aplicables:** Ley 19.799 (Firma Electrónica) y Ley 21.719 (Protección de Datos Personales).

---

## 5. Hoja de Ruta TRL (Technology Readiness Level)
| Nivel TRL | Estado | Entregable / Evidencia |
| :--- | :--- | :--- |
| **TRL 1-3** | Completado | Diagnóstico inicial, SRS y Mockups navegables. |
| **TRL 4** | En Curso | Código base, estructura de base de datos y flujos de autenticación. |
| **TRL 5-6** | Meta Final | MVP operativo probado en staging con ClaveÚnica, Webpay y generación de tickets en CRM. |
