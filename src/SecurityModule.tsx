import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, Bot, Bug, CheckCircle2, Clock3, FileText, Fingerprint,
  Gauge, GitBranch, KeyRound, Layers3, LockKeyhole, Network, Plus, Radar,
  Search, ShieldAlert, ShieldCheck, Sparkles, Target, UserRoundCheck, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './security-premium.css'

type Tab='command'|'posture'|'assets'|'iam'|'vulnerabilities'|'incidents'|'attackpaths'|'controls'|'documents'|'agent'
type Severity='Baja'|'Media'|'Alta'|'Crítica'
type AssetCriticality='Baja'|'Media'|'Alta'|'Crítica'
type IncidentStatus='Nuevo'|'Investigando'|'Conteniendo'|'Erradicando'|'Recuperando'|'Cerrado'
type ControlStatus='Efectivo'|'Parcial'|'Débil'|'No implementado'
type IdentityRisk='Bajo'|'Medio'|'Alto'|'Crítico'

type SecurityAsset={id:string;name:string;type:string;owner:string;criticality:AssetCriticality;internet:boolean;data:string;health:number;lastScan:string;source:string}
type Identity={id:string;name:string;type:'Humana'|'Servicio';role:string;privileged:boolean;mfa:boolean;lastAccess:string;risk:IdentityRisk;owner:string;source:string}
type Vulnerability={id:string;assetId:string;title:string;severity:Severity;cvss:number;exploitable:boolean;internet:boolean;age:number;owner:string;status:'Abierta'|'Mitigando'|'Aceptada'|'Resuelta';evidence:string}
type Incident={id:string;title:string;severity:Severity;status:IncidentStatus;opened:string;owner:string;asset:string;impact:string;confidence:number;evidence:string}
type AttackPath={id:string;entry:string;steps:string[];target:string;likelihood:number;impact:number;status:'Abierta'|'Mitigando'|'Cerrada';evidence:string}
type Control={id:string;name:string;domain:string;owner:string;coverage:number;status:ControlStatus;evidence:string;lastTest:string}

const seedAssets:SecurityAsset[]=[
  {id:'AST-SEC-01',name:'WAE API Gateway',type:'Aplicación',owner:'NEXUS',criticality:'Crítica',internet:true,data:'Tokens, sesiones, tráfico API',health:68,lastScan:'01 sep · 08:02',source:'NEXUS + APEX'},
  {id:'AST-SEC-02',name:'Supabase Enterprise22',type:'Datos',owner:'NEXUS + LEDGER',criticality:'Crítica',internet:true,data:'Datos corporativos aislados',health:84,lastScan:'01 sep · 07:58',source:'NEXUS + ARCHIVE'},
  {id:'AST-SEC-03',name:'CEO Workspace',type:'Aplicación',owner:'AURORA',criticality:'Alta',internet:true,data:'Decisiones y documentos ejecutivos',health:79,lastScan:'01 sep · 07:55',source:'AURORA + ARCHIVE'},
  {id:'AST-SEC-04',name:'Payroll Workspace',type:'Aplicación',owner:'PAYROLL',criticality:'Alta',internet:false,data:'Datos de nómina demo',health:88,lastScan:'31 ago · 22:30',source:'PAYROLL + TALENT'},
  {id:'AST-SEC-05',name:'Endpoint CFO-01',type:'Endpoint',owner:'STERLING',criticality:'Alta',internet:false,data:'Información financiera',health:73,lastScan:'01 sep · 07:44',source:'APEX + SENTINEL'},
]

