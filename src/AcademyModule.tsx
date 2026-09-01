import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, Award, BadgeCheck, BookOpenCheck, Bot, CheckCircle2, Clock3,
  FileText, Gauge, GraduationCap, Layers3, Plus, Route, Search, ShieldCheck,
  Sparkles, Target, TrendingUp, UsersRound,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './academy-premium.css'

type Tab='command'|'skills'|'paths'|'courses'|'assessments'|'certifications'|'compliance'|'simulations'|'documents'|'agent'
type Level=1|2|3|4|5
type Priority='Baja'|'Media'|'Alta'|'Crítica'
type CourseStatus='Borrador'|'Activo'|'Retirado'
type LearningStatus='No asignado'|'Asignado'|'En curso'|'Evaluado'|'Certificado'
type CertificationStatus='Vigente'|'Por vencer'|'Vencida'|'En progreso'

type Skill={id:string;name:string;domain:string;owner:string;criticality:Priority;target:Level;avg:Level;coverage:number}
type EmployeeSkill={employee:string;role:string;department:string;skillId:string;level:Level;target:Level;lastAssessment:string;confidence:number}
type LearningPath={id:string;name:string;role:string;owner:string;skills:string[];courses:string[];duration:number;assigned:number;completion:number;status:'Activa'|'Borrador'}
type Course={id:string;title:string;domain:string;modality:'Microlearning'|'Curso'|'Workshop'|'Simulación';duration:number;owner:string;status:CourseStatus;completion:number;passRate:number;version:string}
type Assessment={id:string;title:string;skill:string;employees:number;passRate:number;avgScore:number;lastRun:string;status:'Disponible'|'Programada'|'Cerrada'}
type Certification={id:string;employee:string;name:string;issuer:string;expires:string;status:CertificationStatus;evidence:string}
type ComplianceTraining={id:string;name:string;audience:string;coverage:number;deadline:string;owner:string;risk:Priority;status:'En curso'|'Completo'|'Vencido'}
type Simulation={id:string;name:string;scenario:string;audience:string;participants:number;score:number;lastRun:string;nextRun:string;status:'Programada'|'Ejecutada'}
type Enrollment={employee:string;pathId:string;status:LearningStatus;progress:number;assessmentScore:number}

const pct=(v:number)=>`${Math.round(v)}%`

const skills:Skill[]=[
  {id:'SK-001',name:'Operación de WAE OS',domain:'Producto',owner:'ACADEMY + NEXUS',criticality:'Alta',target:4,avg:3,coverage:72},
  {id:'SK-002',name:'Seguridad de la información',domain:'Seguridad',owner:'SENTINEL',criticality:'Crítica',target:4,avg:3,coverage:68},
  {id:'SK-003',name:'Interpretación financiera',domain:'Finanzas',owner:'STERLING',criticality:'Alta',target:3,avg:2,coverage:61},
  {id:'SK-004',name:'Gestión de clientes Enterprise',domain:'Comercial',owner:'CLOSER + CARE',criticality:'Alta',target:4,avg:3,coverage:74},
  {id:'SK-005',name:'Cumplimiento y evidencia',domain:'Compliance',owner:'NORM + ARCHIVE',criticality:'Crítica',target:4,avg:2,coverage:55},
  {id:'SK-006',name:'Gestión de proyectos',domain:'PMO',owner:'PMO',criticality:'Media',target:3,avg:3,coverage:81},
]

