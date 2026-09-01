import { useMemo, useState } from 'react'
import {
  AlertTriangle, BadgeCheck, BookOpen, Bot, Calculator, CheckCircle2, CircleDollarSign,
  FileCheck2, FileText, Landmark, ListChecks, Plus, ReceiptText, Scale, Search,
  ShieldCheck, Sparkles, TrendingUp, WalletCards, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './accounting-premium.css'

type Tab='command'|'ledger'|'journals'|'reconciliation'|'statements'|'close'|'tax'|'anomalies'|'documents'|'agent'
type JournalStatus='Borrador'|'Revisión'|'Contabilizada'
type ReconciliationStatus='Conciliada'|'Pendiente'|'Diferencia'
type CloseStatus='Completo'|'Pendiente'|'Bloqueado'
type AnomalyStatus='Nueva'|'En revisión'|'Resuelta'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'

type LedgerAccount={code:string;name:string;type:'Activo'|'Pasivo'|'Capital'|'Ingreso'|'Gasto';debit:number;credit:number;balance:number;source:string}
type Journal={id:string;date:string;concept:string;source:string;debit:number;credit:number;evidence:number;owner:string;status:JournalStatus}
type Reconciliation={id:string;account:string;book:number;bank:number;difference:number;owner:string;updated:string;status:ReconciliationStatus}
type CloseTask={id:string;title:string;owner:string;source:string;status:CloseStatus}
type Anomaly={id:string;title:string;account:string;amount:number;risk:Risk;reason:string;source:string;status:AnomalyStatus}

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

const seedLedger:LedgerAccount[]=[
  {code:'1101',name:'Bancos',type:'Activo',debit:986420,credit:302300,balance:684120,source:'Tesorería / STERLING'},
  {code:'1105',name:'Clientes',type:'Activo',debit:612576,credit:173184,balance:439392,source:'Facturación / INVOICER'},
  {code:'1201',name:'Inventarios',type:'Activo',debit:258400,credit:74580,balance:183820,source:'Inventarios / MERIDIAN'},
  {code:'2101',name:'Proveedores',type:'Pasivo',debit:92400,credit:218840,balance:-126440,source:'Compras / SOURCE'},
  {code:'2105',name:'Impuestos por pagar',type:'Pasivo',debit:28150,credit:66740,balance:-38590,source:'Fiscal / LEDGER'},
  {code:'3101',name:'Capital social',type:'Capital',debit:0,credit:500000,balance:-500000,source:'Gobierno corporativo'},
  {code:'4101',name:'Ingresos por servicios',type:'Ingreso',debit:0,credit:284823,balance:-284823,source:'Facturación / INVOICER'},
  {code:'5101',name:'Nómina y prestaciones',type:'Gasto',debit:79400,credit:0,balance:79400,source:'Nóminas / PAYROLL'},
  {code:'5201',name:'Infraestructura y operación',type:'Gasto',debit:122000,credit:0,balance:122000,source:'Operaciones / NEXUS'},
]

const seedJournals:Journal[]=[
  {id:'POL-2609-001',date:'01 sep 2026',concept:'Reconocimiento de ingresos del periodo',source:'Facturación',debit:284823,credit:284823,evidence:12,owner:'LEDGER',status:'Contabilizada'},
  {id:'POL-2609-002',date:'01 sep 2026',concept:'Provisión de nómina mensual',source:'PAYROLL',debit:79400,credit:79400,evidence:10,owner:'Contabilidad',status:'Contabilizada'},
  {id:'POL-2609-003',date:'01 sep 2026',concept:'Servicios de infraestructura',source:'Compras / NEXUS',debit:38200,credit:38200,evidence:4,owner:'Contabilidad',status:'Revisión'},
  {id:'POL-2609-004',date:'01 sep 2026',concept:'Estimación de impuestos del periodo',source:'LEDGER Tax',debit:38590,credit:38590,evidence:3,owner:'Fiscal',status:'Borrador'},
]

const seedReconciliations:Reconciliation[]=[
  {id:'REC-01',account:'Bancos · Operativa MXN',book:684120,bank:684120,difference:0,owner:'Tesorería',updated:'01 sep 2026',status:'Conciliada'},
  {id:'REC-02',account:'Clientes / CxC',book:439392,bank:438742,difference:650,owner:'Facturación',updated:'01 sep 2026',status:'Diferencia'},
  {id:'REC-03',account:'Proveedores / CxP',book:126440,bank:126440,difference:0,owner:'Compras',updated:'31 ago 2026',status:'Conciliada'},
  {id:'REC-04',account:'Nómina por pagar',book:79400,bank:79400,difference:0,owner:'PAYROLL',updated:'31 ago 2026',status:'Pendiente'},
]

const seedClose:CloseTask[]=[
  {id:'CLS-01',title:'Conciliar bancos y tesorería',owner:'LEDGER + STERLING',source:'Bancos',status:'Completo'},
  {id:'CLS-02',title:'Validar facturación y notas de crédito',owner:'LEDGER + INVOICER',source:'Facturación',status:'Completo'},
  {id:'CLS-03',title:'Integrar nómina e incidencias',owner:'LEDGER + PAYROLL',source:'Nóminas',status:'Completo'},
  {id:'CLS-04',title:'Resolver diferencia de cuentas por cobrar',owner:'LEDGER + INVOICER',source:'CxC',status:'Bloqueado'},
  {id:'CLS-05',title:'Revisar provisiones e impuestos',owner:'Fiscal',source:'Impuestos',status:'Pendiente'},
  {id:'CLS-06',title:'Emitir estados financieros de gestión',owner:'LEDGER',source:'Reporting',status:'Pendiente'},
]

const seedAnomalies:Anomaly[]=[
  {id:'ANO-01',title:'Diferencia entre auxiliar y cartera',account:'1105 · Clientes',amount:650,risk:'Medio',reason:'Saldo no conciliado entre Facturación y mayor contable.',source:'INVOICER ↔ LEDGER',status:'Nueva'},
  {id:'ANO-02',title:'Póliza con evidencia incompleta',account:'5201 · Infraestructura',amount:38200,risk:'Alto',reason:'La póliza tiene soporte parcial y requiere factura/orden autorizada.',source:'NEXUS / Compras',status:'En revisión'},
  {id:'ANO-03',title:'Provisión fiscal pendiente de aprobación',account:'2105 · Impuestos por pagar',amount:38590,risk:'Medio',reason:'Estimación demo pendiente de validación fiscal y fuente oficial.',source:'LEDGER Tax',status:'Nueva'},
]

const accountingDocs=[
  'Balanza de comprobación','Estado de resultados','Balance general','Estado de flujo de efectivo',
  'Libro mayor','Auxiliar de clientes','Auxiliar de proveedores','Póliza contable','Paquete de cierre mensual',
  'Conciliación bancaria','Papeles de trabajo fiscales','Reporte de anomalías contables','Memo de políticas contables','Reporte para Consejo',
]
const accountingKnowledge=[
  'NIF · Normas de Información Financiera mexicanas','NIIF / IFRS · referencia internacional',
  'Código Fiscal de la Federación · contexto fiscal','Resolución Miscelánea Fiscal · validar vigencia',
  'Catálogo de cuentas corporativo','Políticas contables internas','Matriz de autorizaciones y segregación de funciones',
  'Evidencia de Facturación, Nóminas, Compras, Inventarios y Tesorería autorizada para el tenant',
]
const accountingSuggestions=[
  '¿Estamos listos para cerrar el mes?','Detecta diferencias y pólizas sin soporte suficiente',
  'Explícame el estado de resultados y sus variaciones','Prioriza las conciliaciones que bloquean el cierre',
]

export default function AccountingModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [journals,setJournals]=useState(seedJournals)
  const [reconciliations,setReconciliations]=useState(seedReconciliations)
  const [closeTasks,setCloseTasks]=useState(seedClose)
  const [anomalies,setAnomalies]=useState(seedAnomalies)
  const [search,setSearch]=useState('')
  const [journalOpen,setJournalOpen]=useState(false)
  const [draft,setDraft]=useState({concept:'',source:'Manual',amount:0,owner:'LEDGER'})

  const debit=seedLedger.reduce((s,a)=>s+a.debit,0)
  const credit=seedLedger.reduce((s,a)=>s+a.credit,0)
  const journalDebit=journals.reduce((s,j)=>s+j.debit,0)
  const journalCredit=journals.reduce((s,j)=>s+j.credit,0)
  const trialDifference=Math.abs(journalDebit-journalCredit)
  const unreconciled=reconciliations.filter(r=>r.status!=='Conciliada')
  const reconciliationDiff=reconciliations.reduce((s,r)=>s+Math.abs(r.difference),0)
  const completeClose=closeTasks.filter(t=>t.status==='Completo').length
  const closeReadiness=Math.round(completeClose/closeTasks.length*100)
  const unresolvedAnomalies=anomalies.filter(a=>a.status!=='Resuelta')
  const highRisk=unresolvedAnomalies.filter(a=>a.risk==='Alto'||a.risk==='Crítico').length
  const integrityScore=Math.max(0,100-(trialDifference?35:0)-unreconciled.length*5-highRisk*8)

  const revenue=284823
  const payroll=79400
  const operating=122000
  const ebitda=revenue-payroll-operating
  const taxEstimate=38590
  const netIncome=ebitda-taxEstimate
  const assets=684120+439392+183820
  const liabilities=126440+38590
  const equity=assets-liabilities

  const filteredLedger=useMemo(()=>{
    const q=search.trim().toLowerCase(); if(!q)return seedLedger
    return seedLedger.filter(a=>[a.code,a.name,a.type,a.source].some(v=>v.toLowerCase().includes(q)))
  },[search])

  const createJournal=()=>{
    if(!draft.concept.trim()||draft.amount<=0)return
    const amount=Number(draft.amount)
    setJournals(v=>[{id:`POL-2609-${String(v.length+1).padStart(3,'0')}`,date:new Date().toLocaleDateString('es-MX'),concept:draft.concept.trim(),source:draft.source,debit:amount,credit:amount,evidence:0,owner:draft.owner,status:'Borrador'},...v])
    setDraft({concept:'',source:'Manual',amount:0,owner:'LEDGER'});setJournalOpen(false);setTab('journals')
  }
  const postJournal=(id:string)=>setJournals(v=>v.map(j=>j.id===id?{...j,status:j.status==='Borrador'?'Revisión':'Contabilizada'}:j))
  const reconcile=(id:string)=>setReconciliations(v=>v.map(r=>r.id===id?{...r,book:r.bank,difference:0,status:'Conciliada',updated:new Date().toLocaleDateString('es-MX')}:r))
  const completeTask=(id:string)=>setCloseTasks(v=>v.map(t=>t.id===id?{...t,status:'Completo'}:t))
  const resolveAnomaly=(id:string)=>setAnomalies(v=>v.map(a=>a.id===id?{...a,status:'Resuelta'}:a))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Contabilidad\n**Agente:** LEDGER\n\n## Periodo\nSeptiembre 2026\n\n## Integridad contable\n- Débitos de pólizas: ${money(journalDebit)}\n- Créditos de pólizas: ${money(journalCredit)}\n- Diferencia: ${money(trialDifference)}\n- Conciliaciones abiertas: ${unreconciled.length}\n- Cierre listo: ${closeReadiness}%\n\n## Cifras de gestión (demo)\n- Ingresos: ${money(revenue)}\n- EBITDA: ${money(ebitda)}\n- Utilidad neta estimada: ${money(netIncome)}\n\n## Evidencia / fuentes\n\n## Ajustes y reclasificaciones\n\n## Revisión y aprobaciones\n\n> Documento contable operativo. Validar contra mayor, auxiliares, evidencia y normativa fiscal vigente antes de emitir información oficial.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="accounting-premium">
    <header className="accounting-head">
      <div className="accounting-brand"><span><Calculator size={25}/></span><div><small>LEDGER · DIRECTOR DE CONTABILIDAD AI</small><h1>Accounting Command Center</h1><p>Mayor, pólizas, conciliaciones, estados financieros, cierre continuo y trazabilidad contable.</p></div></div>
      <div className="accounting-head-status"><i/>Datos demo · Double-entry aware</div>
    </header>

    <nav className="accounting-tabs">
      {[
        ['command','Command Center'],['ledger','Libro mayor'],['journals','Pólizas'],['reconciliation','Conciliación'],
        ['statements','Estados'],['close','Cierre'],['tax','Fiscal'],['anomalies','Anomalías'],['documents','Documentos'],['agent','LEDGER AI'],
      ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}
    </nav>

    {tab!=='agent'&&<div className="accounting-kpis">
      <AccountingKpi icon={<Scale size={18}/>} label="Integridad contable" value={`${integrityScore}/100`} detail={trialDifference===0?'Débitos = créditos':'Revisar descuadre'} tone="emerald"/>
      <AccountingKpi icon={<ListChecks size={18}/>} label="Cierre mensual" value={`${closeReadiness}%`} detail={`${completeClose}/${closeTasks.length} controles completos`} tone="violet"/>
      <AccountingKpi icon={<Landmark size={18}/>} label="Conciliaciones" value={`${reconciliations.length-unreconciled.length}/${reconciliations.length}`} detail={`${money(reconciliationDiff)} por resolver`} tone="cyan"/>
      <AccountingKpi icon={<AlertTriangle size={18}/>} label="Anomalías" value={String(unresolvedAnomalies.length)} detail={`${highRisk} alto riesgo`} tone="amber"/>
      <AccountingKpi icon={<CircleDollarSign size={18}/>} label="Utilidad estimada" value={money(netIncome)} detail="Gestión demo · no fiscal" tone="blue"/>
    </div>}

    {tab==='command'&&<div className="accounting-layout">
      <section className="accounting-panel accounting-hero-panel">
        <div className="accounting-panel-title"><div><small>CONTROLLER VIEW</small><h2>Readiness del cierre</h2></div><span className="accounting-score"><BadgeCheck size={17}/>{closeReadiness}%</span></div>
        <div className="accounting-health-grid">
          <div><span>Partida doble</span><b>{trialDifference===0?'Cuadrada':'Descuadre'}</b><i className={trialDifference===0?'good':'risk'}/></div>
          <div><span>Conciliación</span><b>{unreconciled.length} pendientes</b><i className={unreconciled.length?'warn':'good'}/></div>
          <div><span>Evidencia</span><b>{journals.filter(j=>j.evidence>=4).length}/{journals.length} pólizas</b><i className="warn"/></div>
          <div><span>Anomalías</span><b>{unresolvedAnomalies.length} abiertas</b><i className={highRisk?'risk':'warn'}/></div>
        </div>
        <div className="accounting-ai-brief"><Sparkles size={21}/><div><b>Lectura de LEDGER</b><p>La partida doble está cuadrada. El cierre está bloqueado principalmente por una diferencia de $650 en clientes, una póliza de infraestructura con soporte incompleto y la provisión fiscal todavía en borrador.</p></div></div>
      </section>

      <section className="accounting-panel">
        <div className="accounting-panel-title"><div><small>PERIODO</small><h2>Resultado operativo</h2></div><TrendingUp size={18}/></div>
        <div className="pnl-stack"><div><span>Ingresos</span><b>{money(revenue)}</b></div><div><span>Nómina</span><b>-{money(payroll)}</b></div><div><span>Operación</span><b>-{money(operating)}</b></div><div className="strong"><span>EBITDA</span><b>{money(ebitda)}</b></div><div><span>Impuesto estimado</span><b>-{money(taxEstimate)}</b></div><div className="net"><span>Utilidad estimada</span><b>{money(netIncome)}</b></div></div>
      </section>

      <section className="accounting-panel">
        <div className="accounting-panel-title"><div><small>CONTINUOUS CLOSE</small><h2>Bloqueadores principales</h2></div><Bot size={18}/></div>
        <div className="accounting-decisions">
          <Decision n="01" title="Resolver diferencia CxC" text="Conciliar $650 entre auxiliar de clientes y mayor contable." tone="risk"/>
          <Decision n="02" title="Completar soporte de infraestructura" text="Vincular factura/orden aprobada a POL-2609-003 antes de contabilizar." tone="warn"/>
          <Decision n="03" title="Validar provisión fiscal" text="Confirmar cálculo con fuente fiscal vigente antes del cierre." tone="good"/>
        </div>
      </section>
    </div>}

    {tab==='ledger'&&<section className="accounting-panel accounting-wide">
      <div className="accounting-panel-title"><div><small>GENERAL LEDGER</small><h2>Libro mayor</h2></div><span>{seedLedger.length} cuentas</span></div>
      <label className="accounting-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cuenta, código, tipo o fuente..."/></label>
      <div className="accounting-table-wrap"><table><thead><tr><th>Cuenta</th><th>Nombre</th><th>Tipo</th><th>Débitos</th><th>Créditos</th><th>Saldo</th><th>Fuente</th></tr></thead><tbody>{filteredLedger.map(a=><tr key={a.code}><td>{a.code}</td><td>{a.name}</td><td><span className="acct-pill">{a.type}</span></td><td>{money(a.debit)}</td><td>{money(a.credit)}</td><td className={a.balance<0?'negative':''}>{money(a.balance)}</td><td>{a.source}</td></tr>)}</tbody></table></div>
      <div className="trial-footer"><span>Movimientos del mayor (demo)</span><b>Débitos {money(debit)} · Créditos {money(credit)}</b></div>
    </section>}

    {tab==='journals'&&<section className="accounting-panel accounting-wide">
      <div className="accounting-panel-title"><div><small>JOURNAL ENGINE</small><h2>Pólizas contables</h2></div><button className="accounting-primary" onClick={()=>setJournalOpen(true)}><Plus size={15}/>Nueva póliza</button></div>
      <div className="accounting-table-wrap"><table><thead><tr><th>Póliza</th><th>Fecha</th><th>Concepto</th><th>Fuente</th><th>Débito</th><th>Crédito</th><th>Evidencia</th><th>Estado</th><th/></tr></thead><tbody>{journals.map(j=><tr key={j.id}><td>{j.id}</td><td>{j.date}</td><td>{j.concept}</td><td>{j.source}</td><td>{money(j.debit)}</td><td>{money(j.credit)}</td><td>{j.evidence}</td><td><span className={`acct-status ${j.status.toLowerCase().replace('ó','o')}`}>{j.status}</span></td><td>{j.status!=='Contabilizada'&&<button onClick={()=>postJournal(j.id)}>{j.status==='Borrador'?'Enviar a revisión':'Contabilizar'}</button>}</td></tr>)}</tbody></table></div>
      <div className={`double-entry-check ${trialDifference===0?'ok':'bad'}`}><Scale size={18}/><div><b>Control de partida doble</b><span>Débitos {money(journalDebit)} · Créditos {money(journalCredit)} · Diferencia {money(trialDifference)}</span></div></div>
    </section>}

    {tab==='reconciliation'&&<section className="accounting-panel accounting-wide">
      <div className="accounting-panel-title"><div><small>RECONCILIATION HUB</small><h2>Conciliaciones</h2></div><span>{unreconciled.length} abiertas</span></div>
      <div className="reconciliation-grid">{reconciliations.map(r=><article key={r.id} className={r.status==='Diferencia'?'has-diff':''}><div><Landmark size={17}/><b>{r.account}</b><small>{r.id} · {r.owner}</small></div><div className="recon-values"><span>Libros <b>{money(r.book)}</b></span><span>Fuente <b>{money(r.bank)}</b></span><span>Diferencia <b>{money(r.difference)}</b></span></div><footer><span className={`acct-status ${r.status.toLowerCase()}`}>{r.status}</span>{r.status!=='Conciliada'&&<button onClick={()=>reconcile(r.id)}>Resolver demo</button>}</footer></article>)}</div>
    </section>}

    {tab==='statements'&&<div className="accounting-layout">
      <section className="accounting-panel"><div className="accounting-panel-title"><div><small>P&L</small><h2>Estado de resultados</h2></div><ReceiptText size={18}/></div><div className="pnl-stack"><div><span>Ingresos</span><b>{money(revenue)}</b></div><div><span>Gastos de personal</span><b>-{money(payroll)}</b></div><div><span>Gastos operativos</span><b>-{money(operating)}</b></div><div className="strong"><span>EBITDA</span><b>{money(ebitda)}</b></div><div className="net"><span>Resultado neto estimado</span><b>{money(netIncome)}</b></div></div></section>
      <section className="accounting-panel"><div className="accounting-panel-title"><div><small>BALANCE SHEET</small><h2>Balance general</h2></div><Scale size={18}/></div><div className="balance-grid"><div><span>Activos</span><b>{money(assets)}</b></div><div><span>Pasivos</span><b>{money(liabilities)}</b></div><div><span>Capital contable estimado</span><b>{money(equity)}</b></div><div className="balance-check"><CheckCircle2 size={17}/><span>Activos = Pasivos + Capital</span></div></div></section>
      <section className="accounting-panel accounting-wide"><div className="accounting-panel-title"><div><small>REPORTING</small><h2>Estados listos para Workspace</h2></div></div><div className="accounting-doc-grid">{['Estado de resultados','Balance general','Estado de flujo de efectivo','Balanza de comprobación'].map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span>{d}</span><small>Generar borrador</small></button>)}</div></section>
    </div>}

    {tab==='close'&&<section className="accounting-panel accounting-wide">
      <div className="accounting-panel-title"><div><small>CONTINUOUS CLOSE</small><h2>Cierre mensual · Septiembre 2026</h2></div><span className="accounting-score">{closeReadiness}%</span></div>
      <div className="close-progress"><i style={{width:`${closeReadiness}%`}}/></div>
      <div className="close-list">{closeTasks.map(t=><article key={t.id}><span className={`close-dot ${t.status.toLowerCase()}`}/><div><b>{t.title}</b><small>{t.owner} · Fuente: {t.source}</small></div><span className={`acct-status ${t.status.toLowerCase()}`}>{t.status}</span>{t.status!=='Completo'&&<button onClick={()=>completeTask(t.id)}>Completar demo</button>}</article>)}</div>
    </section>}

    {tab==='tax'&&<div className="accounting-layout">
      <section className="accounting-panel accounting-hero-panel"><div className="accounting-panel-title"><div><small>TAX WORKBENCH</small><h2>Posición fiscal estimada</h2></div><ShieldCheck size={18}/></div><div className="tax-kpis"><div><span>IVA trasladado demo</span><b>$45,572</b></div><div><span>IVA acreditable demo</span><b>$19,840</b></div><div><span>IVA neto estimado</span><b>$25,732</b></div><div><span>ISR / provisión demo</span><b>{money(taxEstimate)}</b></div></div><div className="tax-warning"><AlertTriangle size={18}/><p>Estas cifras son demostrativas. Declaraciones, DIOT, contabilidad electrónica y determinación fiscal real requieren fuentes SAT vigentes, CFDI reales y revisión fiscal.</p></div></section>
      <section className="accounting-panel"><h2>Checklist fiscal</h2>{['Validar CFDI emitidos/recibidos','Revisar cancelaciones y notas de crédito','Conciliar impuestos retenidos','Validar provisiones','Preparar papeles de trabajo'].map((x,i)=><div className="tax-row" key={x}><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b><em>{i<2?'Listo':'Pendiente'}</em></div>)}</section>
    </div>}

    {tab==='anomalies'&&<section className="accounting-panel accounting-wide">
      <div className="accounting-panel-title"><div><small>ANOMALY ENGINE</small><h2>Excepciones y anomalías contables</h2></div><span>{unresolvedAnomalies.length} abiertas</span></div>
      <div className="anomaly-list">{anomalies.map(a=><article key={a.id}><span className={`anomaly-risk risk-${a.risk.toLowerCase()}`}>{a.risk}</span><div><b>{a.title}</b><small>{a.account} · {a.source}</small><p>{a.reason}</p></div><strong>{money(a.amount)}</strong><span className={`acct-status ${a.status.toLowerCase().replace(' ','-')}`}>{a.status}</span>{a.status!=='Resuelta'&&<button onClick={()=>resolveAnomaly(a.id)}>Resolver demo</button>}</article>)}</div>
    </section>}

    {tab==='documents'&&<section className="accounting-panel accounting-wide"><div className="accounting-panel-title"><div><small>WORKSPACE READY</small><h2>Biblioteca contable</h2></div></div><div className="accounting-doc-list">{accountingDocs.map(doc=><div key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>openWorkspace(doc)}>Editar en Workspace</button></div>)}</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={accountingDocs} knowledge={accountingKnowledge} suggestions={accountingSuggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>} 

    {journalOpen&&<div className="accounting-modal-backdrop" onMouseDown={()=>setJournalOpen(false)}><div className="accounting-modal" onMouseDown={e=>e.stopPropagation()}><div className="accounting-modal-head"><div><BookOpen size={17}/><b>Nueva póliza</b></div><button onClick={()=>setJournalOpen(false)}><X size={17}/></button></div><label><span>Concepto</span><input value={draft.concept} onChange={e=>setDraft({...draft,concept:e.target.value})}/></label><label><span>Fuente / módulo</span><input value={draft.source} onChange={e=>setDraft({...draft,source:e.target.value})}/></label><label><span>Importe balanceado</span><input type="number" value={draft.amount} onChange={e=>setDraft({...draft,amount:Number(e.target.value)})}/></label><label><span>Responsable</span><input value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})}/></label><div className="accounting-modal-note"><FileCheck2 size={16}/><span>El borrador crea débito y crédito iguales para preservar partida doble. La cuenta/contracuenta real debe validarse antes de contabilizar.</span></div><div className="accounting-modal-actions"><button className="accounting-primary" onClick={createJournal}>Crear borrador</button><button onClick={()=>setJournalOpen(false)}>Cancelar</button></div></div></div>}
  </section>
}

function AccountingKpi({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`accounting-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></div>}
function Decision({n,title,text,tone}:{n:string;title:string;text:string;tone:string}){return <div className={`accounting-decision ${tone}`}><span>{n}</span><div><b>{title}</b><p>{text}</p></div></div>}
