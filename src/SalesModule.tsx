import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, BadgeCheck, BarChart3, Bot, BriefcaseBusiness, CalendarClock,
  CheckCircle2, CircleDollarSign, FileText, Gauge, Handshake, Plus, Search, Sparkles,
  Target, TrendingUp, UserRound, UsersRound, X, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './sales-premium.css'

type Tab='command'|'accounts'|'pipeline'|'forecast'|'dealrooms'|'activities'|'intelligence'|'documents'|'agent'
type Stage='Lead'|'Discovery'|'Qualified'|'Proposal'|'Negotiation'|'Won'|'Lost'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'
type Tier='Growth'|'Strategic'|'Enterprise'
type ActivityType='Llamada'|'Demo'|'Email'|'Reunión'|'Propuesta'|'Seguimiento'

type Account={id:string;name:string;tier:Tier;industry:string;owner:string;mrr:number;health:number;openOpps:number;lastTouch:string;source:string}
type Opportunity={
  id:string;accountId:string;account:string;title:string;stage:Stage;amount:number;probability:number;owner:string;
  source:string;created:string;closeDate:string;lastActivity:string;nextAction:string;champion:string;competitor:string;
  risk:Risk;confidence:number;notes:string
}
type SalesActivity={id:string;opportunityId:string;account:string;type:ActivityType;date:string;owner:string;summary:string;outcome:string}
type WinLoss={id:string;account:string;result:'Ganada'|'Perdida';amount:number;reason:string;competitor:string;lesson:string}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const pct=(v:number)=>`${Math.round(v)}%`

const seedAccounts:Account[]=[
  {id:'ACC-001',name:'Northwind México',tier:'Enterprise',industry:'Retail',owner:'Carolina Mata',mrr:68000,health:61,openOpps:2,lastTouch:'01 sep 2026',source:'PULSE + CARE'},
  {id:'ACC-002',name:'Cobalt Labs',tier:'Enterprise',industry:'Tecnología',owner:'Carolina Mata',mrr:52000,health:92,openOpps:1,lastTouch:'30 ago 2026',source:'Partner'},
  {id:'ACC-003',name:'Meridian Foods',tier:'Strategic',industry:'Consumo',owner:'Mauricio León',mrr:19700,health:72,openOpps:1,lastTouch:'01 sep 2026',source:'Inbound'},
  {id:'ACC-004',name:'Lumen Retail',tier:'Growth',industry:'Retail',owner:'Carolina Mata',mrr:28400,health:84,openOpps:1,lastTouch:'31 ago 2026',source:'PULSE'},
  {id:'ACC-005',name:'Atlas Studio',tier:'Growth',industry:'Servicios',owner:'Mauricio León',mrr:8900,health:77,openOpps:1,lastTouch:'28 ago 2026',source:'Organic'},
]

