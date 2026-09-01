# WAE OS Enterprise — 22 Departamentos

Sistema operativo empresarial con interfaz ejecutiva, 22 departamentos especializados y una capa central de inteligencia corporativa.

## Estado

**v1.1 — Cognitive Core / Multi-sector evolution**

Implementación funcional construida a partir de las referencias visuales y de arquitectura proporcionadas por el fundador. GitHub Actions valida TypeScript y build de producción en cada push a `main`.

## Incluye

- Dashboard ejecutivo y métricas empresariales.
- Multiempresa y selector de empresa.
- 15 perfiles sectoriales con selección multi-sector.
- Adaptación de KPIs, procesos, documentos, riesgos, terminología y foco de agentes por industria.
- 22 departamentos/directores AI.
- Finanzas, RR. HH., Legal, Contabilidad, Facturación, Nóminas, Inventarios, Proveedores, Compras, Activos, Atención, Marketing, Ventas, Proyectos, Analítica, Documentos, Capacitación, Seguridad, Compliance, Operaciones, Tecnología y Dirección General.
- WAE Cognitive Core: Memoria Empresarial, Base de Conocimiento, router multi-modelo y Document Intelligence.
- Router de IA provider-agnostic con selección por modalidad, salud, latencia, costo y fallback.
- Context Engine con presupuesto dinámico, jerarquía de fuentes y protección de evidencia crítica.
- Caché determinista/semántica con scope por tenant, permisos, versión documental y política.
- Política de evidencia y citas para conocimiento corporativo.
- Document Intelligence multimodal: texto, imagen, audio, video, voz, OCR, diagramas, planos, fotografías, capturas, escaneos y presentaciones.
- WAE Workspace con outline, editor, panel IA, versiones y autosave.
- Respuestas ejecutivas visuales dentro de WAE Intelligence.
- Diseño responsive para escritorio y móvil.

## Arquitectura crítica pendiente de backend

Antes de considerar el producto enterprise-ready deben completarse, entre otros:

- RLS real a nivel base de datos para entidades `company_id`.
- Enforcement RBAC en backend.
- Persistencia y autenticación multiempresa.
- Conexión real de los adapters IA.
- RAG persistente con embeddings y trazabilidad.
- Auditoría inmutable de operaciones críticas.
- CFDI real mediante SAT/PAC.
- Filtro de sucursal en backend.
- POS offline con sincronización y resolución de conflictos.

Consulta `docs/CLIP_CONTEXT_2026-09-01.md` para el contexto funcional completo extraído de la última referencia.

## Stack

- React
- TypeScript
- Vite
- Lucide Icons

## Desarrollo

```bash
npm install
npm run dev
```

## Calidad

```bash
npm run typecheck
npm run build
```

## Producción

```bash
npm run build
npm run preview
```

## Siguiente fase

Conectar Supabase, autenticación, RLS/RBAC, persistencia, adapters de IA, memoria/RAG real y automatizaciones transaccionales sin romper la arquitectura visual y operativa existente.
