# Contexto adicional — clip 2026-09-01

Este documento conserva los requisitos extraídos del clip de referencia para WAE OS Enterprise.

## 1. Adaptación sectorial

- Catálogo inicial de 15 perfiles de industria.
- Selector multi-sector por empresa.
- Cada sector define KPIs, documentos, procesos, terminología, normativa, riesgos, sub-sectores y foco de los agentes.
- El contexto sectorial debe inyectarse al system prompt de los 22 agentes.
- La página Empresas debe mostrar información contextual del sector activo.

## 2. Infraestructura cognitiva

Cuatro capacidades base:

1. Memoria Empresarial.
2. Base de Conocimiento.
3. Router de IA multi-modelo.
4. Document Intelligence multimodal.

El router debe ser provider-agnostic y permitir fallback sin reescribir el producto.

## 3. Document Intelligence

Modalidades contempladas: texto, imagen, audio, video, voz, OCR, diagramas, planos, fotografía, capturas de pantalla, documentos escaneados y presentaciones.

## 4. Biblioteca corporativa

Organizar manuales, plantillas, políticas, documentación, procedimientos, guías, reglamentos, capacitaciones, tutoriales y material multimedia. Todo debe poder recuperarse mediante IA.

## 5. WAE Workspace

Editor universal con:

- toolbar completa;
- panel de IA;
- outline;
- historial/versiones;
- autosave;
- continuidad de conversación mientras se edita;
- soporte para documentos, manuales, contratos, políticas, procedimientos, libros, informes, actas, correos, presentaciones, páginas web y Markdown.

## 6. Contratos de backend

Las entidades deben contemplar metadata operacional como createdAt, updatedAt, updatedBy, status, version y deletedAt cuando aplique. La capa backend debe incorporar DTOs, servicios, repositorios, endpoints, paginación, filtros, búsqueda, ordenamiento, manejo de errores, transacciones, migraciones e integridad referencial.

## 7. Gobierno de conocimiento

- Estado de procesamiento y eliminación controlada.
- Filtros, búsqueda híbrida y semántica.
- Citas obligatorias para respuestas basadas en documentos.
- Control de acceso.
- Separación por tenant, departamento y agente.
- Trazabilidad de consultas.
- Diferenciar datos corporativos de conocimiento general.
- No inventar información y declarar evidencia insuficiente.

## 8. Legal

El módulo Legal debe cubrir vencimientos, riesgos críticos, obligaciones, audiencias, documentos por aprobar, costos legales, provisiones, actividad reciente y expedientes con clasificación, partes, responsables, jurisdicción, autoridad, número, fechas, riesgo, costos y eventos.

## 9. Auditoría / deuda técnica prioritaria

P0:

- RLS real a nivel base de datos para entidades con company_id.
- Enforcement RBAC en backend para evitar bypass client-side.

P1:

- Filtro real por sucursal seleccionada.
- CFDI real mediante integración SAT/PAC.
- POS offline con sincronización y resolución de conflictos.

## 10. Conexiones operativas

Ejemplos observados:

- movimientos de inventario → pagos → facturas;
- incidencias → vacaciones / nómina;
- facturación → finanzas;
- reposición IA → órdenes de compra;
- todas las operaciones críticas → auditoría.

## 11. Caché y contexto

- Semantic cache con tenant scope, permission scope, frescura, versión documental y versión de política.
- Nunca compartir caché entre tenants.
- Caché determinista para configuraciones, catálogos y permisos.
- Context pipeline: system instructions → business context → relevant state → relevant memory → relevant RAG → recent conversation → current request.
- Presupuesto dinámico de contexto; nunca comprimir evidencia crítica solo para ahorrar tokens.

## 12. Performance

Medir P50, P95, P99, throughput, queue depth, memoria, CPU y saturación por proveedor. Optimizar progresivamente reduciendo contexto redundante y llamadas evitables sin degradar calidad.

## 13. Respuesta ejecutiva visual

Las respuestas de WAE deben poder renderizar dentro del chat:

- KPIs;
- gráficos;
- badges de estado;
- tablas;
- riesgos;
- action cards;
- botones interactivos;
- deep links a módulos.

La interfaz debe conservar paridad visual con el producto existente mientras se amplían capacidades.
