import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, BadgeCheck, BarChart3, Bot, CheckCircle2, Clock3, FileText,
  Headphones, HeartPulse, Inbox, Mail, MessageCircle, MessageSquareText, Phone,
  Plus, Search, Send, ShieldCheck, Sparkles, Target, ThumbsUp, UserRound,
  UsersRound, X, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './care-premium.css'

type Tab='command'|'inbox'|'tickets'|'sla'|'customers'|'insights'|'knowledge'|'documents'|'agent'
type Channel='WhatsApp'|'Email'|'Chat web'|'Teléfono'|'Portal'
type Priority='Baja'|'Media'|'Alta'|'Crítica'
type Sentiment='Positivo'|'Neutral'|'Negativo'|'Frustrado'
type TicketStatus='Nuevo'|'En curso'|'Esperando cliente'|'Escalado'|'Resuelto'
type CustomerTier='Standard'|'Growth'|'Strategic'

type Ticket={
  id:string;customerId:string;customer:string;subject:string;channel:Channel;priority:Priority;
  sentiment:Sentiment;status:TicketStatus;owner:string;created:string;lastUpdate:string;
  slaMinutes:number;elapsedMinutes:number;messages:number;category:string;source:string
}
type Customer={
  id:string;name:string;tier:CustomerTier;mrr:number;health:number;nps:number;tickets90:number;
  churnRisk:'Bajo'|'Medio'|'Alto';lastContact:string;owner:string;products:string[]
}
type KnowledgeItem={id:string;title:string;category:string;coverage:number;updated:string;owner:string}

type Action={title:string;reason:string;tone:'risk'|'warn'|'good';ticketId?:string}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const pct=(v:number)=>`${Math.max(0,Math.min(100,Math.round(v)))}%`

const seedCustomers:Customer[]=[
  {id:'CUS-001',name:'Northwind México',tier:'Strategic',mrr:68000,health:61,nps:3,tickets90:8,churnRisk:'Alto',lastContact:'01 sep 2026',owner:'Carolina Mata',products:['Enterprise','Analytics']},
  {id:'CUS-002',name:'Lumen Retail',tier:'Growth',mrr:28400,health:84,nps:8,tickets90:3,churnRisk:'Bajo',lastContact:'31 ago 2026',owner:'CARE',products:['Core','Invoices']},
  {id:'CUS-003',name:'Cobalt Labs',tier:'Strategic',mrr:52000,health:92,nps:9,tickets90:2,churnRisk:'Bajo',lastContact:'30 ago 2026',owner:'Carolina Mata',products:['Enterprise','Security']},
  {id:'CUS-004',name:'Meridian Foods',tier:'Growth',mrr:19700,health:72,nps:6,tickets90:5,churnRisk:'Medio',lastContact:'01 sep 2026',owner:'CARE',products:['Core','Inventory']},
  {id:'CUS-005',name:'Atlas Studio',tier:'Standard',mrr:8900,health:77,nps:7,tickets90:1,churnRisk:'Bajo',lastContact:'28 ago 2026',owner:'CARE',products:['Core']},
]