const seedOpportunities:Opportunity[]=[
  {id:'OPP-2609-014',accountId:'ACC-001',account:'Northwind México',title:'Expansión WAE OS Enterprise',stage:'Negotiation',amount:248000,probability:72,owner:'Carolina Mata',source:'PULSE',created:'14 ago 2026',closeDate:'18 sep 2026',lastActivity:'01 sep · reunión ejecutiva',nextAction:'Cerrar alcance y aprobación presupuestal',champion:'Dir. Operaciones',competitor:'ERP tradicional',risk:'Alto',confidence:78,notes:'Valor claro; riesgo por incidente abierto CARE.'},
  {id:'OPP-2609-013',accountId:'ACC-002',account:'Cobalt Labs',title:'Security + Compliance Suite',stage:'Proposal',amount:196000,probability:64,owner:'Carolina Mata',source:'Partner',created:'18 ago 2026',closeDate:'24 sep 2026',lastActivity:'31 ago · propuesta enviada',nextAction:'Validar alcance con SENTINEL y JUSTITIA',champion:'CISO',competitor:'Suite especializada',risk:'Medio',confidence:84,notes:'Buen fit técnico; falta sponsor financiero.'},
  {id:'OPP-2609-012',accountId:'ACC-003',account:'Meridian Foods',title:'Inventory + Procurement',stage:'Qualified',amount:132000,probability:48,owner:'Mauricio León',source:'Inbound',created:'21 ago 2026',closeDate:'30 sep 2026',lastActivity:'01 sep · discovery',nextAction:'Demo MERIDIAN + PROCURE',champion:'Gerente de Supply',competitor:'Sin decisión',risk:'Medio',confidence:71,notes:'Dolor operativo validado; presupuesto por confirmar.'},
  {id:'OPP-2609-011',accountId:'ACC-004',account:'Lumen Retail',title:'Finance Command Center',stage:'Discovery',amount:118000,probability:35,owner:'Carolina Mata',source:'PULSE',created:'25 ago 2026',closeDate:'08 oct 2026',lastActivity:'30 ago · email',nextAction:'Discovery CFO + business case',champion:'Controller',competitor:'BI interno',risk:'Alto',confidence:58,notes:'Interés inicial; actividad baja.'},
  {id:'OPP-2609-010',accountId:'ACC-005',account:'Atlas Studio',title:'Upgrade Core → Growth',stage:'Lead',amount:72000,probability:18,owner:'Mauricio León',source:'Organic',created:'29 ago 2026',closeDate:'15 oct 2026',lastActivity:'29 ago · lead capturado',nextAction:'Calificar ICP y urgencia',champion:'Por identificar',competitor:'Status quo',risk:'Alto',confidence:42,notes:'Lead temprano; no asumir oportunidad calificada.'},
  {id:'OPP-2608-044',accountId:'ACC-002',account:'Cobalt Labs',title:'WAE OS Core',stage:'Won',amount:156000,probability:100,owner:'Carolina Mata',source:'Partner',created:'02 jul 2026',closeDate:'22 ago 2026',lastActivity:'22 ago · contrato firmado',nextAction:'Onboarding con CARE',champion:'COO',competitor:'ERP SaaS',risk:'Bajo',confidence:100,notes:'Cierre confirmado en demo.'},
]

const seedActivities:SalesActivity[]=[
  {id:'ACT-901',opportunityId:'OPP-2609-014',account:'Northwind México',type:'Reunión',date:'01 sep 2026',owner:'Carolina Mata',summary:'Revisión ejecutiva de alcance y recuperación de servicio.',outcome:'Avance; solicitaron business case final.'},
  {id:'ACT-902',opportunityId:'OPP-2609-013',account:'Cobalt Labs',type:'Propuesta',date:'31 ago 2026',owner:'Carolina Mata',summary:'Propuesta Security + Compliance entregada.',outcome:'Revisión técnica en curso.'},
  {id:'ACT-903',opportunityId:'OPP-2609-012',account:'Meridian Foods',type:'Llamada',date:'01 sep 2026',owner:'Mauricio León',summary:'Discovery sobre stockouts y compras manuales.',outcome:'Dolor validado; agendar demo.'},
  {id:'ACT-904',opportunityId:'OPP-2609-011',account:'Lumen Retail',type:'Email',date:'30 ago 2026',owner:'Carolina Mata',summary:'Seguimiento al caso financiero.',outcome:'Pendiente respuesta CFO.'},
]

const winLoss:WinLoss[]=[
  {id:'WL-081',account:'Cobalt Labs',result:'Ganada',amount:156000,reason:'Integración multiárea + rapidez de implementación',competitor:'ERP SaaS',lesson:'Demo enfocada en operación ejecutiva elevó valor percibido.'},
  {id:'WL-079',account:'Delta Logistics',result:'Perdida',amount:142000,reason:'Presupuesto congelado',competitor:'Status quo',lesson:'Validar timing presupuestal antes de invertir demasiado ciclo comercial.'},
  {id:'WL-074',account:'Nova Health',result:'Perdida',amount:210000,reason:'Requisito de integración no resuelto',competitor:'Suite vertical',lesson:'Involucrar NEXUS antes en oportunidades con dependencia técnica crítica.'},
]

