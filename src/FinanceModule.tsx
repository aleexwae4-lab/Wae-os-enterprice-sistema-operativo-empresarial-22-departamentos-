import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Bot, Building2, CalendarClock,
  CheckCircle2, CircleDollarSign, FileText, Gauge, Landmark, LineChart, PiggyBank,
  ReceiptText, ShieldCheck, Sparkles, Target, TrendingUp, WalletCards, Zap,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './finance-premium.css'

type Tab='overview'|'cashflow'|'receivables'|'payables'|'treasury'|'scenarios'|'documents'|'agent'
type Receivable={id:string;client:string;amount:number;due:string;days:number;status:'Vencida'|'Pendiente'|'Pagada'}
type Payable={id:string;vendor:string;amount:number;due:string;category:string;status:'Por aprobar'|'Programada'|'Pagada'}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

const seedReceivables:Receivable[]=[
  {id:'FAC-2025-1022',client:'Northwind',amount:44110,due:'24 abr 2025',days:130,status:'Vencida'},
  {id:'FAC-2025-1008',client:'Lumen',amount:27407,due:'24 feb 2025',days:189,status:'Vencida'},
  {id:'FAC-2025-1016',client:'Lumen',amount:32681,due:'24 abr 2025',days:130,status:'Vencida'},
  {id:'FAC-2025-1024',client:'Lumen',amount:52506,due:'24 jun 2025',days:69,status:'Vencida'},
  {id:'FAC-2025-1014-V',client:'Northwind',amount:12657,due:'24 abr 2025',days:130,status:'Vencida'},
  {id:'FAC-2025-1019',client:'Cobalt',amount:30518,due:'24 may 2025',days:100,status:'Vencida'},
  {id:'FAC-2025-1018',client:'Finvest',amount:31647,due:'24 sep 2026',days:0,status:'Pendiente'},
  {id:'FAC-2025-1004',client:'BluePeak',amount:70957,due:'30 sep 2026',days:0,status:'Pendiente'},
  {id:'FAC-2025-1007',client:'Cobalt',amount:57538,due:'05 oct 2026',days:0,status:'Pendiente'},
  {id:'FAC-2025-1014',client:'Northwind',amount:79232,due:'12 oct 2026',days:0,status:'Pendiente'},
]

const seedPayables:Payable[]=[
  {id:'AP-2201',vendor:'CloudNet Services',amount:38200,due:'05 sep 2026',category:'Infraestructura',status:'Por aprobar'},
  {id:'AP-2202',vendor:'TechSupply MX',amount:27450,due:'08 sep 2026',category:'Tecnología',status:'Programada'},
  {id:'AP-2203',vendor:'Office World',amount:18690,due:'11 sep 2026',category:'Operación',status:'Programada'},
  {id:'AP-2204',vendor:'Seguros Atlas',amount:42100,due:'15 sep 2026',category:'Seguros',status:'Por aprobar'},
]

const cashflow=[
  {label:'Abr',inflow:228000,outflow:166000},
  {label:'May',inflow:251000,outflow:172000},
  {label:'Jun',inflow:263000,outflow:181000},
  {label:'Jul',inflow:271000,outflow:188000},
  {label:'Ago',inflow:278000,outflow:194000},
  {label:'Sep',inflow:284823,outflow:201400},
]

const financeDocs=['Estado de resultados ejecutivo','Flujo de caja 13 semanas','Reporte de tesorería','Aging de cuentas por cobrar','Aging de cuentas por pagar','Presupuesto vs real','Forecast financiero','Memo de inversión','Reporte para Consejo','Política de tesorería']
const financeKnowledge=['NIF · Normas de Información Financiera','IFRS / NIIF','COSO · Control interno','ISO 31000 · Gestión de riesgos','Política corporativa de tesorería','Matriz de autorizaciones financieras','Histórico de cierres y presupuestos']
const financeSuggestions=['Dame el estado financiero de la empresa','¿Qué está presionando nuestra liquidez?','Construye un escenario conservador de 90 días','Prioriza la cobranza por impacto en caja']