const seedIdentities:Identity[]=[
  {id:'ID-001',name:'Alex · Org Admin',type:'Humana',role:'org_admin',privileged:true,mfa:true,lastAccess:'hace 9 min',risk:'Medio',owner:'TALENT + NEXUS',source:'IAM demo'},
  {id:'ID-002',name:'svc-wae-gateway',type:'Servicio',role:'gateway_service',privileged:true,mfa:false,lastAccess:'hace 2 min',risk:'Alto',owner:'NEXUS',source:'Service registry demo'},
  {id:'ID-003',name:'Andrea Flores',type:'Humana',role:'project_manager',privileged:false,mfa:true,lastAccess:'hace 28 min',risk:'Bajo',owner:'TALENT',source:'IAM demo'},
  {id:'ID-004',name:'svc-reporting',type:'Servicio',role:'read_analytics',privileged:false,mfa:false,lastAccess:'hace 17 min',risk:'Medio',owner:'INSIGHT',source:'Service registry demo'},
  {id:'ID-005',name:'Break-glass Admin',type:'Humana',role:'emergency_admin',privileged:true,mfa:true,lastAccess:'28 ago 2026',risk:'Crítico',owner:'SENTINEL + NEXUS',source:'IAM demo'},
]

const seedVulnerabilities:Vulnerability[]=[
  {id:'VUL-101',assetId:'AST-SEC-01',title:'Dependencia web con parche pendiente',severity:'Crítica',cvss:9.1,exploitable:true,internet:true,age:3,owner:'NEXUS',status:'Mitigando',evidence:'SCA demo · paquete gateway'},
  {id:'VUL-102',assetId:'AST-SEC-05',title:'Cifrado de disco sin evidencia reciente',severity:'Alta',cvss:7.2,exploitable:false,internet:false,age:12,owner:'SENTINEL + APEX',status:'Abierta',evidence:'Control endpoint demo'},
  {id:'VUL-103',assetId:'AST-SEC-03',title:'CSP restrictiva pendiente',severity:'Media',cvss:5.4,exploitable:false,internet:true,age:8,owner:'NEXUS',status:'Abierta',evidence:'Header review demo'},
  {id:'VUL-104',assetId:'AST-SEC-02',title:'Rotación de secreto de servicio próxima',severity:'Alta',cvss:7.8,exploitable:false,internet:true,age:1,owner:'NEXUS + SENTINEL',status:'Mitigando',evidence:'Vault lifecycle demo'},
  {id:'VUL-105',assetId:'AST-SEC-04',title:'Sesión administrativa excesiva',severity:'Media',cvss:5.9,exploitable:false,internet:false,age:5,owner:'PAYROLL + NEXUS',status:'Abierta',evidence:'Session policy demo'},
]

const seedIncidents:Incident[]=[
  {id:'INC-260901-01',title:'Login anómalo en cuenta privilegiada',severity:'Crítica',status:'Investigando',opened:'01 sep · 07:31',owner:'SENTINEL',asset:'IAM / Break-glass Admin',impact:'Posible uso indebido de privilegio; sin compromiso confirmado.',confidence:86,evidence:'EV-SOC-901'},
  {id:'INC-260831-04',title:'Picos de error en API Gateway',severity:'Alta',status:'Recuperando',opened:'31 ago · 21:42',owner:'NEXUS + SENTINEL',asset:'WAE API Gateway',impact:'Disponibilidad degradada; no evidencia de exfiltración.',confidence:78,evidence:'EV-SOC-884'},
  {id:'INC-260830-02',title:'Phishing reportado por usuario',severity:'Media',status:'Cerrado',opened:'30 ago · 10:05',owner:'SENTINEL + ACADEMY',asset:'Correo / identidad humana',impact:'Mensaje contenido; credenciales no confirmadas como expuestas.',confidence:92,evidence:'EV-SOC-861'},
]

const seedPaths:AttackPath[]=[
  {id:'PATH-01',entry:'Internet → API Gateway',steps:['Dependencia vulnerable','Token de servicio','Permiso elevado'],target:'Supabase Enterprise22',likelihood:74,impact:96,status:'Mitigando',evidence:'Modelado demo · VUL-101 + ID-002'},
  {id:'PATH-02',entry:'Credencial privilegiada',steps:['Break-glass Admin','Workspace ejecutivo'],target:'CEO Workspace',likelihood:48,impact:91,status:'Abierta',evidence:'Modelado demo · ID-005 + AST-SEC-03'},
  {id:'PATH-03',entry:'Endpoint financiero',steps:['Sesión local','Documento sensible'],target:'Información financiera',likelihood:36,impact:78,status:'Abierta',evidence:'Modelado demo · AST-SEC-05'},
]

