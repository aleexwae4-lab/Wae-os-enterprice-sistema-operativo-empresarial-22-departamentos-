import { useMemo, useState } from 'react'
import {
  Activity, Bell, Bot, Building2, ChevronDown, ChevronRight, CircleGauge, Command,
  FileText, FolderKanban, GraduationCap, LayoutDashboard, Menu, MessageSquareText,
  Plus, Search, Settings2, Sparkles, X, Zap,
} from 'lucide-react'
import { departments, executiveMetrics, riskMetrics, type Department } from './data'

type View = 'dashboard' | 'empresas' | 'departments' | 'projects' | 'analytics' | 'documents' | 'training' | 'platform' | 'workspace' | 'knowledge'

const navItems: {id:View; label:string; icon:any}[] = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'empresas',label:'Empresas',icon:Building2},
  {id:'projects',label:'Proyectos',icon:FolderKanban},
  {id:'analytics',label:'Analítica',icon:CircleGauge},
]

const intelligenceItems: {id:View; label:string; icon:any}[] = [
  {id:'workspace',label:'Workspace',icon:MessageSquareText},
  {id:'knowledge',label:'Memoria Empresarial',icon:Bot},
  {id:'documents',label:'Documentos IA',icon:FileText},
  {id:'training',label:'Capacitación',icon:GraduationCap},
  {id:'platform',label:'Centro de Plataforma',icon:Settings2},
]

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [departmentId, setDepartmentId] = useState('ceo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [query, setQuery] = useState('')
  const department = departments.find(d => d.id === departmentId)!

  const page = useMemo(() => {
    if (view === 'dashboard') return <Dashboard onDepartment={(id)=>{setDepartmentId(id);setView('departments')}} />
    if (view === 'empresas') return <Companies />
    if (view === 'projects') return <Projects />
    if (view === 'analytics') return <Analytics />
    if (view === 'documents') return <Documents />
    if (view === 'training') return <Training />
    if (view === 'platform') return <Platform />
    if (view === 'workspace') return <Workspace />
    if (view === 'knowledge') return <Knowledge />
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
        <button className="company-switcher">
          <div className="avatar">A</div>
          <div><b>Aurora Dynamics</b><small>Tecnología</small></div>
          <ChevronDown size={16}/>
        </button>
        <div className="nav-scroll">
          <NavSection title="ESTRATÉGICO" items={navItems} active={view} onSelect={setView}/>
          <div className="section-title">OPERACIÓN · 22 DEPARTAMENTOS</div>
          <div className="department-nav">
            {departments.map(d => {
              const Icon = d.icon
              return <button key={d.id} className={view==='departments'&&departmentId===d.id?'active':''} onClick={()=>{setDepartmentId(d.id);setView('departments');setSidebarOpen(false)}}>
                <span className={`mini-icon ${d.tone}`}><Icon size={14}/></span><span>{d.name}</span>
              </button>
            })}
          </div>
          <NavSection title="INTELIGENCIA" items={intelligenceItems} active={view} onSelect={setView}/>
        </div>
        <div className="sidebar-footer"><span className="status-dot"/> IA Core activa <span>v1.0</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="top-left"><button className="icon-btn menu" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button>
            <div className="searchbox"><Search size={16}/><input placeholder="Buscar en toda la empresa" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div>
          </div>
          <div className="top-actions"><button className="icon-btn"><Bell size={18}/><i/></button><span className="ceo-badge">CEO</span></div>
        </header>
        <div className="content">{page}</div>
      </main>

      <button className="ai-fab" onClick={()=>setChatOpen(v=>!v)}><Sparkles size={22}/></button>
      {chatOpen && <AiPanel department={department} onClose={()=>setChatOpen(false)} />}
    </div>
  )
}

function NavSection({title,items,active,onSelect}:{title:string;items:any[];active:View;onSelect:(v:View)=>void}){
  return <div><div className="section-title">{title}</div><div className="nav-group">{items.map(({id,label,icon:Icon})=><button key={id} className={active===id?'active':''} onClick={()=>onSelect(id)}><Icon size={16}/><span>{label}</span></button>)}</div></div>
}

function PageHead({eyebrow,title,subtitle,action}:{eyebrow?:string;title:string;subtitle:string;action?:string}){
  return <div className="page-head"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{action&&<button className="primary"><Plus size={16}/>{action}</button>}</div>
}

function Dashboard({onDepartment}:{onDepartment:(id:string)=>void}){
  return <>
    <PageHead eyebrow="CENTRO DE MANDO" title="Buenos días, Alex" subtitle="Así está operando Aurora Dynamics en este momento." />
    <div className="metric-grid">{executiveMetrics.map((m,i)=>{const Icon=m.icon; return <div className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><Icon size={18}/></div><strong>{m.value}</strong><small>{m.delta}</small><div className="sparkline" aria-hidden>{Array.from({length:12}).map((_,j)=><i key={j} style={{height:`${22+((i*17+j*11)%54)}%`}}/>)}</div></div>})}</div>
    <div className="dashboard-columns">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">INTELIGENCIA CORPORATIVA</span><h2>Directores AI</h2></div><button className="text-btn">Ver 22 <ChevronRight size={15}/></button></div><div className="director-grid">{departments.slice(0,8).map(d=>{const Icon=d.icon; return <button key={d.id} className="director-card" onClick={()=>onDepartment(d.id)}><span className={`dept-icon ${d.tone}`}><Icon size={20}/></span><div><b>{d.agent}</b><small>{d.role}</small></div><ChevronRight size={16}/></button>})}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">ESTADO GENERAL</span><h2>Riesgos y operación</h2></div><span className="health">93% saludable</span></div><div className="risk-grid">{riskMetrics.map(r=><div key={r.label}><span>{r.label}</span><b>{r.value}</b></div>)}</div><div className="alert-card"><div className="alert-icon"><Activity size={18}/></div><div><b>2 asuntos requieren atención</b><p>Liquidez proyectada y vencimientos contractuales.</p></div></div></section>
    </div>
  </>
}

function Companies(){return <><PageHead title="Empresas" subtitle="Administra múltiples empresas, sucursales y perfiles sectoriales desde un solo panel." action="Nueva empresa"/><div className="mini-metrics"><Mini label="Empresas" value="3"/><Mini label="Sucursales" value="4"/><Mini label="Empleados" value="10"/><Mini label="Sectores" value="1"/></div><section className="panel form-panel"><h2>Nueva empresa</h2><div className="form-grid"><Field label="Nombre comercial" value="Aurora Dynamics"/><Field label="Razón social" value="Aurora Dynamics S.A. de C.V."/><Field label="RFC" value="AUR260101AA1"/><Field label="Sector" value="Tecnología"/></div><button className="primary">Guardar empresa</button></section></>}

function DepartmentView({department:d}:{department:Department}){const Icon=d.icon;return <><PageHead eyebrow={`${d.agent} · ${d.role}`} title={d.name} subtitle={d.description}/><div className="department-hero"><span className={`hero-icon ${d.tone}`}><Icon size={30}/></span><div><small>DIRECTOR ACTIVO</small><h2>{d.agent}</h2><p>{d.role}</p></div><span className="online"><i/> En línea</span></div><div className="dashboard-columns"><section className="panel"><div className="panel-tabs"><button className="active">Dashboard</button><button>Automatizaciones</button><button>Integraciones</button></div><h2>Capacidades</h2><div className="cap-list">{d.capabilities.map(c=><div key={c}><Zap size={16}/><span>{c}</span><b>Activo</b></div>)}</div></section><section className="panel"><div className="panel-head"><h2>Automatizaciones</h2><span className="pill">{d.automations.length} activas</span></div><div className="automation-list">{d.automations.map((a,i)=><div key={a}><span className="automation-index">0{i+1}</span><div><b>{a}</b><small>Configurado y listo para ejecutar</small></div><span className="toggle on"/></div>)}</div></section></div><section className="panel integration-panel"><div className="panel-head"><div><span className="eyebrow">COLABORACIÓN MULTIAGENTE</span><h2>Conexiones del departamento</h2></div></div><div className="chip-row">{departments.filter(x=>x.id!==d.id).slice(0,7).map(x=><span key={x.id}>{x.agent}</span>)}</div></section></>}

function Projects(){return <><PageHead title="Proyectos" subtitle="Gestión por Kanban, cronogramas y entregables." action="Nuevo proyecto"/><div className="mini-metrics"><Mini label="Proyectos" value="5"/><Mini label="En curso" value="3"/><Mini label="Presupuesto total" value="$860,000"/><Mini label="Gastado" value="$392,000"/></div><section className="panel"><h2>Portafolio activo</h2><Project name="Auditoría ISO 27001" status="On Hold" progress={62}/><Project name="Rediseño de producto" status="En progreso" progress={78}/><Project name="Automatización comercial" status="En progreso" progress={44}/></section></>}

function Analytics(){return <><PageHead eyebrow="INSIGHT · Business Intelligence AI" title="Analítica Empresarial" subtitle="Predicciones, machine learning y dashboards ejecutivos."/><div className="metric-grid">{executiveMetrics.map(m=><div className="metric-card" key={m.label}><span>{m.label}</span><strong>{m.value}</strong><small>{m.delta}</small></div>)}</div><section className="panel"><div className="panel-head"><h2>Tendencia de negocio</h2><span className="pill">Actualizado ahora</span></div><div className="big-chart">{Array.from({length:24}).map((_,i)=><i key={i} style={{height:`${20+((i*23)%72)}%`}}/>)}</div></section></>}

function Documents(){return <><PageHead title="Documentos Inteligentes" subtitle="IA multimodal que comprende, resume, detecta riesgos y responde preguntas sobre cualquier documento." action="Subir documento"/><div className="mini-metrics"><Mini label="Documentos" value="0"/><Mini label="Procesados" value="0"/><Mini label="En proceso" value="0"/><Mini label="Con riesgos" value="0"/></div><section className="panel"><h2>Pipeline de análisis automático</h2><div className="chip-row"><span>Subir archivo</span><span>Extracción</span><span>Análisis con IA</span><span>Resumen + Riesgos + Q&A</span></div></section></>}

function Training(){return <><PageHead title="Capacitación" subtitle="Cursos, evaluaciones y desarrollo de personal."/><section className="panel"><div className="panel-tabs"><button>Catálogo</button><button>Inscripciones</button><button className="active">Certificados</button></div><div className="empty-state"><GraduationCap size={34}/><b>Sin certificados emitidos</b><p>Los certificados se generan al completar cursos con certificación.</p></div></section></>}

function Platform(){return <><PageHead title="Centro de Plataforma" subtitle="Configuración, usuarios, roles, equipos, seguridad y licencias."/><div className="platform-grid">{['Configuración','Usuarios','Roles','Equipos','API Keys','Feature Flags','Licencias','Eventos'].map(x=><button key={x}><Settings2 size={17}/><span>{x}</span><ChevronRight size={15}/></button>)}</div><section className="panel form-panel"><h2>Variable empresarial</h2><div className="form-grid"><Field label="Key" value="finance.tax_rate"/><Field label="Valor" value="16"/><Field label="Tipo" value="number"/><Field label="Scope" value="Empresa"/></div><button className="primary">Guardar</button></section></>}

function Workspace(){return <><PageHead title="Workspace" subtitle="Espacio ejecutivo para conversar, escribir, analizar y coordinar trabajo con WAE Intelligence."/><section className="workspace panel"><div className="workspace-toolbar"><button>H1</button><button>H2</button><button>• Lista</button><button>✓ Tarea</button><button>Adjuntar</button></div><textarea defaultValue={'WAE OS Enterprise\n\nSistema operativo empresarial\n\n22 departamentos coordinados por inteligencia artificial.'}/></section></>}

function Knowledge(){return <><PageHead title="Memoria Empresarial" subtitle="Base de conocimiento corporativa con recuperación contextual y aislamiento por empresa."/><section className="panel"><div className="searchbox knowledge-search"><Search size={16}/><input placeholder="Buscar en base de conocimiento..."/></div><div className="knowledge-list">{['Manual de operación','Políticas corporativas','Contratos marco','Procedimientos financieros','Kit de marketing','Normativa y compliance'].map(x=><div key={x}><FileText size={17}/><span>{x}</span><small>Indexado</small></div>)}</div></section></>}

function AiPanel({department,onClose}:{department:Department;onClose:()=>void}){const [input,setInput]=useState(''); const [messages,setMessages]=useState([{role:'ai',text:`Soy ${department.agent}. Puedo analizar ${department.name.toLowerCase()} y coordinarme con los demás departamentos.`}]); const send=()=>{if(!input.trim())return; setMessages([...messages,{role:'user',text:input},{role:'ai',text:'Entendido. Voy a cruzar el contexto empresarial, dependencias y riesgos antes de proponer la acción.'}]);setInput('')}; return <aside className="ai-panel"><div className="ai-head"><div className="ai-orb"><Sparkles size={18}/></div><div><b>WAE Intelligence</b><small>{department.agent} · {department.name}</small></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><div className="ai-modes"><button className="active">Profundidad</button><button>Rápido</button><button>Detallado</button><button>Producto</button></div><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><span>{m.text}</span></div>)}</div><div className="ai-suggestions"><button onClick={()=>setInput('Analiza el estado general de la empresa')}>Estado general</button><button onClick={()=>setInput('Detecta riesgos críticos')}>Riesgos</button></div><div className="composer"><button className="icon-btn"><Plus size={18}/></button><textarea placeholder="Pregúntale a WAE..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button className="send" onClick={send}><Command size={16}/></button></div></aside>}

const Mini=({label,value}:{label:string;value:string})=><div className="mini-card"><span>{label}</span><b>{value}</b></div>
const Field=({label,value}:{label:string;value:string})=><label className="field"><span>{label}</span><input defaultValue={value}/></label>
const Project=({name,status,progress}:{name:string;status:string;progress:number})=><div className="project-row"><div><b>{name}</b><small>Legal · Kanban · vence 14 dic</small></div><span className="pill">{status}</span><div className="progress"><i style={{width:`${progress}%`}}/></div><b>{progress}%</b></div>

export default App
