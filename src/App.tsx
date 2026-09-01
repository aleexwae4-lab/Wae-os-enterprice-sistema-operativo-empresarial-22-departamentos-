import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, Bell, Bot, BrainCircuit, Building2, ChevronDown, ChevronRight, CircleGauge,
  Crown, FileText, GraduationCap, Grid3X3, LayoutDashboard, Menu, Mic,
  Paperclip, Plus, ReceiptText, Search, Send, Settings2, Sparkles, Store, WalletCards,
  Boxes, ClipboardCheck, X, Zap,
} from 'lucide-react'
import { departments, executiveMetrics, riskMetrics, type Department } from './data'
import {
  CognitiveCore, KnowledgeGovernance, MultimodalSupport, SectorContextPanel,
} from './EvolutionPanels'

type View =
  | 'ceo'
  | 'dashboard'
  | 'empresas'
  | 'departments'
  | 'projects'
  | 'analytics'
  | 'posDashboard'
  | 'documents'
  | 'training'
  | 'platform'
  | 'workspace'
  | 'knowledge'
  | 'cognitive'

const strategicItems: {id:View; label:string; icon:any}[] = [
  {id:'ceo',label:'CEO Chat',icon:Crown},
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'empresas',label:'Empresas',icon:Building2},
  {id:'analytics',label:'Analítica',icon:CircleGauge},
  {id:'posDashboard',label:'Dashboard POS',icon:Store},
]

const intelligenceItems: {id:View; label:string; icon:any}[] = [
  {id:'cognitive',label:'Núcleo Cognitivo',icon:BrainCircuit},
  {id:'workspace',label:'Workspace',icon:Sparkles},
  {id:'knowledge',label:'Memoria Empresarial',icon:Bot},
  {id:'documents',label:'Documentos IA',icon:FileText},
  {id:'training',label:'Capacitación',icon:GraduationCap},
  {id:'platform',label:'Centro de Plataforma',icon:Settings2},
]

function App() {
  const [view, setView] = useState<View>('ceo')
  const [departmentId, setDepartmentId] = useState('finanzas')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const department = departments.find(d => d.id === departmentId) ?? departments[1]

  const openDepartment = (id:string) => {
    setDepartmentId(id)
    setView('departments')
    setSidebarOpen(false)
  }

  const page = useMemo(() => {
    if (view === 'ceo') return <CEOChat onNavigate={setView} onDepartment={openDepartment} />
    if (view === 'dashboard') return <Dashboard onDepartment={openDepartment} />
    if (view === 'empresas') return <Companies />
    if (view === 'projects') return <Projects />
    if (view === 'analytics') return <Analytics />
    if (view === 'posDashboard') return <POSDashboard />
    if (view === 'documents') return <Documents />
    if (view === 'training') return <Training />
    if (view === 'platform') return <Platform />
    if (view === 'workspace') return <Workspace />
    if (view === 'knowledge') return <Knowledge />
    if (view === 'cognitive') return <Cognitive />
    return <DepartmentView department={department} />
  }, [view, department])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open':''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={18}/></div>
          <div><strong>WAE OS</strong><span>ENTERPRISE</span></div>
          <button className="icon-btn mobile-close" onClick={()=>setSidebarOpen(false)}><X size={18}/></button>
        </div>

        <button className="company-switcher" onClick={()=>{setView('empresas');setSidebarOpen(false)}}>
          <div className="avatar">A</div>
          <div><b>Aurora Dynamics</b><small>Tecnología</small></div>
          <ChevronDown size={16}/>
        </button>

        <div className="nav-scroll">
          <NavSection title="ESTRATÉGICO" items={strategicItems} active={view} onSelect={(v)=>{setView(v);setSidebarOpen(false)}}/>

          <div className="section-title">OPERACIÓN</div>
          <div className="department-nav">
            <button className={view==='posDashboard'?'active':''} onClick={()=>{setView('posDashboard');setSidebarOpen(false)}}>
              <span className="mini-icon cyan"><Store size={14}/></span><span>POS Enterprise</span>
            </button>
            {departments.filter(d=>d.id!=='ceo').map(d => {
              const Icon = d.icon
              return (
                <button
                  key={d.id}
                  className={view==='departments'&&departmentId===d.id?'active':''}
                  onClick={()=>openDepartment(d.id)}
                >
                  <span className={`mini-icon ${d.tone}`}><Icon size={14}/></span><span>{d.name}</span>
                </button>
              )
            })}
          </div>

          <NavSection title="INTELIGENCIA" items={intelligenceItems} active={view} onSelect={(v)=>{setView(v);setSidebarOpen(false)}}/>
        </div>

        <div className="sidebar-footer">
          <span className="core-footer-icon"><BrainCircuit size={14}/></span>
          <div><b>IA Core activa</b><small>8 agentes en línea</small></div>
          <span className="status-dot"/>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button>
            <div className="searchbox">
              <Search size={16}/>
              <input placeholder="Buscar en todo WAE OS..." value={query} onChange={e=>setQuery(e.target.value)}/>
              <kbd>⌘ K</kbd>
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-btn"><Bell size={18}/><i/></button>
            <span className="ceo-badge">CEO</span>
          </div>
        </header>

        <div className={`content ${view==='ceo'?'ceo-content':''}`}>{page}</div>
      </main>

      {view!=='ceo' && (
        <button className="ceo-return-fab" onClick={()=>setView('ceo')} title="Volver a CEO Chat">
          <Crown size={21}/>
        </button>
      )}
    </div>
  )
}

