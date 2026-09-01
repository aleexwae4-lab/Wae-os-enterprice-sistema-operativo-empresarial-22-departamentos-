import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bot, CheckCircle2, CircleDollarSign,
  Clock3, FileText, Gauge, GitBranch, Layers3, Search, ShieldAlert, Sparkles,
  Target, TrendingUp, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './analytics-premium.css'

type Tab='command'|'metrics'|'anomalies'|'drivers'|'forecast'|'scenarios'|'alerts'|'documents'|'agent'
type Confidence='Alta'|'Media'|'Baja'
type MetricStatus='Normal'|'Atención'|'Riesgo'
type Severity='Info'|'Media'|'Alta'|'Crítica'
type Direction='up'|'down'|'flat'

type Metric={
  id:string;name:string;value:number;format:'money'|'percent'|'number'|'score';previous:number;target:number;
  source:string;freshness:string;confidence:Confidence;status:MetricStatus;direction:Direction;owner:string
}
type Anomaly={id:string;metricId:string;title:string;severity:Severity;delta:number;detected:string;source:string;confidence:Confidence;status:'Nueva'|'Investigando'|'Explicada';hypothesis:string}
type Driver={id:string;outcome:string;driver:string;relation:'Positiva'|'Negativa';strength:number;confidence:Confidence;evidence:string;note:string}
type ForecastPoint={period:string;base:number;low:number;high:number;actual?:number}
type AlertRule={id:string;name:string;metric:string;condition:string;owner:string;status:'Activa'|'Pausada';lastTrigger:string}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const pct=(v:number)=>`${Math.round(v*10)/10}%`
const fmt=(m:Metric,v=m.value)=>m.format==='money'?money(v):m.format==='percent'?pct(v):m.format==='score'?`${Math.round(v)}/100`:new Intl.NumberFormat('es-MX').format(Math.round(v))

const seedMetrics:Metric[]=[
  {id:'KPI-REV',name:'Revenue mensual',value:601481,format:'money',previous:533200,target:640000,source:'CLOSER + INVOICER + LEDGER',freshness:'hace 4 min',confidence:'Alta',status:'Normal',direction:'up',owner:'STERLING'},
  {id:'KPI-CASH',name:'Caja disponible',value:427800,format:'money',previous:391400,target:450000,source:'STERLING',freshness:'hace 6 min',confidence:'Alta',status:'Normal',direction:'up',owner:'STERLING'},
  {id:'KPI-AR',name:'Cartera vencida',value:199879,format:'money',previous:164300,target:120000,source:'INVOICER + LEDGER',freshness:'hace 7 min',confidence:'Alta',status:'Riesgo',direction:'up',owner:'INVOICER'},
  {id:'KPI-PIPE',name:'Pipeline abierto',value:768000,format:'money',previous:704000,target:900000,source:'CLOSER',freshness:'hace 3 min',confidence:'Alta',status:'Atención',direction:'up',owner:'CLOSER'},
  {id:'KPI-CAC',name:'CAC demo',value:11273,format:'money',previous:9800,target:10000,source:'PULSE + CLOSER',freshness:'hace 12 min',confidence:'Media',status:'Atención',direction:'up',owner:'PULSE'},
  {id:'KPI-CX',name:'Customer health',value:77,format:'score',previous:80,target:85,source:'CARE',freshness:'hace 5 min',confidence:'Media',status:'Atención',direction:'down',owner:'CARE'},
  {id:'KPI-PMO',name:'Portfolio health',value:74,format:'score',previous:78,target:85,source:'PMO',freshness:'hace 8 min',confidence:'Alta',status:'Atención',direction:'down',owner:'PMO'},
  {id:'KPI-SLA',name:'SLA cumplimiento',value:94.2,format:'percent',previous:96.8,target:98,source:'CARE + ORBIT',freshness:'hace 9 min',confidence:'Alta',status:'Atención',direction:'down',owner:'CARE'},
]

