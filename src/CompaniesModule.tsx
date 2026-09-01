import { useMemo, useState } from 'react'
import {
  BarChart3, BookOpen, Building2, FileText, Globe2, Grid3X3, Plus, Search,
  ShieldAlert, Sparkles, Workflow, X,
} from 'lucide-react'
import { industryProfiles } from './enterprise'
import './companies.css'

type Company = {
  id:string
  name:string
  legalName:string
  taxId:string
  country:string
  currency:string
  sectorIds:string[]
  branches:number
  contracts:number
  employees:number
  projects:number
  status:'Activo'|'Inactivo'
}

type SectorCard = {
  id:string
  name:string
  description:string
  subs:string[]
  tone:string
}

const sectorCatalog:SectorCard[] = [
  {id:'general',name:'General / Multi-sector',description:'Perfil genérico para organizaciones multi-sector o sin un giro específico',subs:['Genérico','Diversificado','Holding'],tone:'violet'},
  {id:'technology',name:'Tecnología',description:'Empresas de tecnología, software, IA e infraestructura digital',subs:['SaaS','Desarrollo de software','Startups','Ciberseguridad','Cloud','Telecom','IA','Hardware'],tone:'violet'},
  {id:'marketing',name:'Marketing y Medios',description:'Agencias de marketing, medios, producción audiovisual y editorial',subs:['Agencias de marketing','Publicidad','Producción audiovisual','Medios','Editorial','Contenido','Eventos'],tone:'amber'},
  {id:'engineering',name:'Ingeniería y Construcción',description:'Constructoras, estudios de arquitectura e ingeniería',subs:['Constructoras','Arquitectura','Ingeniería','Obra civil','Instalaciones'],tone:'orange'},
  {id:'legal',name:'Jurídico',description:'Despachos jurídicos, notarías y corredurías',subs:['Despachos jurídicos','Notarías','Correduría pública'],tone:'purple'},
  {id:'finance',name:'Financiero',description:'Bancos, fintech, aseguradoras y servicios financieros',subs:['Banca','Fintech','Casas de bolsa','Seguros','Crédito'],tone:'emerald'},
  {id:'health',name:'Salud',description:'Hospitales, clínicas, laboratorios y farmacias',subs:['Hospitales','Clínicas','Laboratorios','Farmacias'],tone:'red'},
  {id:'education',name:'Educación',description:'Instituciones educativas y centros de investigación',subs:['Universidades','Escuelas','Academias','Investigación'],tone:'sky'},
  {id:'commerce',name:'Comercio',description:'Comercio minorista, e-commerce, importadores y exportadores',subs:['Retail','E-commerce','Marketplace','Mayorista'],tone:'yellow'},
  {id:'industry',name:'Industria',description:'Manufactura, industria agrícola, minería, energía y petróleo',subs:['Manufactura','Automotriz','Alimentos','Química','Energía'],tone:'blue'},
  {id:'transport',name:'Transporte y Logística',description:'Logística, transporte, almacenes, courier y distribución',subs:['Logística','Transporte terrestre','Almacenes','Última milla'],tone:'cyan'},
  {id:'government',name:'Gobierno y Sector Público',description:'Gobiernos municipales, estatales y dependencias federales',subs:['Municipal','Estatal','Dependencias','Organismos'],tone:'slate'},
  {id:'nonprofit',name:'Organizaciones sin fines de lucro',description:'Organizaciones sin fines de lucro, asociaciones civiles e iglesias',subs:['Fundaciones','Asociaciones civiles','ONG','Iglesias'],tone:'rose'},
  {id:'services',name:'Servicios',description:'Consultorías, servicios profesionales, gastronomía, hospedaje y fitness',subs:['Consultoría','Servicios profesionales','Gastronomía','Hospedaje','Fitness'],tone:'teal'},
  {id:'aerospace',name:'Aeroespacial',description:'Empresas aeroespaciales, aviación y defensa',subs:['Aeroespacial','Aviación','Defensa','MRO'],tone:'sky'},
  {id:'realestate',name:'Bienes Raíces',description:'Inmobiliarias, desarrolladoras y administración de propiedades',subs:['Residencial','Comercial','Administración','Desarrollo'],tone:'indigo'},
]

const initialCompanies:Company[] = [
  {id:'nova',name:'Nova Retail',legalName:'Nova Retail Co.',taxId:'NIT 901.529',country:'Colombia',currency:'USD',sectorIds:['general'],branches:1,contracts:0,employees:4,projects:0,status:'Activo'},
  {id:'meridian',name:'Meridian Group',legalName:'Meridian Group LLC',taxId:'M-5931',country:'España',currency:'EUR',sectorIds:['general'],branches:1,contracts:0,employees:0,projects:0,status:'Activo'},
  {id:'aurora',name:'Aurora Dynamics',legalName:'Aurora Dynamics S.A. de C.V.',taxId:'AD2401AB12',country:'México',currency:'USD',sectorIds:['general'],branches:2,contracts:12,employees:10,projects:5,status:'Activo'},
]

