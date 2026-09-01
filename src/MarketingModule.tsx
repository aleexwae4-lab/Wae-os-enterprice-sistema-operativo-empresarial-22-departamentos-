import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, BadgeDollarSign, BarChart3, Bot, CalendarDays, CheckCircle2,
  FileText, FlaskConical, Gauge, Megaphone, MousePointerClick, Plus, Search,
  Sparkles, Target, TrendingUp, UsersRound,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './marketing-premium.css'

type Tab='command'|'campaigns'|'funnel'|'attribution'|'content'|'experiments'|'budget'|'documents'|'agent'
type CampaignStatus='Borrador'|'Activa'|'Pausada'|'Finalizada'
type Channel='Paid Search'|'Paid Social'|'LinkedIn'|'Email'|'Organic'|'Partners'
type ExperimentStatus='Diseño'|'Corriendo'|'Ganador'|'Sin diferencia'
type Confidence='Alta'|'Media'|'Baja'

type Campaign={
  id:string;name:string;channel:Channel;objective:string;budget:number;spend:number;revenue:number;
  leads:number;mql:number;sql:number;won:number;impressions:number;clicks:number;status:CampaignStatus;owner:string
}
type ContentItem={id:string;title:string;format:string;stage:string;channel:string;score:number;status:'Idea'|'Producción'|'Publicado';owner:string}
type Experiment={id:string;name:string;metric:string;control:number;variant:number;uplift:number;confidence:number;status:ExperimentStatus;owner:string}
type AttributionRow={source:string;spend:number;pipeline:number;revenue:number;won:number;confidence:Confidence;model:string}

type Action={title:string;reason:string;tone:'good'|'warn'|'risk'}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const pct=(v:number)=>`${Math.round(v*10)/10}%`
const safeDivide=(a:number,b:number)=>b>0?a/b:0

const seedCampaigns:Campaign[]=[
  {id:'CMP-2609-01',name:'WAE OS · Decisión ejecutiva',channel:'LinkedIn',objective:'Pipeline enterprise',budget:92000,spend:58400,revenue:248000,leads:86,mql:41,sql:18,won:4,impressions:184000,clicks:6320,status:'Activa',owner:'PULSE'},
  {id:'CMP-2609-02',name:'Automatiza tu empresa',channel:'Paid Social',objective:'Generación de demanda',budget:68000,spend:49200,revenue:112000,leads:214,mql:72,sql:21,won:3,impressions:428000,clicks:12180,status:'Activa',owner:'PULSE'},
  {id:'CMP-2608-11',name:'CFO Command Center',channel:'Paid Search',objective:'Intento alto',budget:76000,spend:70100,revenue:196000,leads:98,mql:54,sql:28,won:5,impressions:96000,clicks:8210,status:'Finalizada',owner:'PULSE + STERLING'},
  {id:'CMP-2609-04',name:'Customer Experience premium',channel:'Email',objective:'Cross-sell',budget:18000,spend:7600,revenue:62000,leads:44,mql:31,sql:14,won:2,impressions:18400,clicks:2190,status:'Activa',owner:'PULSE + CARE'},
  {id:'CMP-2609-05',name:'Partner LATAM',channel:'Partners',objective:'Canal indirecto',budget:52000,spend:18400,revenue:88000,leads:35,mql:24,sql:15,won:2,impressions:0,clicks:0,status:'Activa',owner:'PULSE + CLOSER'},
  {id:'CMP-2609-06',name:'SEO · Sistema operativo empresarial',channel:'Organic',objective:'Demanda orgánica',budget:26000,spend:9400,revenue:54000,leads:71,mql:32,sql:12,won:1,impressions:138000,clicks:8460,status:'Activa',owner:'PULSE'},
]