const seedTickets:Ticket[]=[
  {id:'TCK-2609-041',customerId:'CUS-001',customer:'Northwind México',subject:'Intermitencia en sincronización de conversaciones',channel:'WhatsApp',priority:'Crítica',sentiment:'Frustrado',status:'Escalado',owner:'NEXUS + CARE',created:'01 sep · 06:42',lastUpdate:'hace 8 min',slaMinutes:60,elapsedMinutes:52,messages:14,category:'Incidente técnico',source:'Cliente'},
  {id:'TCK-2609-040',customerId:'CUS-004',customer:'Meridian Foods',subject:'Duda sobre reposición automática',channel:'Chat web',priority:'Media',sentiment:'Neutral',status:'En curso',owner:'CARE',created:'01 sep · 06:31',lastUpdate:'hace 12 min',slaMinutes:120,elapsedMinutes:46,messages:6,category:'Producto',source:'Cliente'},
  {id:'TCK-2609-039',customerId:'CUS-002',customer:'Lumen Retail',subject:'Solicitud de estado de cuenta',channel:'Email',priority:'Baja',sentiment:'Neutral',status:'Esperando cliente',owner:'CARE',created:'01 sep · 05:55',lastUpdate:'hace 28 min',slaMinutes:240,elapsedMinutes:85,messages:4,category:'Administrativo',source:'Cliente'},
  {id:'TCK-2609-038',customerId:'CUS-003',customer:'Cobalt Labs',subject:'Confirmación de nueva política de acceso',channel:'Portal',priority:'Alta',sentiment:'Positivo',status:'En curso',owner:'SENTINEL + CARE',created:'01 sep · 05:40',lastUpdate:'hace 18 min',slaMinutes:90,elapsedMinutes:42,messages:7,category:'Seguridad',source:'Cliente'},
  {id:'TCK-2609-037',customerId:'CUS-001',customer:'Northwind México',subject:'Seguimiento de factura vencida',channel:'Teléfono',priority:'Alta',sentiment:'Negativo',status:'Nuevo',owner:'CARE',created:'01 sep · 06:58',lastUpdate:'hace 4 min',slaMinutes:90,elapsedMinutes:18,messages:2,category:'Facturación',source:'Cliente'},
  {id:'TCK-2608-188',customerId:'CUS-005',customer:'Atlas Studio',subject:'Configuración de usuarios',channel:'Chat web',priority:'Baja',sentiment:'Positivo',status:'Resuelto',owner:'CARE',created:'31 ago · 14:22',lastUpdate:'31 ago',slaMinutes:180,elapsedMinutes:54,messages:8,category:'Onboarding',source:'Cliente'},
]

const knowledgeItems:KnowledgeItem[]=[
  {id:'KB-101',title:'Runbook · Sincronización de conversaciones',category:'Técnico',coverage:93,updated:'31 ago 2026',owner:'NEXUS'},
  {id:'KB-102',title:'FAQ · Facturación y estados de cuenta',category:'Facturación',coverage:88,updated:'30 ago 2026',owner:'INVOICER'},
  {id:'KB-103',title:'Playbook · Recuperación de servicio',category:'Customer Success',coverage:81,updated:'28 ago 2026',owner:'CARE'},
  {id:'KB-104',title:'Guía · Accesos y seguridad',category:'Seguridad',coverage:96,updated:'01 sep 2026',owner:'SENTINEL'},
  {id:'KB-105',title:'Manual · Inventarios y reposición',category:'Producto',coverage:91,updated:'29 ago 2026',owner:'MERIDIAN'},
]

const documents=[
  'Customer 360 · Resumen ejecutivo','Reporte de tickets y SLA','Informe de experiencia del cliente',
  'Plan de recuperación de servicio','Plan de retención de cuenta','QBR / Business Review','Voice of Customer',
  'Reporte CSAT / NPS','Postmortem de incidente de cliente','Matriz de escalamiento','Playbook de atención omnicanal',
  'Checklist de onboarding','Reporte de churn risk','Reporte para Dirección Comercial',
]
const knowledge=[
  'Política de atención y niveles de servicio','Catálogo de productos y troubleshooting autorizado',
  'Contratos y SLA de clientes autorizados','Base de conocimiento y runbooks NEXUS','Facturación y cartera INVOICER',
  'CRM y account ownership CLOSER','Estado de seguridad SENTINEL','Histórico autorizado de conversaciones y tickets del tenant',
]
const suggestions=[
  '¿Qué clientes requieren intervención hoy?','Prioriza tickets por SLA, sentimiento y valor de cuenta',
  'Detecta riesgo de churn y propón acciones de retención','Resume la voz del cliente y los problemas recurrentes',
]

const channelIcon=(channel:Channel):ReactNode=>{
  if(channel==='Email')return <Mail size={16}/>
  if(channel==='Teléfono')return <Phone size={16}/>
  if(channel==='WhatsApp')return <MessageCircle size={16}/>
  if(channel==='Portal')return <Inbox size={16}/>
  return <MessageSquareText size={16}/>
}

function slaRemaining(t:Ticket){return t.slaMinutes-t.elapsedMinutes}
function slaState(t:Ticket){const remaining=slaRemaining(t);if(t.status==='Resuelto')return 'ok';if(remaining<=0)return 'breach';if(remaining<=20)return 'risk';if(remaining<=45)return 'warn';return 'ok'}