const seedAnomalies:Anomaly[]=[
  {id:'ANM-301',metricId:'KPI-AR',title:'Cartera vencida creció por encima de tendencia',severity:'Crítica',delta:21.7,detected:'01 sep · 07:52',source:'INVOICER + LEDGER',confidence:'Alta',status:'Nueva',hypothesis:'Concentración en 6 facturas vencidas y menor velocidad de cobranza.'},
  {id:'ANM-302',metricId:'KPI-CAC',title:'CAC aumentó mientras MQL→SQL perdió conversión',severity:'Alta',delta:15.0,detected:'01 sep · 07:48',source:'PULSE + CLOSER',confidence:'Media',status:'Investigando',hypothesis:'Mix de canal y calidad de lead; correlación, no causalidad confirmada.'},
  {id:'ANM-303',metricId:'KPI-PMO',title:'Portfolio health cayó 4 puntos',severity:'Alta',delta:-5.1,detected:'01 sep · 07:41',source:'PMO',confidence:'Alta',status:'Nueva',hypothesis:'Dos proyectos en riesgo y un recurso sobreasignado en ruta crítica.'},
  {id:'ANM-304',metricId:'KPI-CX',title:'Customer health de cuenta Enterprise cayó',severity:'Media',delta:-3.8,detected:'01 sep · 07:36',source:'CARE',confidence:'Media',status:'Explicada',hypothesis:'Incidente técnico abierto y conversación de facturación simultánea.'},
]

const drivers:Driver[]=[
  {id:'DRV-11',outcome:'Revenue mensual',driver:'Cierres Enterprise',relation:'Positiva',strength:82,confidence:'Alta',evidence:'CLOSER + INVOICER',note:'Asociación consistente en datos demo; validar al integrar histórico real.'},
  {id:'DRV-12',outcome:'Cartera vencida',driver:'Días desde última actividad de cobranza',relation:'Positiva',strength:76,confidence:'Media',evidence:'INVOICER',note:'Señal útil para priorización; no demuestra causalidad.'},
  {id:'DRV-13',outcome:'Customer health',driver:'Tickets críticos / 30 días',relation:'Negativa',strength:71,confidence:'Media',evidence:'CARE',note:'Correlación demo entre recurrencia de incidentes y health.'},
  {id:'DRV-14',outcome:'Portfolio health',driver:'Tareas bloqueadas en ruta crítica',relation:'Negativa',strength:88,confidence:'Alta',evidence:'PMO',note:'Relación operacional directa dentro del modelo PMO.'},
  {id:'DRV-15',outcome:'Pipeline',driver:'SQL generados por PULSE',relation:'Positiva',strength:67,confidence:'Media',evidence:'PULSE + CLOSER',note:'Requiere reconciliación de identidad y ventana de atribución.'},
]

const forecast:ForecastPoint[]=[
  {period:'May',base:508000,low:480000,high:532000,actual:512000},
  {period:'Jun',base:534000,low:502000,high:563000,actual:528000},
  {period:'Jul',base:562000,low:529000,high:598000,actual:571000},
  {period:'Ago',base:585000,low:548000,high:624000,actual:589000},
  {period:'Sep',base:618000,low:570000,high:668000},
  {period:'Oct',base:649000,low:586000,high:714000},
  {period:'Nov',base:681000,low:603000,high:759000},
]

const seedAlerts:AlertRule[]=[
  {id:'ALT-01',name:'Cartera vencida crítica',metric:'Cartera vencida',condition:'> $180,000',owner:'STERLING + INVOICER',status:'Activa',lastTrigger:'hace 12 min'},
  {id:'ALT-02',name:'Pipeline coverage bajo',metric:'Pipeline abierto',condition:'< 1.5x objetivo',owner:'CLOSER',status:'Activa',lastTrigger:'sin trigger'},
  {id:'ALT-03',name:'Customer health Enterprise',metric:'Customer health',condition:'< 70/100',owner:'CARE + CLOSER',status:'Activa',lastTrigger:'hace 31 min'},
  {id:'ALT-04',name:'Portfolio risk',metric:'Portfolio health',condition:'< 70/100',owner:'PMO + AURORA',status:'Activa',lastTrigger:'sin trigger'},
]

