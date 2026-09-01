import {
  Activity, BadgeDollarSign, BarChart3, BookOpenCheck, Boxes, BriefcaseBusiness,
  Calculator, ChartNoAxesCombined, ClipboardCheck, Cpu, FileText,
  Fingerprint, Gavel, Headphones, Landmark, Megaphone, Network, PackageCheck,
  ReceiptText, ShieldCheck, ShoppingCart, UsersRound, WalletCards,
} from 'lucide-react'

export type Department = {
  id: string
  name: string
  agent: string
  role: string
  description: string
  icon: typeof Activity
  tone: string
  capabilities: string[]
  automations: string[]
}

export const departments: Department[] = [
  { id:'ceo', name:'Dirección General', agent:'AURORA', role:'Chief Executive AI', description:'Orquesta la empresa, coordina directores y convierte datos en decisiones.', icon:BriefcaseBusiness, tone:'violet', capabilities:['Resumen ejecutivo','Decisiones asistidas','Delegación multiagente'], automations:['Brief diario','Alertas críticas','Seguimiento de objetivos'] },
  { id:'finanzas', name:'Finanzas', agent:'STERLING', role:'Director de Finanzas AI', description:'Liquidez, flujo, tesorería, escenarios y control financiero.', icon:BadgeDollarSign, tone:'emerald', capabilities:['Flujo de caja','Proyecciones','Tesorería'], automations:['Alertas de liquidez','Forecast automático','Conciliación'] },
  { id:'rrhh', name:'Recursos Humanos', agent:'TALENT', role:'Director de RR. HH. AI', description:'Talento, clima, expedientes, contratación y desempeño.', icon:UsersRound, tone:'pink', capabilities:['Gestión de talento','Expedientes','Desempeño'], automations:['Vacaciones','Onboarding','Alertas laborales'] },
  { id:'legal', name:'Legal', agent:'JUSTITIA', role:'Director Jurídico AI', description:'Contratos, riesgos, cumplimiento y soporte corporativo.', icon:Gavel, tone:'amber', capabilities:['Contratos','Riesgo jurídico','Obligaciones'], automations:['Vencimientos','Revisión documental','Matriz de riesgo'] },
  { id:'contabilidad', name:'Contabilidad', agent:'LEDGER', role:'Director de Contabilidad AI', description:'Contabilidad financiera, fiscal y cierres.', icon:Calculator, tone:'teal', capabilities:['Contabilidad','Fiscal','Cierres'], automations:['Conciliaciones','Cierre mensual','Validaciones'] },
  { id:'facturacion', name:'Facturación AI', agent:'INVOICER', role:'Gerente de Facturación AI', description:'CFDI, cobranza, emisión y control de facturas.', icon:ReceiptText, tone:'green', capabilities:['CFDI','Cobranza','Clientes'], automations:['Emisión de recibos','Recordatorios','Validación fiscal'] },
  { id:'nominas', name:'Nóminas AI', agent:'PAYROLL', role:'Gerente de Nóminas AI', description:'Nómina, prestaciones, finiquitos y calendario laboral.', icon:WalletCards, tone:'fuchsia', capabilities:['Nómina','Prestaciones','Finiquitos'], automations:['Cálculo de prestaciones','Recibos','Aguinaldo y PTU'] },
  { id:'inventarios', name:'Inventarios', agent:'MERIDIAN', role:'Director de Inventarios AI', description:'Stock, rotación, mínimos, máximos y movimientos.', icon:Boxes, tone:'cyan', capabilities:['Stock','Rotación','Almacenes'], automations:['Reorden','Alertas de stock','Conteo cíclico'] },
  { id:'proveedores', name:'Proveedores', agent:'SOURCE', role:'Director de Abastecimiento AI', description:'Proveedores, SLA, costos y evaluación de suministro.', icon:PackageCheck, tone:'orange', capabilities:['Directorio','Evaluación','SLA'], automations:['Scorecards','Renovaciones','Alertas de costo'] },
  { id:'compras', name:'Compras', agent:'PROCURE', role:'Director de Compras AI', description:'Solicitudes, órdenes, comparativos y autorizaciones.', icon:ShoppingCart, tone:'blue', capabilities:['Órdenes de compra','Cotizaciones','Aprobaciones'], automations:['Comparativo de ofertas','Aprobación','Seguimiento'] },
  { id:'activos', name:'Activos', agent:'APEX', role:'Director de Activos AI', description:'Activos fijos, depreciación, asignaciones y mantenimiento.', icon:Landmark, tone:'indigo', capabilities:['Activos fijos','Depreciación','Custodia'], automations:['Mantenimiento','Depreciación','Inventario físico'] },
  { id:'atencion', name:'Atención', agent:'CARE', role:'Director CX AI', description:'Servicio, tickets, SLA, satisfacción y retención.', icon:Headphones, tone:'sky', capabilities:['Tickets','SLA','Satisfacción'], automations:['Enrutamiento','Escalamiento','Encuestas'] },
  { id:'marketing', name:'Marketing', agent:'PULSE', role:'Director de Marketing AI', description:'Campañas, contenido, leads, CAC y rendimiento.', icon:Megaphone, tone:'yellow', capabilities:['Campañas','Contenido','Performance'], automations:['Calendario editorial','Optimización','Lead scoring'] },
  { id:'ventas', name:'Ventas & CRM', agent:'CLOSER', role:'Director Comercial AI', description:'Pipeline, oportunidades, forecast y clientes.', icon:ChartNoAxesCombined, tone:'rose', capabilities:['CRM','Pipeline','Forecast'], automations:['Seguimientos','Scoring','Forecast comercial'] },
  { id:'proyectos', name:'Proyectos', agent:'PMO', role:'Director de Proyectos AI', description:'Kanban, cronogramas, entregables, presupuesto y riesgos.', icon:ClipboardCheck, tone:'purple', capabilities:['Kanban','Cronogramas','Riesgos'], automations:['Seguimiento','Alertas de desvío','Reportes de avance'] },
  { id:'analitica', name:'Analítica Empresarial', agent:'INSIGHT', role:'Director de Business Intelligence AI', description:'KPIs, dashboards, anomalías, predicción y machine learning.', icon:BarChart3, tone:'violet', capabilities:['KPIs','Dashboards','Predicción'], automations:['Refresh de dashboards','Detección de outliers','Forecast'] },
  { id:'documentos', name:'Documentos Inteligentes', agent:'ARCHIVE', role:'Director Documental AI', description:'Lee, resume, clasifica, relaciona y detecta riesgos documentales.', icon:FileText, tone:'purple', capabilities:['OCR/RAG','Resumen','Riesgos'], automations:['Clasificación','Extracción','Resumen + Q&A'] },
  { id:'capacitacion', name:'Capacitación', agent:'ACADEMY', role:'Director de Aprendizaje AI', description:'Cursos, evaluaciones, certificaciones y desarrollo de personal.', icon:BookOpenCheck, tone:'blue', capabilities:['Cursos','Evaluaciones','Certificados'], automations:['Rutas de aprendizaje','Recordatorios','Certificación'] },
  { id:'seguridad', name:'Seguridad', agent:'SENTINEL', role:'CISO AI', description:'Riesgo tecnológico, incidentes, acceso y postura de seguridad.', icon:ShieldCheck, tone:'red', capabilities:['Postura de seguridad','Incidentes','Accesos'], automations:['Alertas','Revisión de privilegios','Respuesta a incidentes'] },
  { id:'compliance', name:'Compliance', agent:'NORM', role:'Director de Cumplimiento AI', description:'Políticas, controles, evidencias, auditoría y obligaciones.', icon:Fingerprint, tone:'amber', capabilities:['Controles','Evidencias','Auditorías'], automations:['Checklist','Vencimientos','Evidence pack'] },
  { id:'operaciones', name:'Operaciones', agent:'ORBIT', role:'COO AI', description:'Procesos, capacidad, eficiencia, SLA y ejecución operativa.', icon:Network, tone:'cyan', capabilities:['Procesos','SLA','Capacidad'], automations:['Seguimiento operativo','Detección de cuellos','Escalamiento'] },
  { id:'tecnologia', name:'Tecnología', agent:'NEXUS', role:'CTO AI', description:'Arquitectura, producto digital, infraestructura e integraciones.', icon:Cpu, tone:'blue', capabilities:['Arquitectura','Integraciones','DevOps'], automations:['Health checks','Incidentes','Releases'] },
]

export const executiveMetrics = [
  { label:'Ingresos', value:'$601,481', delta:'+12.8%', icon:BadgeDollarSign },
  { label:'Utilidad', value:'$511,567', delta:'+8.4%', icon:BarChart3 },
  { label:'Por cobrar', value:'$439,392', delta:'6 facturas', icon:ReceiptText },
  { label:'Pipeline', value:'$500,000', delta:'14 oportunidades', icon:Activity },
]

export const riskMetrics = [
  {label:'Activos',value:'128'}, {label:'Tickets abiertos',value:'4'}, {label:'Por vencer',value:'3'}, {label:'Riesgos críticos',value:'2'},
  {label:'Obligaciones',value:'7'}, {label:'Costos legales',value:'$0'}, {label:'Provisiones',value:'$79,400'}, {label:'Empleados',value:'10'},
]