export default function CustomerExperienceModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [tickets,setTickets]=useState(seedTickets)
  const [customers,setCustomers]=useState(seedCustomers)
  const [query,setQuery]=useState('')
  const [selectedTicket,setSelectedTicket]=useState('TCK-2609-041')
  const [newOpen,setNewOpen]=useState(false)
  const [draft,setDraft]=useState({customer:'Northwind México',subject:'',channel:'Chat web' as Channel,priority:'Media' as Priority,category:'Producto'})

  const openTickets=tickets.filter(t=>t.status!=='Resuelto')
  const critical=openTickets.filter(t=>t.priority==='Crítica').length
  const atRisk=openTickets.filter(t=>['risk','breach'].includes(slaState(t))).length
  const breached=openTickets.filter(t=>slaState(t)==='breach').length
  const resolved=tickets.filter(t=>t.status==='Resuelto').length
  const negative=openTickets.filter(t=>t.sentiment==='Negativo'||t.sentiment==='Frustrado').length
  const highChurn=customers.filter(c=>c.churnRisk==='Alto').length
  const avgHealth=Math.round(customers.reduce((s,c)=>s+c.health,0)/Math.max(1,customers.length))
  const avgNps=(customers.reduce((s,c)=>s+c.nps,0)/Math.max(1,customers.length)).toFixed(1)
  const responseHealth=Math.max(0,Math.round(96-atRisk*5-breached*10-negative*2))

  const filteredTickets=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return tickets
    return tickets.filter(t=>[t.id,t.customer,t.subject,t.channel,t.priority,t.sentiment,t.status,t.owner,t.category].some(v=>v.toLowerCase().includes(q)))
  },[query,tickets])
  const selected=tickets.find(t=>t.id===selectedTicket)??tickets[0]
  const selectedCustomer=customers.find(c=>c.id===selected?.customerId)

  const actions=useMemo<Action[]>(()=>{
    const list:Action[]=[]
    const criticalTicket=openTickets.find(t=>t.priority==='Crítica')
    if(criticalTicket)list.push({title:`Escalar ${criticalTicket.id} con NEXUS`,reason:`Prioridad crítica, sentimiento ${criticalTicket.sentiment.toLowerCase()} y ${Math.max(0,slaRemaining(criticalTicket))} min de SLA restante.`,tone:'risk',ticketId:criticalTicket.id})
    const churn=customers.find(c=>c.churnRisk==='Alto')
    if(churn)list.push({title:`Activar recuperación de ${churn.name}`,reason:`Health ${churn.health}/100, NPS ${churn.nps}/10 y ${churn.tickets90} tickets en 90 días.`,tone:'warn'})
    const billing=openTickets.find(t=>t.category==='Facturación')
    if(billing)list.push({title:'Coordinar CARE + INVOICER',reason:`${billing.customer} tiene una conversación de facturación abierta; conviene resolver contexto de servicio y cartera en una sola respuesta.`,tone:'warn',ticketId:billing.id})
    list.push({title:'Cerrar el loop de Voice of Customer',reason:'Convertir temas recurrentes de soporte en acciones de producto, capacitación y base de conocimiento.',tone:'good'})
    return list
  },[tickets,customers])

  const createTicket=()=>{
    if(!draft.subject.trim())return
    const customer=customers.find(c=>c.name===draft.customer)??customers[0]
    const id=`TCK-2609-${String(42+tickets.length).padStart(3,'0')}`
    const next:Ticket={id,customerId:customer.id,customer:customer.name,subject:draft.subject.trim(),channel:draft.channel,priority:draft.priority,sentiment:'Neutral',status:'Nuevo',owner:'CARE',created:'01 sep · ahora',lastUpdate:'ahora',slaMinutes:draft.priority==='Crítica'?60:draft.priority==='Alta'?90:draft.priority==='Media'?120:240,elapsedMinutes:0,messages:1,category:draft.category,source:'Cliente'}
    setTickets(v=>[next,...v]);setSelectedTicket(id);setDraft({customer:'Northwind México',subject:'',channel:'Chat web',priority:'Media',category:'Producto'});setNewOpen(false);setTab('inbox')
  }
  const progressTicket=(id:string)=>setTickets(v=>v.map(t=>t.id===id?{...t,status:t.status==='Nuevo'?'En curso':t.status==='En curso'?'Esperando cliente':t.status==='Esperando cliente'?'Resuelto':t.status,lastUpdate:'ahora'}:t))
  const escalateTicket=(id:string)=>setTickets(v=>v.map(t=>t.id===id?{...t,status:'Escalado',priority:t.priority==='Baja'?'Media':t.priority==='Media'?'Alta':t.priority,owner:t.category==='Facturación'?'INVOICER + CARE':t.category==='Seguridad'?'SENTINEL + CARE':'NEXUS + CARE',lastUpdate:'ahora'}:t))
  const resolveTicket=(id:string)=>setTickets(v=>v.map(t=>t.id===id?{...t,status:'Resuelto',sentiment:t.sentiment==='Frustrado'?'Neutral':t.sentiment,lastUpdate:'ahora'}:t))
  const recoverCustomer=(id:string)=>setCustomers(v=>v.map(c=>c.id===id?{...c,health:Math.min(100,c.health+8),churnRisk:c.churnRisk==='Alto'?'Medio':c.churnRisk,lastContact:'01 sep 2026'}:c))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Atención / Customer Experience\n**Agente:** CARE\n\n## Resumen ejecutivo\n- Tickets abiertos: ${openTickets.length}\n- SLA en riesgo: ${atRisk}\n- Clientes alto churn: ${highChurn}\n- Customer health promedio: ${avgHealth}/100\n- NPS demo promedio: ${avgNps}/10\n\n## Cliente / conversación\n\n## Hechos y contexto verificado\n\n## Sentimiento y prioridad\n\n## SLA y responsables\n\n## Next Best Action\n\n## Evidencia / mensajes fuente\n\n## Resolución y seguimiento\n\n## Aprobaciones / escalamiento\n\n> Documento operativo demo. No enviar compensaciones, compromisos contractuales ni cambios sensibles sin validar permisos, SLA, evidencia y responsable autorizado.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="care-premium">
    <header className="care-head">
      <div className="care-brand"><span><Headphones size={25}/></span><div><small>CARE · DIRECTOR DE CUSTOMER EXPERIENCE AI</small><h1>Customer Experience Command Center</h1><p>Omnicanalidad, SLA, sentimiento, customer health, churn y resolución inteligente en una sola capa.</p></div></div>
      <div className="care-head-status"><i/>Datos demo · Human-governed CX</div>
    </header>

    <nav className="care-tabs">{[
      ['command','Command Center'],['inbox','Omnichannel Inbox'],['tickets','Tickets'],['sla','SLA Control'],['customers','Customer 360'],['insights','CX Intelligence'],['knowledge','Knowledge'],['documents','Documentos'],['agent','CARE AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="care-kpis">
      <Kpi icon={<GaugeIcon/>} label="CX Health" value={`${responseHealth}/100`} detail={`${openTickets.length} tickets abiertos`} tone="emerald"/>
      <Kpi icon={<Clock3 size={18}/>} label="SLA en riesgo" value={String(atRisk)} detail={`${breached} breach demo`} tone="amber"/>
      <Kpi icon={<HeartPulse size={18}/>} label="Customer health" value={`${avgHealth}/100`} detail={`${highChurn} cuenta alto churn`} tone="violet"/>
      <Kpi icon={<ThumbsUp size={18}/>} label="NPS promedio" value={`${avgNps}/10`} detail={`${negative} conversaciones negativas`} tone="cyan"/>
      <Kpi icon={<CheckCircle2 size={18}/>} label="Resueltos" value={String(resolved)} detail="dataset demo actual" tone="blue"/>
    </div>}

    {tab==='command'&&<div className="care-layout">
      <section className="care-panel care-hero-panel">
        <div className="care-panel-title"><div><small>CX CONTROL TOWER</small><h2>Experiencia del cliente ahora</h2></div><span className="care-score"><ShieldCheck size={17}/>{responseHealth}/100</span></div>
        <div className="care-health-grid">
          <div><span>Tickets críticos</span><b>{critical}</b><i className={critical?'risk':'good'}/></div>
          <div><span>SLA risk</span><b>{atRisk}</b><i className={atRisk?'warn':'good'}/></div>
          <div><span>Sentimiento negativo</span><b>{negative}</b><i className={negative?'warn':'good'}/></div>
          <div><span>Churn alto</span><b>{highChurn}</b><i className={highChurn?'risk':'good'}/></div>
        </div>
        <div className="care-ai-brief"><Sparkles size={21}/><div><b>Lectura de CARE</b><p>Northwind concentra el mayor riesgo: incidente crítico cerca del SLA, sentimiento frustrado y customer health bajo. La prioridad es resolver el incidente técnico, coordinar la conversación de facturación y cerrar con un plan de recuperación de cuenta.</p></div></div>
      </section>
      <section className="care-panel"><div className="care-panel-title"><div><small>NEXT BEST ACTION</small><h2>Acciones recomendadas</h2></div><Bot size={18}/></div><div className="care-actions-list">{actions.map((a,i)=><button key={`${a.title}-${i}`} onClick={()=>{if(a.ticketId){setSelectedTicket(a.ticketId);setTab('inbox')}}} className={`nba-${a.tone}`}><span>{String(i+1).padStart(2,'0')}</span><div><b>{a.title}</b><small>{a.reason}</small></div></button>)}</div></section>
      <section className="care-panel"><div className="care-panel-title"><div><small>LIVE QUEUE</small><h2>Conversaciones prioritarias</h2></div><Inbox size={18}/></div><div className="care-live-queue">{openTickets.slice(0,4).map(t=><button key={t.id} onClick={()=>{setSelectedTicket(t.id);setTab('inbox')}}><span className={`care-channel channel-${t.channel.toLowerCase().replaceAll(' ','-')}`}>{channelIcon(t.channel)}</span><div><b>{t.customer}</b><small>{t.subject}</small></div><em className={`sla-${slaState(t)}`}>{t.status==='Resuelto'?'OK':slaRemaining(t)<=0?`${Math.abs(slaRemaining(t))}m vencido`:`${slaRemaining(t)}m`}</em></button>)}</div></section>
    </div>}

    {tab==='inbox'&&<div className="care-inbox-layout">
      <section className="care-panel care-conversation-list"><div className="care-toolbar"><div><small>UNIFIED INBOX</small><h2>Conversaciones</h2></div><button className="primary" onClick={()=>setNewOpen(true)}><Plus size={16}/>Nuevo ticket</button></div><label className="care-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cliente, ticket o tema..."/></label><div className="care-thread-list">{filteredTickets.filter(t=>t.status!=='Resuelto').map(t=><button key={t.id} className={selectedTicket===t.id?'active':''} onClick={()=>setSelectedTicket(t.id)}><span className={`care-channel`}>{channelIcon(t.channel)}</span><div><div><b>{t.customer}</b><em className={`sent-${t.sentiment.toLowerCase()}`}>{t.sentiment}</em></div><strong>{t.subject}</strong><small>{t.id} · {t.lastUpdate} · {t.owner}</small></div><i className={`sla-dot ${slaState(t)}`}/></button>)}</div></section>
      {selected&&<section className="care-panel care-conversation"><header><div><small>{selected.id} · {selected.channel}</small><h2>{selected.subject}</h2><p>{selected.customer} · {selected.category}</p></div><span className={`priority-${selected.priority.toLowerCase()}`}>{selected.priority}</span></header><div className="conversation-context"><div><span>Sentimiento</span><b>{selected.sentiment}</b></div><div><span>SLA restante</span><b className={`sla-text-${slaState(selected)}`}>{slaRemaining(selected)<=0?`${Math.abs(slaRemaining(selected))} min vencido`:`${slaRemaining(selected)} min`}</b></div><div><span>Responsable</span><b>{selected.owner}</b></div><div><span>Mensajes</span><b>{selected.messages}</b></div></div><div className="conversation-demo"><div className="bubble customer">Necesitamos una solución clara y seguimiento. Este tema ya nos está afectando la operación.</div><div className="bubble agent">CARE organiza el contexto y propone el siguiente paso. La respuesta final debe validarse contra datos del ticket, SLA y equipos responsables.</div></div><div className="conversation-customer-health">{selectedCustomer&&<><HeartPulse size={18}/><div><b>{selectedCustomer.name} · Health {selectedCustomer.health}/100</b><small>{selectedCustomer.tier} · MRR {money(selectedCustomer.mrr)} · Churn {selectedCustomer.churnRisk}</small></div></>}</div><div className="conversation-controls"><button onClick={()=>progressTicket(selected.id)}><Zap size={15}/>Avanzar</button><button onClick={()=>escalateTicket(selected.id)}><AlertTriangle size={15}/>Escalar</button><button className="primary" onClick={()=>resolveTicket(selected.id)}><CheckCircle2 size={15}/>Resolver</button></div><div className="care-composer"><input placeholder="Respuesta demo · no conectada a canal real"/><button><Send size={16}/></button></div></section>}
    </div>}

    {tab==='tickets'&&<section className="care-panel care-wide"><div className="care-toolbar"><div><small>SERVICE DESK</small><h2>Tickets y casos</h2></div><button className="primary" onClick={()=>setNewOpen(true)}><Plus size={16}/>Nuevo ticket</button></div><div className="care-table-wrap"><table><thead><tr><th>Ticket</th><th>Cliente</th><th>Canal</th><th>Prioridad</th><th>SLA</th><th>Sentimiento</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>{filteredTickets.map(t=><tr key={t.id} onClick={()=>{setSelectedTicket(t.id);setTab('inbox')}}><td><b>{t.id}</b><small>{t.subject}</small></td><td>{t.customer}</td><td><span className="table-channel">{channelIcon(t.channel)}{t.channel}</span></td><td><span className={`priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td><td><span className={`sla-pill sla-${slaState(t)}`}>{t.status==='Resuelto'?'Cumplido':slaRemaining(t)<=0?'Vencido':`${slaRemaining(t)} min`}</span></td><td>{t.sentiment}</td><td>{t.owner}</td><td>{t.status}</td></tr>)}</tbody></table></div></section>}

    {tab==='sla'&&<div className="care-layout">
      <section className="care-panel care-hero-panel"><div className="care-panel-title"><div><small>SLA CONTROL TOWER</small><h2>Riesgo de incumplimiento</h2></div><Clock3 size={18}/></div><div className="sla-board">{openTickets.sort((a,b)=>slaRemaining(a)-slaRemaining(b)).map(t=><div key={t.id}><span className={`sla-ring sla-${slaState(t)}`}>{slaRemaining(t)<=0?'!':Math.max(0,slaRemaining(t))}</span><div><b>{t.customer} · {t.subject}</b><small>{t.id} · {t.owner} · objetivo {t.slaMinutes} min</small></div><em className={`sla-${slaState(t)}`}>{slaState(t)==='breach'?'BREACH':slaState(t)==='risk'?'RIESGO':slaState(t)==='warn'?'ATENCIÓN':'EN SLA'}</em></div>)}</div></section>
      <section className="care-panel"><div className="care-panel-title"><div><small>ESCALATION MATRIX</small><h2>Rutas inteligentes</h2></div><Target size={18}/></div><div className="escalation-grid"><div><b>Técnico crítico</b><span>CARE → NEXUS → AURORA</span></div><div><b>Seguridad</b><span>CARE → SENTINEL → NORM</span></div><div><b>Facturación</b><span>CARE → INVOICER → STERLING</span></div><div><b>Riesgo churn</b><span>CARE → CLOSER → AURORA</span></div></div></section>
    </div>}

    {tab==='customers'&&<section className="care-panel care-wide"><div className="care-panel-title"><div><small>CUSTOMER 360</small><h2>Salud y retención</h2></div><UsersRound size={18}/></div><div className="customer-grid">{customers.map(c=><article key={c.id} className={`customer-card churn-${c.churnRisk.toLowerCase()}`}><header><div><small>{c.id} · {c.tier}</small><h3>{c.name}</h3></div><span>{c.health}/100</span></header><div className="customer-health-bar"><i style={{width:pct(c.health)}}/></div><div className="customer-stats"><div><span>MRR</span><b>{money(c.mrr)}</b></div><div><span>NPS</span><b>{c.nps}/10</b></div><div><span>Tickets 90d</span><b>{c.tickets90}</b></div><div><span>Churn</span><b>{c.churnRisk}</b></div></div><p>{c.products.join(' · ')}</p><footer><span>{c.owner}</span><button onClick={()=>recoverCustomer(c.id)}><HeartPulse size={14}/>Plan de recuperación</button></footer></article>)}</div></section>}

    {tab==='insights'&&<div className="care-layout">
      <section className="care-panel care-hero-panel"><div className="care-panel-title"><div><small>VOICE OF CUSTOMER</small><h2>Temas que están moviendo la experiencia</h2></div><BarChart3 size={18}/></div><div className="topic-grid"><Topic title="Sincronización y continuidad" volume={34} sentiment="Negativo" trend="↑"/><Topic title="Facturación / estados" volume={22} sentiment="Neutral" trend="→"/><Topic title="Onboarding y usuarios" volume={18} sentiment="Positivo" trend="↓"/><Topic title="Inventarios / reposición" volume={14} sentiment="Neutral" trend="↑"/></div></section>
      <section className="care-panel"><div className="care-panel-title"><div><small>RETENTION SIGNALS</small><h2>Riesgo de churn</h2></div><HeartPulse size={18}/></div>{customers.filter(c=>c.churnRisk!=='Bajo').map(c=><div className="retention-row" key={c.id}><span className={`churn-dot churn-${c.churnRisk.toLowerCase()}`}/><div><b>{c.name}</b><small>Health {c.health} · NPS {c.nps} · {c.tickets90} tickets</small></div><button onClick={()=>recoverCustomer(c.id)}>Activar plan</button></div>)}</section>
    </div>}

    {tab==='knowledge'&&<section className="care-panel care-wide"><div className="care-panel-title"><div><small>KNOWLEDGE OPERATIONS</small><h2>Base de conocimiento</h2></div><BadgeCheck size={18}/></div><div className="knowledge-grid">{knowledgeItems.map(k=><article key={k.id}><span><FileText size={18}/></span><div><small>{k.id} · {k.category}</small><h3>{k.title}</h3><p>{k.owner} · actualizado {k.updated}</p></div><em>{k.coverage}%</em></article>)}</div></section>}

    {tab==='documents'&&<section className="care-panel care-wide"><div className="care-panel-title"><div><small>CX DOCUMENT STUDIO</small><h2>Documentos listos para Workspace</h2></div><FileText size={18}/></div><div className="care-doc-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><span><FileText size={18}/></span><div><b>{d}</b><small>CARE · plantilla editable</small></div><em>Editar</em></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {newOpen&&<div className="care-modal-backdrop"><div className="care-modal"><button className="care-modal-close" onClick={()=>setNewOpen(false)}><X size={18}/></button><small>DEMAND INTAKE</small><h2>Nuevo ticket</h2><label>Cliente<select value={draft.customer} onChange={e=>setDraft(v=>({...v,customer:e.target.value}))}>{customers.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Asunto<input value={draft.subject} onChange={e=>setDraft(v=>({...v,subject:e.target.value}))} placeholder="Describe la solicitud o problema"/></label><div className="care-form-grid"><label>Canal<select value={draft.channel} onChange={e=>setDraft(v=>({...v,channel:e.target.value as Channel}))}><option>WhatsApp</option><option>Email</option><option>Chat web</option><option>Teléfono</option><option>Portal</option></select></label><label>Prioridad<select value={draft.priority} onChange={e=>setDraft(v=>({...v,priority:e.target.value as Priority}))}><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label></div><label>Categoría<select value={draft.category} onChange={e=>setDraft(v=>({...v,category:e.target.value}))}><option>Producto</option><option>Incidente técnico</option><option>Facturación</option><option>Seguridad</option><option>Onboarding</option><option>Administrativo</option></select></label><div className="care-modal-actions"><button onClick={()=>setNewOpen(false)}>Cancelar</button><button className="primary" onClick={createTicket}>Crear ticket</button></div></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <article className={`care-kpi tone-${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>}
function GaugeIcon(){return <Headphones size={18}/>}
function Topic({title,volume,sentiment,trend}:{title:string;volume:number;sentiment:string;trend:string}){return <article><header><b>{title}</b><span>{trend}</span></header><div><strong>{volume}%</strong><small>{sentiment}</small></div><i style={{width:`${volume*2}%`}}/></article>}
