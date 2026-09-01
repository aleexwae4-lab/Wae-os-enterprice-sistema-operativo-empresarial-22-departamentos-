# Análisis de clips y arquitectura de producto

## Evidencia analizada

Se recibieron cuatro archivos MP4 verticales. Dos son binariamente idénticos, por lo que existen **tres clips únicos**.

Los clips muestran distintas capas del mismo producto WAE OS Enterprise: navegación general, inteligencia corporativa, analítica, módulos especializados y automatización multiárea.

---

## 1. Lenguaje visual observado

### Shell principal

- Tema oscuro enterprise.
- Sidebar izquierda persistente.
- Header superior con búsqueda global, notificaciones y perfil CEO.
- Empresa activa mediante switcher superior: ejemplo visible `Aurora Dynamics`.
- Cards compactas con bordes de baja opacidad.
- Acentos morado, azul, turquesa, verde y magenta.
- Tipografía compacta y alta densidad informativa.
- Interfaz responsive pensada para escritorio y móvil.

### Jerarquía del menú observada

**Estratégico**
- Dashboard
- Empresas
- Analítica
- Dashboard POS

**Operación**
- POS Enterprise
- CRM & Ventas
- Proyectos
- Finanzas
- Facturación AI
- RR. HH.
- Nóminas AI
- Inventarios
- Proveedores
- Compras
- Activos
- Atención
- Marketing

**Inteligencia / plataforma**
- Workspace
- Memoria Empresarial
- Base de Conocimiento
- Router de IA
- Documentos IA
- IA Operations
- Legal
- Seguridad
- Inteligencia IA
- Automatizaciones
- Documentos
- Capacitación
- Centro de Plataforma

---

## 2. Patrón de inteligencia observado

La característica más importante es que la IA no se limita a redactar respuestas.

### Comportamiento observado

1. Recibe una intención empresarial.
2. Identifica la entidad y operación solicitada.
3. Valida si existen datos suficientes.
4. Expone los campos faltantes sin inventarlos.
5. Solicita únicamente la información imprescindible.
6. Cruza dependencias con otros departamentos.
7. Calcula impacto económico cuando existen datos verificables.
8. Señala cuando un cálculo no puede realizarse por falta de información.
9. Propone acciones concretas.
10. Distribuye o prepara información para varias áreas.

### Ejemplo observado: alta de empleado

La conversación muestra una solicitud para crear un empleado y posteriormente un análisis de campos faltantes.

La inteligencia identifica dependencias potenciales con:

- Recursos Humanos
- Nómina
- Finanzas
- Legal / Compliance
- Sistemas / TI
- Operaciones

Esto implica un patrón de **workflow multiagente y transaccional**, no solamente un modelo conversacional.

### Regla de producto derivada

> WAE Intelligence nunca debe fabricar un dato corporativo que debería provenir de la empresa. Debe pedirlo, recuperarlo de una fuente autorizada o marcarlo como no disponible.

---

## 3. Modos de conversación observados

En la interfaz aparecen modos como:

- Profundidad
- Rápido
- Detallado
- Profundo / Producto según contexto visual

La implementación debe mapear estos modos a políticas reales de ejecución, por ejemplo:

- `fast`: menor profundidad y menos llamadas.
- `detailed`: explicación ampliada y más contexto recuperado.
- `deep`: análisis multiagente y validación de dependencias.
- `product`: ejecución orientada a acciones y artefactos empresariales.

---

## 4. Agentes / directores visibles

Los clips muestran una identidad específica para distintos responsables AI. Entre los nombres observables se encuentran:

- `INSIGHT` — Business Intelligence / Analítica.
- `STERLING` — Finanzas.
- `TALENT` — Recursos Humanos.
- `LEDGER` — Contabilidad.
- `INVOICER` — Facturación.
- `PAYROLL` — Nóminas.
- `PULSE` — Marketing.

También se observa una capa superior WAE OS / CEO Chat que coordina el conjunto.

La primera implementación del repositorio amplía este patrón a **22 departamentos/directores AI**.

---

## 5. Analítica empresarial observada

Los clips muestran un módulo BI con:

- Resumen ejecutivo.
- Ingresos.
- Utilidad.
- Por cobrar.
- Pipeline.
- Clientes activos.
- Tickets abiertos.
- Proyectos activos.
- Stock bajo.
- Gráficas temporales.
- Ventas por departamento.
- Pipeline comercial.
- Tickets por prioridad.
- Estado del inventario.
- Headcount por departamento.
- Campañas: presupuesto vs. gasto.