const currencies=['USD','MXN','EUR','COP','ARS','PEN','CLP','BRL']
const uniq=(items:string[])=>[...new Set(items)]

function profileFor(company:Company){
  if(company.sectorIds.includes('general') || company.sectorIds.length===0){
    return {
      kpis:['Ingresos','EBITDA','Margen neto','Headcount','Cash runway'],
      processes:['Planeación estratégica','Gestión presupuestal','Cierre contable','Auditoría interna'],
      docs:['Plan estratégico','Manual de organización','Políticas corporativas','Reporte anual'],
      knowledge:['ISO 9001','ISO 31000','COSO ERM','Balanced Scorecard','OKR Framework'],
      risks:['Riesgo financiero','Riesgo operativo','Riesgo de cumplimiento','Riesgo estratégico'],
      regulations:['Código de Comercio','Ley General de Sociedades','ISO 37000'],
      terminology:['KPI','OKR','EBITDA','ROI','Capex','Opex'],
      subs:['Genérico','Diversificado','Holding'],
      adaptation:'Operas en un contexto empresarial general. Aplica frameworks estándar de gestión empresarial sin especialización sectorial específica.',
    }
  }
  const selected=industryProfiles.filter(p=>company.sectorIds.includes(p.id))
  return {
    kpis:uniq(selected.flatMap(p=>p.kpis)).slice(0,8),
    processes:uniq(selected.flatMap(p=>p.processes)).slice(0,8),
    docs:uniq(selected.flatMap(p=>p.documentTypes)).slice(0,8),
    knowledge:uniq(selected.flatMap(p=>p.regulations)).slice(0,8),
    risks:uniq(selected.flatMap(p=>p.risks)).slice(0,8),
    regulations:uniq(selected.flatMap(p=>p.regulations)).slice(0,8),
    terminology:uniq(selected.flatMap(p=>p.terminology)).slice(0,10),
    subs:uniq(selected.flatMap(p=>p.subSectors)).slice(0,10),
    adaptation:`Los agentes IA se especializan automáticamente en ${selected.map(p=>p.name).join(' + ')}: priorizan sus KPIs, procesos, riesgos, normativa, documentos y terminología antes de responder o ejecutar acciones.`,
  }
}

