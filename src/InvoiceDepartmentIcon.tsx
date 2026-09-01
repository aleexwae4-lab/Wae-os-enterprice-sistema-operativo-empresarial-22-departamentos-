import { createPortal } from 'react-dom'
import { ReceiptText, type LucideProps } from 'lucide-react'
import InvoiceModule from './InvoiceModule'
import type { Department } from './data'
import './invoice-portal.css'

const invoiceDepartment:Department={
  id:'facturacion',name:'Facturación AI',agent:'INVOICER',role:'Gerente de Facturación AI',
  description:'CFDI, cobranza, notas de crédito y cuentas por cobrar.',
  icon:ReceiptText,tone:'green',
  capabilities:['Emitir y administrar facturas','Gestionar cartera por cobrar','Detectar facturas vencidas','Registrar pagos y cobranza','Facturación recurrente','Notas de crédito y complementos','Reportes de ingresos','Validaciones fiscales'],
  automations:['Recordatorios de pago automáticos','Detección de facturas vencidas','Facturación recurrente programada','Envío de facturas por correo','Generación de complementos de pago','Alertas de errores fiscales','Reportes de ingresos programados','Estados de cuenta automáticos'],
}

function clickButton(label:string){
  const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()===label)
  if(button instanceof HTMLButtonElement)button.click()
}
function openWorkspace(title:string,body?:string){
  localStorage.setItem('wae-workspace-draft',JSON.stringify({title,body:body??`# ${title}\n`}))
  clickButton('Workspace')
}

export default function InvoiceDepartmentIcon(props:LucideProps){
  const size=typeof props.size==='number'?props.size:Number(props.size??24)
  const target=typeof document!=='undefined'?document.querySelector('.content'):null
  const shouldMount=size>=28&&target instanceof HTMLElement
  return <><ReceiptText {...props}/>{shouldMount&&createPortal(<InvoiceModule department={invoiceDepartment} onBackFinance={()=>clickButton('Finanzas')} onOpenWorkspace={openWorkspace}/>,target)}</>
}
