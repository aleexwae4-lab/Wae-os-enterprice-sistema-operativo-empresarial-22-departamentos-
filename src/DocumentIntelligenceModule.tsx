import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle, Bot, CheckCircle2, Clock3, FileSearch, FileText, Fingerprint,
  Gauge, GitBranch, Layers3, Link2, Network, Plus, Search, ShieldCheck, Sparkles,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './document-intelligence-premium.css'

type Tab='command'|'library'|'extract'|'versions'|'graph'|'risks'|'documents'|'agent'
type Status='Vigente'|'En revisión'|'Vencido'|'Borrador'
type Sensitivity='Interno'|'Confidencial'|'Restringido'
type Confidence='Alta'|'Media'|'Baja'
type Risk='Bajo'|'Medio'|'Alto'|'Crítico'

type DocumentRow={
  id:string;title:string;type:string;department:string;owner:string;version:string;status:Status;
  sensitivity:Sensitivity;updated:string;pages:number;confidence:Confidence;hash:string;source:string
}
type Extraction={id:string;documentId:string;kind:'Entidad'|'Fecha'|'Obligación'|'Monto'|'Cláusula';label:string;value:string;confidence:Confidence;sourceRef:string}
type Obligation={id:string;documentId:string;title:string;owner:string;due:string;risk:Risk;status:'Abierta'|'En seguimiento'|'Cumplida';sourceRef:string}
type VersionDiff={documentId:string;from:string;to:string;changes:number;material:number;summary:string;review:'Pendiente'|'Revisada'}
type Edge={from:string;to:string;relation:string;confidence:Confidence}

const seedDocuments:DocumentRow[]=[
  {id:'DOC-001',title:'Contrato marco · Northwind México',type:'Contrato',department:'Legal',owner:'JUSTITIA',version:'v4.2',status:'Vigente',sensitivity:'Confidencial',updated:'01 sep 2026',pages:38,confidence:'Alta',hash:'sha256:9fd2…a81c',source:'JUSTITIA'},
  {id:'DOC-002',title:'Política de Tesorería',type:'Política',department:'Finanzas',owner:'STERLING',version:'v3.1',status:'Vigente',sensitivity:'Interno',updated:'30 ago 2026',pages:16,confidence:'Alta',hash:'sha256:6ac1…b900',source:'STERLING'},
  {id:'DOC-003',title:'SLA CloudNet 2026',type:'SLA',department:'Proveedores',owner:'SOURCE',version:'v2.0',status:'En revisión',sensitivity:'Confidencial',updated:'29 ago 2026',pages:22,confidence:'Alta',hash:'sha256:2be8…31df',source:'SOURCE + PROCURE'},
  {id:'DOC-004',title:'Manual de Organización',type:'Manual',department:'Recursos Humanos',owner:'TALENT',version:'v5.0',status:'Vigente',sensitivity:'Interno',updated:'27 ago 2026',pages:54,confidence:'Alta',hash:'sha256:0aa4…44ef',source:'TALENT'},
  {id:'DOC-005',title:'Reporte de conciliación · Agosto',type:'Reporte',department:'Contabilidad',owner:'LEDGER',version:'v1.3',status:'En revisión',sensitivity:'Restringido',updated:'01 sep 2026',pages:19,confidence:'Media',hash:'sha256:7d41…0b19',source:'LEDGER'},
  {id:'DOC-006',title:'Playbook de respuesta a incidentes',type:'Playbook',department:'Seguridad',owner:'SENTINEL',version:'v2.4',status:'Vigente',sensitivity:'Restringido',updated:'28 ago 2026',pages:31,confidence:'Alta',hash:'sha256:cc18…9a2f',source:'SENTINEL'},
  {id:'DOC-007',title:'Convenio modificatorio · Lumen Retail',type:'Convenio',department:'Legal',owner:'JUSTITIA',version:'v1.0',status:'Borrador',sensitivity:'Confidencial',updated:'01 sep 2026',pages:11,confidence:'Media',hash:'sha256:draft',source:'JUSTITIA + CLOSER'},
]

