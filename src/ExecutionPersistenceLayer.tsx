import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Database, Fingerprint, HardDrive, LockKeyhole, RefreshCw, Route, ShieldCheck, Workflow, Zap } from 'lucide-react'
import {
  inspectEnterprisePersistence, publishDurableDemoEvent, requestDurableDemoCommand,
  startDurableDemoWorkflow, type EnterprisePersistenceStatus,
} from './enterprisePersistence'
import './execution-persistence.css'

function PersistencePanel(){
  const [status,setStatus]=useState<EnterprisePersistenceStatus|null>(null)
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('')

  const refresh=useCallback(async()=>{
    setBusy(true)
    try{setStatus(await inspectEnterprisePersistence())}
    finally{setBusy(false)}
  },[])

  useEffect(()=>{void refresh()},[refresh])

  const run=async(label:string,fn:(s:EnterprisePersistenceStatus)=>Promise<string>)=>{
    if(!status||status.mode!=='durable')return
    setBusy(true);setNotice('')
    try{
      const id=await fn(status)
      setNotice(`${label} · ${id.slice(0,8)}…`)
      await refresh()
    }catch(error){setNotice(error instanceof Error?error.message:'No fue posible completar la operación durable.')}
    finally{setBusy(false)}
  }

  const durable=status?.mode==='durable'
  const reachable=status?.reachable===true
  const modeLabel=durable?'DURABLE':reachable?'READY / AUTH REQUIRED':status?.mode==='offline'?'OFFLINE':'CONFIG REQUIRED'

  return <section className="execution-layer-card">
    <div className="execution-layer-head">
      <div className="execution-layer-title"><span><Database size={19}/></span><div><small>EXECUTION & PERSISTENCE LAYER</small><h2>Durable Enterprise Control Plane</h2><p>Event store, command store, workflows, approvals, hash-chain audit y transactional outbox.</p></div></div>
      <div className={`execution-layer-mode ${durable?'durable':reachable?'ready':'local'}`}><i/>{modeLabel}</div>
    </div>

    <div className="execution-layer-grid">
      <div className="execution-signal"><HardDrive size={17}/><div><small>Backend</small><b>{reachable?'Supabase reachable':'Not verified'}</b><p>Schema v{status?.schemaVersion??'—'} · Enterprise22 isolated</p></div></div>
      <div className="execution-signal"><ShieldCheck size={17}/><div><small>Boundary</small><b>RLS forced</b><p>Owner-only · RPC-only mutations</p></div></div>
      <div className="execution-signal"><Fingerprint size={17}/><div><small>Audit</small><b>SHA-256 chained</b><p>Append-only ledger by tenant</p></div></div>
      <div className="execution-signal"><Route size={17}/><div><small>Delivery</small><b>Transactional outbox</b><p>Worker claim is service-role only</p></div></div>
    </div>

    <div className="execution-session">
      <div><LockKeyhole size={16}/><span>{status?.reason??'Verificando Persistence Gateway…'}</span></div>
      <button onClick={()=>void refresh()} disabled={busy}><RefreshCw size={14}/>{busy?'Verificando':'Actualizar'}</button>
    </div>

    {durable&&status&&<>
      <div className="execution-counts">
        <span><b>{status.counts.events}</b>events</span><span><b>{status.counts.commands}</b>commands</span>
        <span><b>{status.counts.workflows}</b>workflows</span><span><b>{status.counts.approvals}</b>approvals</span>
        <span><b>{status.counts.outbox}</b>outbox</span><span><b>{status.counts.audit}</b>audit</span>
      </div>
      <div className="execution-actions">
        <button disabled={busy} onClick={()=>void run('Evento durable',publishDurableDemoEvent)}><Zap size={14}/>Emitir evento durable</button>
        <button disabled={busy} onClick={()=>void run('Comando gobernado',requestDurableDemoCommand)}><LockKeyhole size={14}/>Solicitar comando alto riesgo</button>
        <button disabled={busy} onClick={()=>void run('Workflow durable',startDurableDemoWorkflow)}><Workflow size={14}/>Crear workflow durable</button>
      </div>
    </>}

    {!durable&&reachable&&<div className="execution-fallback"><CheckCircle2 size={17}/><p><b>Infraestructura durable lista.</b> Esta sesión continúa en fallback local hasta que exista autenticación Supabase y un tenant Enterprise22 owner. No se debilita RLS para evitar esa condición.</p></div>}
    {notice&&<div className="execution-notice">{notice}</div>}
  </section>
}

export default function ExecutionPersistenceLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)

  useEffect(()=>{
    const sync=()=>{
      const root=document.querySelector('.backbone-premium')
      if(!(root instanceof HTMLElement)){setTarget(null);return}
      let mount=root.querySelector('.execution-persistence-mount')
      if(!(mount instanceof HTMLElement)){
        mount=document.createElement('div')
        mount.className='execution-persistence-mount'
        const tabs=root.querySelector('.backbone-tabs')
        if(tabs)root.insertBefore(mount,tabs)
        else root.appendChild(mount)
      }
      setTarget(mount)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{subtree:true,childList:true})
    return()=>observer.disconnect()
  },[])

  return target?createPortal(<PersistencePanel/>,target):null
}
