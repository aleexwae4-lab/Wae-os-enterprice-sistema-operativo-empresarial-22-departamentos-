import { createPortal } from 'react-dom'
import { UsersRound, type LucideProps } from 'lucide-react'
import HumanResourcesModule from './HumanResourcesModule'
import type { Department } from './data'

const hrDepartment:Department={
  id:'rrhh',name:'Recursos Humanos',agent:'TALENT',role:'Director de Recursos Humanos AI',
  description:'Expedientes, incidencias, contratos, desempeño, clima y organigrama.',
  icon:UsersRound,tone:'pink',
  capabilities:['Diseñar planes de carrera','Evaluar desempeño','Analizar clima laboral','Estructurar compensación','Gestionar conflictos','Crear programas de capacitación','Detectar riesgo de rotación','Optimizar organigramas','Auditar cumplimiento laboral','Generar reportes de RRHH'],
  automations:['Onboarding y offboarding','Vacaciones y permisos','Evaluación de desempeño','Alertas de rotación','Actualización de expedientes','Sincronización con Nóminas'],
}

function clickButton(label:string){
  const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()===label)
  if(button instanceof HTMLButtonElement)button.click()
}
function openWorkspace(title:string,body?:string){
  localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:body??`# ${title}\n`}))
  clickButton('Workspace')
}

export default function HumanResourcesDepartmentIcon(props:LucideProps){
  const size=typeof props.size==='number'?props.size:Number(props.size??24)
  const target=typeof document!=='undefined'?document.querySelector('.content'):null
  const shouldMount=size>=28&&target instanceof HTMLElement
  const backToCEO=()=>{const button=document.querySelector('.ceo-return-fab');if(button instanceof HTMLButtonElement)button.click()}
  return <><UsersRound {...props}/>{shouldMount&&createPortal(<HumanResourcesModule department={hrDepartment} onBackCEO={backToCEO} onOpenPayroll={()=>clickButton('Nóminas AI')} onOpenWorkspace={openWorkspace}/>,target)}</>
}
