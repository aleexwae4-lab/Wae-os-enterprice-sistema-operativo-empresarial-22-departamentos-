import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3, BookOpen, Bot, FileText, Gauge, Link2, MessageSquareText,
  Mic, Paperclip, Send, Sparkles, Volume2, VolumeX, WandSparkles, Workflow, Zap,
} from 'lucide-react'
import type { Department } from './data'
import { buildDepartmentExpertResponse, expertModePrompts } from './departmentExpertEngine'
import { streamEnterprise22Expert, type ExpertHistoryMessage } from './enterprise22AiClient'
import { loadLatestEnterprise22Conversation, useEnterprise22PrivateSession } from './lib/enterprise22PrivateSession'
import './department-agent.css'
import './department-agent-expert.css'
import { usePremiumVoice } from './usePremiumVoice'

type AgentTab = 'chat'|'documents'|'knowledge'|'capabilities'|'dashboard'|'automations'|'integrations'
type RuntimeState='ready'|'cloud'|'private'|'local'|'generating'
type ChatMessage={id:string;role:'ai'|'user';text:string;pending?:boolean;source?:'cloud'|'private'|'local'}

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
  const [messages,setMessages] = useState<ChatMessage[]>([])
  const [runtime,setRuntime]=useState<RuntimeState>('ready')
  const [busy,setBusy]=useState(false)
  const [conversationId,setConversationId]=useState<string|null>(null)
  const loadedPrivateKey=useRef('')
  const privateState=useEnterprise22PrivateSession()
  const voice=usePremiumVoice(setInput)
  const docs = documents ?? defaultDocuments(department.name)
  const kb = knowledge ?? defaultKnowledge(department.name)
  const expertModes = useMemo(()=>expertModePrompts(department),[department])
  const quick = suggestions ?? [
    `Analiza el estado de ${department.name.toLowerCase()}`,
    'Detecta riesgos y pendientes críticos',
    'Propón un plan de acción priorizado',
  ]

  const integrations = useMemo(()=>[
    'CEO Chat','Supabase aislado','Workspace','Documentos IA','Auditoría','Notificaciones',
  ],[])

  useEffect(()=>{
    if(privateState.status!=='private'||!privateState.context?.company.id){loadedPrivateKey.current='';setConversationId(null);return}
    const key=`${privateState.context.company.id}:${department.id}`
    if(loadedPrivateKey.current===key)return
    loadedPrivateKey.current=key
    let alive=true
    void loadLatestEnterprise22Conversation(department.id).then(conversation=>{
      if(!alive)return
      if(!conversation){setConversationId(null);setMessages([]);return}
      setConversationId(conversation.id)
      setMessages(conversation.messages.map(message=>({id:message.id,role:message.role==='assistant'?'ai':'user',text:message.content,source:'private'})))
      setRuntime('private')
    }).catch(()=>{if(alive)setConversationId(null)})
    return()=>{alive=false}
  },[privateState.status,privateState.context?.company.id,department.id])

  const sendText=async(raw:string)=>{
    const text=raw.trim(); if(!text||busy)return
    const history:ExpertHistoryMessage[]=messages.filter(m=>!m.pending&&m.text.trim()).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))
    const userId=`u-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
    const aiId=`a-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
    const privateAccess=privateState.status==='private'&&privateState.context?.company.id&&privateState.accessToken
      ?{accessToken:privateState.accessToken,companyId:privateState.context.company.id,conversationId}
      :undefined
    setInput('');setBusy(true);setRuntime('generating')
    setMessages(v=>[...v,{id:userId,role:'user',text},{id:aiId,role:'ai',text:'',pending:true}])
    try{
      const result=await streamEnterprise22Expert({department,input:text,history,privateAccess,onDelta:chunk=>setMessages(v=>v.map(m=>m.id===aiId?{...m,text:m.text+chunk,pending:true,source:privateAccess?'private':'cloud'}:m))})
      if(result.conversationId)setConversationId(result.conversationId)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,pending:false,source:result.runtime}:m));setRuntime(result.runtime==='private'?'private':'cloud');voice.speak(result.content)
    }catch{
      const fallback=buildDepartmentExpertResponse(department,text)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,text:fallback,pending:false,source:'local'}:m));setRuntime('local');voice.speak(fallback)
    }finally{setBusy(false)}
  }
  const send=()=>{void sendText(input)}
  const runtimeLabel=runtime==='generating'?'Generando…':runtime==='private'?'Private AI':runtime==='cloud'?'WAE AI conectado':runtime==='local'?'Continuidad local':'WAE AI'
  const privacyNote=privateState.status==='private'
    ?`Contexto privado · ${privateState.context?.company.name} · RLS + memoria por empresa`
    :'Runtime efímero · activa Private AI para memoria y contexto empresarial.'

  return <section className={`dept-agent dept-agent-${department.tone}`}>
    <header className="dept-agent-head">
      <div className="dept-agent-orb"><Bot size={22}/></div>
      <div><div className="dept-agent-title"><b>{department.agent}</b><i/></div><p>{department.role} · {department.name}</p></div>
      <span className={`dept-agent-runtime ${runtime}`}>{runtimeLabel}</span>
    </header>

    <div className="dept-agent-expertbar">
      <div className="dept-agent-expert-id"><Sparkles size={13}/><span><b>{privateState.status==='private'?'PRIVATE EXPERT MODE':'EXPERT MODE'}</b><small>{privateState.status==='private'?`Contexto autorizado de ${privateState.context?.company.name}`:`Especialista en ${department.name} · explica, diseña, enseña y diagnostica`}</small></span></div>
      <div className="dept-agent-expert-actions">
        {['Explicar','Estrategia','Plan','Capacitar'].map((label,i)=><button key={label} onClick={()=>setInput(expertModes[i])}>{label}</button>)}
      </div>
    </div>

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
        {messages.length===0?<div className="dept-agent-welcome"><Sparkles size={24}/><p>Habla con <b>{department.agent}</b> como con un especialista de {department.name}.</p><small className="dept-agent-welcome-copy">{privateState.status==='private'?`Está autorizado para usar el contexto privado de ${privateState.context?.company.name} dentro de este módulo.`:'Pregunta conceptos, pide una estrategia, un plan, una capacitación o trae un problema real para diagnosticar.'}</small>{quick.map(q=><button key={q} onClick={()=>setInput(q)}><Zap size={14}/>{q}</button>)}</div>:
          messages.map(m=><div key={m.id} className={`dept-agent-message ${m.role} ${m.pending?'pending':''}`}>{m.text||<span className="dept-agent-thinking"><i/><i/><i/></span>}</div>)}
      </div>
      <div className="dept-agent-composer"><button aria-label="Adjuntar"><Paperclip size={18}/></button><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={`Pregunta a ${department.agent} sobre ${department.name}...`} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button className={voice.listening?'listening':''} aria-label={voice.supported?'Dictar mensaje':'Dictado no disponible'} onClick={voice.toggleListening} disabled={!voice.supported}><Mic size={18}/></button><button aria-label={voice.enabled?'Desactivar respuestas por voz':'Activar respuestas por voz'} onClick={()=>voice.setEnabled(!voice.enabled)}>{voice.enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button className="agent-send" onClick={send} aria-label="Enviar" disabled={busy}><Send size={17}/></button></div>
      <div className="dept-agent-privacy-note">{privacyNote}</div>
    </div>}

    {tab==='documents'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><FileText size={18}/><div><b>Biblioteca documental de {department.name}</b><span>{docs.length} plantillas listas para generar y editar</span></div></div>{docs.map(doc=><div className="dept-doc-row" key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>onOpenWorkspace(doc,`# ${doc}\n\nDocumento generado desde ${department.agent}.\n\n## Objetivo\n\n## Alcance\n\n## Datos y evidencia\n\n## Desarrollo\n\n## Aprobaciones\n`)}>Editar en Workspace</button></div>)}</div>}

    {tab==='knowledge'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><BookOpen size={18}/><div><b>Base de conocimiento</b><span>Contexto autorizado para {department.agent}</span></div></div>{kb.map(item=><div className="dept-knowledge-row" key={item}><BookOpen size={16}/><span>{item}</span><small>{privateState.status==='private'?'Privado · tenant aislado':'Indexado · citable'}</small></div>)}</div>}

    {tab==='capabilities'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><WandSparkles size={18}/><div><b>Capacidades de {department.agent}</b><span>Herramientas especializadas del departamento</span></div></div>{department.capabilities.map(cap=><div className="dept-cap-row" key={cap}><Zap size={17}/><span>{cap}</span><b>Activo</b></div>)}</div>}

    {tab==='dashboard'&&<div className="dept-agent-dashboard"><div className="dept-dash-card"><Gauge size={18}/><span>Salud operativa</span><b>93%</b></div><div className="dept-dash-card"><Workflow size={18}/><span>Automatizaciones</span><b>{department.automations.length}</b></div><div className="dept-dash-card"><FileText size={18}/><span>Documentos</span><b>{docs.length}</b></div><div className="dept-dash-card"><Sparkles size={18}/><span>Agente</span><b>{privateState.status==='private'?'Private AI':'Expert Mode'}</b></div><div className="dept-dashboard-placeholder"><BarChart3 size={28}/><b>Dashboard especializado de {department.name}</b><p>KPIs, alertas, anomalías y decisiones recomendadas por {department.agent}.</p></div></div>}

    {tab==='automations'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><Workflow size={18}/><div><b>Automatizaciones</b><span>Flujos gobernados del departamento</span></div></div>{department.automations.map((a,i)=><div className="dept-auto-row" key={a}><span>{String(i+1).padStart(2,'0')}</span><div><b>{a}</b><small>Validación → permisos → ejecución → auditoría</small></div><i/></div>)}</div>}

    {tab==='integrations'&&<div className="dept-agent-list-view"><div className="dept-agent-section-title"><Link2 size={18}/><div><b>Integraciones del módulo</b><span>Conexiones autorizadas y colaboración multiagente</span></div></div><div className="dept-integration-grid">{integrations.map(x=><span key={x}>{x}</span>)}{department.id!=='finanzas'&&<span>STERLING</span>}{department.id!=='rrhh'&&<span>TALENT</span>}{department.id!=='inventarios'&&<span>MERIDIAN</span>}</div></div>}
  </section>
}

function AgentTabButton({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:React.ReactNode;label:string}){
  return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>
}
