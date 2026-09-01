import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, BadgeDollarSign, CalendarClock, CheckCircle2, FileText,
  Plus, ReceiptText, Search, Sparkles, TrendingUp, WalletCards, X,
} from 'lucide-react'
import type { Department } from './data'
import DepartmentAgentWorkspace from './DepartmentAgentWorkspace'
import './invoices.css'

type InvoiceTab='invoices'|'payments'|'recurring'|'agent'
type InvoiceStatus='Pagada'|'Pendiente'|'Borrador'|'Vencida'
type PaymentMethod='Transferencia'|'Efectivo'|'Tarjeta'|'Cheque'
type Invoice={id:string;client:string;concept:string;amount:number;issued:string;due:string;status:InvoiceStatus;recurring:boolean}
type Payment={id:string;invoiceId:string;method:PaymentMethod;reference:string;amount:number;date:string;status:'Aplicado'}

const seedInvoices:Invoice[]=[
  {id:'FAC-2025-1002',client:'Finvest',concept:'Servicios profesionales',amount:41763,issued:'Feb 9, 2025',due:'Feb 24, 2025',status:'Pagada',recurring:false},
  {id:'FAC-2025-1023',client:'Cobalt',concept:'Servicios profesionales',amount:14589,issued:'May 8, 2025',due:'May 24, 2025',status:'Pagada',recurring:false},
  {id:'FAC-2025-1003',client:'Helix Labs',concept:'Servicios profesionales',amount:31712,issued:'Mar 8, 2025',due:'Mar 24, 2025',status:'Pagada',recurring:false},
  {id:'FAC-2025-1015',client:'Cobalt',concept:'Servicios profesionales',amount:57538,issued:'Apr 9, 2025',due:'Apr 24, 2025',status:'Pagada',recurring:false},
  {id:'FAC-2025-1011',client:'BluePeak',concept:'Consultoría estratégica',amount:27582,issued:'Mar 9, 2025',due:'Mar 24, 2025',status:'Pagada',recurring:false},
  {id:'FAC-2025-1018',client:'Finvest',concept:'Servicios profesionales',amount:31647,issued:'Jun 9, 2025',due:'Jun 24, 2025',status:'Pendiente',recurring:false},
  {id:'FAC-2025-1014',client:'Northwind',concept:'Servicios profesionales',amount:31257,issued:'Apr 8, 2025',due:'Apr 24, 2025',status:'Pendiente',recurring:false},
  {id:'FAC-2025-1010',client:'Lumen',concept:'Servicios administrados',amount:48114,issued:'Jun 9, 2025',due:'Jun 24, 2025',status:'Borrador',recurring:false},
  {id:'FAC-2025-1007',client:'Cobalt',concept:'Servicios profesionales',amount:57538,issued:'May 9, 2025',due:'May 24, 2025',status:'Pendiente',recurring:false},
  {id:'FAC-2025-1004',client:'BluePeak',concept:'Implementación',amount:70957,issued:'Apr 9, 2025',due:'Apr 24, 2025',status:'Pendiente',recurring:false},
  {id:'FAC-2025-1022',client:'Northwind',concept:'Servicios profesionales',amount:44110,issued:'Apr 9, 2025',due:'Apr 24, 2025',status:'Vencida',recurring:false},
  {id:'FAC-2025-1008',client:'Lumen',concept:'Servicios profesionales',amount:27407,issued:'Feb 9, 2025',due:'Feb 24, 2025',status:'Vencida',recurring:false},
  {id:'FAC-2025-1016',client:'Lumen',concept:'Servicios profesionales',amount:32681,issued:'Apr 9, 2025',due:'Apr 24, 2025',status:'Vencida',recurring:false},
  {id:'FAC-2025-1024',client:'Lumen',concept:'Servicios profesionales',amount:52506,issued:'Jun 9, 2025',due:'Jun 24, 2025',status:'Vencida',recurring:false},
  {id:'FAC-2025-1014-V',client:'Northwind',concept:'Servicios profesionales',amount:12657,issued:'Apr 9, 2025',due:'Apr 24, 2025',status:'Vencida',recurring:false},
  {id:'FAC-2025-1019',client:'Cobalt',concept:'Servicios administrados',amount:30518,issued:'May 9, 2025',due:'May 24, 2025',status:'Vencida',recurring:false},
]