const documents=[
  'Revenue Forecast Review','Account Plan','Opportunity Brief','Mutual Action Plan','Business Case','Deal Review',
  'Proposal Executive Summary','Win / Loss Review','Pipeline Inspection','Territory Review','QBR Sales + Marketing',
  'Renewal / Expansion Plan','Sales Playbook','Handoff Sales → CARE','Reporte para Dirección Comercial',
]
const knowledge=[
  'ICP y criterios de calificación autorizados','Pipeline y actividades comerciales del tenant','Campañas y atribución PULSE',
  'Customer health y tickets CARE','Precios, márgenes y límites STERLING','Contratos y condiciones JUSTITIA',
  'Capacidades técnicas NEXUS','Facturación y cartera INVOICER','Histórico de win/loss y objeciones',
]
const suggestions=[
  '¿Qué oportunidades requieren intervención hoy?','Prioriza pipeline por probabilidad, riesgo y valor',
  '¿Qué deals están inflados o sin evidencia suficiente?','Prepara el forecast comercial y explica sus riesgos',
]

const stageOrder:Stage[]=['Lead','Discovery','Qualified','Proposal','Negotiation','Won']
function stageProbability(stage:Stage){return stage==='Lead'?18:stage==='Discovery'?35:stage==='Qualified'?50:stage==='Proposal'?65:stage==='Negotiation'?78:stage==='Won'?100:0}
function riskScore(o:Opportunity){
  let score=100
  if(o.risk==='Crítico')score-=35;else if(o.risk==='Alto')score-=22;else if(o.risk==='Medio')score-=10
  if(o.confidence<60)score-=15
  if(o.champion==='Por identificar')score-=12
  if(o.lastActivity.includes('30 ago')||o.lastActivity.includes('29 ago'))score-=8
  return Math.max(0,score)
}

