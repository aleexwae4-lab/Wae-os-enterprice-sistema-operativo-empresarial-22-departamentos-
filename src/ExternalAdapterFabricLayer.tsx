import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Activity, BadgeCheck, CircuitBoard, CloudCog, Fingerprint, KeyRound, LockKeyhole, PlugZap, RefreshCw, Rocket, ShieldCheck, TestTube2 } from 'lucide-react'
import { inspectEnterprisePersistence, type EnterprisePersistenceStatus } from './enterprisePersistence'
import {
  listExternalAdapters,listExternalRequests,promoteExternalAdapter,requestExternalAdapterProbe,
  rotateExternalAdapterSecret,upsertExternalAdapter,type ExternalAdapter,type ExternalAdapterDraft,type ExternalRequest,
} from './externalAdapterRuntime'
import './external-adapter-fabric.css'

const emptyDraft:ExternalAdapterDraft={adapterKey:'',displayName:'',targetSystem:'',capabilities:'',environment:'Sandbox',endpointUrl:'',allowedHost:'',healthPath:'/',authScheme:'None',riskCeiling:'Medio',timeoutMs:10000}

function statusClass(value:string){
  const v=value.toLowerCase()
  if(v.includes('available')||v.includes('healthy')||v.includes('succeeded')||v==='closed')return 'good'
  if(v.includes('failed')||v.includes('timed')||v==='open'||v.includes('degraded'))return 'bad'
  return 'warn'
}

