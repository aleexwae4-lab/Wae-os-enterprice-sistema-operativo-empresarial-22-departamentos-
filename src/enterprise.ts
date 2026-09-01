export type IndustryProfile = {
  id: string
  name: string
  subSectors: string[]
  kpis: string[]
  processes: string[]
  documentTypes: string[]
  risks: string[]
  terminology: string[]
  regulations: string[]
  agentFocus: string[]
}

export const industryProfiles: IndustryProfile[] = [
  {id:'technology',name:'Tecnología',subSectors:['SaaS','Software Factory','IA','Ciberseguridad','Cloud'],kpis:['MRR','ARR','Churn','NPS','Uptime'],processes:['Producto','Desarrollo','Soporte','DevOps'],documentTypes:['SLA','DPA','Roadmap','Runbook'],risks:['Disponibilidad','Vendor lock-in','Brechas de seguridad'],terminology:['release','incident','backlog','tenant'],regulations:['LFPDPPP','ISO 27001'],agentFocus:['arquitectura','costos cloud','seguridad','retención']},
  {id:'marketing',name:'Marketing y Medios',subSectors:['Agencia','Producción','Publicidad','Contenido'],kpis:['ROAS','CAC','CTR','CPL'],processes:['Campañas','Producción','Aprobaciones','Reporting'],documentTypes:['Brief','Media plan','Guion','Contrato'],risks:['Derechos de autor','Desviación presupuestal'],terminology:['reach','engagement','conversion'],regulations:['Publicidad','Propiedad intelectual'],agentFocus:['performance','contenido','marca']},
  {id:'engineering',name:'Ingeniería y Construcción',subSectors:['Civil','Industrial','Arquitectura','Instalaciones'],kpis:['Avance','Costo real vs plan','Incidentes','Productividad'],processes:['Planeación','Obra','Compras','Supervisión'],documentTypes:['Plano','Bitácora','Estimación','Memoria de cálculo'],risks:['Seguridad','Sobrecosto','Retraso'],terminology:['RFI','estimación','obra','entregable'],regulations:['NOM','Reglamentos locales'],agentFocus:['proyecto','riesgo','compras','seguridad']},
  {id:'legal',name:'Jurídico',subSectors:['Corporativo','Penal','Laboral','Civil','Fiscal'],kpis:['Asuntos activos','Vencimientos','Riesgo','Costo por asunto'],processes:['Expedientes','Audiencias','Contratos','Investigación'],documentTypes:['Contrato','Escrito','Dictamen','Jurisprudencia'],risks:['Caducidad','Incumplimiento','Conflicto'],terminology:['expediente','término','jurisdicción'],regulations:['Constitución','Códigos','Jurisprudencia'],agentFocus:['evidencia','vencimientos','obligaciones','riesgo']},
  {id:'finance',name:'Financiero',subSectors:['Fintech','Crédito','Servicios financieros','Inversión'],kpis:['Liquidez','Mora','NIM','CAC'],processes:['Originación','Cobranza','Tesorería','Riesgo'],documentTypes:['Estado de cuenta','Contrato','KYC','Reporte'],risks:['Fraude','Liquidez','Crédito'],terminology:['cartera','mora','spread'],regulations:['CNBV','PLD/FT'],agentFocus:['riesgo','tesorería','compliance']},
  {id:'health',name:'Salud',subSectors:['Clínica','Hospital','Laboratorio','Telemedicina'],kpis:['Ocupación','Tiempo de espera','Readmisión','Satisfacción'],processes:['Admisión','Consulta','Diagnóstico','Seguimiento'],documentTypes:['Expediente','Consentimiento','Resultado','Receta'],risks:['Privacidad','Seguridad del paciente'],terminology:['paciente','triage','expediente'],regulations:['NOM-004','LFPDPPP'],agentFocus:['operación','privacidad','calidad']},
  {id:'education',name:'Educación',subSectors:['Universidad','Capacitación','EdTech','Academia'],kpis:['Retención','Aprobación','Inscripción','Satisfacción'],processes:['Admisión','Cursos','Evaluación','Certificación'],documentTypes:['Programa','Acta','Certificado','Material'],risks:['Deserción','Acreditación'],terminology:['cohorte','crédito','competencia'],regulations:['SEP','Normativa académica'],agentFocus:['retención','calidad','certificación']},
  {id:'commerce',name:'Comercio',subSectors:['Retail','E-commerce','Marketplace','Mayorista'],kpis:['Ticket promedio','Conversión','Rotación','Margen'],processes:['Venta','Inventario','Devoluciones','Promociones'],documentTypes:['Pedido','Factura','Catálogo','Política'],risks:['Inventario','Fraude','Mermas'],terminology:['SKU','ticket','carrito'],regulations:['PROFECO','Fiscal'],agentFocus:['ventas','inventario','margen']},
  {id:'industry',name:'Industria',subSectors:['Manufactura','Automotriz','Alimentos','Química'],kpis:['OEE','Scrap','Throughput','Downtime'],processes:['Producción','Calidad','Mantenimiento','Abasto'],documentTypes:['Orden','BOM','Checklist','Reporte'],risks:['Paro','Calidad','Seguridad'],terminology:['OEE','BOM','lote'],regulations:['NOM','ISO 9001'],agentFocus:['producción','calidad','mantenimiento']},
  {id:'transport',name:'Transporte y Logística',subSectors:['Última milla','Carga','3PL','Flota'],kpis:['OTIF','Costo por entrega','Utilización','Incidencias'],processes:['Ruteo','Despacho','Entrega','Mantenimiento'],documentTypes:['Carta porte','Manifiesto','Ruta','Incidencia'],risks:['Retraso','Siniestro','Costo combustible'],terminology:['OTIF','ETA','ruta'],regulations:['Carta Porte','SCT'],agentFocus:['rutas','flota','costos']},
  {id:'government',name:'Gobierno',subSectors:['Municipal','Estatal','Dependencia','Organismo'],kpis:['Presupuesto ejercido','Tiempo de trámite','Cobertura'],processes:['Trámites','Compras','Programas','Atención'],documentTypes:['Oficio','Acta','Licitación','Informe'],risks:['Cumplimiento','Transparencia'],terminology:['partida','expediente','servidor público'],regulations:['Transparencia','Adquisiciones'],agentFocus:['cumplimiento','presupuesto','trazabilidad']},
  {id:'nonprofit',name:'Organizaciones sin fines de lucro',subSectors:['Fundación','Asociación','ONG'],kpis:['Impacto','Donantes','Costo por programa'],processes:['Programas','Donaciones','Voluntariado','Reporting'],documentTypes:['Convenio','Informe','Donativo'],risks:['Trazabilidad','Financiamiento'],terminology:['donante','beneficiario','programa'],regulations:['Donatarias','Fiscal'],agentFocus:['impacto','fondos','transparencia']},
  {id:'services',name:'Servicios Profesionales',subSectors:['Consultoría','Despacho','BPO','Creativos'],kpis:['Utilización','Margen por proyecto','Horas facturables','NPS'],processes:['Prospección','Proyecto','Entrega','Cobranza'],documentTypes:['Propuesta','SOW','Entregable','Factura'],risks:['Scope creep','Cobranza'],terminology:['SOW','retainer','entregable'],regulations:['Fiscal','Contratos'],agentFocus:['rentabilidad','proyecto','cliente']},
  {id:'aerospace',name:'Aeroespacial y General',subSectors:['Aeroespacial','Defensa','Servicios especializados'],kpis:['Confiabilidad','Calidad','Lead time'],processes:['Ingeniería','Calidad','Mantenimiento','Supply chain'],documentTypes:['Especificación','Certificado','Orden'],risks:['Calidad','Trazabilidad','Proveedor'],terminology:['traceability','airworthiness','QA'],regulations:['AS9100','Normativa aplicable'],agentFocus:['calidad','trazabilidad','riesgo']},
  {id:'realestate',name:'Bienes Raíces',subSectors:['Comercial','Residencial','Administración','Desarrollo'],kpis:['Ocupación','Cap rate','Cobranza','Vacancia'],processes:['Prospección','Contrato','Cobranza','Mantenimiento'],documentTypes:['Arrendamiento','Ficha','Avalúo','Acta'],risks:['Vacancia','Incumplimiento','Mantenimiento'],terminology:['cap rate','arrendatario','vacancia'],regulations:['Civil','Uso de suelo'],agentFocus:['ocupación','contratos','cobranza']},
]