const seedExtractions:Extraction[]=[
  {id:'EXT-01',documentId:'DOC-001',kind:'Obligación',label:'Renovación contractual',value:'Notificar con 30 días de anticipación',confidence:'Alta',sourceRef:'DOC-001 · cláusula 14.2'},
  {id:'EXT-02',documentId:'DOC-001',kind:'Monto',label:'Valor anual',value:'$248,000 MXN',confidence:'Alta',sourceRef:'DOC-001 · anexo comercial'},
  {id:'EXT-03',documentId:'DOC-003',kind:'Cláusula',label:'Disponibilidad',value:'99.9% mensual',confidence:'Alta',sourceRef:'DOC-003 · sección 5'},
  {id:'EXT-04',documentId:'DOC-003',kind:'Fecha',label:'Renovación',value:'15 sep 2026',confidence:'Alta',sourceRef:'DOC-003 · sección 12'},
  {id:'EXT-05',documentId:'DOC-005',kind:'Monto',label:'Diferencia pendiente',value:'$650 MXN',confidence:'Media',sourceRef:'DOC-005 · tabla 3'},
  {id:'EXT-06',documentId:'DOC-006',kind:'Obligación',label:'Escalamiento crítico',value:'Escalar a SENTINEL + AURORA',confidence:'Alta',sourceRef:'DOC-006 · playbook P1'},
]

const seedObligations:Obligation[]=[
  {id:'OBL-21',documentId:'DOC-001',title:'Preparar aviso de renovación Northwind',owner:'JUSTITIA + CLOSER',due:'18 sep 2026',risk:'Alto',status:'Abierta',sourceRef:'Cláusula 14.2'},
  {id:'OBL-22',documentId:'DOC-003',title:'Revisar SLA y alternativa CloudNet',owner:'SOURCE + NEXUS',due:'08 sep 2026',risk:'Crítico',status:'En seguimiento',sourceRef:'Secciones 5 y 12'},
  {id:'OBL-23',documentId:'DOC-005',title:'Resolver diferencia de conciliación',owner:'LEDGER',due:'03 sep 2026',risk:'Alto',status:'Abierta',sourceRef:'Tabla 3'},
  {id:'OBL-24',documentId:'DOC-006',title:'Revalidar responsables de escalamiento P1',owner:'SENTINEL',due:'12 sep 2026',risk:'Medio',status:'Abierta',sourceRef:'Playbook P1'},
]

const versionDiffs:VersionDiff[]=[
  {documentId:'DOC-001',from:'v4.1',to:'v4.2',changes:14,material:3,summary:'Cambios en renovación, SLA de soporte y límite de responsabilidad.',review:'Pendiente'},
  {documentId:'DOC-002',from:'v3.0',to:'v3.1',changes:7,material:1,summary:'Actualiza umbral de doble autorización y reserva mínima.',review:'Revisada'},
  {documentId:'DOC-004',from:'v4.8',to:'v5.0',changes:28,material:5,summary:'Reestructura responsabilidades, reporting lines y onboarding.',review:'Revisada'},
]

const edges:Edge[]=[
  {from:'DOC-001',to:'Northwind México',relation:'rige relación',confidence:'Alta'},
  {from:'DOC-001',to:'CLOSER',relation:'condiciona renovación',confidence:'Alta'},
  {from:'DOC-003',to:'CloudNet',relation:'define SLA',confidence:'Alta'},
  {from:'DOC-003',to:'NEXUS',relation:'impacta continuidad',confidence:'Alta'},
  {from:'DOC-005',to:'LEDGER',relation:'evidencia cierre',confidence:'Alta'},
  {from:'DOC-006',to:'SENTINEL',relation:'define respuesta',confidence:'Alta'},
  {from:'DOC-006',to:'NORM',relation:'soporta control',confidence:'Media'},
]

const documents=[
  'Document Intelligence Brief','Document Passport','Extraction Report','Obligation Register','Version Comparison',
  'Redline Review','Evidence Map','Knowledge Graph Snapshot','Document Risk Review','Retention & Classification Policy',
  'RAG Evidence Pack','Source Validation Log','Document Due Diligence','Executive Knowledge Brief',
]
const knowledge=[
  'Biblioteca documental autorizada del tenant','Metadatos, versiones y owners','Permisos y clasificación documental',
  'Contratos y obligaciones JUSTITIA','Políticas STERLING / TALENT / NORM','Evidencia LEDGER / SENTINEL',
  'Relaciones documentales entre módulos','Reglas de provenance, confidence y citación interna',
]
const suggestions=[
  '¿Qué documentos requieren revisión prioritaria?','Extrae obligaciones y fechas con evidencia visible',
  'Compara versiones y señala cambios materiales','Construye el mapa de relaciones de un documento sin inventar hechos',
]