function NavSection({title,items,active,onSelect}:{title:string;items:any[];active:View;onSelect:(v:View)=>void}){
  return <div><div className="section-title">{title}</div><div className="nav-group">{items.map(({id,label,icon:Icon})=><button key={id} className={active===id?'active':''} onClick={()=>onSelect(id)}><Icon size={16}/><span>{label}</span></button>)}</div></div>
}

function CEOChat({onNavigate,onDepartment}:{onNavigate:(view:View)=>void;onDepartment:(id:string)=>void}) {
  const [input,setInput] = useState('')
  const [depth,setDepth] = useState<'Rápido'|'Detallado'|'Profundo'>('Detallado')
  const [lastQuery,setLastQuery] = useState('')
  const [showDiagnostic,setShowDiagnostic] = useState(false)

  const send = () => {
    const text = input.trim()
    if (!text) return
    setLastQuery(text)
    setShowDiagnostic(true)
    setInput('')
  }

  const prompt = (text:string) => setInput(text)

  return (
    <section className="ceo-chat-shell">
      <div className="ceo-contextbar">
        <div className="ceo-crown"><Crown size={24}/></div>
        <span className="ceo-online-dot"/>
        <button className="ceo-company"><Building2 size={15}/><b>Aurora Dynamics</b><ChevronDown size={15}/></button>
        <button className="ceo-context-action"><Bell size={17}/><i/></button>
        <button className="ceo-context-action"><Grid3X3 size={17}/></button>
      </div>

      <div className="ceo-thread">
        <article className="ceo-daily">
          <div className="daily-title">
            <span className="daily-orb"><Sparkles size={22}/></span>
            <div><h1>CEO Daily Brief</h1><p>Buenos días, este es el estado de tu empresa hoy.</p></div>
          </div>

          <div className="daily-grid">
            <DailyMetric icon={<ClipboardCheck size={18}/>} label="Tareas críticas" value="4" tone="amber"/>
            <DailyMetric icon={<ReceiptText size={18}/>} label="Facturas vencidas" value="6" tone="rose"/>
            <DailyMetric icon={<FileText size={18}/>} label="Contratos por vencer" value="0" tone="emerald"/>
            <DailyMetric icon={<Boxes size={18}/>} label="Inventario bajo" value="2" tone="amber"/>
            <DailyMetric icon={<Activity size={18}/>} label="Ingresos del mes" value="$284,823" tone="emerald" wide/>
            <DailyMetric icon={<WalletCards size={18}/>} label="Por cobrar" value="$203,290" tone="amber" wide/>
          </div>

          <div className="today-priorities">
            <div><span>⚠</span><b>Prioridades de hoy</b></div>
            <p>• 6 factura(s) vencida(s) por gestionar</p>
            <p>• 2 producto(s) con inventario bajo</p>
            <p>• 4 tarea(s) crítica(s) pendiente(s)</p>
          </div>

          <div className="ceo-module-actions">
            <button onClick={()=>onNavigate('dashboard')}><CircleGauge size={17}/>Dashboard ejecutivo</button>
            <button onClick={()=>onDepartment('finanzas')}><WalletCards size={17}/>Ver finanzas</button>
            <button onClick={()=>onDepartment('proyectos')}><ClipboardCheck size={17}/>Tareas</button>
          </div>
        </article>

        {lastQuery && <div className="ceo-user-message"><span>{lastQuery}</span></div>}
        {showDiagnostic && <ExecutiveDiagnostic onDepartment={onDepartment}/>}
      </div>

      <div className="ceo-prompt-strip">
        <button onClick={()=>prompt('¿Cómo vamos este mes?')}><Zap size={14}/>¿Cómo vamos este mes?</button>
        <button onClick={()=>prompt('Crea un empleado')}><Zap size={14}/>Crea un empleado</button>
        <button onClick={()=>prompt('Actualiza inventario')}><Zap size={14}/>Actualiza inventario</button>
      </div>

      <div className="ceo-composer-wrap">
        <div className="depth-row">
          <span>Profundidad:</span>
          {(['Rápido','Detallado','Profundo'] as const).map(mode=><button key={mode} className={depth===mode?'active':''} onClick={()=>setDepth(mode)}>{mode}</button>)}
        </div>
        <div className="ceo-composer">
          <button className="attach"><Paperclip size={21}/></button>
          <textarea placeholder="Pregúntale a WAE..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/>
          <button className="voice"><Mic size={20}/></button>
          <button className="ceo-send" onClick={send}><Send size={19}/></button>
        </div>
        <p className="ceo-capability-note">CEO Chat puede crear empleados, productos, clientes y tareas; consultar módulos y coordinar acciones. Verifica información crítica y no inventa datos.</p>
      </div>
    </section>
  )
}

