import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Activity, Bot, BrainCircuit, Check, CheckCircle2, ClipboardCheck, FileText, Gauge, ListChecks, Mic, Paperclip, RefreshCw, Send, ShieldAlert, Volume2, VolumeX, X, Zap } from 'lucide-react'
import { departments } from './data'
import { buildDepartmentExpertResponse } from './departmentExpertEngine'
import { streamEnterprise22Expert, type ExpertHistoryMessage } from './enterprise22AiClient'
import { loadLatestEnterprise22Conversation, useEnterprise22PrivateSession } from './lib/enterprise22PrivateSession'
import './aurora-expert-chat.css'
import { usePremiumVoice } from './usePremiumVoice'

const aurora=departments.find(d=>d.id==='ceo')??departments[0]
type RuntimeState='ready'|'cloud'|'private'|'local'|'generating'
type AnalysisDepth='quick'|'detailed'|'deep'
type ActionCommand={id:string;command_type:string;target_agent:string;risk:string;status:string;approval_required:boolean;approver_role?:string|null;summary:string;correlation_id:string;created_at:string;updated_at:string}
type OperationMeta={operation?:string;entity?:string;risk?:string;approverRole?:string;executionStatus?:string;missingFields?:string[];workflow?:string[];collaborators?:string[];requestText?:string;command?:ActionCommand}
type ChatMessage={id:string;role:'ai'|'user';text:string;pending?:boolean;source?:'cloud'|'private'|'local';depth?:AnalysisDepth;meta?:OperationMeta}

const executiveHeadings=/^(diagn[oó]stico|diagn[oó]stico ejecutivo|evidencia|datos confirmados|datos no disponibles|supuestos|impacto empresarial|impacto en la empresa|an[aá]lisis interdepartamental|riesgos|escenarios|recomendaci[oó]n|pr[oó]ximos pasos|plan de acci[oó]n|decisi[oó]n requerida)\s*:?[\s]*$/i
function cleanExecutiveLine(line:string){return line.replace(/^#{1,4}\s*/,'').replace(/^\*\*(.+)\*\*$/,'$1').trim()}
function ExecutiveCopy({text}:{text:string}){
  const lines=text.split(/\n+/).map(line=>line.trim()).filter(Boolean)
  if(lines.length<2)return <p className="executive-paragraph">{text}</p>
  return <div className="executive-structured">{lines.map((raw,index)=>{
    const line=cleanExecutiveLine(raw),bullet=/^(?:[-*•]|\d+[.)])\s+/.test(raw)
    const heading=/^#{1,4}\s+/.test(raw)||executiveHeadings.test(line)
    if(heading)return <h4 key={index}>{line.replace(/:$/,'')}</h4>
    if(bullet)return <div className="executive-bullet" key={index}><i/>{cleanExecutiveLine(raw.replace(/^(?:[-*•]|\d+[.)])\s+/,''))}</div>
    return <p className="executive-paragraph" key={index}>{line}</p>
  })}</div>
}

function clickNavigation(label:string){const button=[...document.querySelectorAll('button')].find(item=>item.textContent?.trim()===label);if(button instanceof HTMLButtonElement)button.click()}

