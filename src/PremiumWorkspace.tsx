import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bot, Check, Download, FilePlus2, FileText, LoaderCircle, Save, Sparkles, WandSparkles } from 'lucide-react'
import { departments } from './data'
import { streamEnterprise22Expert } from './enterprise22AiClient'
import './premium-workspace.css'

const AUTOSAVE_KEY='wae-workspace-autosave-v2'
const DEFAULT_TITLE='Documento sin título'
const archive=departments.find(item=>item.id==='documentos')??departments[0]
type StoredDocument={title:string;body:string;updatedAt:string}

function safeName(value:string){return(value.trim()||'documento-wae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-_]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'documento-wae'}
function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
function initialDocument():StoredDocument{
  const pending=localStorage.getItem('wae-workspace-draft')
  const saved=localStorage.getItem(AUTOSAVE_KEY)
  for(const raw of [pending,saved]){if(!raw)continue;try{const value=JSON.parse(raw) as Partial<StoredDocument>;if(pending)localStorage.removeItem('wae-workspace-draft');return{title:value.title||DEFAULT_TITLE,body:value.body||'',updatedAt:value.updatedAt||new Date().toISOString()}}catch{}}
  return{title:DEFAULT_TITLE,body:'',updatedAt:new Date().toISOString()}
}

export default function PremiumWorkspace(){
  const [document,setDocument]=useState<StoredDocument>(initialDocument)
  const [saved,setSaved]=useState(true)
  const [busy,setBusy]=useState(false)
  const [status,setStatus]=useState('Listo para escribir')
  const words=useMemo(()=>document.body.trim()?document.body.trim().split(/\s+/).length:0,[document.body])
  const update=useCallback((next:Partial<StoredDocument>)=>{setDocument(current=>({...current,...next,updatedAt:new Date().toISOString()}));setSaved(false)},[])

  useEffect(()=>{const timer=window.setTimeout(()=>{localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(document));setSaved(true)},550);return()=>window.clearTimeout(timer)},[document])

  const newDocument=()=>{setDocument({title:DEFAULT_TITLE,body:'',updatedAt:new Date().toISOString()});setStatus('Documento nuevo')}
  const exportTxt=()=>downloadBlob(new Blob([document.body],{type:'text/plain;charset=utf-8'}),`${safeName(document.title)}.txt`)
  const exportMarkdown=()=>downloadBlob(new Blob([document.body],{type:'text/markdown;charset=utf-8'}),`${safeName(document.title)}.md`)
  const exportHtml=()=>{const escaped=document.body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');downloadBlob(new Blob([`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${document.title}</title><style>body{font:16px/1.7 Arial;max-width:820px;margin:60px auto;color:#172033;white-space:pre-wrap}h1{font-size:28px}</style></head><body><h1>${document.title}</h1>${escaped}</body></html>`],{type:'text/html;charset=utf-8'}),`${safeName(document.title)}.html`)}
  const exportPdf=async()=>{setStatus('Preparando PDF…');const {jsPDF}=await import('jspdf');const pdf=new jsPDF({unit:'pt',format:'a4'});pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.text(document.title,48,58,{maxWidth:500});pdf.setFont('helvetica','normal');pdf.setFontSize(11);const lines=pdf.splitTextToSize(document.body||' ',500);let y=88;for(const line of lines){if(y>790){pdf.addPage();y=54}pdf.text(line,48,y);y+=16}pdf.save(`${safeName(document.title)}.pdf`);setStatus('PDF descargado')}
  const exportWord=async()=>{setStatus('Preparando Word…');const {Document,Packer,Paragraph,TextRun,HeadingLevel}=await import('docx');const paragraphs=document.body.split('\n').map(line=>new Paragraph({text:line.replace(/^#{1,6}\s*/,''),heading:line.startsWith('# ')?HeadingLevel.HEADING_1:line.startsWith('## ')?HeadingLevel.HEADING_2:undefined,spacing:{after:120}}));const file=new Document({sections:[{children:[new Paragraph({children:[new TextRun({text:document.title,bold:true,size:36})],spacing:{after:300}}),...paragraphs]}]});downloadBlob(await Packer.toBlob(file),`${safeName(document.title)}.docx`);setStatus('Word descargado')}

  const runAssistant=async(instruction:string)=>{
    if(busy)return;setBusy(true);setStatus('ARCHIVE está trabajando…');let generated=''
    try{await streamEnterprise22Expert({department:archive,input:`${instruction}\n\nDOCUMENTO ACTUAL:\n${document.body.slice(0,10000)}`,history:[],onDelta:chunk=>{generated+=chunk;setStatus('Generando contenido…')}});update({body:document.body.trim()?`${document.body.trim()}\n\n${generated.trim()}`:generated.trim()});setStatus('Contenido agregado por ARCHIVE')}
    catch{setStatus('No fue posible conectar con ARCHIVE. Intenta nuevamente.')}
    finally{setBusy(false)}
  }

  return <section className="premium-workspace">
    <header className="workspace-commandbar">
      <div><span className="workspace-brand"><Sparkles size={16}/></span><div><small>WAE DOCUMENT STUDIO</small><b>Workspace</b></div></div>
      <div className="workspace-actions"><button onClick={newDocument}><FilePlus2 size={15}/>Nuevo</button><span className={saved?'saved':'saving'}>{saved?<Check size={14}/>:<Save size={14}/>} {saved?'Guardado':'Guardando'}</span></div>
    </header>
    <div className="workspace-titlebar"><input aria-label="Título del documento" value={document.title} onChange={event=>update({title:event.target.value})}/><div><span>{words} palabras</span><span>{document.body.length} caracteres</span></div></div>
    <div className="workspace-layout">
      <aside className="workspace-tools">
        <small>COPILOTO DOCUMENTAL</small><div className="workspace-agent"><span><Bot size={18}/></span><div><b>ARCHIVE</b><em>Document Intelligence AI</em></div></div>
        <p>Redacta, estructura, revisa y convierte conocimiento de cualquier departamento en un documento profesional.</p>
        <button disabled={busy} onClick={()=>void runAssistant('Redacta y completa este documento profesionalmente. Conserva los hechos, distingue supuestos y agrega una estructura ejecutiva clara.')}><WandSparkles size={15}/>Redactar y completar</button>
        <button disabled={busy} onClick={()=>void runAssistant('Revisa este documento, detecta riesgos, contradicciones, vacíos de información y decisiones pendientes. Entrega recomendaciones accionables.')}><Sparkles size={15}/>Auditar documento</button>
        <button disabled={busy} onClick={()=>void runAssistant('Convierte el contenido en un plan de acción con prioridades, responsables sugeridos, fechas, KPI, dependencias y criterio de cierre.')}><FileText size={15}/>Convertir en plan</button>
        <button disabled={busy} onClick={()=>void runAssistant('Crea un resumen ejecutivo breve, preciso y preparado para que el CEO tome decisiones.')}><Bot size={15}/>Resumen ejecutivo</button>
        <div className="workspace-ai-status">{busy?<LoaderCircle className="spin" size={14}/>:<i/>}{status}</div>
      </aside>
      <main className="workspace-canvas"><div className="workspace-paper"><textarea aria-label="Contenido del documento" value={document.body} onChange={event=>update({body:event.target.value})} placeholder="Empieza a escribir…" spellCheck/></div></main>
      <aside className="workspace-export"><small>DESCARGAR</small><h3>Exportar documento</h3><p>Genera una copia local en el formato que necesites.</p>
        <button onClick={()=>void exportPdf()}><Download size={15}/><span><b>PDF</b><em>Documento final</em></span></button>
        <button onClick={()=>void exportWord()}><Download size={15}/><span><b>Word</b><em>.docx editable</em></span></button>
        <button onClick={exportTxt}><Download size={15}/><span><b>Texto</b><em>.txt universal</em></span></button>
        <button onClick={exportMarkdown}><Download size={15}/><span><b>Markdown</b><em>.md estructurado</em></span></button>
        <button onClick={exportHtml}><Download size={15}/><span><b>HTML</b><em>Página web</em></span></button>
      </aside>
    </div>
  </section>
}