Valores visibles usados como referencia visual del prototipo:

- Ingresos: `$601,481`.
- Utilidad: `$511,567`.
- Por cobrar: `$439,392`.
- Pipeline: `$500,000`.

Estos valores son **datos demo**, no información contable real.

---

## 6. Módulos especializados observados

### Proyectos

- Nuevo proyecto.
- Número de proyectos.
- Proyectos en curso.
- Presupuesto total.
- Gastado.
- Kanban / cronogramas / entregables.

### Nóminas

Se observan automatizaciones para:

- Cálculo de prestaciones.
- Generación de recibos.
- Envío de recibos.
- Recordatorios de vacaciones.
- Alertas de vencimientos laborales.
- Simulación de liquidaciones.
- Simulación de finiquitos.
- Cálculo de aguinaldo.
- Cálculo de PTU.
- Programación de pagos.
- Generación de documentación.

### Documentos Inteligentes

- Subir documento.
- Procesados.
- En proceso.
- Con riesgos.
- Pipeline de análisis automático.
- Extracción.
- Análisis con IA.
- Resumen, riesgos y preguntas/respuestas.

### Capacitación

- Catálogo.
- Inscripciones.
- Certificados.
- Emisión de certificados al completar cursos.

### Centro de Plataforma

- Configuración.
- Usuarios.
- Roles.
- Equipos.
- API Keys.
- Feature Flags.
- Licencias.
- Eventos.
- Variables empresariales tipadas por key/value/scope.

---

## 7. Arquitectura objetivo derivada

```text
                     WAE OS ENTERPRISE
                            │
                    WAE Intelligence Core
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Intent Router      Context / Memory     Policy Engine
        │                   │                   │
        └─────────────── Orchestrator ──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
       Department AI   Workflow Engine   Tool Gateway
             │              │              │
             └──────────────┼──────────────┘
                            │
                      Enterprise Data
                            │
               Multi-tenant persistence
```

### Capas recomendadas

1. **Frontend shell** — implementado en esta primera fase.
2. **Auth + tenant context**.
3. **RBAC / ABAC** por organización y departamento.
4. **Enterprise data layer**.
5. **AI router**.
6. **Agent registry** para los 22 departamentos.
7. **Tool/action registry**.
8. **Workflow engine** con idempotencia.
9. **RAG / memoria empresarial**.
10. **Audit log inmutable**.
11. **Observabilidad y costos de IA**.
12. **Automatizaciones y scheduler**.

---

## 8. Contrato obligatorio para acciones de IA

Toda acción empresarial debe seguir un estado explícito:

```ts
type ActionState =
  | 'intent_received'
  | 'validating_context'
  | 'missing_data'
  | 'ready_for_plan'
  | 'awaiting_approval'
  | 'executing'
  | 'completed'
  | 'failed'
```

Una acción sensible nunca debe saltar directamente de conversación a escritura en base de datos sin:

- identidad,
- tenant,
- permisos,
- validación del payload,
- política de aprobación cuando aplique,
- idempotency key,
- audit trail.

---

## 9. Primer alcance ya implementado

La primera versión del repositorio contiene:

- shell visual WAE OS Enterprise;
- navegación responsive;
- selector de empresa;
- dashboard ejecutivo;
- 22 departamentos AI;
- vistas por departamento;
- capacidades;
- automatizaciones;
- integraciones multiagente;
- empresas;
- proyectos;
- analítica;
- documentos inteligentes;
- capacitación;
- workspace;
- memoria empresarial;
- centro de plataforma;
- panel WAE Intelligence contextual.

---

## 10. Siguiente fase de ingeniería

La siguiente fase no debe rehacer el frontend. Debe convertir esta capa en un producto conectado:

1. Supabase/Auth.
2. Modelo multi-tenant.
3. Catálogo real de departamentos/agentes.
4. Router IA.
5. Acciones reales con tool calling.
6. Alta de empleados end-to-end.
7. Nómina / facturación / inventarios con esquemas de datos.
8. RAG documental.
9. Auditoría.
10. Seguridad y pruebas automáticas.

El objetivo final no es imitar la apariencia del clip: es preservar su **modelo de operación empresarial asistida por inteligencia** y convertirlo en software de producción.
