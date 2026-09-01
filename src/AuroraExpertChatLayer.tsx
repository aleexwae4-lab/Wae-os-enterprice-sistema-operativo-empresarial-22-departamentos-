import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, BrainCircuit, Mic, Paperclip, Send, Sparkles, Zap } from 'lucide-react'
import { departments } from './data'
import { buildDepartmentExpertResponse } from './departmentExpertEngine'
import './aurora-expert-chat.css'

const aurora=departments.find(d=>d.id==='ceo')??departments[0]

export default function AuroraExpertChatLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [input,setInput]=useState('')
  const [messages,setMessages]=useState<{role:'ai'|'user';text:string}[]>([])

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

  const sendText=(raw:string)=>{
    const text=raw.trim();if(!text)return
    setMessages(v=>[...v,{role:'user',text},{role:'ai',text:buildDepartmentExpertResponse(aurora,text)}])
    setInput('')
  }

  if(!target)return null
  return createPortal(<section className="aurora-expert-chat">
    <div className="aurora-expert-head">
      <div className="aurora-expert-orb"><BrainCircuit size={18}/></div>
      <div><small>AURORA · EXECUTIVE EXPERT MODE</small><b>Chief Executive AI</b><p>Estrategia · gobierno · KPIs · decisiones · coordinación multiagente</p></div>
      <span><i/>EXPERT</span>
    </div>

    <div className="aurora-expert-thread">
      {messages.length===0?<div className="aurora-expert-welcome"><Sparkles size={23}/><h3>Conversa con AURORA como con un asesor ejecutivo.</h3><p>Puedo explicarte conceptos empresariales, construir estrategias, convertirlas en planes, enseñarte métodos de dirección y ayudarte a decidir qué director debe intervenir.</p><div>
        {['Explícame un concepto de dirección empresarial','Diseña una estrategia para mejorar mi empresa','Crea un plan ejecutivo de 90 días','Enséñame a dirigir con KPIs'].map(x=><button key={x} onClick={()=>setInput(x)}><Zap size={12}/>{x}</button>)}
      </div></div>:messages.map((m,i)=><div className={`aurora-expert-message ${m.role}`} key={i}>{m.text}</div>)}
    </div>

    <div className="aurora-expert-composer">
      <button aria-label="Adjuntar"><Paperclip size={18}/></button>
      <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Pregúntale a AURORA sobre estrategia, dirección o decisiones..." onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText(input)}}}/>
      <button aria-label="Voz"><Mic size={18}/></button>
      <button className="aurora-expert-send" onClick={()=>sendText(input)} aria-label="Enviar"><Send size={17}/></button>
    </div>
    <div className="aurora-expert-note"><Bot size={12}/>AURORA resuelve la parte ejecutiva y deriva la especialidad técnica al director correspondiente cuando hace falta.</div>
  </section>,target)
}