const seedControls:Control[]=[
  {id:'CTL-01',name:'MFA para identidades humanas privilegiadas',domain:'IAM',owner:'SENTINEL + NEXUS',coverage:100,status:'Efectivo',evidence:'IAM policy demo',lastTest:'01 sep 2026'},
  {id:'CTL-02',name:'Least privilege en cuentas de servicio',domain:'IAM',owner:'NEXUS',coverage:72,status:'Parcial',evidence:'Role review demo',lastTest:'30 ago 2026'},
  {id:'CTL-03',name:'Gestión de vulnerabilidades',domain:'Exposure',owner:'SENTINEL + NEXUS',coverage:81,status:'Parcial',evidence:'Vulnerability queue demo',lastTest:'01 sep 2026'},
  {id:'CTL-04',name:'Respuesta a incidentes P1/P2',domain:'IR',owner:'SENTINEL',coverage:92,status:'Efectivo',evidence:'ARCHIVE · playbook P1/P2',lastTest:'22 ago 2026'},
  {id:'CTL-05',name:'Backup / recovery evidence',domain:'Resilience',owner:'NEXUS + ORBIT',coverage:76,status:'Parcial',evidence:'DR exercise demo',lastTest:'25 ago 2026'},
  {id:'CTL-06',name:'Clasificación y manejo de información',domain:'Data',owner:'NORM + ARCHIVE',coverage:67,status:'Débil',evidence:'Policy mapping demo',lastTest:'28 ago 2026'},
]

const documents=[
  'Executive Security Posture','Security Risk Register','Incident Response Report','Incident Timeline','Threat Brief',
  'Attack Path Review','Privileged Access Review','Identity Risk Report','Vulnerability Prioritization','Patch & Remediation Plan',
  'Zero Trust Assessment','Control Coverage Report','Security Exception Memo','Asset Criticality Review','Tabletop After Action Review',
]
const knowledge=[
  'Inventario crítico APEX / NEXUS','Identidades y privilegios autorizados','Políticas SENTINEL / NORM','Playbooks ARCHIVE',
  'Riesgos y dependencias PMO','Capacitación ACADEMY','Controles técnicos NEXUS','Evidencia y excepciones autorizadas del tenant',
]
const suggestions=[
  '¿Qué exposición representa mayor riesgo real hoy?','Prioriza vulnerabilidades por activo, exploitabilidad y privilegio',
  '¿Qué identidades privilegiadas requieren revisión?','Resume incidentes abiertos y propone next best actions gobernadas',
]

function sevWeight(s:Severity){return s==='Crítica'?100:s==='Alta'?76:s==='Media'?48:24}
function riskTone(v:string){return v==='Crítica'||v==='Crítico'?'risk':v==='Alta'||v==='Alto'?'warn':'good'}

