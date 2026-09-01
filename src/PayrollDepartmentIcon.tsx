import { createPortal } from 'react-dom'
import { WalletCards, type LucideProps } from 'lucide-react'
import PayrollModule from './PayrollModule'
import type { Department } from './data'

const payrollDepartment:Department={
  id:'nominas',name:'Nóminas AI',agent:'PAYROLL',role:'Gerente de Nóminas AI',
  description:'Cálculo, incidencias, periodos, recibos y compensación coordinados con Recursos Humanos.',
  icon:WalletCards,tone:'fuchsia',
  capabilities:['Calcular pre-nómina','Procesar incidencias','Generar recibos y reportes','Prestaciones, finiquitos y liquidaciones','Aguinaldo y PTU','Calendario y cierres de nómina'],
  automations:['Pre-cálculo por periodo','Validación de incidencias','Generación documental','Alertas de cierre','Preparación de dispersión','Integración contable'],
}

function openWorkspace(title:string,body?:string){
  localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:body??`# ${title}\n`}))
  const workspace=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Workspace')
  if(workspace instanceof HTMLButtonElement) workspace.click()
}

export default function PayrollDepartmentIcon(props:LucideProps){
  const size=typeof props.size==='number'?props.size:Number(props.size??24)
  const target=typeof document!=='undefined'?document.querySelector('.content'):null
  const shouldMount=size>=28&&target instanceof HTMLElement
  const backToCEO=()=>{const button=document.querySelector('.ceo-return-fab');if(button instanceof HTMLButtonElement)button.click()}
  return <><WalletCards {...props}/>{shouldMount&&createPortal(<PayrollModule department={payrollDepartment} onBackCEO={backToCEO} onOpenWorkspace={openWorkspace}/>,target)}</>
}
