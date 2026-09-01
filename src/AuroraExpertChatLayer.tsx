import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, BrainCircuit, Mic, Paperclip, Send, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react'
import { departments } from './data'
import { buildDepartmentExpertResponse } from './departmentExpertEngine'
import { streamEnterprise22Expert, type ExpertHistoryMessage } from './enterprise22AiClient'
import { loadLatestEnterprise22Conversation, useEnterprise22PrivateSession } from './lib/enterprise22PrivateSession'
import './aurora-expert-chat.css'
import { usePremiumVoice } from './usePremiumVoice'

const aurora=departments.find(d=>d.id==='ceo')??departments[0]
type RuntimeState='ready'|'cloud'|'private'|'local'|'generating'
type ChatMessage={id:string;role:'ai'|'user';text:string;pending?:boolean;source?:'cloud'|'private'|'local'}

export default function AuroraExpertChatLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [input,setInput]=useState('')
  const [messages,setMessages]=useState<ChatMessage[]>([])
  const [runtime,setRuntime]=useState<RuntimeState>('ready')
  const [busy,setBusy]=useState(false)
  const [conversationId,setConversationId]=useState<string|null>(null)
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
    setInput('');setBusy(true);setRuntime('generating');setMessages(v=>[...v,{id:userId,role:'user',text},{id:aiId,role:'ai',text:'',pending:true}])
    try{
      const result=await streamEnterprise22Expert({department:aurora,input:text,history,privateAccess,onDelta:chunk=>setMessages(v=>v.map(m=>m.id===aiId?{...m,text:m.text+chunk,pending:true,source:privateAccess?'private':'cloud'}:m))})
      if(result.conversationId)setConversationId(result.conversationId)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,pending:false,source:result.runtime}:m));setRuntime(result.runtime==='private'?'private':'cloud');voice.speak(result.content)
    }catch{
      const fallback=buildDepartmentExpertResponse(aurora,text)
      setMessages(v=>v.map(m=>m.id===aiId?{...m,text:fallback,pending:false,source:'local'}:m));setRuntime('local');voice.speak(fallback)
    }finally{setBusy(false)}
  }
  const runtimeLabel=runtime==='generating'?'Generando…':runtime==='private'?'Private AI':runtime==='cloud'?'WAE AI conectado':runtime==='local'?'Continuidad local':'WAE AI'
  const note=privateState.status==='private'
    ?`Contexto privado · ${privateState.context?.company.name} · RLS + memoria ejecutiva`
    :'Runtime efímero con continuidad local · activa Private AI para memoria empresarial.'

  if(!target)return null
  return createPortal(<section className="aurora-expert-chat">
    <div className="aurora-expert-head">
      <div className="aurora-expert-orb"><BrainCircuit size={18}/></div>
      <div><small>{privateState.status==='private'?'AURORA · PRIVATE EXECUTIVE MODE':'AURORA · EXECUTIVE EXPERT MODE'}</small><b>Chief Executive AI</b><p>{privateState.status==='private'?`Empresa activa: ${privateState.context?.company.name}`:'Estrategia · gobierno · KPIs · decisiones · coordinación multiagente'}</p></div>
      <span className={`aurora-runtime ${runtime}`}><i/>{runtimeLabel}</span>
    </div>

    <div className="aurora-expert-thread">
      {messages.length===0?<div className="aurora-expert-welcome"><Sparkles size={23}/><h3>{privateState.status==='private'?'AURORA ya reconoce tu empresa autorizada.':'Conversa con AURORA como con un asesor ejecutivo.'}</h3><p>{privateState.status==='private'?`Puede razonar con el contexto privado de ${privateState.context?.company.name} y conservar la conversación ejecutiva por empresa.`:'Puedo explicarte conceptos empresariales, construir estrategias, convertirlas en planes, enseñarte métodos de dirección y ayudarte a decidir qué director debe intervenir.'}</p><div>
        {['Explícame un concepto de dirección empresarial','Diseña una estrategia para mejorar mi empresa','Crea un plan ejecutivo de 90 días','Enséñame a dirigir con KPIs'].map(x=><button key={x} onClick={()=>setInput(x)}><Zap size={12}/>{x}</button>)}
      </div></div>:messages.map(m=><div className={`aurora-expert-message ${m.role} ${m.pending?'pending':''}`} key={m.id}>{m.text||<span className="aurora-thinking"><i/><i/><i/></span>}</div>)}
    </div>

    <div className="aurora-expert-composer">
      <button aria-label="Adjuntar"><Paperclip size={18}/></button>
      <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Pregúntale a AURORA sobre estrategia, dirección o decisiones..." onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void sendText(input)}}}/>
      <button className={voice.listening?'listening':''} aria-label={voice.supported?'Dictar mensaje':'Dictado no disponible'} onClick={voice.toggleListening} disabled={!voice.supported}><Mic size={18}/></button>
      <button aria-label={voice.enabled?'Desactivar respuestas por voz':'Activar respuestas por voz'} onClick={()=>voice.setEnabled(!voice.enabled)}>{voice.enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
      <button className="aurora-expert-send" onClick={()=>void sendText(input)} aria-label="Enviar" disabled={busy}><Send size={17}/></button>
    </div>
    <div className="aurora-expert-note"><Bot size={12}/>{note}</div>
  </section>,target)
}