export default function CompaniesModule(){
  const [companies,setCompanies]=useState(initialCompanies)
  const [selectedId,setSelectedId]=useState('aurora')
  const [newOpen,setNewOpen]=useState(false)
  const [sectorSearch,setSectorSearch]=useState('')
  const [draft,setDraft]=useState({name:'',legalName:'',taxId:'',country:'',currency:'USD',sectorIds:[] as string[]})
  const selected=companies.find(c=>c.id===selectedId)??companies[0]
  const profile=profileFor(selected)
  const totalBranches=companies.reduce((s,c)=>s+c.branches,0)
  const totalEmployees=companies.reduce((s,c)=>s+c.employees,0)
  const sectorCount=uniq(companies.flatMap(c=>c.sectorIds)).length
  const filteredSectors=useMemo(()=>{
    const q=sectorSearch.trim().toLowerCase()
    if(!q)return sectorCatalog
    return sectorCatalog.filter(s=>[s.name,s.description,...s.subs].some(v=>v.toLowerCase().includes(q)))
  },[sectorSearch])

  const toggleSector=(id:string)=>setDraft(v=>{
    const next=v.sectorIds.includes(id)?v.sectorIds.filter(x=>x!==id):[...v.sectorIds,id]
    return {...v,sectorIds:next}
  })

  const createCompany=()=>{
    if(!draft.name.trim())return
    const sectorIds=draft.sectorIds.length?draft.sectorIds:['general']
    const company:Company={
      id:`company-${Date.now()}`,name:draft.name.trim(),legalName:draft.legalName.trim()||draft.name.trim(),taxId:draft.taxId.trim()||'—',
      country:draft.country.trim()||'Sin país',currency:draft.currency,sectorIds,branches:1,contracts:0,employees:0,projects:0,status:'Activo',
    }
    setCompanies(v=>[...v,company]);setSelectedId(company.id);setNewOpen(false);setSectorSearch('');
    setDraft({name:'',legalName:'',taxId:'',country:'',currency:'USD',sectorIds:[]})
  }

  return <section className="companies-module">
    <header className="companies-heading">
      <span className="companies-icon"><Building2 size={24}/></span>
      <div><h1>Empresas</h1><p>Administra múltiples empresas y perfiles sectoriales desde un solo panel</p></div>
    </header>
    <button className="companies-new" onClick={()=>setNewOpen(true)}><Plus size={17}/>Nueva empresa</button>

    <div className="companies-kpis">
      <CompanyKpi label="Empresas" value={String(companies.length)}/><CompanyKpi label="Sucursales" value={String(totalBranches)}/>
      <CompanyKpi label="Empleados" value={String(totalEmployees)}/><CompanyKpi label="Sectores" value={String(sectorCount)}/>
    </div>

    {newOpen&&<section className="company-create-card">
      <div className="company-create-head"><div><Sparkles size={19}/><b>Nueva empresa</b></div><button onClick={()=>setNewOpen(false)}><X size={18}/></button></div>
      <div className="company-fields">
        <input placeholder="Nombre comercial *" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/>
        <input placeholder="Razón social" value={draft.legalName} onChange={e=>setDraft({...draft,legalName:e.target.value})}/>
        <input placeholder="RFC / Tax ID" value={draft.taxId} onChange={e=>setDraft({...draft,taxId:e.target.value})}/>
        <input placeholder="País" value={draft.country} onChange={e=>setDraft({...draft,country:e.target.value})}/>
        <select value={draft.currency} onChange={e=>setDraft({...draft,currency:e.target.value})}>{currencies.map(x=><option key={x}>{x}</option>)}</select>
      </div>
      <div className="sector-picker-head"><Sparkles size={17}/><b>Perfil sectorial — Especialización automática</b></div>
      <label className="sector-search"><Search size={18}/><input placeholder="Buscar sector o sub-sector..." value={sectorSearch} onChange={e=>setSectorSearch(e.target.value)}/></label>
      <p className="sector-help">Selecciona uno o varios sectores. La plataforma se especializará automáticamente.</p>
      <div className="sector-cards">{filteredSectors.map(s=><button key={s.id} className={`sector-card tone-${s.tone} ${draft.sectorIds.includes(s.id)?'selected':''}`} onClick={()=>toggleSector(s.id)}>
        <span className="sector-card-icon"><Grid3X3 size={19}/></span><div><b>{s.name}</b><p>{s.description}</p><div className="sector-subs">{s.subs.slice(0,3).map(x=><span key={x}>{x}</span>)}{s.subs.length>3&&<em>+{s.subs.length-3}</em>}</div></div>
      </button>)}</div>
      <div className="company-create-actions"><button className="create-company" onClick={createCompany} disabled={!draft.name.trim()}>Crear empresa</button><button onClick={()=>setNewOpen(false)}>Cancelar</button></div>
    </section>}

    <div className="company-list">{companies.map(c=>{
      const sectorNames=c.sectorIds.map(id=>sectorCatalog.find(s=>s.id===id)?.name).filter(Boolean).join(' + ')
      return <button className={`company-card ${selectedId===c.id?'selected':''}`} key={c.id} onClick={()=>setSelectedId(c.id)}>
        <div className="company-card-top"><span className="company-avatar">{c.name.charAt(0)}</span><div><b>{c.name}</b><small>{c.legalName}</small></div><i>{c.status}</i></div>
        <span className="company-sector"><Grid3X3 size={13}/>{sectorNames||'General / Multi-sector'}</span>
        <div className="company-meta"><span><Globe2 size={14}/>{c.country} · {c.currency}</span><span>RFC / Tax: <b>{c.taxId}</b></span></div>
        <div className="company-card-metrics"><div><b>{c.branches}</b><span>BRAN</span></div><div><b>{c.contracts}</b><span>CONT</span></div><div><b>{c.employees}</b><span>EMPL</span></div><div><b>{c.projects}</b><span>PROJ</span></div></div>
      </button>
    })}</div>

    <section className="sector-profile">
      <div className="sector-profile-title"><span><Grid3X3 size={20}/></span><div><h2>Perfil sectorial de {selected.name}</h2><p>Especialización automática de la plataforma</p></div></div>
      <ProfileBlock icon={<BarChart3 size={18}/>} title="KPIs del sector" values={profile.kpis}/>
      <ProfileBlock icon={<Workflow size={18}/>} title="Procesos" values={profile.processes}/>
      <ProfileBlock icon={<FileText size={18}/>} title="Biblioteca documental" values={profile.docs}/>
      <ProfileBlock icon={<BookOpen size={18}/>} title="Base de conocimiento" values={profile.knowledge}/>
      <ProfileBlock icon={<ShieldAlert size={18}/>} title="Riesgos del sector" values={profile.risks}/>
      <ProfileBlock icon={<Globe2 size={18}/>} title="Normativa aplicable" values={profile.regulations}/>
      <ProfileBlock title="Terminología técnica del sector" values={profile.terminology}/>
      <ProfileBlock title="Sub-sectores" values={profile.subs}/>
      <div className="agent-adaptation"><Sparkles size={21}/><div><b>Adaptación automática de agentes IA</b><p>{profile.adaptation}</p></div></div>
    </section>
  </section>
}

function CompanyKpi({label,value}:{label:string;value:string}){return <div className="company-kpi"><span>{label}</span><b>{value}</b></div>}
function ProfileBlock({icon,title,values}:{icon?:React.ReactNode;title:string;values:string[]}){return <div className="profile-block"><div className="profile-block-title">{icon}<b>{title}</b></div><div className="profile-chips">{values.map(x=><span key={x}>{x}</span>)}</div></div>}