const employeeSkills:EmployeeSkill[]=[
  {employee:'Fernando Peña',role:'Analista Datos',department:'Tecnología',skillId:'SK-001',level:4,target:4,lastAssessment:'28 ago 2026',confidence:91},
  {employee:'Fernando Peña',role:'Analista Datos',department:'Tecnología',skillId:'SK-002',level:3,target:4,lastAssessment:'27 ago 2026',confidence:84},
  {employee:'Ricardo Domínguez',role:'Soporte N2',department:'Operaciones',skillId:'SK-001',level:3,target:4,lastAssessment:'29 ago 2026',confidence:86},
  {employee:'Ricardo Domínguez',role:'Soporte N2',department:'Operaciones',skillId:'SK-002',level:2,target:4,lastAssessment:'29 ago 2026',confidence:79},
  {employee:'Luis Ramírez',role:'Abogado Senior',department:'Legal',skillId:'SK-005',level:4,target:4,lastAssessment:'25 ago 2026',confidence:93},
  {employee:'Carolina Mata',role:'Ejecutiva Ventas',department:'Ventas',skillId:'SK-004',level:4,target:4,lastAssessment:'31 ago 2026',confidence:90},
  {employee:'Carolina Mata',role:'Ejecutiva Ventas',department:'Ventas',skillId:'SK-003',level:2,target:3,lastAssessment:'26 ago 2026',confidence:80},
  {employee:'Andrea Flores',role:'Gerente Proyectos',department:'Operaciones',skillId:'SK-006',level:4,target:3,lastAssessment:'30 ago 2026',confidence:92},
  {employee:'Patricia Nava',role:'Dir. Marketing',department:'Marketing',skillId:'SK-004',level:3,target:4,lastAssessment:'30 ago 2026',confidence:82},
  {employee:'Jorge González',role:'Contador',department:'Contabilidad',skillId:'SK-003',level:4,target:3,lastAssessment:'31 ago 2026',confidence:94},
]

const seedPaths:LearningPath[]=[
  {id:'LP-001',name:'WAE OS Power User',role:'Usuarios clave',owner:'ACADEMY + NEXUS',skills:['SK-001','SK-005'],courses:['CRS-001','CRS-004'],duration:12,assigned:18,completion:72,status:'Activa'},
  {id:'LP-002',name:'Enterprise Customer Leader',role:'Ventas / CARE',owner:'ACADEMY + CLOSER',skills:['SK-004','SK-003'],courses:['CRS-002','CRS-005'],duration:10,assigned:8,completion:63,status:'Activa'},
  {id:'LP-003',name:'Secure Operator',role:'Operaciones / Tecnología',owner:'ACADEMY + SENTINEL',skills:['SK-002','SK-005'],courses:['CRS-003','CRS-004'],duration:8,assigned:12,completion:58,status:'Activa'},
  {id:'LP-004',name:'Manager Financial Fluency',role:'Managers',owner:'ACADEMY + STERLING',skills:['SK-003','SK-006'],courses:['CRS-005','CRS-006'],duration:9,assigned:6,completion:41,status:'Activa'},
]

const seedCourses:Course[]=[
  {id:'CRS-001',title:'WAE OS · Operación ejecutiva',domain:'Producto',modality:'Curso',duration:180,owner:'NEXUS',status:'Activo',completion:78,passRate:91,version:'v3.2'},
  {id:'CRS-002',title:'Customer 360 & Revenue Handoff',domain:'Comercial',modality:'Workshop',duration:120,owner:'CLOSER + CARE',status:'Activo',completion:71,passRate:88,version:'v2.1'},
  {id:'CRS-003',title:'Security Essentials',domain:'Seguridad',modality:'Microlearning',duration:45,owner:'SENTINEL',status:'Activo',completion:82,passRate:93,version:'v4.0'},
  {id:'CRS-004',title:'Evidence & Compliance by Design',domain:'Compliance',modality:'Simulación',duration:90,owner:'NORM + ARCHIVE',status:'Activo',completion:54,passRate:76,version:'v1.4'},
  {id:'CRS-005',title:'Financial Fluency for Managers',domain:'Finanzas',modality:'Curso',duration:150,owner:'STERLING',status:'Activo',completion:48,passRate:81,version:'v2.0'},
  {id:'CRS-006',title:'Critical Path Decision Making',domain:'PMO',modality:'Workshop',duration:105,owner:'PMO',status:'Activo',completion:67,passRate:86,version:'v1.7'},
]

