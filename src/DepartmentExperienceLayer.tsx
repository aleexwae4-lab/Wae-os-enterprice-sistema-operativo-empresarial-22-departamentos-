import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, X } from 'lucide-react'
import { departments, type Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import DepartmentOperationsModule from './DepartmentOperationsModule'
import FinanceModule from './FinanceModule'
import { departmentBlueprints } from './departmentCatalog'
import './department-experience.css'
import './department-operations-portal.css'

function activeDepartmentFromDom():Department|null{
  const active=document.querySelector('.department-nav button.active')
  const label=active?.textContent?.trim()
  if(label){
    const byDepartment=departments.find(d=>d.name===label)
    if(byDepartment)return byDepartment
  }
  const navActive=[...document.querySelectorAll('.nav-group button.active')].find(b=>['Analítica','Documentos IA','Capacitación'].includes(b.textContent?.trim()??''))
  const strategic=navActive?.textContent?.trim()
  if(strategic==='Analítica')return departments.find(d=>d.id==='analitica')??null
  if(strategic==='Documentos IA')return departments.find(d=>d.id==='documentos')??null
  if(strategic==='Capacitación')return departments.find(d=>d.id==='capacitacion')??null
  return null
}

function openWorkspaceDraft(title:string,body?:string){
  localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:body??`# ${title}\n`}))
  const buttons=[...document.querySelectorAll('button')]
  const workspace=buttons.find(b=>b.textContent?.trim()==='Workspace')
  if(workspace instanceof HTMLButtonElement)workspace.click()
}

function injectWorkspaceDraft(){
  const raw=localStorage.getItem('wae-workspace-draft');if(!raw)return
  const textarea=document.querySelector('.workspace textarea')
  if(!(textarea instanceof HTMLTextAreaElement))return
  try{
    const draft=JSON.parse(raw) as {title?:string;body?:string}
    textarea.value=draft.body||`# ${draft.title||'Documento'}\n`
    textarea.dispatchEvent(new Event('input',{bubbles:true}))
    localStorage.removeItem('wae-workspace-draft')
  }catch{localStorage.removeItem('wae-workspace-draft')}
}

export default function DepartmentExperienceLayer(){
  const [department,setDepartment]=useState<Department|null>(null)
  const [open,setOpen]=useState(false)
  const [target,setTarget]=useState<HTMLElement|null>(null)

  useEffect(()=>{
    const sync=()=>{
      const next=activeDepartmentFromDom()
      setDepartment(next)
      const content=document.querySelector('.content')
      setTarget(content instanceof HTMLElement?content:null)
      if(!next)setOpen(false)
      injectWorkspaceDraft()
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})
    return()=>observer.disconnect()
  },[])

  const docs=useMemo(()=>department?[`Reporte ejecutivo · ${department.name}`,`Política operativa · ${department.name}`,`Procedimiento · ${department.name}`,`Checklist · ${department.name}`,`Plan de acción · ${department.name}`]:[],[department])

  if(!department)return null

  if(department.id==='finanzas'&&target){
    return createPortal(<FinanceModule department={department}/>,target)
  }

  const hasOperationalWorkspace=Boolean(departmentBlueprints[department.id])
  if(hasOperationalWorkspace&&target){
    return createPortal(<DepartmentOperationsModule department={department}/>,target)
  }

  return <>
    <button className={`department-agent-launcher tone-${department.tone}`} onClick={()=>setOpen(true)} title={`Abrir ${department.agent}`}><Bot size={21}/><span>{department.agent}</span></button>
    {open&&<div className="department-agent-overlay"><div className="department-agent-dialog"><button className="department-agent-close" onClick={()=>setOpen(false)}><X size={20}/></button><DepartmentAgentWorkspace department={department} documents={docs} onOpenWorkspace={(title,body)=>{openWorkspaceDraft(title,body);setOpen(false)}}/></div></div>}
  </>
}