export default function SecurityModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [vulnerabilities,setVulnerabilities]=useState(seedVulnerabilities)
  const [incidents,setIncidents]=useState(seedIncidents)
  const [paths,setPaths]=useState(seedPaths)
  const [controls,setControls]=useState(seedControls)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState('AST-SEC-01')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',severity:'Media' as Severity,asset:'WAE API Gateway',owner:'SENTINEL'})

  const exposureRows=useMemo(()=>vulnerabilities.map(v=>{
    const asset=seedAssets.find(a=>a.id===v.assetId)!
    const score=Math.min(100,Math.round(sevWeight(v.severity)*.35+asset.health<75?12:0))
    const contextual=Math.min(100,Math.round(sevWeight(v.severity)*.45+(v.exploitable?20:0)+(v.internet?12:0)+(asset.criticality==='Crítica'?18:asset.criticality==='Alta'?10:3)+(v.age>7?5:0)))
    return {...v,asset,score:Math.max(score,contextual)}
  }),[vulnerabilities])

  const openCritical=exposureRows.filter(v=>v.status!=='Resuelta'&&v.score>=75).length
  const privileged=seedIdentities.filter(i=>i.privileged).length
  const highIdentityRisk=seedIdentities.filter(i=>i.privileged&&(i.risk==='Alto'||i.risk==='Crítico')).length
  const controlCoverage=Math.round(controls.reduce((s,c)=>s+c.coverage,0)/controls.length)
  const activeIncidents=incidents.filter(i=>i.status!=='Cerrado').length
  const openPaths=paths.filter(p=>p.status!=='Cerrada').length
  const posture=Math.max(0,Math.min(100,Math.round(controlCoverage-openCritical*5-highIdentityRisk*4-activeIncidents*2+8)))

  const filteredAssets=useMemo(()=>{
    const q=query.trim().toLowerCase(); if(!q)return seedAssets
    return seedAssets.filter(a=>[a.id,a.name,a.type,a.owner,a.criticality,a.data,a.source].some(v=>v.toLowerCase().includes(q)))
  },[query])
  const selectedAsset=seedAssets.find(a=>a.id===selected)??seedAssets[0]

  const nextActions=useMemo(()=>[
    {title:'Cerrar exposición del API Gateway',reason:'Activo crítico expuesto a internet + vulnerabilidad explotable + cuenta de servicio privilegiada.',tone:'risk'},
    {title:'Revisar Break-glass Admin',reason:'Identidad privilegiada con riesgo crítico; validar necesidad, acceso reciente, MFA y trazabilidad.',tone:'risk'},
    {title:'Fortalecer clasificación de información',reason:'Control de Data coverage 67%; afecta manejo consistente de información sensible.',tone:'warn'},
    {title:'Ejecutar tabletop de ruta PATH-01',reason:'La combinación activo crítico + servicio privilegiado + exposición crea un attack path de alta consecuencia.',tone:'warn'},
  ] as const,[])

  const createIncident=()=>{
    if(!draft.title.trim())return
    const id=`INC-260901-${String(incidents.length+2).padStart(2,'0')}`
    setIncidents(v=>[{id,title:draft.title.trim(),severity:draft.severity,status:'Nuevo',opened:'01 sep · ahora',owner:draft.owner,asset:draft.asset,impact:'Impacto por determinar; no asumir compromiso hasta validar evidencia.',confidence:55,evidence:'Pendiente'},...v])
    setOpen(false);setDraft({title:'',severity:'Media',asset:'WAE API Gateway',owner:'SENTINEL'});setTab('incidents')
  }
  const advanceIncident=(id:string)=>setIncidents(v=>v.map(i=>{
    if(i.id!==id)return i
    const order:IncidentStatus[]=['Nuevo','Investigando','Conteniendo','Erradicando','Recuperando','Cerrado']
    return {...i,status:order[Math.min(order.length-1,order.indexOf(i.status)+1)]}
  }))
  const mitigateVulnerability=(id:string)=>setVulnerabilities(v=>v.map(x=>x.id===id?{...x,status:x.status==='Abierta'?'Mitigando':'Resuelta'}:x))
  const mitigatePath=(id:string)=>setPaths(v=>v.map(p=>p.id===id?{...p,status:p.status==='Abierta'?'Mitigando':'Cerrada'}:p))
  const improveControl=(id:string)=>setControls(v=>v.map(c=>c.id===id?{...c,status:c.status==='No implementado'?'Débil':c.status==='Débil'?'Parcial':'Efectivo',coverage:Math.min(100,c.coverage+12)}:c))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Seguridad\n**Agente:** SENTINEL\n\n## Executive security posture\n- Security posture demo: ${posture}/100\n- Exposiciones prioritarias: ${openCritical}\n- Incidentes activos: ${activeIncidents}\n- Identidades privilegiadas de alto riesgo: ${highIdentityRisk}\n\n## Activo / identidad / alcance\n\n## Evidencia observada\n\n## Hipótesis / supuestos\n\n## Impacto y criticidad\n\n## Attack path / dependencia\n\n## Controles actuales\n\n## Next best action\n\n## Owner / aprobación\n\n## Evidencia de cierre\n\n> Documento de seguridad demo. No afirmar compromiso, explotación o atribución sin evidencia suficiente. Validar telemetría, alcance, permisos y responsables antes de acciones reales.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="security-premium">
    <header className="security-head">
      <div className="security-brand"><span><ShieldCheck size={25}/></span><div><small>SENTINEL · DIRECTOR DE CIBERSEGURIDAD AI</small><h1>Cybersecurity & Enterprise Risk Command Center</h1><p>Exposure, identity, attack paths, controls e incident response con evidencia y gobierno.</p></div></div>
      <div className="security-head-status"><i/>Datos demo · Defensive intelligence</div>
    </header>

    <nav className="security-tabs">{[
      ['command','Command Center'],['posture','Posture'],['assets','Activos'],['iam','IAM'],['vulnerabilities','Exposure'],['incidents','Incidentes'],['attackpaths','Attack Paths'],['controls','Controles'],['documents','Documentos'],['agent','SENTINEL AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="security-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Security posture" value={`${posture}/100`} detail={`${openCritical} exposiciones prioritarias`} tone="emerald"/>
      <Kpi icon={<Fingerprint size={18}/>} label="Privileged identities" value={String(privileged)} detail={`${highIdentityRisk} alto/crítico`} tone="violet"/>
      <Kpi icon={<Activity size={18}/>} label="Incidentes activos" value={String(activeIncidents)} detail={`${incidents.filter(i=>i.severity==='Crítica'&&i.status!=='Cerrado').length} críticos`} tone="rose"/>
      <Kpi icon={<ShieldCheck size={18}/>} label="Control coverage" value={`${controlCoverage}%`} detail={`${openPaths} attack paths abiertos`} tone="cyan"/>
    </div>}

    {tab==='command'&&<>
      <div className="security-grid-2">
        <article className="security-panel hero"><div className="panel-title"><div><small>SECURITY CONTROL TOWER</small><h2>Enterprise security posture</h2></div><Radar size={20}/></div>
          <div className="security-ring"><strong>{posture}</strong><span>/100</span></div>
          <p>SENTINEL prioriza exposición contextual: criticidad del activo, exploitabilidad, internet exposure, privilegios y controles existentes.</p>
          <div className="mini-stats"><span><b>{openCritical}</b> exposiciones</span><span><b>{highIdentityRisk}</b> privileged risk</span><span><b>{activeIncidents}</b> incidentes</span></div>
        </article>
        <article className="security-panel"><div className="panel-title"><div><small>DECISION QUEUE</small><h2>Next Best Security Actions</h2></div><Sparkles size={20}/></div>
          <div className="security-actions">{nextActions.map(a=><div key={a.title} className={`security-action ${a.tone}`}><span>{a.tone==='risk'?<ShieldAlert size={17}/>:<Zap size={17}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></div>)}</div>
        </article>
      </div>
      <div className="security-grid-2">
        <article className="security-panel"><div className="panel-title"><div><small>TOP EXPOSURE</small><h2>Contextual risk queue</h2></div><Bug size={20}/></div>{exposureRows.sort((a,b)=>b.score-a.score).slice(0,4).map(v=><div className="exposure-row" key={v.id}><div><b>{v.title}</b><small>{v.asset.name} · {v.evidence}</small></div><strong>{v.score}</strong></div>)}</article>
        <article className="security-panel"><div className="panel-title"><div><small>IDENTITY RISK</small><h2>Privileged access posture</h2></div><KeyRound size={20}/></div>{seedIdentities.filter(i=>i.privileged).map(i=><div className="identity-row" key={i.id}><div><b>{i.name}</b><small>{i.role} · MFA {i.mfa?'sí':'no'} · {i.lastAccess}</small></div><span className={`risk-chip ${riskTone(i.risk)}`}>{i.risk}</span></div>)}</article>
      </div>
    </>}

    {tab==='posture'&&<div className="security-grid-3">{[
      ['Identity & Access',Math.round(seedIdentities.reduce((s,i)=>s+(i.risk==='Bajo'?95:i.risk==='Medio'?80:i.risk==='Alto'?62:42),0)/seedIdentities.length),'Privilegios, MFA y cuentas de servicio'],
      ['Exposure Management',Math.max(40,100-openCritical*12),'Vulnerabilidades contextualizadas'],
      ['Incident Readiness',Math.round(seedControls.find(c=>c.id==='CTL-04')!.coverage),'Playbooks, evidencia y tabletop'],
      ['Data Protection',seedControls.find(c=>c.id==='CTL-06')!.coverage,'Clasificación y manejo de información'],
      ['Resilience',seedControls.find(c=>c.id==='CTL-05')!.coverage,'Backup, recovery y continuidad'],
      ['Attack Surface',Math.max(35,100-openPaths*11),'Rutas de ataque modeladas'],
    ].map(([name,value,detail])=><article className="security-panel posture-card" key={String(name)}><Gauge size={20}/><strong>{value}/100</strong><h3>{name}</h3><p>{detail}</p><div className="bar"><i style={{width:`${value}%`}}/></div></article>)}</div>}

    {tab==='assets'&&<article className="security-panel"><div className="panel-title"><div><small>ASSET SECURITY 360</small><h2>Activos críticos</h2></div><Layers3 size={20}/></div><div className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar activo, owner, dato..."/></div><div className="asset-layout"><div className="asset-list">{filteredAssets.map(a=><button key={a.id} className={selected===a.id?'active':''} onClick={()=>setSelected(a.id)}><span><b>{a.name}</b><small>{a.id} · {a.owner}</small></span><em>{a.health}/100</em></button>)}</div><div className="asset-passport"><small>SECURITY ASSET PASSPORT</small><h2>{selectedAsset.name}</h2><div className="passport-grid"><span><small>Tipo</small><b>{selectedAsset.type}</b></span><span><small>Criticidad</small><b>{selectedAsset.criticality}</b></span><span><small>Internet</small><b>{selectedAsset.internet?'Expuesto':'Interno'}</b></span><span><small>Health</small><b>{selectedAsset.health}/100</b></span><span><small>Owner</small><b>{selectedAsset.owner}</b></span><span><small>Último scan</small><b>{selectedAsset.lastScan}</b></span></div><p><b>Datos:</b> {selectedAsset.data}</p><p><b>Fuente:</b> {selectedAsset.source}</p></div></div></article>}

    {tab==='iam'&&<article className="security-panel table-panel"><div className="panel-title"><div><small>IDENTITY SECURITY</small><h2>Identity & Privilege Intelligence</h2></div><UserRoundCheck size={20}/></div><div className="table-wrap"><table><thead><tr><th>Identidad</th><th>Tipo</th><th>Rol</th><th>Privilegio</th><th>MFA</th><th>Último acceso</th><th>Riesgo</th></tr></thead><tbody>{seedIdentities.map(i=><tr key={i.id}><td><b>{i.name}</b><small>{i.source}</small></td><td>{i.type}</td><td>{i.role}</td><td>{i.privileged?'Sí':'No'}</td><td>{i.mfa?'Sí':'No'}</td><td>{i.lastAccess}</td><td><span className={`risk-chip ${riskTone(i.risk)}`}>{i.risk}</span></td></tr>)}</tbody></table></div><div className="security-note"><LockKeyhole size={17}/><p>Las acciones IAM son solo recomendaciones demo. Revocar acceso, cambiar roles o rotar credenciales requiere integración IAM real, autorización y evidencia.</p></div></article>}

    {tab==='vulnerabilities'&&<article className="security-panel table-panel"><div className="panel-title"><div><small>EXPOSURE MANAGEMENT</small><h2>Vulnerabilidades contextualizadas</h2></div><Bug size={20}/></div><div className="table-wrap"><table><thead><tr><th>Exposición</th><th>Activo</th><th>CVSS</th><th>Exploit</th><th>Internet</th><th>Score contextual</th><th>Estado</th><th></th></tr></thead><tbody>{exposureRows.sort((a,b)=>b.score-a.score).map(v=><tr key={v.id}><td><b>{v.title}</b><small>{v.id} · {v.evidence}</small></td><td>{v.asset.name}</td><td>{v.cvss}</td><td>{v.exploitable?'Sí':'No'}</td><td>{v.internet?'Sí':'No'}</td><td><strong>{v.score}/100</strong></td><td>{v.status}</td><td><button className="mini-btn" onClick={()=>mitigateVulnerability(v.id)}>{v.status==='Abierta'?'Mitigar':'Resolver'}</button></td></tr>)}</tbody></table></div></article>}

    {tab==='incidents'&&<><div className="security-toolbar"><div><small>INCIDENT RESPONSE</small><h2>Incident Command</h2></div><button onClick={()=>setOpen(true)}><Plus size={16}/> Nuevo incidente</button></div><div className="incident-grid">{incidents.map(i=><article className={`incident-card ${riskTone(i.severity)}`} key={i.id}><div className="incident-top"><span>{i.id}</span><span className={`risk-chip ${riskTone(i.severity)}`}>{i.severity}</span></div><h3>{i.title}</h3><p>{i.impact}</p><div className="incident-meta"><span><Clock3 size={14}/>{i.opened}</span><span><Target size={14}/>{i.asset}</span><span><Fingerprint size={14}/>{i.evidence}</span></div><footer><span>{i.status} · confidence {i.confidence}%</span>{i.status!=='Cerrado'&&<button className="mini-btn" onClick={()=>advanceIncident(i.id)}>Avanzar respuesta</button>}</footer></article>)}</div></>}

    {tab==='attackpaths'&&<div className="path-grid">{paths.map(p=><article className="security-panel path-card" key={p.id}><div className="panel-title"><div><small>{p.id}</small><h2>{p.entry}</h2></div><Network size={20}/></div><div className="path-flow"><span>{p.entry}</span>{p.steps.map(s=><><i key={`${p.id}-${s}`}>→</i><span key={`${p.id}-${s}-span`}>{s}</span></>)}<i>→</i><strong>{p.target}</strong></div><div className="path-score"><span>Likelihood <b>{p.likelihood}/100</b></span><span>Impact <b>{p.impact}/100</b></span></div><p>{p.evidence}</p><footer><span>{p.status}</span>{p.status!=='Cerrada'&&<button className="mini-btn" onClick={()=>mitigatePath(p.id)}>{p.status==='Abierta'?'Mitigar':'Cerrar ruta'}</button>}</footer></article>)}</div>}

    {tab==='controls'&&<div className="control-grid">{controls.map(c=><article className="security-panel control-card" key={c.id}><div className="control-head"><ShieldCheck size={20}/><span className={`control-status ${c.status.replaceAll(' ','-').toLowerCase()}`}>{c.status}</span></div><h3>{c.name}</h3><p>{c.domain} · {c.owner}</p><div className="bar"><i style={{width:`${c.coverage}%`}}/></div><div className="control-meta"><span>{c.coverage}% coverage</span><span>{c.lastTest}</span></div><small>{c.evidence}</small>{c.status!=='Efectivo'&&<button className="mini-btn" onClick={()=>improveControl(c.id)}>Registrar mejora demo</button>}</article>)}</div>}

    {tab==='documents'&&<article className="security-panel"><div className="panel-title"><div><small>SECURITY DOCUMENT STUDIO</small><h2>Documentos listos para Workspace</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={19}/><span><b>{d}</b><small>Evidence-aware · editable</small></span></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="security-modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="security-modal" onMouseDown={e=>e.stopPropagation()}><div><small>INCIDENT INTAKE</small><h2>Registrar incidente</h2></div><label>Título<input value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></label><label>Severidad<select value={draft.severity} onChange={e=>setDraft(v=>({...v,severity:e.target.value as Severity}))}><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label><label>Activo<input value={draft.asset} onChange={e=>setDraft(v=>({...v,asset:e.target.value}))}/></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label><p>El incidente inicia como <b>Nuevo</b>. Registrar un incidente no confirma compromiso ni atribución.</p><div className="modal-actions"><button onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={createIncident}>Crear incidente</button></div></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){
  return <article className={`security-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}
