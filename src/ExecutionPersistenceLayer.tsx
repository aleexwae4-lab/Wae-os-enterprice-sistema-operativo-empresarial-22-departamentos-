import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Database, Fingerprint, HardDrive, KeyRound, LockKeyhole, LogOut, RefreshCw, Route, ShieldCheck, UserCheck, Workflow, Zap } from 'lucide-react'
import {
  inspectEnterprisePersistence, publishDurableDemoEvent, requestDurableDemoCommand,
  startDurableDemoWorkflow, type EnterprisePersistenceStatus,
} from './enterprisePersistence'
import {
  bootstrapEnterpriseOwner, decideAndQueueEnterpriseCommand, getEnterpriseAuthState, getEnterpriseRuntimeStatus,
  listEnterpriseApprovals, listEnterpriseReceipts, onEnterpriseAuthChange, signInEnterprise, signOutEnterprise,
  signUpEnterprise, type EnterpriseApproval, type EnterpriseAuthState, type EnterpriseReceipt, type EnterpriseRuntimeStatus,
} from './enterpriseRuntime'
import './execution-persistence.css'
import './execution-runtime.css'

const emptyAuth:EnterpriseAuthState={authenticated:false,email:null,userId:null}

function commandFromApproval(approval:EnterpriseApproval){
  const raw=approval.command as EnterpriseApproval['command']|EnterpriseApproval['command'][]
  return Array.isArray(raw)?raw[0]??null:raw??null
}