function DailyMetric({icon,label,value,tone,wide}:{icon:ReactNode;label:string;value:string;tone:string;wide?:boolean}) {
  return <div className={`daily-metric ${tone} ${wide?'wide':''}`}><span className="daily-icon">{icon}</span><div><span>{label}</span><b>{value}</b></div></div>
}

function ExecutiveDiagnostic({onDepartment}:{onDepartment:(id:string)=>void}) {
  return (
    <article className="exec-diagnostic">
      <span className="risk-critical">● Riesgo: crítico</span>
      <h2>Diagnóstico Ejecutivo<br/>360°</h2>
      <p className="exec-subtitle">Lectura consolidada de tu empresa · Área más comprometida: Finanzas y cobranza</p>
      <div className="exec-meta"><span>Confiabilidad: <b>Alta</b></span><span>Fuente: <b>WAE Tools + base de datos</b></span></div>
      <h3>Estado general</h3>
      <p className="exec-copy">La mayor presión está en <b>finanzas y cobranza</b> con <b>$199,879</b> en facturas vencidas que están afectando tu liquidez. Adicionalmente, tienes <b>2 producto(s)</b> con inventario crítico y <b>2 tarea(s) crítica(s)</b> que requieren atención.</p>
      <div className="diagnostic-kpis"><div className="amber"><span>Flujo por cobrar</span><b>$403,169</b></div><div className="rose"><span>Facturas vencidas</span><b>6</b></div></div>
      <div className="recommendation-card">
        <h3>Recomendaciones inmediatas</h3>
        {['Cobrar $199,879 en cartera vencida','Reabastecer 2 producto(s) crítico(s)','Atender 2 tarea(s) crítica(s)','Mantener calendario legal al día','Mantener satisfacción del cliente'].map((text,i)=><div className="recommendation-row" key={text}><span>{i+1}</span><p>{text}</p></div>)}
        <div className="recommendation-actions">
          <button onClick={()=>onDepartment('finanzas')}><CircleGauge size={17}/>Detalle financiero</button>
          <button onClick={()=>onDepartment('proyectos')}><FileText size={17}/>Plan de acción</button>
          <button onClick={()=>onDepartment('legal')}><Activity size={17}/>Ver riesgos legales</button>
          <button onClick={()=>onDepartment('proyectos')}><ClipboardCheck size={17}/>Asignar tareas</button>
        </div>
      </div>
      <div className="response-tools"><span>🔊</span><ChevronDown size={15}/><Mic size={18}/></div>
    </article>
  )
}