const assessments:Assessment[]=[
  {id:'ASM-01',title:'WAE OS Operator Check',skill:'Operación de WAE OS',employees:14,passRate:86,avgScore:88,lastRun:'31 ago 2026',status:'Disponible'},
  {id:'ASM-02',title:'Security Decision Drill',skill:'Seguridad de la información',employees:10,passRate:70,avgScore:78,lastRun:'29 ago 2026',status:'Disponible'},
  {id:'ASM-03',title:'Evidence Handling Assessment',skill:'Cumplimiento y evidencia',employees:9,passRate:67,avgScore:74,lastRun:'28 ago 2026',status:'Programada'},
  {id:'ASM-04',title:'Commercial Discovery Assessment',skill:'Gestión de clientes Enterprise',employees:7,passRate:86,avgScore:89,lastRun:'30 ago 2026',status:'Disponible'},
]

const seedCertifications:Certification[]=[
  {id:'CERT-101',employee:'Fernando Peña',name:'WAE OS Power User',issuer:'ACADEMY',expires:'31 ago 2027',status:'Vigente',evidence:'EV-ACD-101'},
  {id:'CERT-102',employee:'Carolina Mata',name:'Enterprise Customer Leader',issuer:'ACADEMY',expires:'15 sep 2027',status:'Vigente',evidence:'EV-ACD-102'},
  {id:'CERT-103',employee:'Ricardo Domínguez',name:'Secure Operator',issuer:'ACADEMY + SENTINEL',expires:'18 sep 2026',status:'Por vencer',evidence:'EV-ACD-103'},
  {id:'CERT-104',employee:'Patricia Nava',name:'Data Handling Essentials',issuer:'ACADEMY + NORM',expires:'08 sep 2026',status:'Por vencer',evidence:'EV-ACD-104'},
  {id:'CERT-105',employee:'Andrea Flores',name:'Project Governance',issuer:'ACADEMY + PMO',expires:'21 jul 2027',status:'Vigente',evidence:'EV-ACD-105'},
]

const complianceTraining:ComplianceTraining[]=[
  {id:'CMP-01',name:'Seguridad y phishing',audience:'Todo el personal',coverage:90,deadline:'10 sep 2026',owner:'SENTINEL',risk:'Crítica',status:'En curso'},
  {id:'CMP-02',name:'Privacidad y manejo de datos',audience:'Operaciones / Comercial',coverage:78,deadline:'12 sep 2026',owner:'NORM + JUSTITIA',risk:'Alta',status:'En curso'},
  {id:'CMP-03',name:'Código de conducta',audience:'Todo el personal',coverage:100,deadline:'31 ago 2026',owner:'TALENT + NORM',risk:'Media',status:'Completo'},
  {id:'CMP-04',name:'Evidencia y documentación',audience:'Managers / áreas de control',coverage:64,deadline:'09 sep 2026',owner:'ARCHIVE + NORM',risk:'Alta',status:'En curso'},
]

const simulations:Simulation[]=[
  {id:'SIM-01',name:'Executive Cyber Incident',scenario:'Phishing + acceso privilegiado comprometido',audience:'SENTINEL / NEXUS / AURORA',participants:6,score:82,lastRun:'22 ago 2026',nextRun:'19 sep 2026',status:'Ejecutada'},
  {id:'SIM-02',name:'Customer Escalation War Room',scenario:'Cuenta Enterprise con SLA en riesgo',audience:'CARE / CLOSER / NEXUS',participants:7,score:76,lastRun:'26 ago 2026',nextRun:'16 sep 2026',status:'Ejecutada'},
  {id:'SIM-03',name:'Close Integrity Drill',scenario:'Diferencia contable antes de cierre',audience:'LEDGER / STERLING',participants:5,score:0,lastRun:'—',nextRun:'08 sep 2026',status:'Programada'},
]