function AdapterFabricPanel(){
  const [persistence,setPersistence]=useState<EnterprisePersistenceStatus|null>(null)
  const [adapters,setAdapters]=useState<ExternalAdapter[]>([])
  const [requests,setRequests]=useState<ExternalRequest[]>([])
  const [draft,setDraft]=useState<ExternalAdapterDraft>(emptyDraft)
  const [selectedAdapter,setSelectedAdapter]=useState('')
  const [secret,setSecret]=useState('')
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')

  const refresh=useCallback(async(showBusy=false)=>{
    if(showBusy)setBusy(true)
    setError('')
    try{
      const next=await inspectEnterprisePersistence()
      setPersistence(next)
      if(next.mode==='durable'&&next.tenantId){
        const [a,r]=await Promise.all([listExternalAdapters(next.tenantId),listExternalRequests(next.tenantId)])
        setAdapters(a);setRequests(r)
        setSelectedAdapter(current=>current&&a.some(x=>x.id===current)?current:(a[0]?.id??''))
      }else{setAdapters([]);setRequests([]);setSelectedAdapter('')}
    }catch(e){setError(e instanceof Error?e.message:'No fue posible actualizar Adapter Fabric.')}
    finally{if(showBusy)setBusy(false)}
  },[])

  useEffect(()=>{void refresh(true)},[refresh])
  useEffect(()=>{
    if(persistence?.mode!=='durable')return
    const timer=window.setInterval(()=>void refresh(false),5000)
    return()=>window.clearInterval(timer)
  },[persistence?.mode,refresh])

  const metrics=useMemo(()=>({
    total:adapters.length,
    healthy:adapters.filter(a=>a.status==='Available'&&a.circuit_state==='Closed').length,
    open:adapters.filter(a=>a.circuit_state==='Open').length,
    inflight:requests.filter(r=>r.status==='In flight').length,
    failures:requests.filter(r=>r.status==='Failed'||r.status==='Timed out').length,
  }),[adapters,requests])

  const durable=persistence?.mode==='durable'&&Boolean(persistence.tenantId)

  const saveAdapter=async()=>{
    if(!durable||!persistence?.tenantId)return
    setBusy(true);setError('');setNotice('')
    try{
      if(!draft.adapterKey.trim()||!draft.displayName.trim()||!draft.targetSystem.trim()||!draft.endpointUrl.trim()||!draft.allowedHost.trim())throw new Error('Completa key, nombre, sistema, endpoint HTTPS y host permitido.')
      if(!draft.endpointUrl.toLowerCase().startsWith('https://'))throw new Error('Solo se aceptan endpoints HTTPS.')
      await upsertExternalAdapter(persistence.tenantId,draft)
      setNotice('Adapter guardado en Sandbox/Control Plane. Production permanece bloqueado hasta health probe exitoso.')
      setDraft(emptyDraft)
      await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible guardar el adapter.')}
    finally{setBusy(false)}
  }

  const rotateSecret=async()=>{
    if(!selectedAdapter)throw new Error('Selecciona un adapter.')
    if(secret.length<8){setError('La credencial debe tener al menos 8 caracteres.');return}
    setBusy(true);setError('');setNotice('')
    try{
      await rotateExternalAdapterSecret(selectedAdapter,secret)
      setSecret('')
      setNotice('Credencial rotada dentro de Supabase Vault. El valor no se devuelve ni se conserva en la interfaz.')
      await refresh(false)
    }catch(e){setError(e instanceof Error?e.message:'No fue posible rotar la credencial.')}
    finally{setBusy(false)}
  }

  const probe=async(id:string)=>{
    setBusy(true);setError('');setNotice('')
    try{await requestExternalAdapterProbe(id);setNotice('Health probe solicitado. El worker service-only lo ejecutará y reconciliará de forma asíncrona.');await refresh(false)}
    catch(e){setError(e instanceof Error?e.message:'No fue posible solicitar el probe.')}
    finally{setBusy(false)}
  }

  const promote=async(id:string)=>{
    setBusy(true);setError('');setNotice('')
    try{await promoteExternalAdapter(id);setNotice('Adapter promovido a Production bajo health + circuit gate.');await refresh(false)}
    catch(e){setError(e instanceof Error?e.message:'Production gate rechazó la promoción.')}
    finally{setBusy(false)}
  }

  return <section className="adapter-fabric-card">
    <div className="adapter-fabric-head">
      <div className="adapter-fabric-title"><span><PlugZap size={20}/></span><div><small>EXTERNAL ADAPTER FABRIC · RUNTIME v4</small><h2>Governed Integration Control Plane</h2><p>Versioned adapters, Vault credentials, signed envelopes, health probes, circuit breakers y request/response evidence.</p></div></div>
      <div className={`adapter-fabric-badge ${durable?'good':'locked'}`}><i/>{durable?'VAULT + WORKER READY':'DURABLE TENANT REQUIRED'}</div>
    </div>

    <div className="adapter-policy-row">
      <div><ShieldCheck size={15}/><span><b>HTTPS allowlist</b><small>Host exacto · IP literals bloqueadas</small></span></div>
      <div><KeyRound size={15}/><span><b>Secret Vault</b><small>Write-only · never read back</small></span></div>
      <div><Fingerprint size={15}/><span><b>Signed envelope</b><small>SHA-256 + HMAC tenant key</small></span></div>
      <div><CircuitBoard size={15}/><span><b>Fail closed</b><small>Health + risk + circuit gates</small></span></div>
    </div>

    {!durable&&<div className="adapter-locked"><LockKeyhole size={18}/><div><b>Adapter Fabric está físicamente listo.</b><p>Inicia sesión y activa un tenant Enterprise22 en el bloque superior. Ninguna integración externa se habilita sin identidad, owner y RLS.</p></div></div>}

    {durable&&<>
      <div className="adapter-metrics">
        <div><small>Adapters</small><b>{metrics.total}</b><em>versionados</em></div>
        <div className="good"><small>Healthy</small><b>{metrics.healthy}</b><em>closed circuit</em></div>
        <div className={metrics.open?'bad':'good'}><small>Open circuits</small><b>{metrics.open}</b><em>fail-closed</em></div>
        <div><small>In flight</small><b>{metrics.inflight}</b><em>async HTTP</em></div>
        <div className={metrics.failures?'warn':'good'}><small>External failures</small><b>{metrics.failures}</b><em>recent ledger</em></div>
      </div>

      <div className="adapter-section-head"><div><small>ADAPTER REGISTRY</small><h3>Integration topology</h3></div><button onClick={()=>void refresh(true)} disabled={busy}><RefreshCw size={13}/>Actualizar</button></div>
      <div className="adapter-registry">
        {adapters.length===0?<div className="adapter-empty">No hay adapters externos todavía. Crea el primero en Sandbox.</div>:adapters.map(a=><div className="adapter-row" key={a.id}>
          <div className="adapter-row-main"><div className="adapter-icon"><CloudCog size={17}/></div><div><b>{a.display_name}</b><p>{a.adapter_key} · v{a.adapter_version} · {a.target_system}</p><small>{a.allowed_host??'host pendiente'}{a.capabilities.length?` · ${a.capabilities.join(' · ')}`:' · probe-only'}</small></div></div>
          <div className="adapter-row-signals">
            <span className={`adapter-pill ${statusClass(a.status)}`}>{a.status}</span>
            <span className={`adapter-pill ${a.environment==='Production'?'prod':'sandbox'}`}>{a.environment}</span>
            <span className={`adapter-pill ${statusClass(a.circuit_state)}`}>Circuit {a.circuit_state}</span>
            <span className={`adapter-pill ${statusClass(a.last_health_status??'pending')}`}>{a.last_health_code??'—'} · {a.last_health_latency_ms??'—'} ms</span>
          </div>
          <div className="adapter-row-actions">
            <button disabled={busy} onClick={()=>void probe(a.id)}><TestTube2 size={12}/>Probe</button>
            <button disabled={busy||a.environment==='Production'||a.status!=='Available'||a.circuit_state!=='Closed'||a.last_health_status!=='Healthy'} onClick={()=>void promote(a.id)}><Rocket size={12}/>Production</button>
          </div>
        </div>)}
      </div>

      <div className="adapter-config-grid">
        <div className="adapter-config-card">
          <div className="adapter-section-head"><div><small>ADAPTER BUILDER</small><h3>Sandbox configuration</h3></div><BadgeCheck size={17}/></div>
          <div className="adapter-form-grid">
            <input value={draft.adapterKey} onChange={e=>setDraft({...draft,adapterKey:e.target.value})} placeholder="adapter.key"/>
            <input value={draft.displayName} onChange={e=>setDraft({...draft,displayName:e.target.value})} placeholder="Nombre del adapter"/>
            <input value={draft.targetSystem} onChange={e=>setDraft({...draft,targetSystem:e.target.value})} placeholder="Sistema destino"/>
            <input value={draft.capabilities} onChange={e=>setDraft({...draft,capabilities:e.target.value})} placeholder="capacidades, separadas, por coma"/>
            <input className="wide" value={draft.endpointUrl} onChange={e=>setDraft({...draft,endpointUrl:e.target.value})} placeholder="https://api.proveedor.com/v1/action"/>
            <input value={draft.allowedHost} onChange={e=>setDraft({...draft,allowedHost:e.target.value})} placeholder="api.proveedor.com"/>
            <input value={draft.healthPath} onChange={e=>setDraft({...draft,healthPath:e.target.value})} placeholder="/health"/>
            <select value={draft.authScheme} onChange={e=>setDraft({...draft,authScheme:e.target.value as ExternalAdapterDraft['authScheme']})}><option>None</option><option>Bearer</option><option>ApiKey</option><option>HMAC-SHA256</option></select>
            <select value={draft.riskCeiling} onChange={e=>setDraft({...draft,riskCeiling:e.target.value as ExternalAdapterDraft['riskCeiling']})}><option>Bajo</option><option>Medio</option><option>Alto</option><option>Crítico</option></select>
            <select value={draft.environment} onChange={e=>setDraft({...draft,environment:e.target.value as ExternalAdapterDraft['environment']})}><option>Sandbox</option><option>Production</option></select>
            <input type="number" min={1000} max={60000} value={draft.timeoutMs} onChange={e=>setDraft({...draft,timeoutMs:Number(e.target.value)||10000})} placeholder="Timeout ms"/>
          </div>
          <div className="adapter-config-foot"><p>Guardar una configuración siempre desactiva Production hasta que el adapter vuelva a pasar health + circuit gate.</p><button className="adapter-primary" disabled={busy} onClick={()=>void saveAdapter()}><PlugZap size={13}/>Guardar adapter</button></div>
        </div>

        <div className="adapter-config-card vault">
          <div className="adapter-section-head"><div><small>SECRET VAULT</small><h3>Credential rotation</h3></div><KeyRound size={17}/></div>
          <p className="adapter-vault-copy">La credencial viaja únicamente al RPC gobernado y se cifra en Supabase Vault. La UI nunca puede leerla de regreso.</p>
          <select value={selectedAdapter} onChange={e=>setSelectedAdapter(e.target.value)}><option value="">Selecciona adapter</option>{adapters.filter(a=>a.auth_scheme!=='None').map(a=><option key={a.id} value={a.id}>{a.display_name} · {a.auth_scheme}</option>)}</select>
          <input type="password" autoComplete="new-password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Nueva credencial / token"/>
          <button className="adapter-primary" disabled={busy||!selectedAdapter} onClick={()=>void rotateSecret()}><KeyRound size={13}/>Rotar en Vault</button>
          <div className="adapter-vault-seal"><ShieldCheck size={15}/><span><b>No plaintext storage</b><small>solo secret reference + audit event</small></span></div>
        </div>
      </div>

      <div className="adapter-section-head ledger"><div><small>REQUEST / RESPONSE LEDGER</small><h3>Signed external evidence</h3></div><Activity size={17}/></div>
      <div className="adapter-request-ledger">
        {requests.length===0?<div className="adapter-empty">El ledger está listo. Los health probes y ejecuciones externas aparecerán aquí sin almacenar cuerpos de respuesta en claro.</div>:requests.map(r=><div className="adapter-request-row" key={r.id}>
          <div><b>{r.request_kind} · {r.adapter_key}</b><p>{r.method} · {r.endpoint_host}{r.endpoint_path} · {r.environment}</p><small>{r.correlation_id}</small></div>
          <div className="adapter-request-meta"><span className={`adapter-pill ${statusClass(r.status)}`}>{r.status}</span><span className="adapter-pill">HTTP {r.response_status??'—'}</span>{r.response_hash&&<code>{r.response_hash.slice(0,18)}…</code>}</div>
        </div>)}
      </div>
    </>}

    {notice&&<div className="adapter-notice">{notice}</div>}
    {error&&<div className="adapter-error">{error}</div>}
  </section>
}

export default function ExternalAdapterFabricLayer(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  useEffect(()=>{
    const sync=()=>{
      const root=document.querySelector('.backbone-premium')
      if(!(root instanceof HTMLElement)){setTarget(null);return}
      let mount=root.querySelector<HTMLElement>('.external-adapter-fabric-mount')
      if(!mount){
        mount=document.createElement('div');mount.className='external-adapter-fabric-mount'
        const execution=root.querySelector<HTMLElement>('.execution-persistence-mount')
        const tabs=root.querySelector<HTMLElement>('.backbone-tabs')
        if(execution?.parentElement===root)execution.insertAdjacentElement('afterend',mount)
        else if(tabs)root.insertBefore(mount,tabs)
        else root.appendChild(mount)
      }
      setTarget(mount)
    }
    sync();const observer=new MutationObserver(sync);observer.observe(document.body,{subtree:true,childList:true});return()=>observer.disconnect()
  },[])
  return target?createPortal(<AdapterFabricPanel/>,target):null
}