export default function SalesModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [opportunities,setOpportunities]=useState(seedOpportunities)
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const [selected,setSelected]=useState('OPP-2609-014')
  const [draft,setDraft]=useState({account:'Northwind México',title:'',amount:100000,owner:'Carolina Mata',source:'PULSE'})

  const openOpps=opportunities.filter(o=>!['Won','Lost'].includes(o.stage))
  const pipeline=openOpps.reduce((s,o)=>s+o.amount,0)
  const weighted=openOpps.reduce((s,o)=>s+o.amount*(o.probability/100),0)
  const commit=openOpps.filter(o=>o.stage==='Negotiation'&&o.confidence>=70).reduce((s,o)=>s+o.amount,0)
  const won=opportunities.filter(o=>o.stage==='Won').reduce((s,o)=>s+o.amount,0)
  const avgDeal=openOpps.length?pipeline/openOpps.length:0
  const highRisk=openOpps.filter(o=>o.risk==='Alto'||o.risk==='Crítico').length
  const stale=openOpps.filter(o=>o.lastActivity.includes('30 ago')||o.lastActivity.includes('29 ago')).length
  const coverage=pipeline/Math.max(1,600000)
  const health=Math.max(0,Math.min(100,Math.round(82-highRisk*4-stale*3+Math.min(8,coverage*2))))

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return opportunities
    return opportunities.filter(o=>[o.id,o.account,o.title,o.stage,o.owner,o.source,o.risk,o.nextAction].some(v=>v.toLowerCase().includes(q)))
  },[opportunities,query])
  const selectedOpp=opportunities.find(o=>o.id===selected)??opportunities[0]

  const actions=useMemo(()=>{
    const list:{title:string;reason:string;tone:'good'|'warn'|'risk';id?:string}[]=[]
    const top=[...openOpps].sort((a,b)=>(b.amount*b.probability)-(a.amount*a.probability))[0]
    if(top)list.push({title:`Executive deal review · ${top.account}`,reason:`${money(top.amount)} · ${top.probability}% probabilidad · riesgo ${top.risk.toLowerCase()} · próxima acción: ${top.nextAction}.`,tone:top.risk==='Alto'||top.risk==='Crítico'?'risk':'good',id:top.id})
    const weak=openOpps.find(o=>o.confidence<60)
    if(weak)list.push({title:`Recalificar ${weak.id}`,reason:`Confidence ${weak.confidence}/100; evitar inflar forecast hasta validar champion, presupuesto y siguiente paso.`,tone:'warn',id:weak.id})
    const noChampion=openOpps.find(o=>o.champion==='Por identificar')
    if(noChampion)list.push({title:`Identificar champion en ${noChampion.account}`,reason:'Sin sponsor interno la oportunidad tiene mayor riesgo de estancamiento y forecast débil.',tone:'risk',id:noChampion.id})
    const expansion=seedAccounts.find(a=>a.health>=85&&a.mrr>=50000)
    if(expansion)list.push({title:`Explorar expansión en ${expansion.name}`,reason:`Health ${expansion.health}/100 y MRR ${money(expansion.mrr)}; revisar señales de uso y necesidades antes de abrir oportunidad.`,tone:'good'})
    return list
  },[opportunities])

  const createOpportunity=()=>{
    if(!draft.title.trim()||draft.amount<=0)return
    const account=seedAccounts.find(a=>a.name===draft.account)??seedAccounts[0]
    const id=`OPP-2609-${String(15+opportunities.length).padStart(3,'0')}`
    const next:Opportunity={id,accountId:account.id,account:account.name,title:draft.title.trim(),stage:'Lead',amount:Number(draft.amount),probability:18,owner:draft.owner,source:draft.source,created:'01 sep 2026',closeDate:'Por definir',lastActivity:'01 sep · creada',nextAction:'Calificar ICP, dolor, urgencia y presupuesto',champion:'Por identificar',competitor:'Por identificar',risk:'Medio',confidence:35,notes:'Oportunidad demo nueva; no incluida como commit.'}
    setOpportunities(v=>[next,...v]);setSelected(id);setDraft({account:'Northwind México',title:'',amount:100000,owner:'Carolina Mata',source:'PULSE'});setOpen(false);setTab('pipeline')
  }
  const advanceStage=(id:string)=>setOpportunities(v=>v.map(o=>{
    if(o.id!==id||o.stage==='Won'||o.stage==='Lost')return o
    const idx=stageOrder.indexOf(o.stage);const stage=stageOrder[Math.min(stageOrder.length-1,idx+1)]
    return {...o,stage,probability:stageProbability(stage),confidence:Math.min(100,o.confidence+8),lastActivity:'01 sep · etapa actualizada'}
  }))
  const markLost=(id:string)=>setOpportunities(v=>v.map(o=>o.id===id?{...o,stage:'Lost',probability:0,lastActivity:'01 sep · cierre perdido demo',nextAction:'Registrar win/loss review'}:o))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Ventas & CRM\n**Agente:** CLOSER\n\n## Resumen ejecutivo\n- Pipeline abierto demo: ${money(pipeline)}\n- Forecast ponderado demo: ${money(weighted)}\n- Commit demo: ${money(commit)}\n- Won demo: ${money(won)}\n- Oportunidades alto riesgo: ${highRisk}\n\n## Cuenta / oportunidad\n\n## Problema y valor de negocio\n\n## Champion / stakeholders\n\n## Etapa y evidencia\n\n## Presupuesto / autoridad / timing\n\n## Riesgos y competencia\n\n## Próxima acción\n\n## Forecast y nivel de confianza\n\n## Handoff / aprobaciones\n\n> Documento operativo demo. Validar actividad, presupuesto, decisión del cliente, contrato y evidencia comercial antes de declarar pipeline, commit o cierre real.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="sales-premium">
    <header className="sales-head">
      <div className="sales-brand"><span><Handshake size={25}/></span><div><small>CLOSER · DIRECTOR COMERCIAL AI</small><h1>Revenue Intelligence Command Center</h1><p>Pipeline, forecast, cuentas, deal health y decisiones comerciales conectadas al negocio.</p></div></div>
      <div className="sales-head-status"><i/>Datos demo · Evidence-aware revenue</div>
    </header>

    <nav className="sales-tabs">{[
      ['command','Command Center'],['accounts','Account 360'],['pipeline','Pipeline'],['forecast','Forecast'],['dealrooms','Deal Rooms'],['activities','Actividades'],['intelligence','Win/Loss'],['documents','Documentos'],['agent','CLOSER AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="sales-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Revenue health" value={`${health}/100`} detail={`${openOpps.length} oportunidades abiertas`} tone="rose"/>
      <Kpi icon={<CircleDollarSign size={18}/>} label="Pipeline" value={money(pipeline)} detail={`${coverage.toFixed(1)}x cobertura demo`} tone="cyan"/>
      <Kpi icon={<TrendingUp size={18}/>} label="Forecast ponderado" value={money(weighted)} detail={`${money(commit)} commit demo`} tone="emerald"/>
      <Kpi icon={<Target size={18}/>} label="Ticket promedio" value={money(avgDeal)} detail={`${highRisk} alto riesgo`} tone="amber"/>
      <Kpi icon={<BadgeCheck size={18}/>} label="Won" value={money(won)} detail="cierres demo confirmados" tone="violet"/>
    </div>}

    {tab==='command'&&<div className="sales-layout">
      <section className="sales-panel sales-hero-panel"><div className="sales-panel-title"><div><small>CRO VIEW</small><h2>Revenue Control Tower</h2></div><span className="sales-score"><Sparkles size={17}/>{health}/100</span></div>
        <div className="sales-health-grid"><div><span>Pipeline</span><b>{money(pipeline)}</b><i className="good"/></div><div><span>Weighted</span><b>{money(weighted)}</b><i className="good"/></div><div><span>Commit</span><b>{money(commit)}</b><i className={commit?'good':'warn'}/></div><div><span>Stale deals</span><b>{stale}</b><i className={stale?'warn':'good'}/></div></div>
        <div className="sales-ai-brief"><Sparkles size={21}/><div><b>Lectura de CLOSER</b><p>El forecast debe concentrarse en evidencia de etapa, actividad reciente, champion y siguiente acción. Northwind tiene alto valor, pero CARE reporta fricción; Cobalt necesita sponsor financiero; Atlas todavía no debe tratarse como oportunidad calificada.</p></div></div>
      </section>
      <section className="sales-panel"><div className="sales-panel-title"><div><small>NEXT BEST ACTION</small><h2>Decisiones comerciales</h2></div><Bot size={18}/></div>{actions.map((a,i)=><button className={`sales-action ${a.tone}`} key={i} onClick={()=>{if(a.id){setSelected(a.id);setTab('dealrooms')}}}><span>{i+1}</span><div><b>{a.title}</b><small>{a.reason}</small></div></button>)}</section>
      <section className="sales-panel"><div className="sales-panel-title"><div><small>PIPELINE AT RISK</small><h2>Oportunidades que requieren atención</h2></div><AlertTriangle size={18}/></div>{openOpps.filter(o=>o.risk==='Alto'||o.confidence<60).map(o=><div className="sales-risk-row" key={o.id}><span className={`risk-${o.risk.toLowerCase()}`}>{o.risk}</span><div><b>{o.account} · {o.title}</b><small>{money(o.amount)} · {o.stage} · confidence {o.confidence}/100</small></div></div>)}</section>
    </div>}

    {tab==='accounts'&&<section className="sales-panel sales-wide"><div className="sales-panel-title"><div><small>ACCOUNT INTELLIGENCE</small><h2>Customer & Account 360</h2></div><UsersRound size={18}/></div><div className="account-grid">{seedAccounts.map(a=><article className="account-card" key={a.id}><div className="account-top"><span>{a.name.slice(0,2).toUpperCase()}</span><div><b>{a.name}</b><small>{a.tier} · {a.industry}</small></div><em>{a.health}/100</em></div><div className="account-metrics"><span><small>MRR</small><b>{money(a.mrr)}</b></span><span><small>Opps</small><b>{a.openOpps}</b></span><span><small>Owner</small><b>{a.owner}</b></span></div><p>Último contacto: {a.lastTouch} · Fuente: {a.source}</p><button onClick={()=>openWorkspace(`Account Plan · ${a.name}`)}><FileText size={14}/>Abrir account plan</button></article>)}</div></section>}

    {tab==='pipeline'&&<section className="sales-panel sales-wide"><div className="sales-toolbar"><div><small>PIPELINE MANAGEMENT</small><h2>Oportunidades</h2></div><div className="sales-actions"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar oportunidad..."/></label><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nueva oportunidad</button></div></div><div className="sales-table-wrap"><table><thead><tr><th>Oportunidad</th><th>Etapa</th><th>Monto</th><th>Prob.</th><th>Owner</th><th>Riesgo</th><th>Próxima acción</th></tr></thead><tbody>{filtered.map(o=><tr key={o.id} onClick={()=>setSelected(o.id)}><td><b>{o.account}</b><small>{o.title} · {o.id}</small></td><td><span className="stage-chip">{o.stage}</span></td><td>{money(o.amount)}</td><td>{pct(o.probability)}</td><td>{o.owner}</td><td><span className={`risk-${o.risk.toLowerCase()}`}>{o.risk}</span></td><td>{o.nextAction}</td></tr>)}</tbody></table></div></section>}

    {tab==='forecast'&&<div className="sales-forecast-grid"><section className="sales-panel"><div className="sales-panel-title"><div><small>FORECAST ENGINE</small><h2>Vista ponderada</h2></div><BarChart3 size={18}/></div>{['Discovery','Qualified','Proposal','Negotiation'].map(stage=>{const rows=openOpps.filter(o=>o.stage===stage);const amount=rows.reduce((s,o)=>s+o.amount,0);const weightedAmount=rows.reduce((s,o)=>s+o.amount*o.probability/100,0);return <div className="forecast-row" key={stage}><div><b>{stage}</b><small>{rows.length} oportunidades</small></div><span>{money(amount)}</span><em>{money(weightedAmount)} ponderado</em></div>})}</section><section className="sales-panel"><div className="sales-panel-title"><div><small>FORECAST QUALITY</small><h2>Confianza del forecast</h2></div><Gauge size={18}/></div>{openOpps.map(o=><div className="confidence-row" key={o.id}><div><b>{o.account}</b><small>{o.stage} · {money(o.amount)}</small></div><span>{o.confidence}/100</span><i><em style={{width:`${o.confidence}%`}}/></i></div>)}</section></div>}

    {tab==='dealrooms'&&selectedOpp&&<section className="sales-panel sales-wide"><div className="dealroom-head"><div><small>DEAL ROOM · {selectedOpp.id}</small><h2>{selectedOpp.account} · {selectedOpp.title}</h2><p>{money(selectedOpp.amount)} · {selectedOpp.stage} · {selectedOpp.probability}% · owner {selectedOpp.owner}</p></div><span className={`risk-${selectedOpp.risk.toLowerCase()}`}>{selectedOpp.risk}</span></div><div className="dealroom-grid"><DealFact label="Deal health" value={`${riskScore(selectedOpp)}/100`}/><DealFact label="Forecast confidence" value={`${selectedOpp.confidence}/100`}/><DealFact label="Champion" value={selectedOpp.champion}/><DealFact label="Competencia" value={selectedOpp.competitor}/><DealFact label="Cierre esperado" value={selectedOpp.closeDate}/><DealFact label="Fuente" value={selectedOpp.source}/></div><div className="dealroom-notes"><div><small>ÚLTIMA ACTIVIDAD</small><b>{selectedOpp.lastActivity}</b></div><div><small>PRÓXIMA ACCIÓN</small><b>{selectedOpp.nextAction}</b></div><div><small>LECTURA</small><b>{selectedOpp.notes}</b></div></div><div className="dealroom-actions"><button onClick={()=>advanceStage(selectedOpp.id)}><TrendingUp size={15}/>Avanzar etapa demo</button><button onClick={()=>openWorkspace(`Deal Review · ${selectedOpp.account}`)}><FileText size={15}/>Abrir Deal Review</button><button className="danger" onClick={()=>markLost(selectedOpp.id)}><X size={15}/>Marcar perdida demo</button></div></section>}

    {tab==='activities'&&<section className="sales-panel sales-wide"><div className="sales-panel-title"><div><small>ACTIVITY INTELLIGENCE</small><h2>Actividad comercial</h2></div><Activity size={18}/></div><div className="activity-list">{seedActivities.map(a=><article key={a.id}><span><CalendarClock size={16}/></span><div><b>{a.account} · {a.type}</b><small>{a.date} · {a.owner}</small><p>{a.summary}</p><em>{a.outcome}</em></div></article>)}</div></section>}

    {tab==='intelligence'&&<section className="sales-panel sales-wide"><div className="sales-panel-title"><div><small>WIN / LOSS INTELLIGENCE</small><h2>Aprendizajes comerciales</h2></div><Zap size={18}/></div><div className="winloss-grid">{winLoss.map(w=><article key={w.id} className={w.result==='Ganada'?'won':'lost'}><div><span>{w.result==='Ganada'?<CheckCircle2 size={17}/>:<AlertTriangle size={17}/>}</span><div><b>{w.account}</b><small>{money(w.amount)} · {w.competitor}</small></div></div><p><strong>Razón:</strong> {w.reason}</p><p><strong>Aprendizaje:</strong> {w.lesson}</p></article>)}</div></section>}

    {tab==='documents'&&<section className="sales-panel sales-wide"><div className="sales-panel-title"><div><small>REVENUE DOCUMENT STUDIO</small><h2>Documentos editables en Workspace</h2></div><FileText size={18}/></div><div className="sales-doc-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><span><FileText size={17}/></span><div><b>{d}</b><small>Generar borrador trazable</small></div></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="sales-modal-backdrop"><div className="sales-modal"><button className="modal-close" onClick={()=>setOpen(false)}><X size={18}/></button><small>NEW OPPORTUNITY</small><h2>Nueva oportunidad</h2><label>Cuenta<select value={draft.account} onChange={e=>setDraft(v=>({...v,account:e.target.value}))}>{seedAccounts.map(a=><option key={a.id}>{a.name}</option>)}</select></label><label>Oportunidad<input value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))} placeholder="Ej. Expansión Enterprise"/></label><label>Monto<input type="number" value={draft.amount} onChange={e=>setDraft(v=>({...v,amount:Number(e.target.value)}))}/></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label><label>Fuente<input value={draft.source} onChange={e=>setDraft(v=>({...v,source:e.target.value}))}/></label><p>Nace como <b>Lead</b> con confidence bajo. Debe calificarse antes de entrar al forecast serio.</p><button className="primary" onClick={createOpportunity}>Crear oportunidad demo</button></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`sales-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function DealFact({label,value}:{label:string;value:string}){return <div className="deal-fact"><small>{label}</small><b>{value}</b></div>}