function PersistencePanel(){
  const [status,setStatus]=useState<EnterprisePersistenceStatus|null>(null)
  const [auth,setAuth]=useState<EnterpriseAuthState>(emptyAuth)
  const [runtime,setRuntime]=useState<EnterpriseRuntimeStatus|null>(null)
  const [approvals,setApprovals]=useState<EnterpriseApproval[]>([])
  const [receipts,setReceipts]=useState<EnterpriseReceipt[]>([])
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [tenantName,setTenantName]=useState('WAE OS Enterprise')
  const [companyName,setCompanyName]=useState('Mi empresa')

  const refresh=useCallback(async(showBusy=true)=>{
    if(showBusy)setBusy(true)
    setError('')
    try{
      const [nextStatus,nextAuth]=await Promise.all([inspectEnterprisePersistence(),getEnterpriseAuthState()])
      setStatus(nextStatus);setAuth(nextAuth)
      if(nextStatus.mode==='durable'&&nextStatus.tenantId){
        const [nextRuntime,nextApprovals,nextReceipts]=await Promise.all([
          getEnterpriseRuntimeStatus(nextStatus.tenantId),
          listEnterpriseApprovals(nextStatus.tenantId),
          listEnterpriseReceipts(nextStatus.tenantId),
        ])
        setRuntime(nextRuntime);setApprovals(nextApprovals);setReceipts(nextReceipts)
      }else{
        setRuntime(null);setApprovals([]);setReceipts([])
      }
    }catch(e){setError(e instanceof Error?e.message:'No fue posible actualizar Enterprise Runtime.')}
    finally{if(showBusy)setBusy(false)}
  },[])

  useEffect(()=>{void refresh();return onEnterpriseAuthChange(()=>void refresh(false))},[refresh])
  useEffect(()=>{
    if(status?.mode!=='durable')return
    const timer=window.setInterval(()=>void refresh(false),5000)
    return()=>window.clearInterval(timer)
  },[status?.mode,refresh])

  const run=async(label:string,fn:(s:EnterprisePersistenceStatus)=>Promise<string>)=>{
    if(!status||status.mode!=='durable')return
    setBusy(true);setNotice('');setError('')
    try{
      const id=await fn(status)
      setNotice(`${label} · ${id.slice(0,8)}…`)
      await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible completar la operación durable.')}
    finally{setBusy(false)}
  }

  const handleAuth=async(kind:'signin'|'signup')=>{
    setError('');setNotice('')
    if(!email.trim()||password.length<8){setError('Ingresa un correo válido y una contraseña de al menos 8 caracteres.');return}
    setBusy(true)
    try{
      const message=kind==='signin'?await signInEnterprise(email,password):await signUpEnterprise(email,password)
      setNotice(message);setPassword('');await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible autenticar la sesión.')}
    finally{setBusy(false)}
  }

  const bootstrap=async()=>{
    setBusy(true);setError('');setNotice('')
    try{
      const result=await bootstrapEnterpriseOwner(tenantName,companyName)
      setNotice(`Tenant durable activado · ${result.tenant_name} / ${result.company_name}`)
      await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible activar el tenant Enterprise22.')}
    finally{setBusy(false)}
  }

  const logout=async()=>{
    setBusy(true);setError('');setNotice('')
    try{await signOutEnterprise();setNotice('Sesión Enterprise cerrada.');await refresh(false)}
    catch(e){setError(e instanceof Error?e.message:'No fue posible cerrar la sesión.')}
    finally{setBusy(false)}
  }

  const decide=async(commandId:string,decision:'Approved'|'Rejected')=>{
    setBusy(true);setError('');setNotice('')
    try{
      const result=await decideAndQueueEnterpriseCommand(commandId,decision)
      setNotice(decision==='Approved'?`Comando aprobado y encolado · ${result}`:`Comando bloqueado · ${result}`)
      await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible registrar la decisión.')}
    finally{setBusy(false)}
  }

  const durable=status?.mode==='durable'
  const reachable=status?.reachable===true
  const modeLabel=durable?'DURABLE + WORKER':reachable&&auth.authenticated?'TENANT SETUP':reachable?'READY / AUTH REQUIRED':status?.mode==='offline'?'OFFLINE':'CONFIG REQUIRED'
  const workerGood=runtime?.worker_status==='Active'&&runtime.worker_fresh

  return <section className="execution-layer-card">
    <div className="execution-layer-head">
      <div className="execution-layer-title"><span><Database size={19}/></span><div><small>EXECUTION & PERSISTENCE LAYER</small><h2>Durable Enterprise Control Plane</h2><p>Auth, tenant isolation, event store, approvals, worker, receipts, hash-chain audit y transactional outbox.</p></div></div>
      <div className={`execution-layer-mode ${durable?'durable':reachable?'ready':'local'}`}><i/>{modeLabel}</div>
    </div>

    <div className="execution-layer-grid">
      <div className="execution-signal"><HardDrive size={17}/><div><small>Backend</small><b>{reachable?'Supabase reachable':'Not verified'}</b><p>Schema v{status?.schemaVersion??'—'} · Enterprise22 isolated</p></div></div>
      <div className="execution-signal"><ShieldCheck size={17}/><div><small>Boundary</small><b>RLS forced</b><p>Owner-only · RPC-only mutations</p></div></div>
      <div className="execution-signal"><Fingerprint size={17}/><div><small>Audit</small><b>SHA-256 chained</b><p>Append-only ledger + receipt hashes</p></div></div>
      <div className="execution-signal"><Route size={17}/><div><small>Runtime</small><b>{workerGood?'Worker active':'Transactional outbox'}</b><p>{runtime?'pg_cron · 10 s · v'+runtime.runtime_version:'Service-only execution boundary'}</p></div></div>
    </div>

    <div className="execution-session">
      <div><LockKeyhole size={16}/><span>{status?.reason??'Verificando Persistence Gateway…'}</span></div>
      <button onClick={()=>void refresh()} disabled={busy}><RefreshCw size={14}/>{busy?'Verificando':'Actualizar'}</button>
    </div>

    {reachable&&!auth.authenticated&&<div className="runtime-access">
      <div className="runtime-access-head"><div><span className="runtime-kicker">ENTERPRISE ACCESS</span><h3>Identidad durable</h3><p>Autenticación Supabase. La publishable key nunca obtiene privilegios de worker.</p></div><KeyRound size={18}/></div>
      <div className="runtime-auth-grid">
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Correo empresarial"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Contraseña segura"/>
        <div className="runtime-auth-actions"><button className="runtime-primary" disabled={busy} onClick={()=>void handleAuth('signin')}>Entrar</button><button className="runtime-secondary" disabled={busy} onClick={()=>void handleAuth('signup')}>Crear acceso</button></div>
      </div>
    </div>}

    {reachable&&auth.authenticated&&!durable&&<div className="runtime-access">
      <div className="runtime-access-head"><div><span className="runtime-kicker">TENANT BOOTSTRAP</span><h3>Activar espacio Enterprise22</h3><p>La operación crea tenant, owner, empresa inicial y adapter interno en una sola transacción.</p></div><div className="runtime-session-badge"><i/>{auth.email??'Sesión autenticada'}</div></div>
      <div className="runtime-bootstrap-grid">
        <input value={tenantName} onChange={e=>setTenantName(e.target.value)} placeholder="Nombre del tenant"/>
        <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Empresa inicial"/>
        <button className="runtime-primary" disabled={busy} onClick={()=>void bootstrap()}><UserCheck size={13}/>Activar durable</button>
      </div>
      <div className="runtime-note"><button className="runtime-secondary" disabled={busy} onClick={()=>void logout()}><LogOut size={12}/>Cerrar sesión</button></div>
    </div>}

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

      <div className="runtime-access">
        <div className="runtime-access-head"><div><span className="runtime-kicker">LIVE EXECUTION RUNTIME</span><h3>Enterprise Worker Console</h3><p>Cola durable, ejecución service-only y evidencia verificable de cada entrega.</p></div><div className="runtime-auth-actions"><div className="runtime-session-badge"><i/>{auth.email??status.tenantName}</div><button className="runtime-secondary" disabled={busy} onClick={()=>void logout()}><LogOut size={12}/>Salir</button></div></div>
        <div className="runtime-live-grid">
          <div className={`runtime-live-cell ${workerGood?'good':'warn'}`}><small>Worker</small><b>{runtime?.worker_status??'—'}</b><em>{runtime?.worker_fresh?'heartbeat fresh':'verificando heartbeat'}</em></div>
          <div className="runtime-live-cell"><small>Queue</small><b>{runtime?.pending??0}</b><em>{runtime?.processing??0} processing</em></div>
          <div className={`runtime-live-cell ${(runtime?.dead_letter??0)>0?'warn':'good'}`}><small>Dead letter</small><b>{runtime?.dead_letter??0}</b><em>fail-closed</em></div>
          <div className="runtime-live-cell good"><small>Receipts</small><b>{runtime?.receipts??0}</b><em>SHA-256 evidence</em></div>
          <div className="runtime-live-cell"><small>Delivered</small><b>{runtime?.delivered_total??0}</b><em>{runtime?.failed_total??0} failed attempts</em></div>
        </div>

        <div className="runtime-approvals">
          <div className="runtime-section-title"><h4>Human Approval Gate</h4><span>{approvals.length} pendientes</span></div>
          {approvals.length===0?<div className="runtime-empty">No hay comandos de alto riesgo esperando decisión humana.</div>:approvals.map(approval=>{
            const cmd=commandFromApproval(approval)
            return <div className="runtime-approval-row" key={approval.id}><div><b>{cmd?.command_type??'Comando gobernado'} · {cmd?.target_agent??'Agent'}</b><p>{cmd?.summary??`Requiere ${approval.required_role}`} · Riesgo {cmd?.risk??'—'} · {cmd?.correlation_id??approval.command_id.slice(0,8)}</p></div><div className="runtime-approval-actions"><button className="runtime-approve" disabled={busy} onClick={()=>void decide(approval.command_id,'Approved')}>Aprobar + ejecutar</button><button className="runtime-danger" disabled={busy} onClick={()=>void decide(approval.command_id,'Rejected')}>Bloquear</button></div></div>
          })}
        </div>

        <div className="runtime-receipts">
          <div className="runtime-section-title"><h4>Execution Receipts</h4><span>últimos {receipts.length}</span></div>
          {receipts.length===0?<div className="runtime-empty">El ledger de receipts está listo. Emite un evento o aprueba un comando para generar evidencia.</div>:receipts.map(receipt=><div className="runtime-receipt-row" key={receipt.id}><div><b>{receipt.aggregate_type} · {receipt.adapter_key}</b><p>{receipt.status} · intento {receipt.attempt} · {receipt.latency_ms} ms</p><p className="runtime-hash">{receipt.receipt_hash.slice(0,28)}…</p></div><div className="runtime-receipt-meta"><span className={`runtime-pill ${receipt.status==='Failed'?'fail':'ok'}`}>{receipt.status}</span><span className="runtime-pill">{new Date(receipt.created_at).toLocaleTimeString()}</span></div></div>)}
        </div>
      </div>
    </>}

    {!durable&&reachable&&!auth.authenticated&&<div className="execution-fallback"><CheckCircle2 size={17}/><p><b>Runtime durable listo.</b> Autentícate para activar un tenant Enterprise22. No se relaja RLS ni se exponen credenciales de worker para acelerar este paso.</p></div>}
    {notice&&<div className="execution-notice">{notice}</div>}
    {error&&<div className="runtime-error">{error}</div>}
  </section>
}

export default function ExecutionPersistenceLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)

  useEffect(()=>{
    const sync=()=>{
      const root=document.querySelector('.backbone-premium')
      if(!(root instanceof HTMLElement)){setTarget(null);return}
      let mount:HTMLElement|null=root.querySelector<HTMLElement>('.execution-persistence-mount')
      if(!mount){
        mount=document.createElement('div')
        mount.className='execution-persistence-mount'
        const tabs=root.querySelector<HTMLElement>('.backbone-tabs')
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