function PageHead({eyebrow,title,subtitle,action}:{eyebrow?:string;title:string;subtitle:string;action?:string}){
  return <div className="page-head"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{action&&<button className="primary"><Plus size={16}/>{action}</button>}</div>
}

function Dashboard({onDepartment}:{onDepartment:(id:string)=>void}){
  return <>
    <PageHead eyebrow="CENTRO DE MANDO" title="Dashboard ejecutivo" subtitle="Vista secundaria del CEO Chat para profundizar en KPIs, operación y riesgos." />
    <div className="metric-grid">{executiveMetrics.map((m,i)=>{const Icon=m.icon; return <div className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><Icon size={18}/></div><strong>{m.value}</strong><small>{m.delta}</small><div className="sparkline" aria-hidden>{Array.from({length:12}).map((_,j)=><i key={j} style={{height:`${22+((i*17+j*11)%54)}%`}}/>)}</div></div>})}</div>
    <div className="dashboard-columns">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">INTELIGENCIA CORPORATIVA</span><h2>Directores AI</h2></div><button className="text-btn">Ver 22 <ChevronRight size={15}/></button></div><div className="director-grid">{departments.filter(d=>d.id!=='ceo').slice(0,8).map(d=>{const Icon=d.icon; return <button key={d.id} className="director-card" onClick={()=>onDepartment(d.id)}><span className={`dept-icon ${d.tone}`}><Icon size={20}/></span><div><b>{d.agent}</b><small>{d.role}</small></div><ChevronRight size={16}/></button>})}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">ESTADO GENERAL</span><h2>Riesgos y operación</h2></div><span className="health">93% saludable</span></div><div className="risk-grid">{riskMetrics.map(r=><div key={r.label}><span>{r.label}</span><b>{r.value}</b></div>)}</div><div className="alert-card"><div className="alert-icon"><Activity size={18}/></div><div><b>2 asuntos requieren atención</b><p>Liquidez proyectada y vencimientos contractuales.</p></div></div></section>
    </div>
    <section className="panel intelligence-strip"><div><BrainCircuit size={19}/><div><b>Cognitive Core v1.1</b><small>Memoria + RAG + router multi-modelo + contexto sectorial.</small></div></div><span>Tenant scoped</span><span>Evidence aware</span><span>Provider agnostic</span></section>
  </>
}

function Companies(){return <><PageHead title="Empresas" subtitle="Multiempresa y multi-sector: cada selección reconfigura KPIs, procesos, riesgos, documentos, normativa y agentes." action="Nueva empresa"/><div className="mini-metrics"><Mini label="Empresas" value="3"/><Mini label="Sucursales" value="4"/><Mini label="Empleados" value="10"/><Mini label="Perfiles sectoriales" value="15"/></div><section className="panel form-panel"><h2>Configuración empresarial</h2><div className="form-grid"><Field label="Nombre comercial" value="Aurora Dynamics"/><Field label="Razón social" value="Aurora Dynamics S.A. de C.V."/><Field label="RFC" value="AUR260101AA1"/><Field label="Tenant" value="aurora-dynamics"/></div><button className="primary">Guardar empresa</button></section><SectorContextPanel/></>}