export default function FinanceModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('overview')
  const [receivables,setReceivables]=useState(seedReceivables)
  const [payables,setPayables]=useState(seedPayables)
  const [revenueDelta,setRevenueDelta]=useState(0)
  const [collectionBoost,setCollectionBoost]=useState(15)
  const [costReduction,setCostReduction]=useState(5)

  const cash=684120
  const monthRevenue=284823
  const monthExpenses=201400
  const ebitda=monthRevenue-monthExpenses
  const margin=monthRevenue?ebitda/monthRevenue*100:0
  const receivable=receivables.filter(x=>x.status!=='Pagada').reduce((s,x)=>s+x.amount,0)
  const overdue=receivables.filter(x=>x.status==='Vencida').reduce((s,x)=>s+x.amount,0)
  const payable=payables.filter(x=>x.status!=='Pagada').reduce((s,x)=>s+x.amount,0)
  const runway=cash/95000
  const projected90=useMemo(()=>{
    const monthlyRevenue=monthRevenue*(1+revenueDelta/100)
    const monthlyExpenses=monthExpenses*(1-costReduction/100)
    const collections=receivable*(collectionBoost/100)
    return cash+(monthlyRevenue-monthlyExpenses)*3+collections-payable
  },[revenueDelta,costReduction,collectionBoost,receivable,payable])

  const payReceivable=(id:string)=>setReceivables(v=>v.map(x=>x.id===id?{...x,status:'Pagada'}:x))
  const approvePayable=(id:string)=>setPayables(v=>v.map(x=>x.id===id?{...x,status:'Programada'}:x))
  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Finanzas\n**Agente:** STERLING\n\n## Resumen ejecutivo\n- Caja disponible: ${money(cash)}\n- Ingresos del mes: ${money(monthRevenue)}\n- EBITDA operativo: ${money(ebitda)}\n- Por cobrar: ${money(receivable)}\n- Vencido: ${money(overdue)}\n- Por pagar: ${money(payable)}\n\n## Análisis\n\n## Riesgos\n\n## Recomendaciones\n\n## Decisiones / responsables\n\n> Borrador financiero editable. Validar cifras contra la fuente contable antes de una decisión externa.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="finance-premium">
    <header className="finance-head">
      <div className="finance-brand"><span><WalletCards size={25}/></span><div><small>STERLING · CFO AI</small><h1>Finance Command Center</h1><p>Liquidez, rentabilidad, tesorería, cobranza, pagos y escenarios en un solo centro.</p></div></div>
      <div className="finance-head-status"><i/>Datos operativos demo · AI activa</div>
    </header>

    <nav className="finance-tabs">
      {[
        ['overview','Command Center'],['cashflow','Flujo de caja'],['receivables','Por cobrar'],['payables','Por pagar'],
        ['treasury','Tesorería'],['scenarios','Escenarios'],['documents','Documentos'],['agent','STERLING AI'],
      ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}
    </nav>

    {tab!=='agent'&&<div className="finance-kpis">
      <Kpi icon={<PiggyBank size={18}/>} label="Caja disponible" value={money(cash)} detail={`${runway.toFixed(1)} meses runway`} tone="emerald"/>
      <Kpi icon={<TrendingUp size={18}/>} label="Ingresos del mes" value={money(monthRevenue)} detail="+12.8% vs periodo anterior" tone="cyan"/>
      <Kpi icon={<CircleDollarSign size={18}/>} label="EBITDA operativo" value={money(ebitda)} detail={`${margin.toFixed(1)}% margen`} tone="violet"/>
      <Kpi icon={<ReceiptText size={18}/>} label="Por cobrar" value={money(receivable)} detail={`${money(overdue)} vencido`} tone="amber"/>
      <Kpi icon={<Landmark size={18}/>} label="Por pagar" value={money(payable)} detail={`${payables.filter(x=>x.status==='Por aprobar').length} por aprobar`} tone="rose"/>
    </div>}

    {tab==='overview'&&<div className="finance-layout">
      <section className="finance-panel finance-hero-panel">
        <div className="finance-panel-title"><div><small>CEO / CFO VIEW</small><h2>Salud financiera</h2></div><span className="finance-score"><Gauge size={17}/>86/100</span></div>
        <div className="finance-health-grid">
          <div><span>Liquidez</span><b>Fuerte</b><i className="good"/></div>
          <div><span>Rentabilidad</span><b>{margin.toFixed(1)}%</b><i className="good"/></div>
          <div><span>Cobranza</span><b>Presionada</b><i className="warn"/></div>
          <div><span>Exposición 30d</span><b>{money(payable+overdue)}</b><i className="risk"/></div>
        </div>
        <div className="finance-ai-brief"><Sparkles size={21}/><div><b>Lectura de STERLING</b><p>La operación es rentable, pero la principal presión financiera está en la cartera vencida. Recuperar el 35% del vencido mejora de inmediato el colchón de liquidez y reduce la exposición de corto plazo.</p></div></div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel-title"><div><small>6 MESES</small><h2>Ingresos vs egresos</h2></div><LineChart size={18}/></div>
        <div className="finance-bars">{cashflow.map(x=>{const max=300000;return <div key={x.label}><div className="bar-pair"><i className="in" style={{height:`${x.inflow/max*100}%`}}/><i className="out" style={{height:`${x.outflow/max*100}%`}}/></div><span>{x.label}</span></div>})}</div>
        <div className="finance-legend"><span><i className="in"/>Entradas</span><span><i className="out"/>Salidas</span></div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel-title"><div><small>PRIORIDAD</small><h2>Decisiones recomendadas</h2></div><Bot size={18}/></div>
        <div className="finance-decisions">
          <Decision n="01" title={`Recuperar ${money(overdue)} vencido`} text="Priorizar Lumen, Northwind y Cobalt por impacto directo en caja." tone="risk"/>
          <Decision n="02" title={`Programar ${money(payable)} por pagar`} text="Separar obligaciones críticas de pagos diferibles antes de liberar tesorería." tone="warn"/>
          <Decision n="03" title="Mantener margen operativo > 25%" text="No incrementar gasto recurrente sin escenario de retorno o ahorro verificable." tone="good"/>
        </div>
      </section>
    </div>}

    {tab==='cashflow'&&<div className="finance-layout">
      <section className="finance-panel finance-wide"><div className="finance-panel-title"><div><small>FORECAST</small><h2>Flujo de caja · 13 semanas</h2></div><span className="positive"><ArrowUpRight size={15}/>Proyección positiva</span></div><div className="cashflow-forecast">{[684,702,718,743,731,762,779,804,826,817,846,872,901].map((v,i)=><div key={i}><i style={{height:`${Math.max(22,(v-650)/2.6)}%`}}/><span>S{i+1}</span></div>)}</div></section>
      <section className="finance-panel"><h2>Entradas previstas</h2>{[['Cobranza clientes',203290],['Ventas nuevas',284823],['Otros ingresos',36000]].map(x=><div className="money-row" key={String(x[0])}><ArrowDownRight size={16}/><span>{x[0]}</span><b>{money(Number(x[1]))}</b></div>)}</section>
      <section className="finance-panel"><h2>Salidas previstas</h2>{[['Nómina',79400],['Proveedores',126440],['Infraestructura',38200]].map(x=><div className="money-row out" key={String(x[0])}><ArrowUpRight size={16}/><span>{x[0]}</span><b>{money(Number(x[1]))}</b></div>)}</section>
    </div>}

    {tab==='receivables'&&<section className="finance-panel finance-wide">
      <div className="finance-panel-title"><div><small>AGING</small><h2>Cuentas por cobrar</h2></div><span>{receivables.filter(x=>x.status!=='Pagada').length} abiertas</span></div>
      <div className="aging-strip"><div><span>Corriente</span><b>{money(receivables.filter(x=>x.status==='Pendiente').reduce((s,x)=>s+x.amount,0))}</b></div><div><span>1–30 días</span><b>$0</b></div><div><span>31–60 días</span><b>$0</b></div><div><span>61–90 días</span><b>{money(52506)}</b></div><div className="risk"><span>90+ días</span><b>{money(Math.max(0,overdue-52506))}</b></div></div>
      <div className="finance-table-wrap"><table><thead><tr><th>Factura</th><th>Cliente</th><th>Vence</th><th>Días</th><th>Monto</th><th>Estado</th><th/></tr></thead><tbody>{receivables.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.client}</td><td>{r.due}</td><td>{r.days||'—'}</td><td>{money(r.amount)}</td><td><span className={`fin-status ${r.status.toLowerCase()}`}>{r.status}</span></td><td>{r.status!=='Pagada'&&<button onClick={()=>payReceivable(r.id)}>Aplicar cobro</button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab==='payables'&&<section className="finance-panel finance-wide">
      <div className="finance-panel-title"><div><small>CONTROL DE EGRESOS</small><h2>Cuentas por pagar</h2></div><span>{money(payable)} comprometido</span></div>
      <div className="finance-table-wrap"><table><thead><tr><th>Referencia</th><th>Proveedor</th><th>Categoría</th><th>Vence</th><th>Monto</th><th>Estado</th><th/></tr></thead><tbody>{payables.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.vendor}</td><td>{p.category}</td><td>{p.due}</td><td>{money(p.amount)}</td><td><span className={`fin-status ${p.status.toLowerCase().replaceAll(' ','-')}`}>{p.status}</span></td><td>{p.status==='Por aprobar'&&<button onClick={()=>approvePayable(p.id)}>Aprobar</button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab==='treasury'&&<div className="finance-layout">
      <section className="finance-panel finance-wide"><div className="finance-panel-title"><div><small>TESORERÍA</small><h2>Posición bancaria consolidada</h2></div><ShieldCheck size={18}/></div><div className="bank-grid">{[
        ['Cuenta Operativa MXN','BBVA · ••4821',318420,'Disponible'],['Reserva Estratégica','Santander · ••1904',220000,'Restringida'],['Cobranza','Mercado Pago · ••7042',94500,'Disponible'],['USD Treasury','Wise Business · ••8830',51200,'Disponible'],
      ].map(([name,bank,value,state])=><article key={String(name)}><Building2 size={18}/><div><b>{name}</b><span>{bank}</span></div><strong>{money(Number(value))}</strong><em>{state}</em></article>)}</div></section>
      <section className="finance-panel"><h2>Reglas de tesorería</h2>{['Reserva mínima de 60 días','Doble autorización > $50,000','Segregación de funciones','Conciliación diaria'].map(x=><div className="rule-row" key={x}><CheckCircle2 size={15}/><span>{x}</span></div>)}</section>
      <section className="finance-panel"><h2>Alertas</h2><div className="alert-row"><AlertTriangle size={17}/><div><b>Cobranza vencida alta</b><span>{money(overdue)} requiere plan de recuperación.</span></div></div><div className="alert-row"><CalendarClock size={17}/><div><b>2 pagos por aprobar</b><span>Revisión antes del siguiente corte.</span></div></div></section>
    </div>}

    {tab==='scenarios'&&<div className="finance-layout">
      <section className="finance-panel finance-scenario-controls"><div className="finance-panel-title"><div><small>WHAT-IF ENGINE</small><h2>Simulador financiero · 90 días</h2></div><Target size={18}/></div>
        <Scenario label="Variación de ingresos" value={revenueDelta} min={-30} max={40} suffix="%" onChange={setRevenueDelta}/>
        <Scenario label="Cobranza adicional" value={collectionBoost} min={0} max={60} suffix="%" onChange={setCollectionBoost}/>
        <Scenario label="Reducción de costos" value={costReduction} min={0} max={25} suffix="%" onChange={setCostReduction}/>
      </section>
      <section className="finance-panel scenario-result"><Sparkles size={28}/><span>Caja proyectada a 90 días</span><b>{money(projected90)}</b><small>Base actual: {money(cash)}</small><div className={projected90>cash?'scenario-good':'scenario-risk'}>{projected90>cash?'Escenario mejora la posición de caja':'Escenario reduce el colchón financiero'}</div></section>
      <section className="finance-panel"><h2>Sensibilidad</h2><div className="sensitivity"><div><span>Ingresos</span><b>{revenueDelta>=0?'+':''}{revenueDelta}%</b></div><div><span>Cobranza</span><b>+{collectionBoost}%</b></div><div><span>Costos</span><b>-{costReduction}%</b></div></div></section>
    </div>}

    {tab==='documents'&&<section className="finance-panel finance-wide"><div className="finance-panel-title"><div><small>WORKSPACE READY</small><h2>Biblioteca financiera</h2></div><FileText size={18}/></div><div className="finance-docs">{financeDocs.map(doc=><div key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>openWorkspace(doc)}>Editar en Workspace</button></div>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={financeDocs} knowledge={financeKnowledge} suggestions={financeSuggestions} onOpenWorkspace={title=>openWorkspace(title)}/>} 
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`finance-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Decision({n,title,text,tone}:{n:string;title:string;text:string;tone:string}){return <div className={`finance-decision ${tone}`}><span>{n}</span><div><b>{title}</b><p>{text}</p></div><Zap size={16}/></div>}
function Scenario({label,value,min,max,suffix,onChange}:{label:string;value:number;min:number;max:number;suffix:string;onChange:(v:number)=>void}){return <label className="scenario-control"><div><span>{label}</span><b>{value}{suffix}</b></div><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