const documents=[
  'Executive Intelligence Brief','KPI Dictionary','Metric Lineage Report','Anomaly Investigation','Driver Analysis',
  'Forecast Review','Scenario Analysis','Decision Memo','Data Quality Report','Alert Policy','Board Metrics Pack',
  'Weekly Business Review','Monthly Performance Review','Experiment Readout','AI Insight Validation Log',
]
const knowledge=[
  'Definiciones de KPIs y owners autorizados','Fuentes departamentales y lineage del tenant','Presupuesto y finanzas STERLING / LEDGER',
  'Revenue y pipeline CLOSER','Growth y atribución PULSE','Customer signals CARE','Portafolio PMO','Operaciones ORBIT',
  'Reglas de calidad, frescura y confidence','Histórico autorizado de métricas, anomalías y decisiones',
]
const suggestions=[
  '¿Qué cambió hoy y qué requiere decisión ejecutiva?','Detecta anomalías con mayor impacto económico',
  'Explica los drivers del revenue sin confundir correlación con causalidad','Simula un escenario adverso y prioriza acciones',
]

export default function AnalyticsModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [metrics]=useState(seedMetrics)
  const [anomalies,setAnomalies]=useState(seedAnomalies)
  const [alerts,setAlerts]=useState(seedAlerts)
  const [query,setQuery]=useState('')
  const [scenario,setScenario]=useState({revenue:-5,cash:0,collections:10,portfolio:0})

  const dataQuality=Math.round(metrics.reduce((s,m)=>s+(m.confidence==='Alta'?96:m.confidence==='Media'?82:65),0)/metrics.length)
  const critical=anomalies.filter(a=>a.status!=='Explicada'&&(a.severity==='Crítica'||a.severity==='Alta')).length
  const riskMetrics=metrics.filter(m=>m.status==='Riesgo').length
  const attentionMetrics=metrics.filter(m=>m.status==='Atención').length
  const decisionHealth=Math.max(0,Math.min(100,Math.round(dataQuality-critical*4-riskMetrics*5-attentionMetrics*1.5)))

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return metrics
    return metrics.filter(m=>[m.name,m.source,m.owner,m.status,m.confidence].some(v=>v.toLowerCase().includes(q)))
  },[metrics,query])

  const actions=useMemo(()=>[
    {title:'Priorizar cobranza ejecutiva',reason:`Cartera vencida ${fmt(metrics.find(m=>m.id==='KPI-AR')!)} y anomalía crítica con confidence alta.`,tone:'risk'},
    {title:'Revisar CAC con PULSE + CLOSER',reason:'CAC demo sube mientras cae conversión MQL→SQL. La evidencia actual sugiere asociación; requiere análisis antes de reasignar presupuesto.',tone:'warn'},
    {title:'Desbloquear ruta crítica PMO',reason:'Portfolio health cayó y existen bloqueos operacionales explícitos. Acción con trazabilidad directa en PMO.',tone:'risk'},
    {title:'Proteger cuentas Enterprise',reason:'Customer health y SLA muestran deterioro. Coordinar CARE + CLOSER antes de impulsar expansión.',tone:'warn'},
  ] as const,[metrics])

  const projectedRevenue=metrics.find(m=>m.id==='KPI-REV')!.value*(1+scenario.revenue/100)
  const projectedCash=metrics.find(m=>m.id==='KPI-CASH')!.value*(1+scenario.cash/100)+(scenario.collections/100)*metrics.find(m=>m.id==='KPI-AR')!.value
  const projectedPortfolio=Math.max(0,Math.min(100,metrics.find(m=>m.id==='KPI-PMO')!.value+scenario.portfolio))

  const acknowledge=(id:string)=>setAnomalies(v=>v.map(a=>a.id===id?{...a,status:a.status==='Nueva'?'Investigando':'Explicada'}:a))
  const toggleAlert=(id:string)=>setAlerts(v=>v.map(a=>a.id===id?{...a,status:a.status==='Activa'?'Pausada':'Activa'}:a))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Analítica Empresarial\n**Agente:** INSIGHT\n\n## Executive summary\n- Decision health demo: ${decisionHealth}/100\n- Data quality demo: ${dataQuality}/100\n- Anomalías críticas/altas abiertas: ${critical}\n- Métricas en riesgo: ${riskMetrics}\n\n## Pregunta de decisión\n\n## Métricas y definiciones\n\n## Fuente / lineage / frescura\n\n## Anomalías\n\n## Drivers observados\n\n## Correlación vs causalidad\n\n## Forecast e intervalo\n\n## Escenarios\n\n## Recomendación\n\n## Nivel de confianza y límites\n\n## Owner / aprobación\n\n> Documento analítico demo. Validar fuentes, definiciones, lineage, calidad y supuestos antes de tomar decisiones reales. Una correlación no demuestra causalidad.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="analytics-premium">
    <header className="analytics-head">
      <div className="analytics-brand"><span><BarChart3 size={25}/></span><div><small>INSIGHT · DIRECTOR DE BUSINESS INTELLIGENCE AI</small><h1>Enterprise Intelligence & Decision Science Center</h1><p>KPIs, anomalías, drivers, forecast y escenarios con lineage, frescura y confidence.</p></div></div>
      <div className="analytics-head-status"><i/>Datos demo · Evidence-aware analytics</div>
    </header>

    <nav className="analytics-tabs">{[
      ['command','Command Center'],['metrics','Metric Fabric'],['anomalies','Anomalías'],['drivers','Drivers'],['forecast','Forecast'],['scenarios','Escenarios'],['alerts','Alertas'],['documents','Documentos'],['agent','INSIGHT AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="analytics-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Decision health" value={`${decisionHealth}/100`} detail={`${critical} señales prioritarias`} tone="violet"/>
      <Kpi icon={<CheckCircle2 size={18}/>} label="Data quality" value={`${dataQuality}/100`} detail="confidence promedio" tone="emerald"/>
      <Kpi icon={<ShieldAlert size={18}/>} label="Anomalías abiertas" value={String(anomalies.filter(a=>a.status!=='Explicada').length)} detail={`${critical} altas/críticas`} tone="rose"/>
      <Kpi icon={<Layers3 size={18}/>} label="Métricas gobernadas" value={String(metrics.length)} detail={`${riskMetrics} en riesgo · ${attentionMetrics} atención`} tone="cyan"/>
    </div>}

    {tab==='command'&&<>
      <div className="analytics-grid two">
        <Panel title="Executive signal board" subtitle="Qué cambió y qué merece una decisión">
          <div className="decision-list">{actions.map((a,i)=><article key={i} className={`decision ${a.tone}`}><span>{a.tone==='risk'?<AlertTriangle size={18}/>:<Sparkles size={18}/>}</span><div><b>{a.title}</b><p>{a.reason}</p></div></article>)}</div>
        </Panel>
        <Panel title="Decision integrity" subtitle="Calidad antes de velocidad">
          <div className="integrity-list">
            <Integrity label="Lineage visible" value="8/8 KPIs" ok/>
            <Integrity label="Confidence alta" value={`${metrics.filter(m=>m.confidence==='Alta').length}/${metrics.length}`} ok/>
            <Integrity label="Frescura" value="3–12 min demo" ok/>
            <Integrity label="Causalidad validada" value="No asumida" ok/>
          </div>
          <div className="analytics-note"><GitBranch size={18}/><p><b>Regla INSIGHT:</b> una correlación puede orientar investigación, pero no debe presentarse como causalidad sin diseño analítico y evidencia suficiente.</p></div>
        </Panel>
      </div>
      <Panel title="Cross-functional KPI fabric" subtitle="Vista ejecutiva consolidada con fuente y confidence">
        <div className="metric-cards">{metrics.slice(0,6).map(m=><MetricCard key={m.id} metric={m}/>)}</div>
      </Panel>
    </>}

    {tab==='metrics'&&<Panel title="Metric Fabric" subtitle="Definiciones, owners, lineage, frescura y confidence">
      <div className="analytics-toolbar"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar KPI, fuente, owner..."/></div><button onClick={()=>openWorkspace('KPI Dictionary')}><FileText size={16}/> KPI Dictionary</button></div>
      <div className="analytics-table"><div className="row head"><span>KPI</span><span>Valor</span><span>Variación</span><span>Target</span><span>Fuente</span><span>Confidence</span></div>{filtered.map(m=><div className="row" key={m.id}><span><b>{m.name}</b><small>{m.owner} · {m.freshness}</small></span><span><b>{fmt(m)}</b></span><span className={m.value>=m.previous?'good':'risk'}>{m.previous?`${m.value>=m.previous?'+':''}${pct((m.value-m.previous)/Math.abs(m.previous)*100)}`:'—'}</span><span>{fmt(m,m.target)}</span><span><small>{m.source}</small></span><span><em className={`confidence ${m.confidence.toLowerCase()}`}>{m.confidence}</em></span></div>)}</div>
    </Panel>}

    {tab==='anomalies'&&<Panel title="Anomaly Detection" subtitle="Señales priorizadas con hipótesis explícitas">
      <div className="anomaly-list">{anomalies.map(a=><article className={`anomaly severity-${a.severity.toLowerCase()}`} key={a.id}><div className="anomaly-top"><span><AlertTriangle size={18}/></span><div><small>{a.id} · {a.detected}</small><b>{a.title}</b></div><em>{a.severity}</em></div><p>{a.hypothesis}</p><div className="anomaly-meta"><span>Fuente: {a.source}</span><span>Confidence: {a.confidence}</span><span>Δ {pct(a.delta)}</span><span>Estado: {a.status}</span></div><button onClick={()=>acknowledge(a.id)} disabled={a.status==='Explicada'}>{a.status==='Nueva'?'Investigar':a.status==='Investigando'?'Marcar explicada':'Explicada'}</button></article>)}</div>
    </Panel>}

    {tab==='drivers'&&<Panel title="Driver Analysis" subtitle="Relaciones observadas, fuerza y límites de interpretación">
      <div className="driver-grid">{drivers.map(d=><article className="driver-card" key={d.id}><div><small>{d.outcome}</small><b>{d.driver}</b></div><span className={d.relation==='Positiva'?'positive':'negative'}>{d.relation}</span><div className="strength"><i><em style={{width:`${d.strength}%`}}/></i><b>{d.strength}/100</b></div><p>{d.note}</p><small>Evidencia: {d.evidence} · Confidence {d.confidence}</small></article>)}</div>
    </Panel>}

    {tab==='forecast'&&<Panel title="Forecast Lab" subtitle="Base, intervalo y actual; no un único número mágico">
      <div className="forecast-chart">{forecast.map(p=><div className="forecast-col" key={p.period}><div className="forecast-range" title={`${money(p.low)} – ${money(p.high)}`}><i style={{height:`${Math.max(12,(p.high/760000)*150)}px`}}/><em style={{height:`${Math.max(8,(p.base/760000)*140)}px`}}/>{p.actual&&<b style={{bottom:`${Math.max(6,(p.actual/760000)*130)}px`}}/>}</div><span>{p.period}</span><small>{money(p.base)}</small></div>)}</div>
      <div className="legend"><span><i className="base"/>Forecast base</span><span><i className="range"/>Intervalo</span><span><i className="actual"/>Actual demo</span></div>
      <div className="analytics-note"><Clock3 size={18}/><p>El intervalo se muestra explícitamente para evitar falsa precisión. El modelo real deberá versionar features, horizonte, error histórico y fecha de entrenamiento.</p></div>
    </Panel>}

    {tab==='scenarios'&&<div className="analytics-grid two">
      <Panel title="Scenario Lab" subtitle="What-if no destructivo">
        <Scenario label="Revenue shock" value={scenario.revenue} min={-20} max={20} suffix="%" onChange={v=>setScenario(s=>({...s,revenue:v}))}/>
        <Scenario label="Cash variation" value={scenario.cash} min={-20} max={20} suffix="%" onChange={v=>setScenario(s=>({...s,cash:v}))}/>
        <Scenario label="Cobranza recuperada" value={scenario.collections} min={0} max={50} suffix="% AR" onChange={v=>setScenario(s=>({...s,collections:v}))}/>
        <Scenario label="Portfolio health delta" value={scenario.portfolio} min={-15} max={15} suffix=" pts" onChange={v=>setScenario(s=>({...s,portfolio:v}))}/>
      </Panel>
      <Panel title="Projected decision surface" subtitle="Impacto demo bajo los supuestos seleccionados">
        <div className="scenario-results"><Result label="Revenue proyectado" value={money(projectedRevenue)}/><Result label="Caja proyectada" value={money(projectedCash)}/><Result label="Portfolio health" value={`${Math.round(projectedPortfolio)}/100`}/><Result label="AR recuperable" value={money(metrics.find(m=>m.id==='KPI-AR')!.value*(scenario.collections/100))}/></div>
        <button className="primary" onClick={()=>openWorkspace('Scenario Analysis')}><FileText size={16}/> Abrir análisis en Workspace</button>
      </Panel>
    </div>}

    {tab==='alerts'&&<Panel title="Executive Alerting" subtitle="Reglas gobernadas; menos ruido, más señal">
      <div className="alert-grid">{alerts.map(a=><article className="alert-card" key={a.id}><div><small>{a.id}</small><b>{a.name}</b><p>{a.metric} · {a.condition}</p></div><span>{a.owner}</span><small>Último trigger: {a.lastTrigger}</small><button className={a.status==='Activa'?'on':''} onClick={()=>toggleAlert(a.id)}><Zap size={15}/>{a.status}</button></article>)}</div>
    </Panel>}

    {tab==='documents'&&<Panel title="Decision Document Studio" subtitle="Análisis estructurado y editable en Workspace">
      <div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span>{d}</span><small>Editar en Workspace</small></button>)}</div>
    </Panel>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>} 
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <article className={`analytics-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>}
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}){return <section className="analytics-panel"><header><div><h3>{title}</h3><p>{subtitle}</p></div></header>{children}</section>}
function Integrity({label,value,ok}:{label:string;value:string;ok:boolean}){return <div className="integrity"><span>{ok?<CheckCircle2 size={17}/>:<AlertTriangle size={17}/>}</span><b>{label}</b><em>{value}</em></div>}
function MetricCard({metric:m}:{metric:Metric}){return <article className={`metric-card ${m.status.toLowerCase()}`}><div><small>{m.owner}</small><em className={`confidence ${m.confidence.toLowerCase()}`}>{m.confidence}</em></div><h4>{m.name}</h4><b>{fmt(m)}</b><p>{m.source}</p><small>{m.freshness} · target {fmt(m,m.target)}</small></article>}
function Scenario({label,value,min,max,suffix,onChange}:{label:string;value:number;min:number;max:number;suffix:string;onChange:(v:number)=>void}){return <label className="scenario-control"><div><span>{label}</span><b>{value>0?'+':''}{value}{suffix}</b></div><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
function Result({label,value}:{label:string;value:string}){return <article><small>{label}</small><b>{value}</b></article>}