function DepartmentView({department:d}:{department:Department}){const Icon=d.icon;return <><PageHead eyebrow={`${d.agent} · ${d.role}`} title={d.name} subtitle={`${d.description} El CEO Chat puede consultar y coordinar este módulo usando contexto, permisos y evidencia.`}/><div className="department-hero"><span className={`hero-icon ${d.tone}`}><Icon size={30}/></span><div><small>DIRECTOR ACTIVO</small><h2>{d.agent}</h2><p>{d.role}</p></div><span className="online"><i/> En línea</span></div><div className="dashboard-columns"><section className="panel"><div className="panel-tabs"><button className="active">Dashboard</button><button>Automatizaciones</button><button>Integraciones</button></div><h2>Capacidades</h2><div className="cap-list">{d.capabilities.map(c=><div key={c}><Zap size={16}/><span>{c}</span><b>Activo</b></div>)}</div></section><section className="panel"><div className="panel-head"><h2>Automatizaciones</h2><span className="pill">{d.automations.length} activas</span></div><div className="automation-list">{d.automations.map((a,i)=><div key={a}><span className="automation-index">0{i+1}</span><div><b>{a}</b><small>Validación → permisos → evidencia → auditoría</small></div><span className="toggle on"/></div>)}</div></section></div><section className="panel integration-panel"><div className="panel-head"><div><span className="eyebrow">COLABORACIÓN MULTIAGENTE</span><h2>Conexiones del departamento</h2></div></div><div className="chip-row">{departments.filter(x=>x.id!==d.id&&x.id!=='ceo').slice(0,7).map(x=><span key={x.id}>{x.agent}</span>)}</div></section></>}

function Projects(){return <><PageHead title="Proyectos" subtitle="Gestión por Kanban, cronogramas, entregables, presupuesto y riesgos." action="Nuevo proyecto"/><div className="mini-metrics"><Mini label="Proyectos" value="5"/><Mini label="En curso" value="3"/><Mini label="Presupuesto total" value="$860,000"/><Mini label="Gastado" value="$392,000"/></div><section className="panel"><h2>Portafolio activo</h2><Project name="Auditoría ISO 27001" status="On Hold" progress={62}/><Project name="Rediseño de producto" status="En progreso" progress={78}/><Project name="Automatización comercial" status="En progreso" progress={44}/></section></>}

function Analytics(){return <><PageHead eyebrow="INSIGHT · Business Intelligence AI" title="Analítica Empresarial" subtitle="Resumen ejecutivo y operación sobre datos agregados de todas las entidades."/><div className="metric-grid">{executiveMetrics.map(m=><div className="metric-card" key={m.label}><span>{m.label}</span><strong>{m.value}</strong><small>{m.delta}</small></div>)}</div><section className="panel"><div className="panel-head"><h2>Tendencia de negocio</h2><span className="pill">Actualizado ahora</span></div><div className="big-chart">{Array.from({length:24}).map((_,i)=><i key={i} style={{height:`${20+((i*23)%72)}%`}}/>)}</div></section></>}

function POSDashboard(){return <><PageHead eyebrow="POS ENTERPRISE" title="Dashboard POS" subtitle="Ventas, terminales, sesiones, devoluciones y operación de punto de venta."/><div className="mini-metrics"><Mini label="Ventas hoy" value="$18,420"/><Mini label="Tickets" value="46"/><Mini label="Terminales" value="2"/><Mini label="Devoluciones" value="1"/></div><section className="panel"><div className="panel-head"><h2>Actividad del punto de venta</h2><span className="health">Operativo</span></div><div className="big-chart">{Array.from({length:18}).map((_,i)=><i key={i} style={{height:`${28+((i*19)%58)}%`}}/>)}</div></section></>}

function Documents(){return <><PageHead title="Documentos Inteligentes" subtitle="Ingesta multimodal, extracción, análisis, RAG con citas, riesgos y conversación sobre evidencia." action="Subir documento"/><div className="mini-metrics"><Mini label="Documentos" value="0"/><Mini label="Procesados" value="0"/><Mini label="En proceso" value="0"/><Mini label="Con riesgos" value="0"/></div><div className="dashboard-columns"><section className="panel"><h2>Pipeline automático</h2><div className="pipeline-list"><div><span>01</span><b>Ingesta</b><ChevronRight size={14}/></div><div><span>02</span><b>Extracción / OCR</b><ChevronRight size={14}/></div><div><span>03</span><b>Clasificación + embeddings</b><ChevronRight size={14}/></div><div><span>04</span><b>Resumen + riesgos + Q&A</b><ChevronRight size={14}/></div></div></section><MultimodalSupport/></div></>}

