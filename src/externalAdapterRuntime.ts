import { enterpriseSupabase, enterpriseSupabaseConfigured } from './supabaseEnterprise'

export type ExternalAdapter={
  id:string
  adapter_key:string
  display_name:string
  target_system:string
  capabilities:string[]
  status:'Disabled'|'Configured'|'Available'|'Degraded'
  risk_ceiling:'Bajo'|'Medio'|'Alto'|'Crítico'
  adapter_version:number
  environment:'Sandbox'|'Production'
  endpoint_url:string|null
  allowed_host:string|null
  health_path:string
  auth_scheme:'None'|'Bearer'|'ApiKey'|'HMAC-SHA256'
  production_enabled:boolean
  timeout_ms:number
  circuit_state:'Closed'|'Open'|'Half-open'
  consecutive_failures:number
  success_count:number
  failure_count:number
  next_probe_at:string|null
  last_health_at:string|null
  last_health_status:string|null
  last_health_code:number|null
  last_health_latency_ms:number|null
  metadata:Record<string,unknown>
}

export type ExternalRequest={
  id:string
  adapter_key:string
  request_kind:'Execution'|'Health'
  environment:'Sandbox'|'Production'
  capability:string|null
  correlation_id:string
  status:'Prepared'|'In flight'|'Succeeded'|'Failed'|'Timed out'
  method:'GET'|'POST'
  endpoint_host:string
  endpoint_path:string
  response_status:number|null
  response_hash:string|null
  response_meta:Record<string,unknown>
  error:string|null
  started_at:string
  completed_at:string|null
}

export type ExternalAdapterDraft={
  adapterKey:string
  displayName:string
  targetSystem:string
  capabilities:string
  environment:'Sandbox'|'Production'
  endpointUrl:string
  allowedHost:string
  healthPath:string
  authScheme:'None'|'Bearer'|'ApiKey'|'HMAC-SHA256'
  riskCeiling:'Bajo'|'Medio'|'Alto'|'Crítico'
  timeoutMs:number
}

function client(){
  if(!enterpriseSupabaseConfigured||!enterpriseSupabase)throw new Error('Supabase Enterprise22 no está configurado.')
  return enterpriseSupabase
}

export async function listExternalAdapters(tenantId:string):Promise<ExternalAdapter[]>{
  const {data,error}=await client()
    .from('wae_enterprise22_adapter_registry')
    .select('id,adapter_key,display_name,target_system,capabilities,status,risk_ceiling,adapter_version,environment,endpoint_url,allowed_host,health_path,auth_scheme,production_enabled,timeout_ms,circuit_state,consecutive_failures,success_count,failure_count,next_probe_at,last_health_at,last_health_status,last_health_code,last_health_latency_ms,metadata')
    .eq('tenant_id',tenantId)
    .not('endpoint_url','is',null)
    .order('updated_at',{ascending:false})
  if(error)throw error
  return (data??[]) as ExternalAdapter[]
}

export async function listExternalRequests(tenantId:string):Promise<ExternalRequest[]>{
  const {data,error}=await client()
    .from('wae_enterprise22_external_requests')
    .select('id,adapter_key,request_kind,environment,capability,correlation_id,status,method,endpoint_host,endpoint_path,response_status,response_hash,response_meta,error,started_at,completed_at')
    .eq('tenant_id',tenantId)
    .order('created_at',{ascending:false})
    .limit(12)
  if(error)throw error
  return (data??[]) as ExternalRequest[]
}

export async function upsertExternalAdapter(tenantId:string,draft:ExternalAdapterDraft){
  const capabilities=draft.capabilities.split(',').map(v=>v.trim()).filter(Boolean)
  const {data,error}=await client().rpc('wae_enterprise22_upsert_external_adapter',{
    p_tenant_id:tenantId,
    p_adapter_key:draft.adapterKey.trim(),
    p_display_name:draft.displayName.trim(),
    p_target_system:draft.targetSystem.trim(),
    p_capabilities:capabilities,
    p_environment:draft.environment,
    p_endpoint_url:draft.endpointUrl.trim(),
    p_allowed_host:draft.allowedHost.trim().toLowerCase(),
    p_health_path:draft.healthPath.trim()||'/',
    p_auth_scheme:draft.authScheme,
    p_risk_ceiling:draft.riskCeiling,
    p_timeout_ms:draft.timeoutMs,
  })
  if(error)throw error
  return data as Record<string,unknown>
}

export async function rotateExternalAdapterSecret(adapterId:string,secret:string){
  const {data,error}=await client().rpc('wae_enterprise22_rotate_adapter_secret',{p_adapter_id:adapterId,p_secret:secret})
  if(error)throw error
  return data as Record<string,unknown>
}

export async function requestExternalAdapterProbe(adapterId:string){
  const {data,error}=await client().rpc('wae_enterprise22_request_adapter_probe',{p_adapter_id:adapterId})
  if(error)throw error
  return String(data)
}

export async function promoteExternalAdapter(adapterId:string){
  const {data,error}=await client().rpc('wae_enterprise22_promote_adapter',{p_adapter_id:adapterId})
  if(error)throw error
  return String(data)
}
