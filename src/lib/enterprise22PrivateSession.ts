import { createClient, type Session } from '@supabase/supabase-js'
import { useEffect, useSyncExternalStore } from 'react'

export type Enterprise22Company={
  id:string
  name:string
  legal_name?:string|null
  sector_ids?:string[]
  metadata?:Record<string,unknown>
}

export type Enterprise22PrivateContext={
  tenant:{id:string;name:string;slug:string}
  role:'owner'|'admin'|'member'|'viewer'|string
  company:Enterprise22Company
  companies:Enterprise22Company[]
  department_key?:string|null
  department_state?:Record<string,unknown>
  private_ready:true
  context_version:number
}

export type Enterprise22PrivateMessage={id:string;role:'user'|'assistant';content:string;created_at:string}
export type Enterprise22PrivateConversation={id:string;department_key:string;title:string;messages:Enterprise22PrivateMessage[]}

type Status='unconfigured'|'guest'|'loading'|'private'|'error'
export type Enterprise22PrivateState={
  status:Status
  session:Session|null
  accessToken:string
  userEmail:string
  context:Enterprise22PrivateContext|null
  notice:string
  error:string
}

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
const client=supabaseUrl&&publishableKey?createClient(supabaseUrl,publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null
const listeners=new Set<()=>void>()
let initialized=false
let authSubscription:{unsubscribe:()=>void}|null=null
let activationVersion=0
let state:Enterprise22PrivateState=client
  ?{status:'guest',session:null,accessToken:'',userEmail:'',context:null,notice:'',error:''}
  :{status:'unconfigured',session:null,accessToken:'',userEmail:'',context:null,notice:'Supabase Private AI no está configurado.',error:''}

function emit(next:Partial<Enterprise22PrivateState>){state={...state,...next};listeners.forEach(fn=>fn())}
function subscribe(fn:()=>void){listeners.add(fn);return()=>listeners.delete(fn)}
function snapshot(){return state}
function savedCompanyId(){try{return localStorage.getItem('wae22.private.company')||null}catch{return null}}
function saveCompanyId(id:string){try{localStorage.setItem('wae22.private.company',id)}catch{}}

async function loadContext(companyId?:string|null){
  if(!client)throw new Error('private_ai_unconfigured')
  const {data,error}=await client.rpc('wae_enterprise22_private_context',{p_company_id:companyId||null,p_department_key:null})
  if(error)throw error
  const context=data as Enterprise22PrivateContext
  if(!context?.private_ready||!context.company?.id)throw new Error('private_context_unavailable')
  saveCompanyId(context.company.id)
  return context
}

async function activateSession(session:Session){
  if(!client)return
  const version=++activationVersion
  emit({status:'loading',session,accessToken:session.access_token,userEmail:session.user.email||'',context:null,error:'',notice:'Sincronizando contexto privado…'})
  try{
    const boot=await client.rpc('wae_enterprise22_bootstrap_private_context')
    if(boot.error)throw boot.error
    let requested=savedCompanyId()
    const bootCompany=(boot.data as {company_id?:string}|null)?.company_id
    if(!requested&&bootCompany)requested=bootCompany
    let context:Enterprise22PrivateContext
    try{context=await loadContext(requested)}catch{context=await loadContext(bootCompany||null)}
    if(version!==activationVersion)return
    emit({status:'private',session,accessToken:session.access_token,userEmail:session.user.email||'',context,error:'',notice:'Private AI activo'})
  }catch(error){
    if(version!==activationVersion)return
    emit({status:'error',session,accessToken:session.access_token,userEmail:session.user.email||'',context:null,error:error instanceof Error?error.message:'private_context_failed',notice:'No se pudo abrir el contexto privado.'})
  }
}

export async function initializeEnterprise22PrivateSession(){
  if(initialized||!client)return
  initialized=true
  const current=await client.auth.getSession()
  if(current.data.session)await activateSession(current.data.session)
  else emit({status:'guest',session:null,accessToken:'',userEmail:'',context:null,error:'',notice:''})
  const {data}=client.auth.onAuthStateChange((_event,session)=>{
    if(session)void activateSession(session)
    else{activationVersion++;emit({status:'guest',session:null,accessToken:'',userEmail:'',context:null,error:'',notice:''})}
  })
  authSubscription=data.subscription
}

export function useEnterprise22PrivateSession(){
  useEffect(()=>{void initializeEnterprise22PrivateSession()},[])
  return useSyncExternalStore(subscribe,snapshot,snapshot)
}

export async function signInEnterprise22(email:string,password:string){
  if(!client)throw new Error('private_ai_unconfigured')
  emit({status:'loading',notice:'Validando identidad…',error:''})
  const {data,error}=await client.auth.signInWithPassword({email:email.trim(),password})
  if(error){emit({status:'guest',notice:'',error:error.message});throw error}
  if(data.session)await activateSession(data.session)
}

export async function signUpEnterprise22(email:string,password:string){
  if(!client)throw new Error('private_ai_unconfigured')
  emit({status:'loading',notice:'Creando acceso privado…',error:''})
  const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:location.origin}})
  if(error){emit({status:'guest',notice:'',error:error.message});throw error}
  if(data.session)await activateSession(data.session)
  else emit({status:'guest',session:null,accessToken:'',userEmail:email.trim(),context:null,error:'',notice:'Cuenta creada. Revisa tu correo para confirmar el acceso.'})
}

export async function signOutEnterprise22(){
  if(!client)return
  activationVersion++
  await client.auth.signOut()
  emit({status:'guest',session:null,accessToken:'',userEmail:'',context:null,error:'',notice:''})
}

export async function selectEnterprise22Company(companyId:string){
  if(!client||!state.session)throw new Error('authentication_required')
  emit({status:'loading',notice:'Cambiando empresa…',error:''})
  try{
    const context=await loadContext(companyId)
    emit({status:'private',context,session:state.session,accessToken:state.session.access_token,userEmail:state.session.user.email||'',notice:'Private AI activo',error:''})
  }catch(error){
    emit({status:'error',notice:'No se pudo cambiar de empresa.',error:error instanceof Error?error.message:'company_switch_failed'})
    throw error
  }
}

export async function loadLatestEnterprise22Conversation(departmentKey:string):Promise<Enterprise22PrivateConversation|null>{
  if(!client||state.status!=='private'||!state.context?.company.id)return null
  const companyId=state.context.company.id
  const {data:conversation,error}=await client.from('wae_enterprise22_conversations')
    .select('id,department_key,title,updated_at')
    .eq('company_id',companyId)
    .eq('department_key',departmentKey)
    .is('archived_at',null)
    .order('updated_at',{ascending:false})
    .limit(1)
    .maybeSingle()
  if(error)throw error
  if(!conversation)return null
  const {data:messages,error:messageError}=await client.from('wae_enterprise22_messages')
    .select('id,role,content,created_at')
    .eq('conversation_id',conversation.id)
    .order('created_at',{ascending:true})
    .limit(60)
  if(messageError)throw messageError
  return{
    id:String(conversation.id),
    department_key:String(conversation.department_key),
    title:String(conversation.title||'Conversación privada'),
    messages:(messages||[]).filter(row=>row.role==='user'||row.role==='assistant').map(row=>({id:String(row.id),role:row.role as 'user'|'assistant',content:String(row.content||''),created_at:String(row.created_at||'')})),
  }
}

export function disposeEnterprise22PrivateSession(){authSubscription?.unsubscribe();authSubscription=null;initialized=false}
