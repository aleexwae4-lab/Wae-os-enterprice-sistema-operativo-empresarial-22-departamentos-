import { useMemo, useState } from 'react'
import {
  Banknote, CalendarDays, CheckCircle2, ChevronLeft, CircleDollarSign, FileText,
  Plus, ReceiptText, Search, Sparkles, UsersRound, WalletCards, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './payroll.css'

type PayrollTab='summary'|'employees'|'incidents'|'periods'|'receipts'|'agent'
type Employee={id:string;name:string;role:string;department:string;monthly:number;status:'Activo'|'Permiso'|'Baja';contract:string}
type Incident={id:string;employeeId:string;type:'Falta'|'Bono'|'Comisión'|'Horas extra'|'Incapacidad'|'Permiso';amount:number;date:string;description:string}
type PayrollPeriod={id:string;label:string;start:string;end:string;status:'Borrador'|'Calculada'|'Cerrada';gross:number;adjustments:number;net:number}

const employees:Employee[]=[
  {id:'fp',name:'Fernando Peña',role:'Analista Datos',department:'Tecnología',monthly:6400,status:'Activo',contract:'Permanente'},
  {id:'rd',name:'Ricardo Domínguez',role:'Soporte N2',department:'Operaciones',monthly:4800,status:'Activo',contract:'Permanente'},
  {id:'lr',name:'Luis Ramírez',role:'Abogado Senior',department:'Legal',monthly:7200,status:'Activo',contract:'Permanente'},
  {id:'cm',name:'Carolina Mata',role:'Ejecutiva Ventas',department:'Ventas',monthly:5200,status:'Activo',contract:'Permanente'},
  {id:'pn',name:'Patricia Nava',role:'Dir. Marketing',department:'Marketing',monthly:8200,status:'Activo',contract:'Permanente'},
  {id:'af',name:'Andrea Flores',role:'Gerente Proyectos',department:'Operaciones',monthly:9800,status:'Activo',contract:'Permanente'},
  {id:'jg',name:'Jorge González',role:'Contador',department:'Contabilidad',monthly:8500,status:'Activo',contract:'Permanente'},
  {id:'mr',name:'María Robles',role:'Dir. Finanzas',department:'Finanzas',monthly:10400,status:'Activo',contract:'Permanente'},
  {id:'sa',name:'Sofía Andrade',role:'Compras',department:'Compras',monthly:9600,status:'Activo',contract:'Permanente'},
  {id:'dc',name:'Diego Cruz',role:'Ingeniero',department:'Tecnología',monthly:9300,status:'Activo',contract:'Permanente'},
]

const initialPeriods:PayrollPeriod[]=[
  {id:'sep-1',label:'Septiembre 2026 · Q1',start:'01/09/2026',end:'15/09/2026',status:'Borrador',gross:39700,adjustments:0,net:39700},
  {id:'aug-2',label:'Agosto 2026 · Q2',start:'16/08/2026',end:'31/08/2026',status:'Cerrada',gross:39700,adjustments:-1280,net:38420},
]

const payrollDocs=[
  'Resumen de nómina del periodo','Recibos de nómina','Reporte de incidencias','Cálculo de finiquito',
  'Cálculo de aguinaldo y PTU','Reporte de percepciones y deducciones','Archivo de dispersión bancaria','Checklist de cierre de nómina',
]
const payrollKnowledge=['LFT · jornadas, vacaciones y prestaciones','Ley del Seguro Social · referencias de cálculo','Políticas internas de compensación','Calendario corporativo de nómina','Matriz de incidencias autorizables','Histórico de periodos y recibos']

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

export default function PayrollModule({department,onBackCEO,onOpenWorkspace}:{department:Department;onBackCEO:()=>void;onOpenWorkspace:(title:string,body?:string)=>void}){
  const [tab,setTab]=useState<PayrollTab>('summary')
  const [incidents,setIncidents]=useState<Incident[]>([])
  const [periods,setPeriods]=useState<PayrollPeriod[]>(initialPeriods)
  const [search,setSearch]=useState('')
  const [incidentOpen,setIncidentOpen]=useState(false)
  const [incidentEmployee,setIncidentEmployee]=useState(employees[0].id)
  const [incidentType,setIncidentType]=useState<Incident['type']>('Falta')
  const [incidentAmount,setIncidentAmount]=useState(0)
  const [incidentDescription,setIncidentDescription]=useState('')

  const monthly=employees.filter(e=>e.status==='Activo').reduce((s,e)=>s+e.monthly,0)
  const active=employees.filter(e=>e.status==='Activo').length
  const leave=employees.filter(e=>e.status!=='Activo').length
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return !q?employees:employees.filter(e=>[e.name,e.role,e.department].some(x=>x.toLowerCase().includes(q)))},[search])
  const current=periods[0]
  const adjustments=incidents.reduce((sum,i)=>sum+(i.type==='Falta'?-Math.abs(i.amount):i.type==='Incapacidad'?-Math.abs(i.amount):Math.abs(i.amount)),0)
  const currentNet=current.gross+adjustments

  const registerIncident=()=>{
    setIncidents(v=>[{id:`inc-${Date.now()}`,employeeId:incidentEmployee,type:incidentType,amount:Number(incidentAmount)||0,date:new Date().toLocaleDateString('es-MX'),description:incidentDescription||'Sin descripción'},...v])
    setIncidentOpen(false);setIncidentAmount(0);setIncidentDescription('')
  }

  const calculateCurrent=()=>setPeriods(v=>v.map((p,i)=>i===0?{...p,status:'Calculada',adjustments,net:currentNet}:p))

  const openPayrollDoc=(title:string)=>onOpenWorkspace(title,`# ${title}\n\n**Departamento:** Nóminas AI\n**Agente:** PAYROLL\n**Periodo:** ${current.label}\n\n## Resumen\n- Empleados activos: ${active}\n- Nómina mensual base: ${money(monthly)}\n- Bruto del periodo: ${money(current.gross)}\n- Ajustes por incidencias: ${money(adjustments)}\n- Neto preliminar: ${money(currentNet)}\n\n## Percepciones\n\n## Deducciones\n\n## Incidencias\n\n## Autorizaciones\n\n> Documento de pre-nómina editable. Timbrado fiscal/CFDI requiere integración SAT/PAC real.\n`)

  return <div className="payroll-module">
    <button className="payroll-back" onClick={onBackCEO}><ChevronLeft size={15}/> CEO Chat</button>
    <div className="payroll-heading"><span className="payroll-icon"><WalletCards size={24}/></span><div><h1>Nóminas AI</h1><p>Cálculo, incidencias, periodos, recibos y compensación coordinados con Recursos Humanos</p></div><span className="payroll-agent-pill"><Sparkles size={14}/>PAYROLL en línea</span></div>

    <div className="payroll-kpis">
      <PayrollKpi icon={<UsersRound size={18}/>} label="Empleados" value={String(employees.length)}/>
      <PayrollKpi icon={<CheckCircle2 size={18}/>} label="Activos" value={String(active)}/>
      <PayrollKpi icon={<CalendarDays size={18}/>} label="Baja / permiso" value={String(leave)}/>
      <PayrollKpi icon={<CircleDollarSign size={18}/>} label="Nómina mensual" value={money(monthly)}/>
    </div>

    <div className="payroll-tabs">
      <button className={tab==='summary'?'active':''} onClick={()=>setTab('summary')}><Banknote size={15}/>Resumen</button>
      <button className={tab==='employees'?'active':''} onClick={()=>setTab('employees')}><UsersRound size={15}/>Empleados</button>
      <button className={tab==='incidents'?'active':''} onClick={()=>setTab('incidents')}><CalendarDays size={15}/>Incidencias</button>
      <button className={tab==='periods'?'active':''} onClick={()=>setTab('periods')}><CircleDollarSign size={15}/>Periodos</button>
      <button className={tab==='receipts'?'active':''} onClick={()=>setTab('receipts')}><ReceiptText size={15}/>Documentos</button>
      <button className={tab==='agent'?'active':''} onClick={()=>setTab('agent')}><Sparkles size={15}/>PAYROLL AI</button>
    </div>

    {tab==='summary'&&<div className="payroll-summary-grid">
      <section className="payroll-card current-period"><div className="payroll-card-head"><div><span>PERIODO ACTUAL</span><h2>{current.label}</h2></div><span className={`payroll-status ${periods[0].status.toLowerCase()}`}>{periods[0].status}</span></div><div className="payroll-period-metrics"><div><span>Bruto base</span><b>{money(current.gross)}</b></div><div><span>Incidencias</span><b>{money(adjustments)}</b></div><div><span>Neto preliminar</span><b>{money(currentNet)}</b></div></div><div className="payroll-actions"><button onClick={calculateCurrent}><Sparkles size={15}/>Calcular pre-nómina</button><button onClick={()=>openPayrollDoc('Resumen de nómina del periodo')}><FileText size={15}/>Editar resumen</button></div></section>
      <section className="payroll-card"><div className="payroll-card-head"><div><span>INTEGRACIÓN</span><h2>RR. HH. → Nóminas</h2></div></div><div className="payroll-flow"><span>TALENT</span><i>→</i><span>Incidencias</span><i>→</i><span>PAYROLL</span><i>→</i><span>Finanzas</span></div><p>Altas, bajas, permisos, vacaciones e incidencias alimentan la pre-nómina. El cierre aprobado puede generar documentos, dispersión y asiento contable.</p></section>
      <section className="payroll-card payroll-wide"><div className="payroll-card-head"><div><span>ALERTAS</span><h2>Control de cierre</h2></div></div><div className="payroll-checks"><div><CheckCircle2 size={16}/><span>10 empleados con salario base</span></div><div className={incidents.length?'warn':''}><CalendarDays size={16}/><span>{incidents.length} incidencias capturadas</span></div><div><FileText size={16}/><span>Recibos listos para generar tras aprobación</span></div></div></section>
    </div>}

    {tab==='employees'&&<section className="payroll-card"><div className="payroll-tools"><label><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empleado, puesto o departamento..."/></label></div><div className="payroll-employee-grid">{filtered.map(e=><article className="payroll-employee" key={e.id}><div className="employee-top"><span>{e.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><div><b>{e.name}</b><small>{e.role}</small></div><i>{e.status}</i></div><dl><div><dt>Departamento</dt><dd>{e.department}</dd></div><div><dt>Salario mensual</dt><dd>{money(e.monthly)}</dd></div><div><dt>Contrato</dt><dd>{e.contract}</dd></div></dl></article>)}</div></section>}

    {tab==='incidents'&&<section className="payroll-card"><div className="payroll-section-head"><div><h2>Incidencias ({incidents.length})</h2><p>Faltas, bonos, comisiones, horas extra, incapacidades y permisos.</p></div><button onClick={()=>setIncidentOpen(true)}><Plus size={15}/>Registrar incidencia</button></div>{incidents.length===0?<div className="payroll-empty">Sin incidencias registradas</div>:<div className="payroll-incident-list">{incidents.map(i=>{const e=employees.find(x=>x.id===i.employeeId);return <div key={i.id}><span>{i.type}</span><div><b>{e?.name}</b><small>{i.date} · {i.description}</small></div><strong>{money(i.amount)}</strong></div>})}</div>}</section>}

    {tab==='periods'&&<section className="payroll-card"><div className="payroll-section-head"><div><h2>Periodos de nómina</h2><p>Pre-cálculo, autorización y cierre.</p></div></div><div className="payroll-period-list">{periods.map(p=><div key={p.id}><div><b>{p.label}</b><small>{p.start} — {p.end}</small></div><span className={`payroll-status ${p.status.toLowerCase()}`}>{p.status}</span><div><span>Neto</span><b>{money(p.net)}</b></div><button onClick={()=>openPayrollDoc(`Nómina · ${p.label}`)}>Workspace</button></div>)}</div></section>}

    {tab==='receipts'&&<section className="payroll-card"><div className="payroll-section-head"><div><h2>Documentos de Nóminas</h2><p>Plantillas listas para generar, revisar y editar en WAE Workspace.</p></div></div><div className="payroll-doc-list">{payrollDocs.map(doc=><div key={doc}><FileText size={17}/><span>{doc}</span><button onClick={()=>openPayrollDoc(doc)}>Editar en Workspace</button></div>)}</div><div className="payroll-fiscal-note">CFDI de nómina y timbrado fiscal permanecen como integración pendiente hasta conectar SAT/PAC y certificados reales.</div></section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={payrollDocs} knowledge={payrollKnowledge} suggestions={['Calcula la pre-nómina del periodo','Detecta incidencias que impactan el pago','Prepara recibos y resumen para aprobación']} onOpenWorkspace={onOpenWorkspace}/>} 

    {incidentOpen&&<div className="payroll-modal-backdrop" onMouseDown={()=>setIncidentOpen(false)}><div className="payroll-modal" onMouseDown={e=>e.stopPropagation()}><div className="payroll-modal-head"><b>Registrar incidencia</b><button onClick={()=>setIncidentOpen(false)}><X size={17}/></button></div><label><span>Empleado</span><select value={incidentEmployee} onChange={e=>setIncidentEmployee(e.target.value)}>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label><span>Tipo</span><select value={incidentType} onChange={e=>setIncidentType(e.target.value as Incident['type'])}>{['Falta','Bono','Comisión','Horas extra','Incapacidad','Permiso'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Importe / impacto</span><input type="number" value={incidentAmount} onChange={e=>setIncidentAmount(Number(e.target.value))}/></label><label><span>Descripción</span><textarea value={incidentDescription} onChange={e=>setIncidentDescription(e.target.value)} placeholder="Motivo, autorización o evidencia..."/></label><div className="payroll-modal-actions"><button onClick={()=>setIncidentOpen(false)}>Cancelar</button><button className="primary-payroll" onClick={registerIncident}>Registrar</button></div></div></div>}
  </div>
}

function PayrollKpi({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="payroll-kpi"><span>{icon}</span><div><small>{label}</small><b>{value}</b></div></div>}