const seedEnrollments:Enrollment[]=[
  {employee:'Fernando Peña',pathId:'LP-001',status:'Certificado',progress:100,assessmentScore:92},
  {employee:'Ricardo Domínguez',pathId:'LP-003',status:'En curso',progress:64,assessmentScore:78},
  {employee:'Carolina Mata',pathId:'LP-002',status:'Evaluado',progress:100,assessmentScore:89},
  {employee:'Patricia Nava',pathId:'LP-002',status:'En curso',progress:58,assessmentScore:0},
  {employee:'Andrea Flores',pathId:'LP-004',status:'En curso',progress:48,assessmentScore:0},
]

const documents=[
  'Learning Strategy','Skills Matrix','Role Competency Profile','Individual Development Plan','Adaptive Learning Path',
  'Course Design Brief','Assessment Blueprint','Certification Record','Compliance Training Report','Skills Gap Analysis',
  'Training Effectiveness Review','Simulation After Action Review','Leadership Development Plan','Capability Risk Report','Learning QBR',
]
const knowledge=[
  'Matriz de roles y competencias TALENT','Rutas de aprendizaje y evidencia ACADEMY','Políticas y entrenamiento obligatorio NORM / SENTINEL',
  'Procesos y capacidades NEXUS / PMO / CARE / CLOSER','Histórico de evaluaciones autorizado','Certificaciones y fechas de vigencia',
  'Reglas de proficiency, confidence y evidencia','Necesidades de capacidad derivadas de PMO y Operaciones',
]
const suggestions=[
  '¿Qué skills gaps representan mayor riesgo hoy?','Diseña rutas adaptativas por rol y evidencia disponible',
  '¿Qué certificaciones o entrenamientos vencen primero?','Prioriza capacitación por impacto operativo, riesgo y capacidad',
]

function riskTone(priority:Priority){return priority==='Crítica'?'risk':priority==='Alta'?'warn':'good'}
function levelText(level:Level){return ['','Inicial','Básico','Operativo','Avanzado','Experto'][level]}

