import { useState } from 'react'
import { Building2, CheckCircle2, LockKeyhole, LogIn, LogOut, ShieldCheck, X } from 'lucide-react'
import {
  selectEnterprise22Company,
  signInEnterprise22,
  signOutEnterprise22,
  signUpEnterprise22,
  useEnterprise22PrivateSession,
} from './lib/enterprise22PrivateSession'
import './enterprise22-private.css'

export default function Enterprise22PrivateDock(){
  const privateState=useEnterprise22PrivateSession()
  const [open,setOpen]=useState(false)
  const [mode,setMode]=useState<'signin'|'signup'>('signin')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [formError,setFormError]=useState('')

  if(privateState.status==='unconfigured')return null
  const isPrivate=privateState.status==='private'&&!!privateState.context
  const label=isPrivate?`Private AI · ${privateState.context?.company.name}`:privateState.status==='loading'?'Private AI · sincronizando':'Activar Private AI'

  const submit=async()=>{
    if(!email.trim()||password.length<6){setFormError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');return}
    setBusy(true);setFormError('')
    try{
      if(mode==='signin')await signInEnterprise22(email,password)
      else await signUpEnterprise22(email,password)
      if(mode==='signin')setOpen(false)
    }catch(error){setFormError(error instanceof Error?error.message:'No se pudo completar el acceso.')}
    finally{setBusy(false)}
  }

  return <>
    <button className={`wae-private-dock ${isPrivate?'active':''}`} onClick={()=>setOpen(true)}>
      <span className="wae-private-dock-icon">{isPrivate?<ShieldCheck size={15}/>:<LockKeyhole size={15}/>}</span>
      <span><b>{label}</b><small>{isPrivate?`${privateState.context?.role} · memoria privada por empresa`:'Identidad · RLS · memoria privada'}</small></span>
      <i/>
    </button>

    {open&&<div className="wae-private-backdrop" onMouseDown={event=>{if(event.currentTarget===event.target)setOpen(false)}}>
      <section className="wae-private-panel">
        <header>
          <div className="wae-private-brand"><div><ShieldCheck size={18}/></div><span><small>WAE OS ENTERPRISE 22</small><b>Private Enterprise Intelligence</b></span></div>
          <button className="wae-private-close" onClick={()=>setOpen(false)}><X size={17}/></button>
        </header>

        {isPrivate?<div className="wae-private-account">
          <div className="wae-private-status-card"><CheckCircle2 size={19}/><div><b>Contexto privado activo</b><span>{privateState.userEmail}</span><small>El acceso a empresa y conversaciones está gobernado por JWT + RLS.</small></div></div>
          <label className="wae-private-field"><span>Empresa activa</span><div className="wae-private-select-wrap"><Building2 size={15}/><select value={privateState.context?.company.id} onChange={event=>void selectEnterprise22Company(event.target.value)}>{privateState.context?.companies.map(company=><option key={company.id} value={company.id}>{company.name}</option>)}</select></div></label>
          <div className="wae-private-grid"><div><span>Organización</span><b>{privateState.context?.tenant.name}</b></div><div><span>Rol</span><b>{privateState.context?.role}</b></div><div><span>Memoria</span><b>Privada</b></div><div><span>Schema</span><b>v2</b></div></div>
          <div className="wae-private-copy"><ShieldCheck size={15}/><p>Los directores solo reciben contexto recuperado con tu JWT. El proxy no usa service-role y no puede saltarse las políticas de acceso.</p></div>
          <button className="wae-private-signout" onClick={()=>{void signOutEnterprise22();setOpen(false)}}><LogOut size={15}/>Cerrar sesión privada</button>
        </div>:<div className="wae-private-auth">
          <div className="wae-private-hero"><LockKeyhole size={24}/><h3>Haz que los 22 directores conozcan tu empresa.</h3><p>Al iniciar sesión, WAE activa contexto privado, empresa autorizada y memoria conversacional aislada.</p></div>
          <div className="wae-private-tabs"><button className={mode==='signin'?'active':''} onClick={()=>setMode('signin')}>Entrar</button><button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>Crear acceso</button></div>
          <label className="wae-private-field"><span>Correo</span><input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="correo@empresa.com" autoComplete="email"/></label>
          <label className="wae-private-field"><span>Contraseña</span><input type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={mode==='signin'?'current-password':'new-password'} onKeyDown={event=>{if(event.key==='Enter')void submit()}}/></label>
          {(formError||privateState.error)&&<div className="wae-private-error">{formError||privateState.error}</div>}
          {privateState.notice&&<div className="wae-private-notice">{privateState.notice}</div>}
          <button className="wae-private-submit" disabled={busy||privateState.status==='loading'} onClick={()=>void submit()}><LogIn size={16}/>{busy||privateState.status==='loading'?'Validando…':mode==='signin'?'Activar Private AI':'Crear acceso privado'}</button>
          <div className="wae-private-footnote">La publishable key es pública por diseño. Las tablas privadas permanecen cerradas por RLS y requieren identidad autenticada.</div>
        </div>}
      </section>
    </div>}
  </>
}
