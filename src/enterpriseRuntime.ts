import { enterpriseSupabase, enterpriseSupabaseConfigured } from './supabaseEnterprise'

export type EnterpriseAuthState={authenticated:boolean;email:string|null;userId:string|null}
export type EnterpriseRuntimeStatus={
  runtime_version:string|null
  worker_status:string|null
  last_tick_at:string|null
  worker_fresh:boolean
  pending:number
  processing:number
  dead_letter:number
  receipts:number
  last_receipt_at:string|null
  claimed_total:number
  delivered_total:number
  failed_total:number
  dead_letter_total:number
}
export type EnterpriseApproval={
  id:string
  command_id:string
  required_role:string
  decision:string
  requested_at:string
  command?:{id:string;command_type:string;target_agent:string;risk:string;summary:string;status:string;correlation_id:string}|null
}
export type EnterpriseReceipt={
  id:string
  aggregate_type:string
  aggregate_id:string
  adapter_key:string
  status:string
  attempt:number
  latency_ms:number
  result:Record<string,unknown>
  error:string|null
  receipt_hash:string
  created_at:string
}

function client(){
  if(!enterpriseSupabaseConfigured||!enterpriseSupabase)throw new Error('Supabase Enterprise22 no está configurado.')
  return enterpriseSupabase
}

export async function getEnterpriseAuthState():Promise<EnterpriseAuthState>{
  if(!enterpriseSupabaseConfigured||!enterpriseSupabase)return {authenticated:false,email:null,userId:null}
  const {data:{session}}=await enterpriseSupabase.auth.getSession()
  return {authenticated:Boolean(session),email:session?.user.email??null,userId:session?.user.id??null}
}

export function onEnterpriseAuthChange(handler:()=>void){
  if(!enterpriseSupabase)return ()=>{}
  const {data:{subscription}}=enterpriseSupabase.auth.onAuthStateChange(()=>handler())
  return ()=>subscription.unsubscribe()
}

export async function signInEnterprise(email:string,password:string){
  const {data,error}=await client().auth.signInWithPassword({email:email.trim(),password})
  if(error)throw error
  return data.session?`Sesión segura iniciada · ${data.user.email??'usuario autenticado'}`:'Sesión no disponible.'
}

export async function signUpEnterprise(email:string,password:string){
  const {data,error}=await client().auth.signUp({email:email.trim(),password})
  if(error)throw error
  return data.session?'Acceso creado y sesión iniciada.':'Acceso creado. Revisa tu correo si Supabase solicita confirmación.'
}

export async function signOutEnterprise(){
  const {error}=await client().auth.signOut()
  if(error)throw error
}

export async function bootstrapEnterpriseOwner(tenantName:string,companyName:string){
  const {data,error}=await client().rpc('wae_enterprise22_bootstrap_owner',{
    p_tenant_name:tenantName.trim()||'WAE OS Enterprise',
    p_company_name:companyName.trim()||'Mi empresa',
  })
  if(error)throw error
  return data as {tenant_id:string;tenant_name:string;company_id:string;company_name:string;role:string;runtime_version:string}
}

export async function getEnterpriseRuntimeStatus(tenantId:string):Promise<EnterpriseRuntimeStatus>{
  const {data,error}=await client().rpc('wae_enterprise22_runtime_status',{p_tenant_id:tenantId})
  if(error)throw error
  return data as EnterpriseRuntimeStatus
}

export async function listEnterpriseApprovals(tenantId:string):Promise<EnterpriseApproval[]>{
  const {data,error}=await client()
    .from('wae_enterprise22_backbone_approvals')
    .select('id,command_id,required_role,decision,requested_at,command:wae_enterprise22_backbone_commands(id,command_type,target_agent,risk,summary,status,correlation_id)')
    .eq('tenant_id',tenantId)
    .eq('decision','Pending')
    .order('requested_at',{ascending:false})
    .limit(8)
  if(error)throw error
  return (data??[]) as unknown as EnterpriseApproval[]
}

export async function decideAndQueueEnterpriseCommand(commandId:string,decision:'Approved'|'Rejected'){
  const {data,error}=await client().rpc('wae_enterprise22_approve_and_queue',{
    p_command_id:commandId,
    p_decision:decision,
    p_reason:decision==='Approved'?'Aprobado desde Enterprise Control Plane.':'Rechazado desde Enterprise Control Plane.',
    p_evidence:{surface:'Enterprise22 Control Plane',human_decision:true},
  })
  if(error)throw error
  return String(data)
}

export async function listEnterpriseReceipts(tenantId:string):Promise<EnterpriseReceipt[]>{
  const {data,error}=await client()
    .from('wae_enterprise22_execution_receipts')
    .select('id,aggregate_type,aggregate_id,adapter_key,status,attempt,latency_ms,result,error,receipt_hash,created_at')
    .eq('tenant_id',tenantId)
    .order('created_at',{ascending:false})
    .limit(8)
  if(error)throw error
  return (data??[]) as EnterpriseReceipt[]
}
