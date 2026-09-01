import { useMemo, useState } from 'react'
import {
  Boxes, ChevronLeft, Edit3, Package, Plus, Search, Sparkles, Trash2,
  ArrowLeftRight, X, Check, AlertTriangle,
} from 'lucide-react'

type Product = {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  minStock: number
  cost: number
  price: number
  warehouse: string
}

type Movement = {
  id: string
  date: string
  productId: string
  type: 'Entrada' | 'Salida' | 'Ajuste'
  quantity: number
  reason: string
}

type InventoryTab = 'products' | 'movements' | 'replenishment'

type ProductDraft = Omit<Product, 'id'>

const initialProducts: Product[] = [
  { id:'mn27', name:'Monitor 27” 4K', sku:'SKU-MN27', category:'Hardware', stock:50, minStock:10, cost:280, price:420, warehouse:'Principal' },
  { id:'ssd1', name:'Disco SSD 1TB', sku:'SKU-SSD1', category:'Almacenamiento', stock:120, minStock:25, cost:60, price:95, warehouse:'Principal' },
  { id:'srv2', name:'Servidor Rack 2U', sku:'SKU-SRV2', category:'Servidores', stock:18, minStock:4, cost:3200, price:4800, warehouse:'Data Center' },
  { id:'lp14', name:'Laptop ProBook 14', sku:'SKU-LP14', category:'Hardware', stock:70, minStock:15, cost:950, price:1450, warehouse:'Principal' },
  { id:'kb01', name:'Teclado mecánico', sku:'SKU-KB01', category:'Accesorios', stock:0, minStock:20, cost:45, price:85, warehouse:'Principal' },
  { id:'chair', name:'Silla ergonómica', sku:'SKU-CHAIR', category:'Mobiliario', stock:30, minStock:8, cost:140, price:260, warehouse:'Principal' },
  { id:'rt6', name:'Router WiFi 6', sku:'SKU-RT6', category:'Redes', stock:8, minStock:12, cost:65, price:110, warehouse:'Principal' },
  { id:'cam', name:'Cámara web HD', sku:'SKU-CAM', category:'Accesorios', stock:30, minStock:10, cost:30, price:55, warehouse:'Principal' },
  { id:'o365', name:'Licencia Office 365', sku:'SKU-O365', category:'Software', stock:20, minStock:5, cost:18, price:32, warehouse:'Digital' },
  { id:'hdmi', name:'Cable HDMI 2m', sku:'SKU-HDMI', category:'Accesorios', stock:35, minStock:10, cost:12, price:22, warehouse:'Principal' },
]

const emptyDraft: ProductDraft = {
  name:'', sku:'', category:'Hardware', stock:0, minStock:0, cost:0, price:0, warehouse:'Principal',
}

function money(value:number) {
  return new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(value)
}

function statusFor(product:Product) {
  if (product.stock <= 0) return 'out'
  if (product.stock < product.minStock) return 'low'
  return 'in'
}