const seedContent:ContentItem[]=[
  {id:'CNT-101',title:'Cómo opera una empresa desde una sola conversación',format:'Video corto',stage:'Awareness',channel:'Social',score:91,status:'Publicado',owner:'PULSE'},
  {id:'CNT-102',title:'ROI del CFO Command Center',format:'Case study',stage:'Consideration',channel:'LinkedIn',score:88,status:'Publicado',owner:'PULSE + STERLING'},
  {id:'CNT-103',title:'Guía de automatización empresarial 2026',format:'Lead magnet',stage:'Lead capture',channel:'Web',score:84,status:'Producción',owner:'PULSE'},
  {id:'CNT-104',title:'Demo: Customer Experience Command Center',format:'Demo',stage:'Decision',channel:'Sales enablement',score:94,status:'Producción',owner:'PULSE + CARE'},
  {id:'CNT-105',title:'Comparativo ERP tradicional vs WAE OS',format:'Artículo',stage:'Consideration',channel:'Organic',score:79,status:'Idea',owner:'PULSE'},
]

const seedExperiments:Experiment[]=[
  {id:'EXP-026',name:'Hero: operar vs automatizar',metric:'CTR landing',control:3.8,variant:4.6,uplift:21.1,confidence:94,status:'Ganador',owner:'PULSE'},
  {id:'EXP-027',name:'CTA: diagnóstico vs demo',metric:'Lead conversion',control:7.2,variant:8.0,uplift:11.1,confidence:81,status:'Corriendo',owner:'PULSE + CLOSER'},
  {id:'EXP-028',name:'Video 15s vs 30s',metric:'Qualified view',control:34,variant:36,uplift:5.9,confidence:62,status:'Corriendo',owner:'PULSE'},
  {id:'EXP-029',name:'Prueba social en pricing',metric:'SQL rate',control:12.4,variant:12.6,uplift:1.6,confidence:48,status:'Sin diferencia',owner:'PULSE'},
]

const documents=[
  'Marketing Performance Review','Plan de campaña','Brief creativo','Media plan','Reporte CAC / ROAS',
  'Funnel & Pipeline Review','Reporte de atribución','Experiment Readout','Calendario editorial','Voice of Customer to Content',
  'Audience Brief','Plan de Growth','Reporte de presupuesto','QBR Marketing + Ventas','Reporte para Dirección',
]
const knowledge=[
  'Estrategia y posicionamiento de marca','Política de marketing y claims autorizados','CRM y pipeline CLOSER',
  'Voice of Customer CARE','Presupuesto y límites STERLING','Biblioteca creativa y aprendizajes históricos',
  'UTM / tracking plan autorizado','Histórico de campañas, contenido y experimentos del tenant',
]
const suggestions=[
  '¿Qué campañas generan más pipeline y revenue?','Prioriza presupuesto por ROAS, CAC y calidad del funnel',
  'Detecta dónde se rompe la conversión entre lead y venta','Propón los próximos experimentos creativos con mayor impacto',
]

function channelIcon(channel:Channel):ReactNode{
  if(channel==='Email')return <FileText size={16}/>
  if(channel==='Organic')return <TrendingUp size={16}/>
  if(channel==='Partners')return <UsersRound size={16}/>
  return <MousePointerClick size={16}/>
}