export default function AcademyModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [paths,setPaths]=useState(seedPaths)
  const [courses,setCourses]=useState(seedCourses)
  const [certifications,setCertifications]=useState(seedCertifications)
  const [enrollments,setEnrollments]=useState(seedEnrollments)
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',domain:'Producto',modality:'Curso' as Course['modality'],duration:60,owner:'ACADEMY'})

  const avgCoverage=Math.round(skills.reduce((s,x)=>s+x.coverage,0)/skills.length)
  const criticalGaps=employeeSkills.filter(x=>x.target-x.level>=2).length
  const expiring=certifications.filter(c=>c.status==='Por vencer'||c.status==='Vencida').length
  const complianceCoverage=Math.round(complianceTraining.reduce((s,x)=>s+x.coverage,0)/complianceTraining.length)
  const activeLearners=enrollments.filter(e=>e.status==='Asignado'||e.status==='En curso'||e.status==='Evaluado').length
  const avgPass=Math.round(courses.filter(c=>c.status==='Activo').reduce((s,c)=>s+c.passRate,0)/courses.filter(c=>c.status==='Activo').length)
  const capabilityHealth=Math.max(0,Math.min(100,Math.round(avgCoverage-criticalGaps*2-expiring*2+(complianceCoverage-70)*.25)))

  const skillGaps=useMemo(()=>employeeSkills.filter(es=>es.level<es.target).map(es=>{
    const skill=skills.find(s=>s.id===es.skillId)!
    return {...es,skill:skill.name,criticality:skill.criticality,gap:es.target-es.level}
  }).sort((a,b)=>b.gap-a.gap||(['Baja','Media','Alta','Crítica'].indexOf(b.criticality)-['Baja','Media','Alta','Crítica'].indexOf(a.criticality))),[])

  const filteredCourses=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return courses
    return courses.filter(c=>[c.id,c.title,c.domain,c.modality,c.owner,c.status].some(v=>String(v).toLowerCase().includes(q)))
  },[courses,query])

  const actions=useMemo(()=>{
    const list:{title:string;reason:string;tone:'good'|'warn'|'risk'}[]=[]
    const gap=skillGaps[0]
    if(gap)list.push({title:`Cerrar gap crítico · ${gap.employee}`,reason:`${gap.skill}: nivel ${gap.level}/${gap.target}; criticidad ${gap.criticality.toLowerCase()} y confidence ${gap.confidence}/100.`,tone:riskTone(gap.criticality)})
    const exp=certifications.find(c=>c.status==='Por vencer')
    if(exp)list.push({title:`Recertificar · ${exp.employee}`,reason:`${exp.name} vence ${exp.expires}; mantener evidencia vigente antes de depender de esa capacidad.`,tone:'warn'})
    const cmp=[...complianceTraining].sort((a,b)=>a.coverage-b.coverage)[0]
    if(cmp)list.push({title:`Elevar cobertura · ${cmp.name}`,reason:`Cobertura ${pct(cmp.coverage)} con riesgo ${cmp.risk.toLowerCase()}; priorizar audiencia pendiente.`,tone:riskTone(cmp.risk)})
    list.push({title:'Validar transferencia al puesto',reason:'No confundir finalización de curso con competencia. Usar evaluación, evidencia y observación operacional antes de certificar.',tone:'good'})
    return list
  },[skillGaps,certifications])

  const createCourse=()=>{
    if(!draft.title.trim()||draft.duration<=0)return
    const id=`CRS-${String(courses.length+1).padStart(3,'0')}`
    const next:Course={id,title:draft.title.trim(),domain:draft.domain,modality:draft.modality,duration:Number(draft.duration),owner:draft.owner,status:'Borrador',completion:0,passRate:0,version:'v0.1'}
    setCourses(v=>[next,...v]);setOpen(false);setDraft({title:'',domain:'Producto',modality:'Curso',duration:60,owner:'ACADEMY'});setTab('courses')
  }
  const advanceCourse=(id:string)=>setCourses(v=>v.map(c=>c.id===id?{...c,status:c.status==='Borrador'?'Activo':c.status}:c))
  const advanceEnrollment=(employee:string,pathId:string)=>setEnrollments(v=>v.map(e=>{
    if(e.employee!==employee||e.pathId!==pathId)return e
    const order:LearningStatus[]=['No asignado','Asignado','En curso','Evaluado','Certificado']
    const next=order[Math.min(order.length-1,order.indexOf(e.status)+1)]
    return {...e,status:next,progress:next==='En curso'?Math.max(e.progress,50):next==='Evaluado'||next==='Certificado'?100:e.progress,assessmentScore:next==='Evaluado'&&e.assessmentScore===0?84:e.assessmentScore}
  }))
  const renewCertification=(id:string)=>setCertifications(v=>v.map(c=>c.id===id?{...c,status:'En progreso',evidence:`${c.evidence}-R`} : c))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Capacitación\n**Agente:** ACADEMY\n\n## Capability snapshot\n- Capability health demo: ${capabilityHealth}/100\n- Cobertura media de skills: ${avgCoverage}%\n- Skills gaps críticos: ${criticalGaps}\n- Cobertura compliance: ${complianceCoverage}%\n- Certificaciones por vencer/vencidas: ${expiring}\n\n## Rol / audiencia\n\n## Competencias objetivo\n\n## Gap actual y evidencia\n\n## Ruta adaptativa\n\n## Evaluación y criterio de aprobación\n\n## Transferencia al puesto\n\n## Certificación / vigencia\n\n## Riesgos y dependencias\n\n## Owner / aprobación\n\n> Documento demo. La finalización de contenido no equivale automáticamente a competencia. Validar evaluación, evidencia, vigencia y desempeño antes de certificar capacidad real.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  return <section className="academy-premium">
    <header className="academy-head">
      <div className="academy-brand"><span><GraduationCap size={25}/></span><div><small>ACADEMY · DIRECTOR DE APRENDIZAJE AI</small><h1>Enterprise Learning & Skills Intelligence</h1><p>Skills graph, rutas adaptativas, evaluación, certificación y capability risk para toda la organización.</p></div></div>
      <div className="academy-head-status"><i/>Datos demo · Evidence-based learning</div>
    </header>

    <nav className="academy-tabs">{[
      ['command','Command Center'],['skills','Skills Graph'],['paths','Rutas'],['courses','Cursos'],['assessments','Evaluaciones'],['certifications','Certificaciones'],['compliance','Compliance'],['simulations','Simulaciones'],['documents','Documentos'],['agent','ACADEMY AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="academy-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Capability health" value={`${capabilityHealth}/100`} detail={`${criticalGaps} gaps severos`} tone="violet"/>
      <Kpi icon={<Target size={18}/>} label="Skills coverage" value={`${avgCoverage}%`} detail="promedio organizacional" tone="cyan"/>
      <Kpi icon={<ShieldCheck size={18}/>} label="Compliance training" value={`${complianceCoverage}%`} detail="cobertura promedio" tone="emerald"/>
      <Kpi icon={<Award size={18}/>} label="Certificaciones" value={String(certifications.length)} detail={`${expiring} requieren atención`} tone="amber"/>
    </div>}

    {tab==='command'&&<>
      <div className="academy-grid-2">
        <article className="academy-panel hero"><div className="panel-title"><div><small>CAPABILITY CONTROL TOWER</small><h2>Organizational readiness</h2></div><Sparkles size={20}/></div>
          <div className="health-ring"><strong>{capabilityHealth}</strong><span>/100</span></div>
          <p>ACADEMY prioriza aprendizaje por skill gap, criticidad, vigencia, compliance y evidencia de transferencia al puesto.</p>
          <div className="mini-stats"><span><b>{activeLearners}</b> learners activos</span><span><b>{avgPass}%</b> pass rate</span><span><b>{simulations.filter(s=>s.status==='Programada').length}</b> simulaciones próximas</span></div>
        </article>
        <article className="academy-panel"><div className="panel-title"><div><small>NEXT BEST LEARNING ACTION</small><h2>Decision queue</h2></div><TrendingUp size={20}/></div>
          <div className="academy-actions">{actions.map(a=><div key={a.title} className={`academy-action ${a.tone}`}><b>{a.title}</b><p>{a.reason}</p></div>)}</div>
        </article>
      </div>
      <div className="academy-grid-3">
        {skills.slice(0,3).map(s=><article className="academy-panel skill-spot" key={s.id}><small>{s.domain}</small><h3>{s.name}</h3><div className="level-row"><span>Actual {s.avg}/5</span><span>Objetivo {s.target}/5</span></div><Progress value={s.coverage}/><footer><span>{pct(s.coverage)} cobertura</span><em className={riskTone(s.criticality)}>{s.criticality}</em></footer></article>)}
      </div>
    </>}

    {tab==='skills'&&<div className="academy-panel"><div className="panel-title"><div><small>SKILLS GRAPH</small><h2>Matriz de competencias</h2></div><UsersRound size={20}/></div>
      <div className="skills-grid">{skills.map(s=><div className="skill-card" key={s.id}><div><small>{s.id} · {s.domain}</small><h3>{s.name}</h3><p>{s.owner}</p></div><strong>{s.avg}/5</strong><Progress value={s.coverage}/><footer><span>{pct(s.coverage)} coverage</span><span>Target {s.target}/5</span><em className={riskTone(s.criticality)}>{s.criticality}</em></footer></div>)}</div>
      <h3 className="section-label">Skills gaps prioritizados</h3>
      <div className="academy-table-wrap"><table className="academy-table"><thead><tr><th>Persona</th><th>Rol</th><th>Skill</th><th>Nivel</th><th>Objetivo</th><th>Gap</th><th>Confidence</th><th>Riesgo</th></tr></thead><tbody>{skillGaps.map(g=><tr key={`${g.employee}-${g.skillId}`}><td><b>{g.employee}</b></td><td>{g.role}</td><td>{g.skill}</td><td>{g.level} · {levelText(g.level)}</td><td>{g.target}</td><td><strong>{g.gap}</strong></td><td>{g.confidence}/100</td><td><span className={`pill ${riskTone(g.criticality)}`}>{g.criticality}</span></td></tr>)}</tbody></table></div>
    </div>}

    {tab==='paths'&&<div className="academy-panel"><div className="panel-title"><div><small>ADAPTIVE LEARNING PATHS</small><h2>Rutas por rol y capability gap</h2></div><Route size={20}/></div>
      <div className="paths-grid">{paths.map(p=><div className="path-card" key={p.id}><small>{p.id} · {p.role}</small><h3>{p.name}</h3><p>{p.owner}</p><div className="tag-row">{p.skills.map(id=><span key={id}>{skills.find(s=>s.id===id)?.name}</span>)}</div><Progress value={p.completion}/><footer><span>{p.assigned} asignados</span><span>{p.duration}h</span><strong>{pct(p.completion)}</strong></footer></div>)}</div>
      <h3 className="section-label">Evidencia de progreso</h3>
      <div className="academy-table-wrap"><table className="academy-table"><thead><tr><th>Persona</th><th>Ruta</th><th>Estado</th><th>Progreso</th><th>Evaluación</th><th>Acción demo</th></tr></thead><tbody>{enrollments.map(e=><tr key={`${e.employee}-${e.pathId}`}><td><b>{e.employee}</b></td><td>{paths.find(p=>p.id===e.pathId)?.name}</td><td><span className="pill neutral">{e.status}</span></td><td>{pct(e.progress)}</td><td>{e.assessmentScore?`${e.assessmentScore}/100`:'Pendiente'}</td><td><button className="table-action" onClick={()=>advanceEnrollment(e.employee,e.pathId)}>Avanzar evidencia</button></td></tr>)}</tbody></table></div>
    </div>}

    {tab==='courses'&&<div className="academy-panel"><div className="panel-title"><div><small>LEARNING CATALOG</small><h2>Cursos y experiencias</h2></div><button className="academy-primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nuevo curso</button></div>
      <div className="academy-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por curso, dominio, modalidad u owner..."/></div>
      <div className="academy-table-wrap"><table className="academy-table"><thead><tr><th>Curso</th><th>Dominio</th><th>Modalidad</th><th>Duración</th><th>Completion</th><th>Pass rate</th><th>Versión</th><th>Estado</th><th></th></tr></thead><tbody>{filteredCourses.map(c=><tr key={c.id}><td><b>{c.title}</b><small>{c.id}</small></td><td>{c.domain}</td><td>{c.modality}</td><td>{c.duration} min</td><td>{pct(c.completion)}</td><td>{c.passRate?pct(c.passRate):'—'}</td><td>{c.version}</td><td><span className={`pill ${c.status==='Activo'?'good':'neutral'}`}>{c.status}</span></td><td>{c.status==='Borrador'&&<button className="table-action" onClick={()=>advanceCourse(c.id)}>Publicar demo</button>}</td></tr>)}</tbody></table></div>
    </div>}

    {tab==='assessments'&&<div className="academy-grid-2">{assessments.map(a=><article className="academy-panel assessment-card" key={a.id}><div className="panel-title"><div><small>{a.id} · {a.skill}</small><h3>{a.title}</h3></div><BadgeCheck size={20}/></div><div className="assessment-stats"><span><b>{a.employees}</b> personas</span><span><b>{pct(a.passRate)}</b> pass</span><span><b>{a.avgScore}/100</b> score</span></div><footer>{a.lastRun}<span className="pill neutral">{a.status}</span></footer></article>)}</div>}

    {tab==='certifications'&&<div className="academy-panel"><div className="panel-title"><div><small>CERTIFICATION LEDGER</small><h2>Vigencia y evidencia</h2></div><Award size={20}/></div>
      <div className="academy-table-wrap"><table className="academy-table"><thead><tr><th>Persona</th><th>Certificación</th><th>Issuer</th><th>Vence</th><th>Evidencia</th><th>Estado</th><th></th></tr></thead><tbody>{certifications.map(c=><tr key={c.id}><td><b>{c.employee}</b></td><td>{c.name}</td><td>{c.issuer}</td><td>{c.expires}</td><td>{c.evidence}</td><td><span className={`pill ${c.status==='Vigente'?'good':c.status==='Por vencer'?'warn':c.status==='Vencida'?'risk':'neutral'}`}>{c.status}</span></td><td>{(c.status==='Por vencer'||c.status==='Vencida')&&<button className="table-action" onClick={()=>renewCertification(c.id)}>Iniciar recertificación</button>}</td></tr>)}</tbody></table></div>
    </div>}

    {tab==='compliance'&&<div className="academy-grid-2">{complianceTraining.map(c=><article className="academy-panel compliance-card" key={c.id}><div className="panel-title"><div><small>{c.audience}</small><h3>{c.name}</h3></div><ShieldCheck size={20}/></div><Progress value={c.coverage}/><div className="compliance-meta"><span>{pct(c.coverage)} cobertura</span><span>Deadline {c.deadline}</span><span>{c.owner}</span></div><footer><span className={`pill ${riskTone(c.risk)}`}>{c.risk}</span><span className="pill neutral">{c.status}</span></footer></article>)}</div>}

    {tab==='simulations'&&<div className="academy-grid-2">{simulations.map(s=><article className="academy-panel simulation-card" key={s.id}><div className="panel-title"><div><small>{s.id} · {s.audience}</small><h3>{s.name}</h3></div><AlertTriangle size={20}/></div><p>{s.scenario}</p><div className="assessment-stats"><span><b>{s.participants}</b> participantes</span><span><b>{s.score||'—'}</b> score</span><span><b>{s.nextRun}</b> siguiente</span></div><footer>{s.lastRun}<span className="pill neutral">{s.status}</span></footer></article>)}</div>}

    {tab==='documents'&&<div className="academy-panel"><div className="panel-title"><div><small>LEARNING DOCUMENT STUDIO</small><h2>Documentos editables en Workspace</h2></div><FileText size={20}/></div><div className="document-grid">{documents.map(d=><button key={d} onClick={()=>openWorkspace(d)}><FileText size={18}/><span>{d}</span><small>Editar en Workspace</small></button>)}</div></div>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={openWorkspace}/>} 

    {open&&<div className="academy-modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="academy-modal" onMouseDown={e=>e.stopPropagation()}><div className="panel-title"><div><small>COURSE DESIGN INTAKE</small><h2>Nuevo curso demo</h2></div><BookOpenCheck size={20}/></div><label>Título<input value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></label><label>Dominio<input value={draft.domain} onChange={e=>setDraft(v=>({...v,domain:e.target.value}))}/></label><label>Modalidad<select value={draft.modality} onChange={e=>setDraft(v=>({...v,modality:e.target.value as Course['modality']}))}><option>Microlearning</option><option>Curso</option><option>Workshop</option><option>Simulación</option></select></label><label>Duración (min)<input type="number" value={draft.duration} onChange={e=>setDraft(v=>({...v,duration:Number(e.target.value)}))}/></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label><div className="modal-actions"><button onClick={()=>setOpen(false)}>Cancelar</button><button className="academy-primary" onClick={createCourse}>Crear borrador</button></div><p className="modal-note">El curso nace como Borrador. Publicarlo no equivale a certificar competencia; la evaluación y la evidencia siguen siendo obligatorias.</p></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <div className={`academy-kpi tone-${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></div>}
function Progress({value}:{value:number}){return <div className="academy-progress"><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
