import { useMemo, useState } from 'react'
import {
  BarChart3, BookOpen, Bot, FileText, Gauge, Link2, MessageSquareText,
  Mic, Paperclip, Send, Sparkles, WandSparkles, Workflow, Zap,
} from 'lucide-react'
import type { Department } from './data'
import './department-agent.css'

type AgentTab = 'chat'|'documents'|'knowledge'|'capabilities'|'dashboard'|'automations'|'integrations'

type Props = {
  department: Department
  documents?: string[]
  knowledge?: string[]
  suggestions?: string[]
  onOpenWorkspace: (title:string, body?:string)=>void
}

const defaultDocuments = (name:string) => [
  `Manual operativo · ${name}`,
  `Política y controles · ${name}`,
  `Reporte ejecutivo · ${name}`,
  `Checklist de cierre · ${name}`,
  `Procedimiento de excepciones · ${name}`,
]

const defaultKnowledge = (name:string) => [
  `Políticas corporativas aplicables a ${name}`,
  `Procedimientos internos de ${name}`,
  'Matriz de autorizaciones y segregación de funciones',
  'Normativa, contratos y evidencia autorizada',
  'Histórico de decisiones y métricas del departamento',
]

export default function DepartmentAgentWorkspace({department,documents,knowledge,suggestions,onOpenWorkspace}:Props){
  const [tab,setTab] = useState<AgentTab>('chat')
  const [input,setInput] = useState('')
  const [messages,setMessages] = useState<{role:'ai'|'user';text:string}[]>([])
  const docs = documents ?? defaultDocuments(department.name)
  const kb = knowledge ?? defaultKnowledge(department.name)
  const quick = suggestions ?? [
    `Analiza el estado de ${department.name.toLowerCase()}`,
    'Detecta riesgos y pendientes críticos',
    'Propón un plan de acción priorizado',
  ]

  const integrations = useMemo(()=>[
    'CEO Chat','Supabase aislado','Workspace','Documentos IA','Auditoría','Notificaciones',
  ],[])

  const send=()=>{
    const text=input.trim(); if(!text)return
    setMessages(v=>[...v,{role:'user',text},{role:'ai',text:`${department.agent} recibió la instrucción. Validaré contexto, permisos, evidencia y dependencias antes de proponer o ejecutar una acción en ${department.name}.`}])
    setInput('')
  }

  return <section className={`dept-agent dept-agent-${department.tone}`}>
    <header className="dept-agent-head">
      <div className="dept-agent-orb"><Bot size={22}/></div>
      <div><div className="dept-agent-title"><b>{department.agent}</b><i/></div><p>{department.role} · {department.name}</p></div>
    </header>

    <div className="dept-agent-tabs" role="tablist">
      <AgentTabButton active={tab==='chat'} onClick={()=>setTab('chat')} icon={<MessageSquareText size={16}/>} label="Chat"/>
      <AgentTabButton active={tab==='documents'} onClick={()=>setTab('documents')} icon={<FileText size={16}/>} label="Documentos"/>
      <AgentTabButton active={tab==='knowledge'} onClick={()=>setTab('knowledge')} icon={<BookOpen size={16}/>} label="Conocimiento"/>
      <AgentTabButton active={tab==='capabilities'} onClick={()=>setTab('capabilities')} icon={<Zap size={16}/>} label="Capacidades"/>
      <AgentTabButton active={tab==='dashboard'} onClick={()=>setTab('dashboard')} icon={<BarChart3 size={16}/>} label="Dashboard"/>
      <AgentTabButton active={tab==='automations'} onClick={()=>setTab('automations')} icon={<Workflow size={16}/>} label="Automatizaciones"/>
      <AgentTabButton active={tab==='integrations'} onClick={()=>setTab('integrations')} icon={<Link2 size={16}/>} label="Integraciones"/>
    </div>

    {tab==='chat'&&<div className="dept-agent-chat">
      <div className="dept-agent-thread">
        {messages.length===0?<div className="dept-agent-welcome"><Sparkles size={24}/><p>Inicia una conversación con <b>{department.agent}</b></p>{quick.map(q=><button key={q} onClick={()=>setInput(q)}><Zap size={14}/>{q}</button>)}</div>:
          messages.map((m,i)=><div key={i} className={`dept-agent-message ${m.role}`}>{m.text}</div>)}
      </div>
      <div className="dept-agent-composer"><button><Paperclip size={18}/></button><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={`Consulta a ${department.agent}...`} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button><Mic size={18}/></button><button className="agent-send" onClick={send}><Send size={17}/></button></div>
    </div>}

    {tab==='documents'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><FileText size={18}/><div><b>Biblioteca documental de {department.name}</b><span>{docs.length} plantillas listas para generar y editar</span></div></div>{docs.map(doc=><div className="dept-doc-row" key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>onOpenWorkspace(doc,`# ${doc}\n\nDocumento generado desde ${department.agent}.\n\n## Objetivo\n\n## Alcance\n\n## Datos y evidencia\n\n## Desarrollo\n\n## Aprobaciones\n`)}>Editar en Workspace</button></div>)}</div>}

    {tab==='knowledge'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><BookOpen size={18}/><div><b>Base de conocimiento</b><span>Contexto autorizado para {department.agent}</span></div></div>{kb.map(item=><div className="dept-knowledge-row" key={item}><BookOpen size={16}/><span>{item}</span><small>Indexado · citable</small></div>)}</div>}

    {tab==='capabilities'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><WandSparkles size={18}/><div><b>Capacidades de {department.agent}</b><span>Herramientas especializadas del departamento</span></div></div>{department.capabilities.map(cap=><div className="dept-cap-row" key={cap}><Zap size={17}/><span>{cap}</span><b>Activo</b></div>)}</div>}

    {tab==='dashboard'&&<div className="dept-agent-dashboard"><div className="dept-dash-card"><Gauge size={18}/><span>Salud operativa</span><b>93%</b></div><div className="dept-dash-card"><Workflow size={18}/><span>Automatizaciones</span><b>{department.automations.length}</b></div><div className="dept-dash-card"><FileText size={18}/><span>Documentos</span><b>{docs.length}</b></div><div className="dept-dash-card"><Sparkles size={18}/><span>Agente</span><b>En línea</b></div><div className="dept-dashboard-placeholder"><BarChart3 size={28}/><b>Dashboard especializado de {department.name}</b><p>KPIs, alertas, anomalías y decisiones recomendadas por {department.agent}.</p></div></div>}

    {tab==='automations'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><Workflow size={18}/><div><b>Automatizaciones</b><span>Flujos gobernados del departamento</span></div></div>{department.automations.map((a,i)=><div className="dept-auto-row" key={a}><span>{String(i+1).padStart(2,'0')}</span><div><b>{a}</b><small>Validación → permisos → ejecución → auditoría</small></div><i/></div>)}</div>}

    {tab==='integrations'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><Link2 size={18}/><div><b>Integraciones del módulo</b><span>Conexiones autorizadas y colaboración multiagente</span></div></div><div className="dept-integration-grid">{integrations.map(x=><span key={x}>{x}</span>)}{department.id!=='finanzas'&&<span>STERLING</span>}{department.id!=='rrhh'&&<span>TALENT</span>}{department.id!=='inventarios'&&<span>MERIDIAN</span>}</div></div>}
  </section>
}

function AgentTabButton({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:React.ReactNode;label:string}){
  return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>
}