const invoiceDocs=['Factura CFDI 4.0','Nota de crédito','Complemento de pago','Estado de cuenta del cliente','Reporte de cartera por cobrar','Reporte de ingresos del periodo','Plantilla de facturación recurrente','Checklist de cierre fiscal']
const invoiceKnowledge=['Código Fiscal de la Federación (México)','Reglas de Resolución Miscelánea Fiscal','Guía de llenado de CFDI 4.0','Catálogo de productos y servicios SAT','NIF de ingresos','ISO 27001 (datos fiscales)']
const invoiceSuggestions=['Dame un análisis de la cartera por cobrar','¿Qué facturas están vencidas?','Genera un reporte de ingresos del periodo']

const money=(v:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

export default function InvoiceModule({department,onBackFinance,onOpenWorkspace}:{department:Department;onBackFinance:()=>void;onOpenWorkspace:(title:string,body?:string)=>void}){
  const [tab,setTab]=useState<InvoiceTab>('invoices')
  const [invoices,setInvoices]=useState(seedInvoices)
  const [payments,setPayments]=useState<Payment[]>([])
  const [search,setSearch]=useState('')
  const [invoiceOpen,setInvoiceOpen]=useState(false)
  const [paymentOpen,setPaymentOpen]=useState(false)
  const [newInvoice,setNewInvoice]=useState({client:'',concept:'Servicios profesionales',amount:0,due:'2026-09-15'})
  const [payment,setPayment]=useState({invoiceId:'FAC-2025-1022',method:'Transferencia' as PaymentMethod,reference:'',amount:0})

  const total=invoices.reduce((s,i)=>s+i.amount,0)
  const collected=invoices.filter(i=>i.status==='Pagada').reduce((s,i)=>s+i.amount,0)
  const receivable=invoices.filter(i=>i.status!=='Pagada').reduce((s,i)=>s+i.amount,0)
  const overdue=invoices.filter(i=>i.status==='Vencida')
  const overdueAmount=overdue.reduce((s,i)=>s+i.amount,0)
  const collectionRate=total?collected/total*100:0
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return !q?invoices:invoices.filter(i=>[i.id,i.client,i.concept,i.status].some(v=>v.toLowerCase().includes(q)))},[invoices,search])
  const recurrent=invoices.filter(i=>i.recurring)

  const createInvoice=()=>{
    if(!newInvoice.client.trim()||newInvoice.amount<=0)return
    const id=`FAC-2026-${String(2000+invoices.length+1)}`
    setInvoices(v=>[{id,client:newInvoice.client.trim(),concept:newInvoice.concept.trim()||'Servicios profesionales',amount:Number(newInvoice.amount),issued:new Date().toLocaleDateString('es-MX'),due:newInvoice.due,status:'Borrador',recurring:false},...v])
    setNewInvoice({client:'',concept:'Servicios profesionales',amount:0,due:'2026-09-15'});setInvoiceOpen(false)
  }

  const registerPayment=()=>{
    const inv=invoices.find(i=>i.id===payment.invoiceId);if(!inv)return
    const amount=payment.amount>0?payment.amount:inv.amount
    setPayments(v=>[{id:`PAY-${Date.now()}`,invoiceId:inv.id,method:payment.method,reference:payment.reference||'Sin referencia',amount,date:new Date().toLocaleDateString('es-MX'),status:'Aplicado'},...v])
    if(amount>=inv.amount)setInvoices(v=>v.map(i=>i.id===inv.id?{...i,status:'Pagada'}:i))
    setPaymentOpen(false);setPayment(p=>({...p,reference:'',amount:0}))
  }

  const markPaid=(id:string)=>setInvoices(v=>v.map(i=>i.id===id?{...i,status:'Pagada'}:i))
  const toggleRecurring=(id:string)=>setInvoices(v=>v.map(i=>i.id===id?{...i,recurring:!i.recurring}:i))

  const openInvoiceDoc=(title:string)=>onOpenWorkspace(title,`# ${title}\n\n**Departamento:** Facturación Inteligente\n**Agente:** INVOICER\n\n## Resumen de cartera\n- Total facturado: ${money(total)}\n- Cobrado: ${money(collected)}\n- Por cobrar: ${money(receivable)}\n- Vencido: ${money(overdueAmount)}\n- Tasa de cobranza: ${collectionRate.toFixed(1)}%\n\n## Cliente / receptor\n\n## Conceptos\n\n## Impuestos\n\n## Condiciones de pago\n\n## Evidencia y autorizaciones\n\n> Documento operativo editable. El timbrado CFDI requiere integración SAT/PAC y certificados reales.\n`)

  return <div className="invoice-module">
    <header className="invoice-heading"><span className="invoice-icon"><ReceiptText size={25}/></span><div><h1>Facturación Inteligente</h1><p>CFDI, cobranza, notas de crédito y cuentas por cobrar</p></div></header>
    <div className="invoice-heading-actions"><button onClick={onBackFinance}><ArrowLeft size={15}/>Finanzas</button><button className="invoice-primary" onClick={()=>setInvoiceOpen(true)}><Plus size={16}/>Nueva factura</button></div>

    <nav className="invoice-tabs">
      <button className={tab==='invoices'?'active':''} onClick={()=>setTab('invoices')}>Facturas</button>
      <button className={tab==='payments'?'active':''} onClick={()=>setTab('payments')}>Pagos</button>
      <button className={tab==='recurring'?'active':''} onClick={()=>setTab('recurring')}>Recurrente</button>
      <button className={tab==='agent'?'active':''} onClick={()=>setTab('agent')}><Sparkles size={14}/>INVOICER AI</button>
    </nav>

    {tab==='invoices'&&<>
      <div className="invoice-kpis"><InvoiceKpi label="Total facturado" value={money(total)}/><InvoiceKpi label="Cobrado" value={money(collected)}/><InvoiceKpi label="Por cobrar" value={money(receivable)}/><InvoiceKpi label="Vencido" value={money(overdueAmount)} detail={`${overdue.length} facturas`}/></div>
      <section className="collection-card"><div><span>Tasa de cobranza</span><b><TrendingUp size={18}/>{collectionRate.toFixed(1)}%</b></div><div className="collection-bar"><i style={{width:`${Math.min(100,collectionRate)}%`}}/></div></section>

      {overdue.length>0&&<section className="overdue-card"><div className="overdue-title"><AlertTriangle size={20}/><h2>Facturas vencidas ({overdue.length})</h2></div><div className="overdue-list">{overdue.map(i=><article key={i.id}><CalendarClock size={17}/><div><b>{i.id} · {i.client}</b><small>Venció: {i.due}</small></div><strong>{money(i.amount)}</strong><button onClick={()=>markPaid(i.id)}>Marcar pagada</button></article>)}</div></section>}

      <section className="invoice-table-card"><div className="invoice-table-tools"><label><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar factura, cliente o concepto..."/></label><button onClick={()=>openInvoiceDoc('Reporte de cartera por cobrar')}><FileText size={14}/>Reporte</button></div><div className="invoice-table-wrap"><table><thead><tr><th>Folio</th><th>Cliente</th><th>Concepto</th><th>Emisión</th><th>Vence</th><th>Total</th><th>Estado</th></tr></thead><tbody>{filtered.map(i=><tr key={i.id}><td>{i.id}</td><td>{i.client}</td><td>{i.concept}</td><td>{i.issued}</td><td>{i.due}</td><td>{money(i.amount)}</td><td><span className={`invoice-status ${i.status.toLowerCase()}`}>{i.status}</span></td></tr>)}</tbody></table></div></section>
    </>}

    {tab==='payments'&&<section className="invoice-table-card"><div className="invoice-section-head"><div><h2>Pagos y cobranza ({payments.length})</h2><p>Registra cobros y vincúlalos con una factura.</p></div><button className="invoice-primary" onClick={()=>setPaymentOpen(true)}><Plus size={15}/>Registrar pago</button></div><div className="invoice-table-wrap"><table><thead><tr><th>Fecha</th><th>Factura</th><th>Cliente</th><th>Método</th><th>Referencia</th><th>Monto</th><th>Estado</th></tr></thead><tbody>{payments.length===0?<tr><td colSpan={7} className="invoice-empty">Sin pagos registrados</td></tr>:payments.map(p=>{const inv=invoices.find(i=>i.id===p.invoiceId);return <tr key={p.id}><td>{p.date}</td><td>{p.invoiceId}</td><td>{inv?.client}</td><td>{p.method}</td><td>{p.reference}</td><td>{money(p.amount)}</td><td><span className="invoice-status pagada">{p.status}</span></td></tr>})}</tbody></table></div></section>}

    {tab==='recurring'&&<div className="recurring-grid"><section className="invoice-table-card recurring-info"><Sparkles size={20}/><div><h2>Facturación recurrente ({recurrent.length})</h2><p>Activa facturas recurrentes para generar automáticamente facturas periódicas: suscripciones, servicios mensuales y contratos.</p></div>{recurrent.length===0?<div className="invoice-empty">Sin facturas recurrentes activas. Activa la recurrencia desde una factura existente.</div>:<div className="active-recurring">{recurrent.map(i=><div key={i.id}><CheckCircle2 size={15}/><span>{i.id} · {i.client}</span><b>{money(i.amount)}</b></div>)}</div>}</section><section className="invoice-table-card"><h3>FACTURAS DISPONIBLES PARA ACTIVAR RECURRENCIA</h3><div className="recurrence-list">{invoices.filter(i=>!i.recurring).slice(0,12).map(i=><div key={i.id}><span>{i.id} · {i.client} · {money(i.amount)}</span><button onClick={()=>toggleRecurring(i.id)}>Activar</button></div>)}</div></section></div>}

    {tab==='agent'&&<DepartmentAgentWorkspace department={department} documents={invoiceDocs} knowledge={invoiceKnowledge} suggestions={invoiceSuggestions} onOpenWorkspace={onOpenWorkspace}/>} 

    {invoiceOpen&&<div className="invoice-modal-backdrop" onMouseDown={()=>setInvoiceOpen(false)}><div className="invoice-modal" onMouseDown={e=>e.stopPropagation()}><div className="invoice-modal-head"><b>Nueva factura</b><button onClick={()=>setInvoiceOpen(false)}><X size={17}/></button></div><label><span>Cliente</span><input value={newInvoice.client} onChange={e=>setNewInvoice({...newInvoice,client:e.target.value})}/></label><label><span>Concepto</span><input value={newInvoice.concept} onChange={e=>setNewInvoice({...newInvoice,concept:e.target.value})}/></label><label><span>Total</span><input type="number" value={newInvoice.amount} onChange={e=>setNewInvoice({...newInvoice,amount:Number(e.target.value)})}/></label><label><span>Vencimiento</span><input type="date" value={newInvoice.due} onChange={e=>setNewInvoice({...newInvoice,due:e.target.value})}/></label><div className="invoice-modal-note">La factura se crea como borrador. Timbrado fiscal real queda bloqueado hasta integrar SAT/PAC.</div><div className="invoice-modal-actions"><button onClick={()=>setInvoiceOpen(false)}>Cancelar</button><button className="invoice-primary" onClick={createInvoice}>Crear borrador</button></div></div></div>}

    {paymentOpen&&<div className="invoice-modal-backdrop" onMouseDown={()=>setPaymentOpen(false)}><div className="invoice-modal" onMouseDown={e=>e.stopPropagation()}><div className="invoice-modal-head"><b>Registrar pago</b><button onClick={()=>setPaymentOpen(false)}><X size={17}/></button></div><label><span>Factura</span><select value={payment.invoiceId} onChange={e=>setPayment({...payment,invoiceId:e.target.value})}>{invoices.filter(i=>i.status!=='Pagada').map(i=><option key={i.id} value={i.id}>{i.id} · {i.client} · {money(i.amount)}</option>)}</select></label><label><span>Método</span><select value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value as PaymentMethod})}>{['Transferencia','Efectivo','Tarjeta','Cheque'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Monto</span><input type="number" value={payment.amount} onChange={e=>setPayment({...payment,amount:Number(e.target.value)})} placeholder="0 = saldo total"/></label><label><span>Referencia</span><input value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></label><div className="invoice-modal-actions"><button onClick={()=>setPaymentOpen(false)}>Cancelar</button><button className="invoice-primary" onClick={registerPayment}>Registrar pago</button></div></div></div>}
  </div>
}

function InvoiceKpi({label,value,detail}:{label:string;value:string;detail?:string}){return <div className="invoice-kpi"><span>{label}</span><b>{value}</b>{detail&&<small>{detail}</small>}</div>}
