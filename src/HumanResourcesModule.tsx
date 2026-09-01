import { useMemo, useState } from 'react'
import {
  BriefcaseBusiness, Building2, CalendarDays, ChevronLeft, Edit3, FileText, GitBranch,
  Mail, Phone, Plus, Search, Sparkles, Trash2, UserRoundPlus, UsersRound, WalletCards, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './human-resources.css'

type HrTab='employees'|'incidents'|'org'|'agent'
type EmployeeStatus='Activo'|'Permiso'|'Baja'
type ContractType='permanent'|'temporary'|'trial'|'internship'|'contractor'
type Employee={
  id:string;name:string;email:string;phone:string;department:string;role:string;manager:string;
  monthly:number;bonus:number;commission:number;contract:ContractType;schedule:string;status:EmployeeStatus;
  vacationDays:number;startDate:string
}
type Incident={id:string;employeeId:string;type:string;days:number;amount:number;date:string;description:string}

type EmployeeDraft=Omit<Employee,'id'>

const seedEmployees:Employee[]=[
  {id:'fp',name:'Fernando Peña',email:'fernando@aurora.test',phone:'33 1000 1001',department:'Tecnología',role:'Analista Datos',manager:'NEXUS',monthly:6400,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'rd',name:'Ricardo Domínguez',email:'ricardo@aurora.test',phone:'33 1000 1002',department:'Operaciones',role:'Soporte N2',manager:'ORBIT',monthly:4800,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'lr',name:'Luis Ramírez',email:'luis@aurora.test',phone:'33 1000 1003',department:'Legal',role:'Abogado Senior',manager:'JUSTITIA',monthly:7200,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'mr',name:'María Robles',email:'maria@aurora.test',phone:'33 1000 1004',department:'Finanzas',role:'Dir. Finanzas',manager:'CEO',monthly:10400,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'jg',name:'Jorge González',email:'jorge@aurora.test',phone:'33 1000 1005',department:'Contabilidad',role:'Contador',manager:'LEDGER',monthly:8500,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'sa',name:'Sofía Andrade',email:'sofia@aurora.test',phone:'33 1000 1006',department:'Compras',role:'Compras',manager:'PROCURE',monthly:9600,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'dc',name:'Diego Cruz',email:'diego@aurora.test',phone:'33 1000 1007',department:'Tecnología',role:'Ingeniero',manager:'NEXUS',monthly:9300,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'cm',name:'Carolina Mata',email:'carolina@aurora.test',phone:'33 1000 1008',department:'Ventas',role:'Ejecutiva Ventas',manager:'CLOSER',monthly:5200,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'pn',name:'Patricia Nava',email:'patricia@aurora.test',phone:'33 1000 1009',department:'Marketing',role:'Dir. Marketing',manager:'PULSE',monthly:8200,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
  {id:'af',name:'Andrea Flores',email:'andrea@aurora.test',phone:'33 1000 1010',department:'Operaciones',role:'Gerente Proyectos',manager:'ORBIT',monthly:9800,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:0,startDate:'14 mar 2024'},
]

const blankEmployee:EmployeeDraft={name:'',email:'',phone:'',department:'Tecnología',role:'',manager:'',monthly:0,bonus:0,commission:0,contract:'permanent',schedule:'Tiempo completo',status:'Activo',vacationDays:12,startDate:new Date().toLocaleDateString('es-MX')}

const talentDocs=['Manual de Organización','Política de RRHH','Procedimientos de Reclutamiento','Escala Salarial','Plan de Carrera','Evaluación 360°','Encuesta de Clima','Reglamento Interior','Manual de Integración','Política de Compensación']
const talentKnowledge=['LFT · Ley Federal del Trabajo','ISO 30414 · Human Capital Reporting','SHRM Body of Knowledge','Modelo de competencias Hay Group','Gallup Q12','Ley de Igualdad Salarial']
const talentSuggestions=['Analiza la salud del equipo','¿Qué perfiles necesitamos contratar?','Propón un plan de retención de talento']

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)
const initials=(name:string)=>name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()

export default function HumanResourcesModule({department,onBackCEO,onOpenPayroll,onOpenWorkspace}:{department:Department;onBackCEO:()=>void;onOpenPayroll:()=>void;onOpenWorkspace:(title:string,body?:string)=>void}){
  const [tab,setTab]=useState<HrTab>('employees')
  const [employees,setEmployees]=useState(seedEmployees)
  const [incidents,setIncidents]=useState<Incident[]>([])
  const [search,setSearch]=useState('')
  const [employeeModal,setEmployeeModal]=useState<{mode:'new'|'edit';draft:EmployeeDraft;id?:string}|null>(null)
  const [incidentOpen,setIncidentOpen]=useState(false)
  const [incidentEmployee,setIncidentEmployee]=useState(seedEmployees[0].id)
  const [incidentType,setIncidentType]=useState('Falta')
  const [incidentDays,setIncidentDays]=useState(1)
  const [incidentAmount,setIncidentAmount]=useState(0)
  const [incidentDescription,setIncidentDescription]=useState('')

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return !q?employees:employees.filter(e=>[e.name,e.role,e.department,e.email].some(v=>v.toLowerCase().includes(q)))},[employees,search])
  const active=employees.filter(e=>e.status==='Activo').length
  const inactive=employees.length-active
  const monthly=employees.filter(e=>e.status==='Activo').reduce((s,e)=>s+e.monthly,0)

  const saveEmployee=()=>{
    if(!employeeModal||!employeeModal.draft.name.trim()||!employeeModal.draft.role.trim())return
    if(employeeModal.mode==='new')setEmployees(v=>[...v,{...employeeModal.draft,id:`emp-${Date.now()}`}])
    else if(employeeModal.id)setEmployees(v=>v.map(e=>e.id===employeeModal.id?{...e,...employeeModal.draft}:e))
    setEmployeeModal(null)
  }
  const deleteEmployee=(id:string)=>{if(window.confirm('¿Dar de baja este registro de Recursos Humanos?'))setEmployees(v=>v.filter(e=>e.id!==id))}
  const registerIncident=()=>{
    setIncidents(v=>[{id:`inc-${Date.now()}`,employeeId:incidentEmployee,type:incidentType,days:Math.max(0,incidentDays),amount:Number(incidentAmount)||0,date:new Date().toLocaleDateString('es-MX'),description:incidentDescription||'Sin descripción'},...v])
    setIncidentOpen(false);setIncidentDays(1);setIncidentAmount(0);setIncidentDescription('')
  }

  return <div className="hr-module">
    <button className="hr-back" onClick={onBackCEO}><ChevronLeft size={15}/> CEO Chat</button>
    <header className="hr-heading">
      <span className="hr-icon"><UsersRound size={24}/></span>
      <div><h1>Recursos Humanos</h1><p>Expedientes, incidencias, contratos, desempeño y organigrama</p></div>
      <button className="hr-payroll-link" onClick={onOpenPayroll}><WalletCards size={15}/>Nóminas AI</button>
    </header>

    <nav className="hr-tabs">
      <button className={tab==='employees'?'active':''} onClick={()=>setTab('employees')}><UsersRound size={15}/>Empleados</button>
      <button className={tab==='incidents'?'active':''} onClick={()=>setTab('incidents')}><CalendarDays size={15}/>Incidencias</button>
      <button className={tab==='org'?'active':''} onClick={()=>setTab('org')}><GitBranch size={15}/>Organigrama</button>
      <button className={tab==='agent'?'active':''} onClick={()=>setTab('agent')}><Sparkles size={15}/>TALENT AI</button>
    </nav>

    {tab!=='agent'&&<div className="hr-kpis">
      <HrKpi label="Empleados" value={String(employees.length)}/><HrKpi label="Activos" value={String(active)}/><HrKpi label="De baja / permiso" value={String(inactive)}/><HrKpi label="Nómina mensual" value={money(monthly)}/>
    </div>}

    {tab==='employees'&&<section className="hr-section">
      <div className="hr-section-head"><div><h2>Empleados ({employees.length})</h2></div><button className="hr-primary" onClick={()=>setEmployeeModal({mode:'new',draft:{...blankEmployee}})}><Plus size={15}/>Nuevo empleado</button></div>
      <label className="hr-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empleado, puesto, departamento..."/></label>
      <div className="hr-employee-list">{filtered.map(e=><article className="hr-employee-card" key={e.id}>
        <div className="hr-employee-top"><span>{initials(e.name)}</span><div><b>{e.name}</b><small>{e.role}</small></div><i className={`status-${e.status.toLowerCase()}`}>{e.status}</i><div className="hr-row-actions"><button onClick={()=>setEmployeeModal({mode:'edit',id:e.id,draft:{...e}})}><Edit3 size={14}/></button><button onClick={()=>deleteEmployee(e.id)}><Trash2 size={14}/></button></div></div>
        <dl><div><dt>{e.department}</dt><dd>{money(e.monthly)}</dd></div><div><dt>Contrato</dt><dd>{e.contract}</dd></div><div><dt>Vacaciones</dt><dd>{e.vacationDays} días</dd></div><div><dt>Ingreso: {e.startDate}</dt><dd>{e.manager}</dd></div></dl>
      </article>)}</div>
    </section>}

    {tab==='incidents'&&<section className="hr-section">
      <div className="hr-section-head"><div><h2>Incidencias ({incidents.length})</h2></div><button className="hr-primary" onClick={()=>setIncidentOpen(true)}><Plus size={15}/>Registrar incidencia</button></div>
      {incidents.length===0?<div className="hr-empty">Sin incidencias registradas</div>:<div className="hr-incident-list">{incidents.map(i=>{const e=employees.find(x=>x.id===i.employeeId);return <article key={i.id}><span>{i.type}</span><div><b>{e?.name??'Empleado'}</b><small>{i.date} · {i.days} día(s) · {i.description}</small></div><strong>{i.amount?money(i.amount):'—'}</strong></article>})}</div>}
    </section>}

    {tab==='org'&&<section className="hr-section">
      <div className="hr-section-head"><div><h2>Organigrama</h2><p>Estructura ejecutiva y líneas de reporte.</p></div><button className="hr-secondary" onClick={()=>onOpenWorkspace('Organigrama corporativo',`# Organigrama corporativo\n\n## Dirección General\n- CEO / AURORA\n\n## Finanzas\n- STERLING\n\n## Recursos Humanos\n- TALENT\n\n## Operaciones\n- ORBIT\n\n## Tecnología\n- NEXUS\n\n## Legal\n- JUSTITIA\n`)}><FileText size={14}/>Editar en Workspace</button></div>
      <div className="hr-org"><div className="org-ceo"><Building2 size={18}/><b>Dirección General</b><span>CEO · AURORA</span></div><div className="org-line"/><div className="org-grid">{['Finanzas · STERLING','RR. HH. · TALENT','Operaciones · ORBIT','Tecnología · NEXUS','Legal · JUSTITIA','Marketing · PULSE'].map(x=><div key={x}><BriefcaseBusiness size={15}/><b>{x.split(' · ')[0]}</b><span>{x.split(' · ')[1]}</span></div>)}</div></div>
    </section>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={talentDocs} knowledge={talentKnowledge} suggestions={talentSuggestions} onOpenWorkspace={onOpenWorkspace}/>} 

    {employeeModal&&<div className="hr-modal-backdrop" onMouseDown={()=>setEmployeeModal(null)}><div className="hr-modal employee-form" onMouseDown={e=>e.stopPropagation()}>
      <div className="hr-modal-head"><div><UserRoundPlus size={17}/><b>{employeeModal.mode==='new'?'Nuevo empleado':'Editar empleado'}</b></div><button onClick={()=>setEmployeeModal(null)}><X size={17}/></button></div>
      <div className="hr-form-grid">
        <HrInput label="Nombre" value={employeeModal.draft.name} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,name:v}})}/>
        <HrInput label="Email" value={employeeModal.draft.email} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,email:v}})}/>
        <HrInput label="Teléfono" value={employeeModal.draft.phone} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,phone:v}})}/>
        <HrInput label="Departamento" value={employeeModal.draft.department} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,department:v}})}/>
        <HrInput label="Puesto" value={employeeModal.draft.role} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,role:v}})}/>
        <HrInput label="Jefe directo" value={employeeModal.draft.manager} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,manager:v}})}/>
        <HrNumber label="Salario" value={employeeModal.draft.monthly} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,monthly:v}})}/>
        <HrNumber label="Bonos" value={employeeModal.draft.bonus} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,bonus:v}})}/>
        <HrNumber label="Comisiones" value={employeeModal.draft.commission} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,commission:v}})}/>
        <label className="hr-field"><span>Contrato</span><select value={employeeModal.draft.contract} onChange={e=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,contract:e.target.value as ContractType}})}><option value="permanent">permanent</option><option value="temporary">temporary</option><option value="trial">trial</option><option value="internship">internship</option><option value="contractor">contractor</option></select></label>
        <HrInput label="Horario" value={employeeModal.draft.schedule} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,schedule:v}})}/>
        <label className="hr-field"><span>Estado</span><select value={employeeModal.draft.status} onChange={e=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,status:e.target.value as EmployeeStatus}})}><option>Activo</option><option>Permiso</option><option>Baja</option></select></label>
        <HrNumber label="Vacaciones" value={employeeModal.draft.vacationDays} onChange={v=>setEmployeeModal({...employeeModal,draft:{...employeeModal.draft,vacationDays:v}})}/>
      </div>
      <div className="hr-modal-actions"><button onClick={()=>setEmployeeModal(null)}>Cancelar</button><button className="hr-primary" onClick={saveEmployee}>Guardar empleado</button></div>
    </div></div>}

    {incidentOpen&&<div className="hr-modal-backdrop" onMouseDown={()=>setIncidentOpen(false)}><div className="hr-modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="hr-modal-head"><div><CalendarDays size={17}/><b>Registrar incidencia</b></div><button onClick={()=>setIncidentOpen(false)}><X size={17}/></button></div>
      <label className="hr-field"><span>Seleccionar empleado *</span><select value={incidentEmployee} onChange={e=>setIncidentEmployee(e.target.value)}>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
      <label className="hr-field"><span>Tipo</span><select value={incidentType} onChange={e=>setIncidentType(e.target.value)}>{['Falta','Permiso','Vacaciones','Incapacidad','Bono','Comisión','Horas extra'].map(x=><option key={x}>{x}</option>)}</select></label>
      <HrNumber label="Días" value={incidentDays} onChange={setIncidentDays}/><HrNumber label="Importe / impacto" value={incidentAmount} onChange={setIncidentAmount}/>
      <label className="hr-field"><span>Descripción</span><textarea value={incidentDescription} onChange={e=>setIncidentDescription(e.target.value)} placeholder="Descripción"/></label>
      <div className="hr-modal-actions"><button onClick={()=>setIncidentOpen(false)}>Cancelar</button><button className="hr-primary" onClick={registerIncident}>Registrar</button></div>
    </div></div>}
  </div>
}

function HrKpi({label,value}:{label:string;value:string}){return <div className="hr-kpi"><span>{label}</span><b>{value}</b></div>}
function HrInput({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="hr-field"><span>{label}</span><input value={value} onChange={e=>onChange(e.target.value)}/></label>}
function HrNumber({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){return <label className="hr-field"><span>{label}</span><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