export default function DocumentIntelligenceModule({department}:{department:Department}){
  const [tab,setTab]=useState<Tab>('command')
  const [docs,setDocs]=useState(seedDocuments)
  const [obligations,setObligations]=useState(seedObligations)
  const [diffs,setDiffs]=useState(versionDiffs)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState('DOC-001')
  const [open,setOpen]=useState(false)
  const [draft,setDraft]=useState({title:'',type:'Documento',department:'Dirección General',owner:'ARCHIVE'})

  const selectedDoc=docs.find(d=>d.id===selected)??docs[0]
  const openObligations=obligations.filter(o=>o.status!=='Cumplida')
  const highRisk=openObligations.filter(o=>o.risk==='Alto'||o.risk==='Crítico').length
  const reviewDocs=docs.filter(d=>d.status==='En revisión'||d.status==='Borrador').length
  const avgConfidence=Math.round(docs.reduce((s,d)=>s+(d.confidence==='Alta'?96:d.confidence==='Media'?80:62),0)/docs.length)
  const evidenceCoverage=Math.round(seedExtractions.filter(e=>e.sourceRef).length/seedExtractions.length*100)
  const knowledgeHealth=Math.max(0,Math.min(100,Math.round(avgConfidence-reviewDocs*2-highRisk*3+evidenceCoverage*.08)))

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return docs
    return docs.filter(d=>[d.id,d.title,d.type,d.department,d.owner,d.status,d.sensitivity,d.source].some(v=>v.toLowerCase().includes(q)))
  },[docs,query])

  const createDocument=()=>{
    if(!draft.title.trim())return
    const id=`DOC-${String(docs.length+1).padStart(3,'0')}`
    const next:DocumentRow={id,title:draft.title.trim(),type:draft.type,department:draft.department,owner:draft.owner,version:'v0.1',status:'Borrador',sensitivity:'Interno',updated:'01 sep 2026',pages:0,confidence:'Baja',hash:'pendiente',source:'Carga manual demo'}
    setDocs(v=>[next,...v]);setSelected(id);setOpen(false);setDraft({title:'',type:'Documento',department:'Dirección General',owner:'ARCHIVE'});setTab('library')
  }
  const advanceStatus=(id:string)=>setDocs(v=>v.map(d=>d.id===id?{...d,status:d.status==='Borrador'?'En revisión':d.status==='En revisión'?'Vigente':d.status}:d))
  const completeObligation=(id:string)=>setObligations(v=>v.map(o=>o.id===id?{...o,status:'Cumplida'}:o))
  const reviewDiff=(id:string)=>setDiffs(v=>v.map(d=>d.documentId===id?{...d,review:'Revisada'}:d))

  const openWorkspace=(title:string)=>{
    localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:`# ${title}\n\n**Departamento:** Documentos Inteligentes\n**Agente:** ARCHIVE\n\n## Documento / alcance\n- Seleccionado: ${selectedDoc.title}\n- Versión: ${selectedDoc.version}\n- Estado: ${selectedDoc.status}\n- Fuente: ${selectedDoc.source}\n- Confidence: ${selectedDoc.confidence}\n- Hash/evidencia demo: ${selectedDoc.hash}\n\n## Resumen con evidencia\n\n## Entidades y datos extraídos\n\n## Obligaciones / fechas\n\n## Riesgos documentales\n\n## Cambios entre versiones\n\n## Relaciones con otros documentos/agentes\n\n## Citas / referencias internas\n\n## Validación humana\n\n> Documento demo. No afirmar contenido no soportado por la fuente. Verificar versión, permisos, integridad, referencias y vigencia antes de usar externamente.\n`}))
    const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
    if(workspace instanceof HTMLButtonElement)workspace.click()
  }

  const selectedExtractions=seedExtractions.filter(e=>e.documentId===selectedDoc.id)
  const selectedObligations=obligations.filter(o=>o.documentId===selectedDoc.id)

  return <section className="archive-premium">
    <header className="archive-head">
      <div className="archive-brand"><span><FileSearch size={25}/></span><div><small>ARCHIVE · DIRECTOR DOCUMENTAL AI</small><h1>Enterprise Knowledge & Document Intelligence</h1><p>Provenance, extracción, obligaciones, versiones y evidence graph para toda la empresa.</p></div></div>
      <div className="archive-head-status"><i/>Datos demo · Evidence-first documents</div>
    </header>

    <nav className="archive-tabs">{[
      ['command','Command Center'],['library','Biblioteca'],['extract','Extracción'],['versions','Versiones'],['graph','Knowledge Graph'],['risks','Riesgos'],['documents','Documentos'],['agent','ARCHIVE AI'],
    ].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id as Tab)}>{label}</button>)}</nav>

    {tab!=='agent'&&<div className="archive-kpis">
      <Kpi icon={<Gauge size={18}/>} label="Knowledge health" value={`${knowledgeHealth}/100`} detail={`${highRisk} obligaciones alto riesgo`} tone="violet"/>
      <Kpi icon={<Layers3 size={18}/>} label="Documentos" value={String(docs.length)} detail={`${reviewDocs} en revisión/borrador`} tone="cyan"/>
      <Kpi icon={<ShieldCheck size={18}/>} label="Evidence coverage" value={`${evidenceCoverage}%`} detail="extracciones con referencia" tone="emerald"/>
      <Kpi icon={<Fingerprint size={18}/>} label="Confidence" value={`${avgConfidence}/100`} detail="promedio de biblioteca" tone="amber"/>
    </div>}

    {tab==='command'&&<>
      <div className="archive-grid-2">
        <article className="archive-panel hero"><div className="panel-title"><div><small>DOCUMENT CONTROL TOWER</small><h2>Knowledge posture</h2></div><Sparkles size={20}/></div>
          <div className="health-ring"><strong>{knowledgeHealth}</strong><span>/100</span></div>
          <p>ARCHIVE prioriza documentos por vigencia, evidencia, obligaciones, cambios materiales y nivel de confianza.</p>
          <div className="mini-stats"><span><b>{openObligations.length}</b> obligaciones abiertas</span><span><b>{diffs.filter(d=>d.review==='Pendiente').length}</b> redlines pendientes</span><span><b>{edges.length}</b> relaciones mapeadas</span></div>
        </article>
        <article className="archive-panel"><div className="panel-title"><div><small>DECISION QUEUE</small><h2>Qué revisar primero</h2></div><AlertTriangle size={20}/></div>
          <div className="decision-list">
            {obligations.filter(o=>o.status!=='Cumplida').sort((a,b)=>(b.risk==='Crítico'?4:b.risk==='Alto'?3:2)-(a.risk==='Crítico'?4:a.risk==='Alto'?3:2)).slice(0,4).map(o=><button key={o.id} onClick={()=>{setSelected(o.documentId);setTab('risks')}}><span className={`risk-dot ${o.risk.toLowerCase()}`}/><div><b>{o.title}</b><small>{o.due} · {o.owner} · {o.sourceRef}</small></div></button>)}
          </div>
        </article>
      </div>
      <article className="archive-panel"><div className="panel-title"><div><small>DOCUMENT PASSPORT</small><h2>{selectedDoc.title}</h2></div><button onClick={()=>setTab('library')}>Abrir biblioteca</button></div>
        <div className="passport-grid"><Info label="ID" value={selectedDoc.id}/><Info label="Versión" value={selectedDoc.version}/><Info label="Owner" value={selectedDoc.owner}/><Info label="Clasificación" value={selectedDoc.sensitivity}/><Info label="Estado" value={selectedDoc.status}/><Info label="Confidence" value={selectedDoc.confidence}/><Info label="Fuente" value={selectedDoc.source}/><Info label="Integridad demo" value={selectedDoc.hash}/></div>
      </article>
    </>}

    {tab==='library'&&<article className="archive-panel"><div className="panel-title"><div><small>DOCUMENT LIBRARY</small><h2>Biblioteca gobernada</h2></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>Nuevo documento</button></div>
      <div className="archive-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar documento, owner, tipo, área..."/></div>
      <div className="doc-table">{filtered.map(d=><button key={d.id} className={selected===d.id?'selected':''} onClick={()=>setSelected(d.id)}><div><b>{d.title}</b><small>{d.id} · {d.type} · {d.department}</small></div><span>{d.version}</span><span className={`status ${d.status.replaceAll(' ','-').toLowerCase()}`}>{d.status}</span><span>{d.confidence}</span><em>{d.updated}</em></button>)}</div>
      <div className="doc-actions"><button onClick={()=>advanceStatus(selectedDoc.id)}>Avanzar revisión</button><button onClick={()=>openWorkspace(`Document Passport · ${selectedDoc.title}`)}>Abrir en Workspace</button></div>
    </article>}

    {tab==='extract'&&<div className="archive-grid-2"><article className="archive-panel"><div className="panel-title"><div><small>STRUCTURED EXTRACTION</small><h2>{selectedDoc.title}</h2></div><FileText size={20}/></div>
      <div className="extraction-list">{selectedExtractions.length?selectedExtractions.map(e=><div key={e.id}><span>{e.kind}</span><div><b>{e.label}</b><p>{e.value}</p><small>{e.sourceRef} · confidence {e.confidence}</small></div></div>):<p className="empty">Sin extracciones demo para este documento.</p>}</div>
    </article><article className="archive-panel"><div className="panel-title"><div><small>OBLIGATION ENGINE</small><h2>Compromisos detectados</h2></div><Clock3 size={20}/></div>
      <div className="obligation-list">{selectedObligations.length?selectedObligations.map(o=><div key={o.id}><span className={`risk-dot ${o.risk.toLowerCase()}`}/><div><b>{o.title}</b><small>{o.due} · {o.owner} · {o.sourceRef}</small></div><button disabled={o.status==='Cumplida'} onClick={()=>completeObligation(o.id)}>{o.status}</button></div>):<p className="empty">Sin obligaciones demo extraídas.</p>}</div>
    </article></div>}

    {tab==='versions'&&<article className="archive-panel"><div className="panel-title"><div><small>VERSION & REDLINE INTELLIGENCE</small><h2>Cambios materiales</h2></div><GitBranch size={20}/></div>
      <div className="version-list">{diffs.map(d=>{const doc=docs.find(x=>x.id===d.documentId);return <div key={d.documentId}><div><b>{doc?.title}</b><small>{d.from} → {d.to}</small></div><span>{d.changes} cambios</span><span className={d.material>2?'material':''}>{d.material} materiales</span><p>{d.summary}</p><button disabled={d.review==='Revisada'} onClick={()=>reviewDiff(d.documentId)}>{d.review}</button></div>})}</div>
    </article>}

    {tab==='graph'&&<div className="archive-grid-2"><article className="archive-panel"><div className="panel-title"><div><small>EVIDENCE GRAPH</small><h2>Relaciones documentales</h2></div><Network size={20}/></div>
      <div className="graph-list">{edges.map((e,i)=><div key={`${e.from}-${e.to}-${i}`}><span>{e.from}</span><Link2 size={15}/><b>{e.relation}</b><Link2 size={15}/><span>{e.to}</span><em>{e.confidence}</em></div>)}</div>
    </article><article className="archive-panel"><div className="panel-title"><div><small>GRAPH RULES</small><h2>Relaciones con provenance</h2></div><ShieldCheck size={20}/></div><ul className="rule-list"><li>No crear relaciones sin fuente identificable.</li><li>Distinguir relación documental, inferencia y hecho.</li><li>Preservar versión y permisos del documento origen.</li><li>Una relación de confidence media requiere validación antes de automatizar acciones.</li></ul></article></div>}

    {tab==='risks'&&<article className="archive-panel"><div className="panel-title"><div><small>DOCUMENT RISK & OBLIGATIONS</small><h2>Riesgos documentales</h2></div><AlertTriangle size={20}/></div>
      <div className="risk-list">{obligations.map(o=>{const doc=docs.find(d=>d.id===o.documentId);return <div key={o.id}><span className={`risk-dot ${o.risk.toLowerCase()}`}/><div><b>{o.title}</b><small>{doc?.title} · {o.sourceRef}</small></div><span>{o.due}</span><span>{o.owner}</span><button disabled={o.status==='Cumplida'} onClick={()=>completeObligation(o.id)}>{o.status}</button></div>})}</div>
    </article>}

    {tab==='documents'&&<article className="archive-panel"><div className="panel-title"><div><small>DOCUMENT STUDIO</small><h2>Inteligencia documental editable</h2></div><FileText size={20}/></div><div className="studio-grid">{documents.map(name=><button key={name} onClick={()=>openWorkspace(name)}><FileText size={18}/><span>{name}</span><small>Editar en Workspace</small></button>)}</div></article>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={documents} knowledge={knowledge} suggestions={suggestions} onOpenWorkspace={(title)=>openWorkspace(title)}/>}

    {open&&<div className="archive-modal"><div><div className="panel-title"><div><small>DOCUMENT INTAKE</small><h2>Nuevo documento</h2></div><button onClick={()=>setOpen(false)}>×</button></div><label>Título<input value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></label><label>Tipo<input value={draft.type} onChange={e=>setDraft(v=>({...v,type:e.target.value}))}/></label><label>Área<input value={draft.department} onChange={e=>setDraft(v=>({...v,department:e.target.value}))}/></label><label>Owner<input value={draft.owner} onChange={e=>setDraft(v=>({...v,owner:e.target.value}))}/></label><button className="primary wide" onClick={createDocument}>Crear como borrador</button><p>Un documento nuevo entra como <b>Borrador</b>, confidence baja e integridad pendiente hasta completar ingesta, versionado y validación.</p></div></div>}
  </section>
}

function Kpi({icon,label,value,detail,tone}:{icon:ReactNode;label:string;value:string;detail:string;tone:string}){return <article className={`archive-kpi ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>}
function Info({label,value}:{label:string;value:string}){return <div><small>{label}</small><b>{value}</b></div>}