export const cognitiveCapabilities = [
  {id:'memory',name:'Memoria Empresarial',status:'ready',detail:'Working, session, user, company y long-term memory con aislamiento por tenant.'},
  {id:'knowledge',name:'Base de Conocimiento',status:'ready',detail:'Búsqueda híbrida + semántica, citas, trazabilidad y control de acceso.'},
  {id:'router',name:'Router de IA Multi-modelo',status:'ready',detail:'Selección por tarea, costo, latencia, modalidad y fallback sin acoplar la app a un proveedor.'},
  {id:'documents',name:'Document Intelligence',status:'ready',detail:'Texto, imagen, audio, video, voz, OCR, diagramas, planos, fotografías, escaneos y presentaciones.'},
]

export const modelProviders = [
  {name:'OpenAI',modes:['texto','visión','tools'],state:'Disponible'},
  {name:'Gemini',modes:['texto','visión','multimodal'],state:'Adapter'},
  {name:'Mistral',modes:['texto','OCR'],state:'Adapter'},
  {name:'Groq',modes:['texto','baja latencia'],state:'Adapter'},
  {name:'Local',modes:['texto','fallback privado'],state:'Adapter'},
]

export const knowledgeRules = [
  'Toda respuesta documental debe citar documento y fragmento recuperado.',
  'Separación estricta por tenant, departamento y agente.',
  'Diferenciar conocimiento corporativo de conocimiento general.',
  'No inventar datos; declarar cuando la evidencia sea insuficiente.',
  'Registrar trazabilidad de consulta y contexto recuperado.',
]

export const contextPipeline = [
  'System instructions',
  'Business context',
  'Relevant state',
  'Relevant memory',
  'Relevant RAG',
  'Recent conversation',
  'Current request',
]

export const auditBacklog = [
  {priority:'P0',item:'RLS real en entidades company_id',impact:'Aislamiento real entre empresas'},
  {priority:'P0',item:'RBAC obligatorio en backend',impact:'Evitar bypass desde cliente'},
  {priority:'P1',item:'Filtro global por sucursal seleccionada',impact:'Separación operativa por branch'},
  {priority:'P1',item:'CFDI real con proveedor SAT/PAC',impact:'Facturación fiscal de producción'},
  {priority:'P1',item:'POS offline con resolución de conflictos',impact:'Continuidad operativa sin red'},
]

export const corporateLibrary = ['Manuales','Plantillas','Políticas','Documentación','Procedimientos','Guías','Reglamentos','Capacitaciones','Tutoriales','Material multimedia']

export function buildSectorContext(selectedIds:string[]) {
  const selected = industryProfiles.filter(p=>selectedIds.includes(p.id))
  return selected.map(p=>`${p.name}: KPIs ${p.kpis.join(', ')}; riesgos ${p.risks.join(', ')}; foco ${p.agentFocus.join(', ')}`).join('\n')
}