export default function AuroraExpertChatLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [input,setInput]=useState('')
  const [messages,setMessages]=useState<ChatMessage[]>([])
  const [runtime,setRuntime]=useState<RuntimeState>('ready')
  const [busy,setBusy]=useState(false)
  const [conversationId,setConversationId]=useState<string|null>(null)
  const [collaborators,setCollaborators]=useState<string[]>([])
  const [depth,setDepth]=useState<AnalysisDepth>('detailed')
  const [approvalCenter,setApprovalCenter]=useState(false)
  const [commands,setCommands]=useState<ActionCommand[]>([])
  const [actionBusy,setActionBusy]=useState('')
  const [actionError,setActionError]=useState('')
  const loadedPrivateKey=useRef('')
  const privateState=useEnterprise22PrivateSession()
  const voice=usePremiumVoice(setInput)

  useEffect(()=>{
    const sync=()=>{
      const shell=document.querySelector('.ceo-chat-shell')
      if(!(shell instanceof HTMLElement)){setTarget(null);return}
      shell.classList.add('aurora-expert-active')
      const thread=shell.querySelector('.ceo-thread')
      if(!(thread instanceof HTMLElement)){setTarget(null);return}
      let mount=thread.querySelector<HTMLElement>('.aurora-expert-mount')
      if(!mount){
        mount=document.createElement('div')
        mount.className='aurora-expert-mount'
        const daily=thread.querySelector('.ceo-daily')
        if(daily)daily.insertAdjacentElement('afterend',mount)
        else thread.appendChild(mount)
      }
      setTarget(mount)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{subtree:true,childList:true})
    return()=>{observer.disconnect();document.querySelectorAll('.ceo-chat-shell').forEach(x=>x.classList.remove('aurora-expert-active'))}
  },[])

  useEffect(()=>{
    if(privateState.status!=='private'||!privateState.context?.company.id){loadedPrivateKey.current='';setConversationId(null);return}
    const key=`${privateState.context.company.id}:ceo`
    if(loadedPrivateKey.current===key)return
    loadedPrivateKey.current=key
    let alive=true
    void loadLatestEnterprise22Conversation('ceo').then(conversation=>{
      if(!alive)return
      if(!conversation){setConversationId(null);setMessages([]);return}
      setConversationId(conversation.id)
      setMessages(conversation.messages.map(message=>({id:message.id,role:message.role==='assistant'?'ai':'user',text:message.content,source:'private'})))
      setRuntime('private')
    }).catch(()=>{if(alive)setConversationId(null)})
    return()=>{alive=false}
  },[privateState.status,privateState.context?.company.id])

  const sendText=async(raw:string)=>{
    const text=raw.trim();if(!text||busy)return
    const history:ExpertHistoryMessage[]=messages.filter(m=>!m.pending&&m.text.trim()).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))
    const userId=`u-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,aiId=`a-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
    const privateAccess=privateState.status==='private'&&privateState.context?.company.id&&privateState.accessToken
      ?{accessToken:privateState.accessToken,companyId:privateState.context.company.id,conversationId}
      :undefined
    setInput('');setBusy(true);setRuntime('generating');setCollaborators([]);setMessages(v=>[...v,{id:userId,role:'user',text,depth},{id:aiId,role:'ai',text:'',pending:true,depth}])
    try{
      const result=await streamEnterprise22Expert({department:aurora,input:text,history,depth,privateAccess,onDelta:chunk=>setMessages(v=>v.map(m=>m.id===aiId?{...m,text:m.text+chunk,pending:true,source:privateAccess?'private':'cloud'}:m)),onMeta:meta=>{
        const agents=Array.isArray(meta.collaborators)?meta.collaborators.map(item=>typeof item==='object'&&item&&'agent' in item?String(item.agent):'').filter(Boolean):[]
        if(agents.length)setCollaborators(agents)
        const operationMeta:OperationMeta={operation:typeof meta.operation==='string'?meta.operation:undefined,entity:typeof meta.entity==='string'?meta.entity:undefined,risk:typeof meta.risk==='string'?meta.risk:undefined,approverRole:typeof meta.approver_role==='string'?meta.approver_role:undefined,executionStatus:typeof meta.execution_status==='string'?meta.execution_status:undefined,missingFields:Array.isArray(meta.missing_fields)?meta.missing_fields.map(String):undefined,workflow:Array.isArray(meta.workflow)?meta.workflow.map(String):undefined,collaborators:agents,requestText:text}
        setMessages(v=>v.map(m=>m.id===aiId?{...m,meta:operationMeta}:m))
      }})
      if(result.conversationId)setConversationId(result.conversationId)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,pending:false,source:result.runtime}:m));setRuntime(result.runtime==='private'?'private':'cloud');voice.speak(result.content)
    }catch{
      const fallback=buildDepartmentExpertResponse(aurora,text)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,text:fallback,pending:false,source:'local'}:m));setRuntime('local');voice.speak(fallback)
    }finally{setBusy(false)}
  }
  const runtimeLabel=runtime==='generating'?'Generando…':runtime==='private'?'Private AI':runtime==='cloud'?'WAE AI conectado':runtime==='local'?'Continuidad local':'WAE AI'
  const openWorkspace=(text:string)=>{localStorage.setItem('wae-workspace-draft',JSON.stringify({title:`Decisión ejecutiva · ${new Date().toLocaleDateString('es-MX')}`,body:`# Decisión ejecutiva\n\n**Origen:** AURORA · Dirección General\n**Profundidad:** ${depth}\n**Directores convocados:** ${collaborators.join(', ')||'Por definir'}\n\n${text}`}));clickNavigation('Workspace')}
  const openLeadDepartment=()=>{const agent=collaborators[0];const department=departments.find(item=>item.agent===agent);if(department)clickNavigation(department.name)}
  const actionRequest=async(payload:Record<string,unknown>)=>{
    if(privateState.status!=='private'||!privateState.accessToken||!privateState.context?.company.id)throw new Error('Inicia sesión privada para operar')
    const response=await fetch('/api/expert-chat/actions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${privateState.accessToken}`},body:JSON.stringify({...payload,company_id:privateState.context.company.id})})
    const body=await response.json().catch(()=>({}))
    if(!response.ok)throw new Error(body.error==='missing_required_fields'?'Faltan datos obligatorios':body.error||'No se pudo completar la operación')
    return body as {command?:ActionCommand;commands?:ActionCommand[]}
  }
  const loadCommands=async()=>{setApprovalCenter(true);setActionError('');setActionBusy('list');try{const body=await actionRequest({action:'list'});setCommands(body.commands||[])}catch(error){setActionError(error instanceof Error?error.message:'No se pudo cargar el centro')}finally{setActionBusy('')}}
  const prepareCommand=async(messageId:string,meta:OperationMeta)=>{if(!meta.requestText)return;setActionError('');setActionBusy(messageId);try{const body=await actionRequest({action:'request',input:meta.requestText});if(body.command){setMessages(v=>v.map(m=>m.id===messageId?{...m,meta:{...m.meta,command:body.command}}:m));setCommands(v=>[body.command!,...v.filter(item=>item.id!==body.command!.id)]);setApprovalCenter(true)}}catch(error){setActionError(error instanceof Error?error.message:'No se pudo preparar la operación')}finally{setActionBusy('')}}
  const decideCommand=async(commandId:string,decision:'Approved'|'Rejected')=>{setActionError('');setActionBusy(commandId);try{const body=await actionRequest({action:'decide',command_id:commandId,decision,reason:decision==='Approved'?'Aprobado desde CEO Chat':'Rechazado desde CEO Chat'});if(body.command){setCommands(v=>v.map(item=>item.id===commandId?body.command!:item));setMessages(v=>v.map(m=>m.meta?.command?.id===commandId?{...m,meta:{...m.meta,command:body.command}}:m))}}catch(error){setActionError(error instanceof Error?error.message:'No se pudo registrar la decisión')}finally{setActionBusy('')}}

  if(!target)return null
  return createPortal(<section className="aurora-expert-chat">
    <div className="aurora-expert-head">
      <div className="aurora-expert-orb"><BrainCircuit size={18}/></div>
      <div><small>{privateState.status==='private'?'AURORA · PRIVATE EXECUTIVE MODE':'AURORA · EXECUTIVE EXPERT MODE'}</small><b>Chief Executive AI</b><p>{privateState.status==='private'?`Empresa activa: ${privateState.context?.company.name}`:'Estrategia · gobierno · KPIs · decisiones · coordinación multiagente'}</p></div>
      <span className={`aurora-runtime ${runtime}`}><i/>{runtimeLabel}</span>
    </div>
    <div className="aurora-orchestration"><span>AURORA COMMAND FABRIC</span><b>CEO + 21 directores conectados</b>{collaborators.length>0?<div>{collaborators.map(agent=><em key={agent}>{agent}</em>)}</div>:<small>Detecta el área responsable, reúne colaboradores y entrega una decisión ejecutiva integrada.</small>}</div>
    {busy?<div className="aurora-analysis-state"><span><i/><i/><i/></span><div><b>WAE está analizando en modo {depth==='quick'?'rápido':depth==='deep'?'profundo':'detallado'}…</b><small>Clasificando intención · convocando directores · evaluando riesgos · consolidando decisión</small></div></div>:null}
    {approvalCenter?<section className="wae-approval-center"><header><span><ClipboardCheck size={17}/></span><div><small>WAE ACTION ENGINE</small><b>Centro de aprobaciones</b></div><button onClick={()=>void loadCommands()} aria-label="Actualizar"><RefreshCw size={14}/></button><button onClick={()=>setApprovalCenter(false)} aria-label="Cerrar"><X size={15}/></button></header>{actionError?<div className="action-error">{actionError}</div>:null}{actionBusy==='list'?<div className="approval-loading">Consultando operaciones autorizadas…</div>:commands.length?<div className="approval-list">{commands.map(command=><article key={command.id}><div><span className={`action-risk ${command.risk.toLowerCase()}`}>{command.risk}</span><small>{command.correlation_id}</small></div><b>{command.summary}</b><p>{command.command_type} · Responsable {command.target_agent}</p><footer><em className={`action-status ${command.status.toLowerCase().replace(/\s+/g,'-')}`}>{command.status}</em>{command.status==='Awaiting approval'?<><button disabled={actionBusy===command.id} onClick={()=>void decideCommand(command.id,'Rejected')}><X size={12}/>Rechazar</button><button className="approve" disabled={actionBusy===command.id} onClick={()=>void decideCommand(command.id,'Approved')}><Check size={12}/>Aprobar</button></>:null}</footer></article>)}</div>:<div className="approval-empty">No hay operaciones registradas para esta empresa.</div>}</section>:null}

    <div className="aurora-expert-thread">
      {messages.map(m=>m.role==='user'?<div className="aurora-expert-message user" key={m.id}>{m.text}</div>:<article className={`aurora-executive-response ${m.pending?'pending':''}`} key={m.id}><header><span><BrainCircuit size={16}/></span><div><small>DIAGNÓSTICO EJECUTIVO</small><b>{m.depth==='deep'?'Lectura empresarial 360°':m.depth==='quick'?'Respuesta ejecutiva':'Análisis y recomendación'}</b></div>{m.pending?<em>Analizando</em>:<em className="complete"><CheckCircle2 size={12}/>Listo</em>}</header>{m.meta?.workflow?.length?<div className="executive-workflow">{m.meta.workflow.map((step,index)=><div className={m.pending&&index===m.meta!.workflow!.length-1?'active':'complete'} key={step}><span>{index+1}</span><small>{step}</small></div>)}</div>:null}{m.meta?.executionStatus==='requires_information'&&m.meta.missingFields?.length?<div className="executive-operation-gate"><div><ShieldAlert size={16}/><span><b>Información obligatoria pendiente</b><small>No se ejecutará ninguna operación con datos incompletos.</small></span></div><div>{m.meta.missingFields.map(field=><button key={field} onClick={()=>setInput(value=>`${value}${value?'\n':''}${field}: `)}>{field}</button>)}</div></div>:null}{m.meta?.executionStatus==='ready_for_validation'?<div className="executive-action-ready"><span><ClipboardCheck size={16}/><div><b>Operación validada · Riesgo {m.meta.risk||'por evaluar'}</b><small>{m.meta.command?`Folio ${m.meta.command.correlation_id} · ${m.meta.command.status}`:`Responsable ${m.meta.collaborators?.[0]||'AURORA'} · lista para registrar`}</small></div></span>{m.meta.command?<button onClick={()=>{setApprovalCenter(true);void loadCommands()}}>Ver aprobación</button>:<button disabled={actionBusy===m.id||privateState.status!=='private'} onClick={()=>void prepareCommand(m.id,m.meta!)}>{actionBusy===m.id?'Registrando…':'Preparar operación'}</button>}</div>:null}{!m.pending?<div className="executive-evidence"><span><Gauge size={12}/>Confiabilidad contextual</span><b>{privateState.status==='private'?'Alta · datos autorizados':'Condicionada · contexto conversacional'}</b></div>:null}<div className="executive-copy">{m.text?(m.pending?m.text:<ExecutiveCopy text={m.text}/>):<span className="aurora-thinking"><i/><i/><i/></span>}</div>{!m.pending&&m.text?<><div className="executive-directors"><small>DIRECTORES CONVOCADOS</small><div>{(m.meta?.collaborators?.length?m.meta.collaborators:['AURORA']).map(agent=><span key={agent}>{agent}</span>)}</div></div><footer><button onClick={openLeadDepartment}><Activity size={14}/>Abrir área responsable</button><button onClick={()=>setInput(`Convierte esta recomendación en un plan de acción con responsables, KPI y fechas:\n${m.text.slice(0,1200)}`)}><ListChecks size={14}/>Crear plan</button><button onClick={()=>setInput(`Realiza una revisión de riesgos legales, financieros, operativos y tecnológicos sobre esta decisión:\n${m.text.slice(0,1200)}`)}><ShieldAlert size={14}/>Revisar riesgos</button><button onClick={()=>openWorkspace(m.text)}><FileText size={14}/>Workspace</button></footer></>:null}</article>)}
    </div>

    <div className="aurora-input-dock">
      <div className="aurora-quick-strip"><button onClick={()=>void loadCommands()}><ClipboardCheck size={12}/>Aprobaciones</button>{['¿Cómo vamos este mes?','Crea un empleado','Crea una tarea para Legal','Analiza mi empresa'].map(text=><button key={text} onClick={()=>setInput(text)}><Zap size={12}/>{text}</button>)}</div>
      <div className="aurora-depth"><span>Profundidad:</span>{([{id:'quick',label:'Rápido'},{id:'detailed',label:'Detallado'},{id:'deep',label:'Profundo'}] as const).map(mode=><button key={mode.id} className={depth===mode.id?'active':''} onClick={()=>setDepth(mode.id)}>{mode.label}</button>)}</div>
      <div className="aurora-expert-composer">
        <button aria-label="Adjuntar"><Paperclip size={20}/></button>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Pregúntale a WAE…" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void sendText(input)}}}/>
        <button className={voice.listening?'listening':''} aria-label={voice.supported?'Dictar mensaje':'Dictado no disponible'} onClick={voice.toggleListening} disabled={!voice.supported}><Mic size={19}/></button>
        <button aria-label={voice.enabled?'Desactivar respuestas por voz':'Activar respuestas por voz'} onClick={()=>voice.setEnabled(!voice.enabled)}>{voice.enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
        <button className="aurora-expert-send" onClick={()=>void sendText(input)} aria-label="Enviar" disabled={busy}><Send size={18}/></button>
      </div>
      <div className="aurora-expert-note"><Bot size={12}/>CEO Chat puede crear empleados, productos, clientes y tareas; consulta áreas y verifica información crítica.</div>
    </div>
  </section>,target)
}