function Training(){return <><PageHead title="Capacitación" subtitle="Cursos, evaluaciones, certificaciones y material corporativo indexable."/><section className="panel"><div className="panel-tabs"><button>Catálogo</button><button>Inscripciones</button><button className="active">Certificados</button></div><div className="empty-state"><GraduationCap size={34}/><b>Sin certificados emitidos</b><p>Los certificados se generan al completar cursos con certificación.</p></div></section></>}

function Platform(){return <><PageHead title="Centro de Plataforma" subtitle="Configuración, usuarios, roles, equipos, seguridad, licencias, flags y auditoría."/><div className="platform-grid">{['Configuración','Usuarios','Roles','Equipos','API Keys','Feature Flags','Licencias','Eventos'].map(x=><button key={x}><Settings2 size={17}/><span>{x}</span><ChevronRight size={15}/></button>)}</div><section className="panel form-panel"><h2>Variable empresarial</h2><div className="form-grid"><Field label="Key" value="finance.tax_rate"/><Field label="Valor" value="16"/><Field label="Tipo" value="number"/><Field label="Scope" value="Empresa"/></div><button className="primary">Guardar</button></section></>}

function Workspace(){return <><PageHead title="WAE Workspace" subtitle="Editor universal: documento, IA, outline, versiones y autosave en el mismo flujo."/><div className="workspace-evolved"><aside className="workspace-outline panel"><span className="eyebrow">OUTLINE</span><button className="active">WAE OS Enterprise</button><button>Arquitectura</button><button>Operaciones</button><button>Riesgos</button><hr/><small>v12 · guardado automático</small></aside><section className="workspace panel"><div className="workspace-toolbar"><button>H1</button><button>H2</button><button>• Lista</button><button>✓ Tarea</button><button>Tabla</button><button>Adjuntar</button><span>Autosave ✓</span></div><textarea defaultValue={'WAE OS Enterprise\n\nSistema operativo empresarial\n\n22 departamentos coordinados por inteligencia artificial.\n\nEl editor conserva formato, historial de versiones y permite seguir conversando con la IA mientras se trabaja.'}/></section><aside className="workspace-ai panel"><div className="ai-orb"><Sparkles size={17}/></div><b>IA del documento</b><p>Selecciona texto o solicita análisis sobre el documento abierto.</p><button>Resumir</button><button>Detectar riesgos</button><button>Convertir en tareas</button><button>Buscar evidencia</button></aside></div></>}

function Knowledge(){return <><PageHead title="Memoria Empresarial" subtitle="Biblioteca corporativa inteligente con búsqueda híbrida, semántica, citas y aislamiento por tenant/departamento/agente."/><section className="panel"><div className="searchbox knowledge-search"><Search size={16}/><input placeholder="Buscar con lenguaje natural en la base corporativa..."/></div><div className="knowledge-list">{['Manual de operación','Políticas corporativas','Contratos marco','Procedimientos financieros','Kit de marketing','Normativa y compliance'].map(x=><div key={x}><FileText size={17}/><span>{x}</span><small>Indexado · citable</small></div>)}</div></section><KnowledgeGovernance/></>}

function Cognitive(){return <><PageHead eyebrow="INFRAESTRUCTURA COGNITIVA" title="WAE Cognitive Core" subtitle="Memoria empresarial, RAG, router multi-modelo, Document Intelligence, caché segura y presupuesto dinámico de contexto."/><CognitiveCore/></>}

const Mini=({label,value}:{label:string;value:string})=><div className="mini-card"><span>{label}</span><b>{value}</b></div>
const Field=({label,value}:{label:string;value:string})=><label className="field"><span>{label}</span><input defaultValue={value}/></label>
const Project=({name,status,progress}:{name:string;status:string;progress:number})=><div className="project-row"><div><b>{name}</b><small>Legal · Kanban · vence 14 dic</small></div><span className="pill">{status}</span><div className="progress"><i style={{width:`${progress}%`}}/></div><b>{progress}%</b></div>

export default App