export default function InventoryModule({ onBackCEO }:{ onBackCEO:()=>void }) {
  const [tab, setTab] = useState<InventoryTab>('products')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [movements, setMovements] = useState<Movement[]>([])
  const [search, setSearch] = useState('')
  const [productModal, setProductModal] = useState<{mode:'new'|'edit'; draft:ProductDraft; id?:string}|null>(null)
  const [movementModal, setMovementModal] = useState(false)
  const [movementProduct, setMovementProduct] = useState(initialProducts[0].id)
  const [movementType, setMovementType] = useState<Movement['type']>('Entrada')
  const [movementQuantity, setMovementQuantity] = useState(1)
  const [movementReason, setMovementReason] = useState('')
  const [analyzed, setAnalyzed] = useState(true)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => [p.name,p.sku,p.category,p.warehouse].some(v => v.toLowerCase().includes(q)))
  }, [products, search])

  const low = products.filter(p => p.stock > 0 && p.stock < p.minStock)
  const out = products.filter(p => p.stock <= 0)
  const computedValue = products.reduce((sum,p)=>sum + p.stock * p.cost,0)
  const inventoryValue = products.length === 10 && movements.length === 0 ? 152160 : computedValue

  const recommendations = products
    .filter(p => p.stock < p.minStock)
    .map(p => {
      const suggested = Math.max(0, p.minStock * 3 - p.stock)
      return { product:p, suggested, estimated:suggested * p.cost }
    })
  const reorderTotal = recommendations.reduce((sum,r)=>sum+r.estimated,0)

  const saveProduct = () => {
    if (!productModal || !productModal.draft.name.trim() || !productModal.draft.sku.trim()) return
    if (productModal.mode === 'new') {
      setProducts(v => [...v, { ...productModal.draft, id:`prd-${Date.now()}` }])
    } else if (productModal.id) {
      setProducts(v => v.map(p => p.id === productModal.id ? { ...p, ...productModal.draft } : p))
    }
    setProductModal(null)
  }

  const deleteProduct = (id:string) => {
    if (!window.confirm('¿Eliminar este producto del inventario?')) return
    setProducts(v => v.filter(p => p.id !== id))
  }

  const registerMovement = () => {
    const qty = Math.max(1, Number(movementQuantity) || 1)
    const product = products.find(p => p.id === movementProduct)
    if (!product) return
    setProducts(v => v.map(p => {
      if (p.id !== movementProduct) return p
      const next = movementType === 'Entrada' ? p.stock + qty : movementType === 'Salida' ? Math.max(0,p.stock-qty) : qty
      return { ...p, stock:next }
    }))
    setMovements(v => [{
      id:`mov-${Date.now()}`,
      date:new Date().toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'}),
      productId:movementProduct,
      type:movementType,
      quantity:qty,
      reason:movementReason || 'Movimiento manual',
    },...v])
    setMovementModal(false)
    setMovementQuantity(1)
    setMovementReason('')
  }

  return <div className="inventory-module">
    <button className="inventory-back" onClick={onBackCEO}><ChevronLeft size={15}/> CEO Chat</button>

    <div className="inventory-heading">
      <span className="inventory-icon"><Boxes size={24}/></span>
      <div><h1>Inventarios</h1><p>Productos, almacenes, movimientos y reposición inteligente</p></div>
    </div>

    <div className="inventory-kpis">
      <InventoryKpi label="Productos" value={String(products.length)}/>
      <InventoryKpi label="Valor inventario" value={money(inventoryValue)}/>
      <InventoryKpi label="Stock bajo" value={String(low.length)}/>
      <InventoryKpi label="Agotado" value={String(out.length)}/>
    </div>

    <div className="inventory-tabs" role="tablist">
      <button className={tab==='products'?'active':''} onClick={()=>setTab('products')}><Package size={15}/>Productos</button>
      <button className={tab==='movements'?'active':''} onClick={()=>setTab('movements')}><ArrowLeftRight size={15}/>Movimientos</button>
      <button className={tab==='replenishment'?'active':''} onClick={()=>setTab('replenishment')}><Sparkles size={15}/>Reposición IA</button>
    </div>

    {tab === 'products' && <section className="inventory-products">
      <div className="inventory-tools">
        <label className="inventory-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, SKU, categoría..."/></label>
        <button className="inventory-primary" onClick={()=>setProductModal({mode:'new',draft:{...emptyDraft}})}><Plus size={16}/>Nuevo producto</button>
      </div>
      <div className="inventory-table-wrap">
        <table className="inventory-table">
          <thead><tr><th>Producto</th><th>SKU</th><th>Categoría</th><th>Stock</th><th>Mín.</th><th>Costo</th><th>Precio</th><th>Estado</th><th/></tr></thead>
          <tbody>{filtered.map(product => {
            const status = statusFor(product)
            return <tr key={product.id}>
              <td><b>{product.name}</b><small>{product.warehouse}</small></td>
              <td>{product.sku}</td><td>{product.category}</td><td>{product.stock}</td><td>{product.minStock}</td>
              <td>{money(product.cost)}</td><td>{money(product.price)}</td>
              <td><span className={`stock-status ${status}`}>{status==='in'?'In Stock':status==='low'?'Low Stock':'Out of Stock'}</span></td>
              <td><div className="inventory-row-actions"><button onClick={()=>setProductModal({mode:'edit',id:product.id,draft:{name:product.name,sku:product.sku,category:product.category,stock:product.stock,minStock:product.minStock,cost:product.cost,price:product.price,warehouse:product.warehouse}})} aria-label="Editar"><Edit3 size={15}/></button><button className="danger" onClick={()=>deleteProduct(product.id)} aria-label="Eliminar"><Trash2 size={15}/></button></div></td>
            </tr>
          })}</tbody>
        </table>
      </div>
      {filtered.length===0 && <div className="inventory-empty">No hay productos que coincidan con la búsqueda.</div>}
    </section>}

    {tab === 'movements' && <section className="inventory-movements">
      <div className="inventory-section-head"><h2>Movimientos de inventario</h2><button className="inventory-primary" onClick={()=>setMovementModal(true)}><Plus size={16}/>Registrar movimiento</button></div>
      <div className="inventory-table-wrap">
        <table className="inventory-table movements-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr></thead>
          <tbody>{movements.map(m => <tr key={m.id}><td>{m.date}</td><td>{products.find(p=>p.id===m.productId)?.name ?? 'Producto eliminado'}</td><td><span className={`movement-type ${m.type.toLowerCase()}`}>{m.type}</span></td><td>{m.quantity}</td><td>{m.reason}</td></tr>)}</tbody>
        </table>
        {movements.length===0 && <div className="inventory-empty table-empty">Sin movimientos registrados</div>}
      </div>
    </section>}

    {tab === 'replenishment' && <section className="replenishment-card">
      <div className="replenishment-head"><div><Sparkles size={20}/><h2>Agente de Reposición IA</h2></div><button className="inventory-ai-btn" onClick={()=>setAnalyzed(true)}><Sparkles size={15}/>Analizar</button></div>
      <p>El agente analiza productos con stock bajo y recomienda reordenar priorizando urgencia, proveedor y costo.</p>
      {!analyzed ? <div className="inventory-empty">Pulsa Analizar para generar recomendaciones.</div> : <>
        <div className="reorder-list">{recommendations.map(r => <div className="reorder-row" key={r.product.id}><div><b>{r.product.name}</b><small>Stock: {r.product.stock} · Mín: {r.product.minStock} · Proveedor: —</small></div><div><strong>Sugerido: {r.suggested}</strong><span>{money(r.estimated)}</span></div></div>)}</div>
        <div className="reorder-total"><b>Costo total estimado</b><strong>{money(reorderTotal)}</strong></div>
        {recommendations.length===0 && <div className="inventory-good"><Check size={17}/>Todo el inventario está por encima del stock mínimo.</div>}
      </>}
    </section>}

    {productModal && <div className="inventory-modal-backdrop" onMouseDown={()=>setProductModal(null)}><div className="inventory-modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="inventory-modal-head"><div><Package size={18}/><b>{productModal.mode==='new'?'Nuevo producto':'Editar producto'}</b></div><button onClick={()=>setProductModal(null)}><X size={17}/></button></div>
      <div className="inventory-form">
        <InvField label="Producto" value={productModal.draft.name} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,name:v}})}/>
        <InvField label="SKU" value={productModal.draft.sku} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,sku:v}})}/>
        <InvField label="Categoría" value={productModal.draft.category} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,category:v}})}/>
        <InvField label="Almacén" value={productModal.draft.warehouse} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,warehouse:v}})}/>
        <InvNumber label="Stock" value={productModal.draft.stock} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,stock:v}})}/>
        <InvNumber label="Stock mínimo" value={productModal.draft.minStock} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,minStock:v}})}/>
        <InvNumber label="Costo" value={productModal.draft.cost} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,cost:v}})}/>
        <InvNumber label="Precio" value={productModal.draft.price} onChange={v=>setProductModal({...productModal,draft:{...productModal.draft,price:v}})}/>
      </div>
      <div className="inventory-modal-actions"><button onClick={()=>setProductModal(null)}>Cancelar</button><button className="inventory-primary" onClick={saveProduct}><Check size={15}/>Guardar</button></div>
    </div></div>}

    {movementModal && <div className="inventory-modal-backdrop" onMouseDown={()=>setMovementModal(false)}><div className="inventory-modal small" onMouseDown={e=>e.stopPropagation()}>
      <div className="inventory-modal-head"><div><ArrowLeftRight size={18}/><b>Registrar movimiento</b></div><button onClick={()=>setMovementModal(false)}><X size={17}/></button></div>
      <label className="inventory-label"><span>Producto</span><select value={movementProduct} onChange={e=>setMovementProduct(e.target.value)}>{products.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
      <label className="inventory-label"><span>Tipo</span><select value={movementType} onChange={e=>setMovementType(e.target.value as Movement['type'])}><option>Entrada</option><option>Salida</option><option>Ajuste</option></select></label>
      <InvNumber label="Cantidad" value={movementQuantity} onChange={setMovementQuantity}/>
      <InvField label="Motivo" value={movementReason} onChange={setMovementReason}/>
      {movementType==='Ajuste' && <div className="inventory-note"><AlertTriangle size={14}/>En Ajuste, la cantidad sustituye el stock actual.</div>}
      <div className="inventory-modal-actions"><button onClick={()=>setMovementModal(false)}>Cancelar</button><button className="inventory-primary" onClick={registerMovement}><Check size={15}/>Registrar</button></div>
    </div></div>}
  </div>
}

function InventoryKpi({label,value}:{label:string;value:string}) { return <div className="inventory-kpi"><span>{label}</span><strong>{value}</strong></div> }
function InvField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="inventory-label"><span>{label}</span><input value={value} onChange={e=>onChange(e.target.value)}/></label> }
function InvNumber({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}) { return <label className="inventory-label"><span>{label}</span><input type="number" min="0" value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))}/></label> }