export default function MarketingModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [campaigns,setCampaigns]=useState(seedCampaigns)
  const [experiments,setExperiments]=useState(seedExperiments)
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({name:'',channel:'LinkedIn' as Channel,objective:'Pipeline enterprise',budget:50000,owner:'PULSE'})

  const spend=campaigns.reduce((s,c)=>s+c.spend,0)
  const budget=campaigns.reduce((s,c)=>s+c.budget,0)
  const revenue=campaigns.reduce((s,c)=>s+c.revenue,0)
  const leads=campaigns.reduce((s,c)=>s+c.leads,0)
  const mql=campaigns.reduce((s,c)=>s+c.mql,0)
  const sql=campaigns.reduce((s,c)=>s+c.sql,0)
  const won=campaigns.reduce((s,c)=>s+c.won,0)
  const roas=safeDivide(revenue,spend)
  const cac=safeDivide(spend,won)
  const pacing=safeDivide(spend,budget)*100
  const pipeline=revenue*1.55
  const health=Math.max(0,Math.min(100,Math.round(78+Math.min(12,roas*2)-Math.max(0,pacing-90)/4)))

  const attribution=useMemo<AttributionRow[]>(()=>campaigns.map(c=>({
    source:c.channel,spend:c.spend,pipeline:c.revenue*1.55,revenue:c.revenue,won:c.won,
    confidence:c.channel==='Organic'||c.channel==='Partners'?'Media':'Alta',
    model:c.channel==='Organic'?'Assisted demo':c.channel==='Partners'?'Partner sourced demo':'UTM + CRM demo',
  })).reduce<AttributionRow[]>((acc,row)=>{
    const found=acc.find(x=>x.source===row.source)
    if(found){found.spend+=row.spend;found.pipeline+=row.pipeline;found.revenue+=row.revenue;found.won+=row.won}else acc.push({...row})
    return acc
  },[]),[campaigns])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return campaigns
    return campaigns.filter(c=>[c.id,c.name,c.channel,c.objective,c.status,c.owner].some(v=>v.toLowerCase().includes(q)))
  },[campaigns,query])

  const actions=useMemo<Action[]>(()=>{
    const list:Action[]=[]
    const best=[...campaigns].filter(c=>c.spend>0&&c.status==='Activa').sort((a,b)=>safeDivide(b.revenue,b.spend)-safeDivide(a.revenue,a.spend))[0]
    if(best)list.push({title:`Escalar ${best.name}`,reason:`ROAS demo ${safeDivide(best.revenue,best.spend).toFixed(1)}x y ${best.won} cierres atribuidos; validar capacidad comercial antes de aumentar presupuesto.`,tone:'good'})
    const weak=[...campaigns].filter(c=>c.spend>0&&c.status==='Activa').sort((a,b)=>safeDivide(a.revenue,a.spend)-safeDivide(b.revenue,b.spend))[0]
    if(weak&&safeDivide(weak.revenue,weak.spend)<2.5)list.push({title:`Revisar ${weak.name}`,reason:`ROAS demo ${safeDivide(weak.revenue,weak.spend).toFixed(1)}x; revisar audiencia, oferta, creatividad y calidad del lead antes de seguir gastando.`,tone:'warn'})
    const exp=experiments.find(e=>e.status==='Ganador'&&e.confidence>=90)
    if(exp)list.push({title:`Documentar ganador ${exp.id}`,reason:`${exp.name} muestra ${pct(exp.uplift)} uplift con ${exp.confidence}% de confianza demo. Aplicar solo después de validar tracking y tamaño de muestra.`,tone:'good'})
    if(safeDivide(sql,mql)<0.45)list.push({title:'Alinear MQL → SQL con CLOSER',reason:`La conversión demo MQL→SQL es ${pct(safeDivide(sql,mql)*100)}; revisar scoring, ICP y handoff comercial.`,tone:'risk'})
    return list
  },[campaigns,experiments,mql,sql])

  const createCampaign=()=>{
    if(!draft.name.trim()||draft.budget<=0)return
    const id=`CMP-2609-${String(campaigns.length+7).padStart(2,'0')}`
    setCampaigns(v=>[{id,name:draft.name.trim(),channel:draft.channel,objective:draft.objective,budget:Number(draft.budget),spend:0,revenue:0,leads:0,mql:0,sql:0,won:0,impressions:0,clicks:0,status:'Borrador',owner:draft.owner},...v])
    setDraft({name:'',channel:'LinkedIn',objective:'Pipeline enterprise',budget:50000,owner:'PULSE'});setOpen(false);setTab('campaigns')
  }
  const cycleCampaign=(id:string)=>setCampaigns(v=>v.map(c=>c.id===id?{...c,status:c.status==='Borrador'?'Activa':c.status==='Activa'?'Pausada':c.status==='Pausada'?'Activa':c.status}:c))
  const scaleCampaign=(id:string)=>setCampaigns(v=>v.map(c=>c.id===id?{...c,budget:Math.round(c.budget*1.1)}:c))
  const advanceExperiment=(id:string)=>setExperiments(v=>v.map(e=>e.id===id?{...e,status:e.status==='Diseño'?'Corriendo':e.status==='Corriendo'?(e.confidence>=90?'Ganador':'Sin diferencia'):e.status}:e))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Marketing\n**Agente:** PULSE\n\n## Resumen ejecutivo\n- Spend demo: ${money(spend)}\n- Revenue atribuido demo: ${money(revenue)}\n- ROAS demo: ${roas.toFixed(1)}x\n- CAC demo: ${money(cac)}\n- Leads / MQL / SQL / Won: ${leads} / ${mql} / ${sql} / ${won}\n\n## Objetivo y audiencia\n\n## Fuente de datos / tracking\n\n## Funnel y pipeline\n\n## Creatividad y mensaje\n\n## Presupuesto y pacing\n\n## Atribución y nivel de confianza\n\n## Experimentos\n\n## Next Best Action\n\n## Aprobaciones\n\n> Documento operativo demo. Validar fuentes, tracking, claims, presupuesto, atribución y permisos antes de publicar campañas o comprometer gasto real.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="marketing-premium">
    <header className="marketing-head">
      <div className="marketing-brand"><span><Megaphone size={25}/></span><div><small>PULSE · DIRECTOR DE MARKETING AI</small><h1>Marketing Intelligence Command Center</h1><p>Growth, revenue, atribución, contenido y experimentación conectados al negocio.</p></div></div>
      <div className="marketing-head-status"><i/>Datos demo · Source-aware growth</div>
    </header>

    <nav className="marketing-tabs">{[
      ['command','Command Center'],['campaigns','Campañas'],['funnel','Funnel'],['attribution','Atribución'],['content','Creative Intelligence'],['experiments','Experimentos'],['budget','Presupuesto'],['documents','Documentos'],['agent','PULSE AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="marketing-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Growth health" value={`${health}/100`} detail={`${pct(pacing)} pacing`} tone="violet"/>
      <Kpi icon={<BadgeDollarSign size={18}/>} label="Spend" value={money(spend)} detail={`${money(budget)} presupuesto`} tone="cyan"/>
      <Kpi icon={<TrendingUp size={18}/>} label="Revenue atribuido" value={money(revenue)} detail={`ROAS ${roas.toFixed(1)}x · demo`} tone="emerald"/>
      <Kpi icon={<Target size={18}/>} label="Pipeline estimado" value={money(pipeline)} detail={`${won} cierres atribuidos`} tone="amber"/>
      <Kpi icon={<UsersRound size={18}/>} label="CAC" value={money(cac)} detail={`${leads} leads`} tone="rose"/>
    </div>}

    {tab==='command'&&<div className="marketing-layout">
      <section className="marketing-panel marketing-hero-panel"><div className="marketing-panel-title"><div><small>CMO VIEW</small><h2>Revenue Growth Control</h2></div><span className="marketing-score"><Sparkles size={17}/>{health}/100</span></div>
        <div className="marketing-health"><div><span>Lead → MQL</span><b>{pct(safeDivide(mql,leads)*100)}</b><i className="good"/></div><div><span>MQL → SQL</span><b>{pct(safeDivide(sql,mql)*100)}</b><i className={safeDivide(sql,mql)<.45?'warn':'good'}/></div><div><span>SQL → Won</span><b>{pct(safeDivide(won,sql)*100)}</b><i className="good"/></div><div><span>Budget pacing</span><b>{pct(pacing)}</b><i className={pacing>90?'warn':'good'}/></div></div>
        <div className="marketing-ai-brief"><Sparkles size={21}/><div><b>Lectura de PULSE</b><p>El crecimiento demo es saludable, pero la decisión no debe basarse solo en ROAS. Conviene priorizar pipeline de calidad, revisar MQL→SQL con CLOSER y usar CARE para convertir problemas/reseñas del cliente en contenido y mensajes verificables.</p></div></div>
      </section>
      <section className="marketing-panel"><div className="marketing-panel-title"><div><small>NEXT BEST ACTION</small><h2>Decisiones sugeridas</h2></div><Bot size={18}/></div>{actions.map((a,i)=><div className="marketing-action" key={i}><span className={a.tone}>{i+1}</span><div><b>{a.title}</b><small>{a.reason}</small></div></div>)}</section>
      <section className="marketing-panel"><div className="marketing-panel-title"><div><small>REVENUE FUNNEL</small><h2>Demanda → venta</h2></div><BarChart3 size={18}/></div><FunnelBar label="Leads" value={leads} max={leads}/><FunnelBar label="MQL" value={mql} max={leads}/><FunnelBar label="SQL" value={sql} max={leads}/><FunnelBar label="Won" value={won} max={leads}/></section>
    </div>}

    {tab==='campaigns'&&<section className="marketing-panel marketing-wide"><div className="marketing-toolbar"><div><small>PERFORMANCE ENGINE</small><h2>Campañas</h2></div><div className="marketing-actions"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar campaña..."/></label><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nueva campaña</button></div></div><div className="marketing-table-wrap"><table><thead><tr><th>Campaña</th><th>Canal</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>MQL/SQL</th><th>CAC</th><th>Estado</th><th></th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td><b>{c.name}</b><small>{c.id} · {c.objective}</small></td><td><span className="channel-pill">{channelIcon(c.channel)}{c.channel}</span></td><td>{money(c.spend)}<small>{pct(safeDivide(c.spend,c.budget)*100)} budget</small></td><td>{money(c.revenue)}</td><td><b className={safeDivide(c.revenue,c.spend)>=3?'good-text':'warn-text'}>{safeDivide(c.revenue,c.spend).toFixed(1)}x</b></td><td>{c.mql} / {c.sql}</td><td>{c.won?money(safeDivide(c.spend,c.won)):'—'}</td><td><span className="marketing-status">{c.status}</span></td><td><div className="row-actions"><button onClick={()=>cycleCampaign(c.id)}>{c.status==='Borrador'?'Activar':c.status==='Activa'?'Pausar':c.status==='Pausada'?'Reactivar':'Ver'}</button>{c.status==='Activa'&&<button onClick={()=>scaleCampaign(c.id)}>+10% budget</button>}</div></td></tr>)}</tbody></table></div></section>}

    {tab==='funnel'&&<div className="marketing-layout"><section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>FULL FUNNEL</small><h2>Conversión de demanda a revenue</h2></div><Target size={18}/></div><div className="funnel-grid"><FunnelCard label="Leads" value={leads} conversion={100}/><FunnelCard label="MQL" value={mql} conversion={safeDivide(mql,leads)*100}/><FunnelCard label="SQL" value={sql} conversion={safeDivide(sql,mql)*100}/><FunnelCard label="Won" value={won} conversion={safeDivide(won,sql)*100}/></div><div className="marketing-note"><AlertTriangle size={17}/><span>La calidad del funnel debe reconciliarse con CLOSER. PULSE no debe considerar un lead como SQL o venta sin el evento comercial correspondiente.</span></div></section></div>}

    {tab==='attribution'&&<section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>ATTRIBUTION CONFIDENCE</small><h2>Revenue por fuente</h2></div><Gauge size={18}/></div><div className="marketing-table-wrap"><table><thead><tr><th>Fuente</th><th>Spend</th><th>Pipeline</th><th>Revenue</th><th>Won</th><th>Modelo</th><th>Confianza</th></tr></thead><tbody>{attribution.map(a=><tr key={a.source}><td><b>{a.source}</b></td><td>{money(a.spend)}</td><td>{money(a.pipeline)}</td><td>{money(a.revenue)}</td><td>{a.won}</td><td>{a.model}</td><td><span className={`confidence ${a.confidence.toLowerCase()}`}>{a.confidence}</span></td></tr>)}</tbody></table></div><div className="marketing-note"><CheckCircle2 size={17}/><span>Atribución demo explícitamente separada de causalidad. En producción, cada cifra deberá conservar source event, UTM/CRM identity, ventana y modelo de atribución.</span></div></section>}

    {tab==='content'&&<section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>CREATIVE INTELLIGENCE</small><h2>Contenido conectado al funnel</h2></div><Sparkles size={18}/></div><div className="content-grid">{seedContent.map(c=><article className="content-card" key={c.id}><div><span className="content-score">{c.score}</span><small>{c.id} · {c.stage}</small></div><h3>{c.title}</h3><p>{c.format} · {c.channel}</p><footer><span>{c.status}</span><b>{c.owner}</b></footer></article>)}</div></section>}

    {tab==='experiments'&&<section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>EXPERIMENTATION OS</small><h2>Pruebas y aprendizaje</h2></div><FlaskConical size={18}/></div><div className="experiment-grid">{experiments.map(e=><article className="experiment-card" key={e.id}><header><span>{e.id}</span><b>{e.status}</b></header><h3>{e.name}</h3><p>{e.metric}</p><div className="experiment-metrics"><div><small>Control</small><b>{e.control}</b></div><div><small>Variante</small><b>{e.variant}</b></div><div><small>Uplift</small><b>{pct(e.uplift)}</b></div><div><small>Confianza</small><b>{e.confidence}%</b></div></div><footer><span>{e.owner}</span>{(e.status==='Diseño'||e.status==='Corriendo')&&<button onClick={()=>advanceExperiment(e.id)}>Avanzar</button>}</footer></article>)}</div></section>}

    {tab==='budget'&&<div className="marketing-layout"><section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>MARKETING FINOPS</small><h2>Presupuesto y pacing</h2></div><BadgeDollarSign size={18}/></div><div className="budget-summary"><div><small>Presupuesto</small><b>{money(budget)}</b></div><div><small>Spend</small><b>{money(spend)}</b></div><div><small>Disponible</small><b>{money(Math.max(0,budget-spend))}</b></div><div><small>Pacing</small><b>{pct(pacing)}</b></div></div>{campaigns.map(c=><div className="budget-row" key={c.id}><div><b>{c.name}</b><small>{c.channel}</small></div><div className="budget-bar"><i style={{width:`${Math.min(100,safeDivide(c.spend,c.budget)*100)}%`}}/></div><span>{money(c.spend)} / {money(c.budget)}</span></div>)}<div className="marketing-note"><BadgeDollarSign size={17}/><span>Cualquier incremento real de presupuesto debe respetar límites STERLING y matriz de autorización. El botón +10% de esta demo solo modifica estado local.</span></div></section></div>}

    {tab==='documents'&&<section className="marketing-panel marketing-wide"><div className="marketing-panel-title"><div><small>DOCUMENT STUDIO</small><h2>Biblioteca de Marketing</h2></div><FileText size={18}/></div><div className="marketing-docs">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span><b>{d}</b><small>Editable en Workspace</small></span></button>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="marketing-modal-backdrop"><div className="marketing-modal"><header><div><small>CAMPAIGN INTAKE</small><h2>Nueva campaña</h2></div><button onClick={()=>setOpen(false)}>×</button></header><div className="marketing-form"><label>Nombre<input value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))}/></label><label>Canal<select value={draft.channel} onChange={e=>setDraft(v=>({...v,channel:e.target.value as Channel}))}>{['LinkedIn','Paid Search','Paid Social','Email','Organic','Partners'].map(x=><option key={x}>{x}</option>)}</select></label><label>Objetivo<input value={draft.objective} onChange={e=>setDraft(v=>({...v,objective:e.target.value}))}/></label><label>Presupuesto<input type="number" value={draft.budget} onChange={e=>setDraft(v=>({...v,budget:Number(e.target.value)}))}/></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label></div><div className="marketing-modal-note"><AlertTriangle size={16}/>La campaña se crea como borrador. Publicación, claims y gasto real requieren tracking, autorización y conectores externos.</div><footer><button onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={createCampaign}>Crear borrador</button></footer></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`marketing-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function FunnelBar({label,value,max}:{label:string;value:number;max:number}){return <div className="funnel-bar"><div><span>{label}</span><b>{value}</b></div><i><em style={{width:`${Math.max(3,safeDivide(value,max)*100)}%`}}/></i></div>}
function FunnelCard({label,value,conversion}:{label:string;value:number;conversion:number}){return <article className="funnel-card"><small>{label}</small><b>{value}</b><span>{pct(conversion)} conversión de etapa</span></article>}
