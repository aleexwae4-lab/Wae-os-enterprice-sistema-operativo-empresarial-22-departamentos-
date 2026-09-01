import { enterpriseSupabase, enterpriseSupabaseConfigured } from './supabaseEnterprise'

export type EnterprisePersistenceMode='misconfigured'|'offline'|'reachable'|'durable'
export type EnterprisePersistenceStatus={
  mode:EnterprisePersistenceMode
  configured:boolean
  reachable:boolean
  schemaVersion:number|null
  authenticated:boolean
  tenantId:string|null
  tenantName:string|null
  companyId:string|null
  reason:string
  counts:{events:number;commands:number;workflows:number;approvals:number;outbox:number;audit:number}
}

const zeroCounts=()=>({events:0,commands:0,workflows:0,approvals:0,outbox:0,audit:0})

export async function inspectEnterprisePersistence():Promise<EnterprisePersistenceStatus>{
  const client=enterpriseSupabase
  if(!enterpriseSupabaseConfigured||!client){
    return {mode:'misconfigured',configured:false,reachable:false,schemaVersion:null,authenticated:false,tenantId:null,tenantName:null,companyId:null,reason:'Faltan variables públicas de Supabase.',counts:zeroCounts()}
  }

  const probe=await client
    .from('wae_enterprise22_connection_probe')
    .select('schema_version,service_name')
    .eq('singleton',true)
    .maybeSingle()

  if(probe.error){
    return {mode:'offline',configured:true,reachable:false,schemaVersion:null,authenticated:false,tenantId:null,tenantName:null,companyId:null,reason:`Backend no verificable: ${probe.error.message}`,counts:zeroCounts()}
  }

  const schemaVersion=typeof probe.data?.schema_version==='number'?probe.data.schema_version:null
  const {data:{session}}=await client.auth.getSession()
  if(!session){
    return {mode:'reachable',configured:true,reachable:true,schemaVersion,authenticated:false,tenantId:null,tenantName:null,companyId:null,reason:'Supabase y schema aislado verificados. Se requiere sesión autenticada para escritura durable.',counts:zeroCounts()}
  }

  const tenantResult=await client
    .from('wae_enterprise22_tenants')
    .select('id,name,slug')
    .is('archived_at',null)
    .order('created_at',{ascending:true})
    .limit(1)
    .maybeSingle()

  if(tenantResult.error){
    return {mode:'reachable',configured:true,reachable:true,schemaVersion,authenticated:true,tenantId:null,tenantName:null,companyId:null,reason:`Sesión válida, pero no fue posible resolver tenant Enterprise22: ${tenantResult.error.message}`,counts:zeroCounts()}
  }
  if(!tenantResult.data){
    return {mode:'reachable',configured:true,reachable:true,schemaVersion,authenticated:true,tenantId:null,tenantName:null,companyId:null,reason:'Sesión válida sin tenant Enterprise22 owner asignado.',counts:zeroCounts()}
  }

  const tenantId=String(tenantResult.data.id)
  const companyResult=await client
    .from('wae_enterprise22_companies')
    .select('id')
    .eq('tenant_id',tenantId)
    .is('archived_at',null)
    .order('created_at',{ascending:true})
    .limit(1)
    .maybeSingle()

  const countTable=async(table:string)=>{
    const result=await client.from(table).select('id',{count:'exact',head:true}).eq('tenant_id',tenantId)
    return result.error?0:(result.count??0)
  }
  const [events,commands,workflows,approvals,outbox,audit]=await Promise.all([
    countTable('wae_enterprise22_backbone_events'),
    countTable('wae_enterprise22_backbone_commands'),
    countTable('wae_enterprise22_workflow_runs'),
    countTable('wae_enterprise22_backbone_approvals'),
    countTable('wae_enterprise22_backbone_outbox'),
    countTable('wae_enterprise22_backbone_audit'),
  ])

  return {
    mode:'durable',configured:true,reachable:true,schemaVersion,authenticated:true,
    tenantId,tenantName:String(tenantResult.data.name),companyId:companyResult.data?.id?String(companyResult.data.id):null,
    reason:'Sesión, tenant y RLS validados. Las mutaciones usan RPCs gobernados.',
    counts:{events,commands,workflows,approvals,outbox,audit},
  }
}

function requireDurable(status:EnterprisePersistenceStatus){
  const client=enterpriseSupabase
  if(!client||status.mode!=='durable'||!status.tenantId)throw new Error('Durable Enterprise22 session is not ready')
  return client
}

export async function publishDurableDemoEvent(status:EnterprisePersistenceStatus){
  const client=requireDurable(status)
  const suffix=Date.now().toString(36)
  const {data,error}=await client.rpc('wae_enterprise22_publish_event',{
    p_tenant_id:status.tenantId,
    p_company_id:status.companyId,
    p_idempotency_key:`ui-event-${suffix}`,
    p_event_type:'control_plane.persistence.verified',
    p_source_agent:'AURORA',
    p_target_agents:['NEXUS','NORM'],
    p_correlation_id:`COR-PERSIST-${suffix}`,
    p_risk:'Bajo',
    p_confidence:'Alta',
    p_summary:'Verificación durable emitida desde Enterprise Control Plane.',
    p_evidence:{source:'Enterprise22 UI',schema_version:status.schemaVersion},
    p_payload:{kind:'persistence_probe'},
  })
  if(error)throw error
  return String(data)
}

export async function requestDurableDemoCommand(status:EnterprisePersistenceStatus){
  const client=requireDurable(status)
  const suffix=Date.now().toString(36)
  const {data,error}=await client.rpc('wae_enterprise22_request_command',{
    p_tenant_id:status.tenantId,
    p_company_id:status.companyId,
    p_idempotency_key:`ui-command-${suffix}`,
    p_command_type:'platform.adapter.validate',
    p_source_agent:'AURORA',
    p_target_agent:'NEXUS',
    p_correlation_id:`COR-CMD-${suffix}`,
    p_risk:'Alto',
    p_summary:'Validar adapter server-side antes de habilitar ejecución externa.',
    p_approver_role:'Authorized owner',
    p_evidence:{source:'Enterprise22 UI',policy:'high-risk approval'},
    p_payload:{execution:'blocked_until_approval'},
  })
  if(error)throw error
  return String(data)
}

export async function startDurableDemoWorkflow(status:EnterprisePersistenceStatus){
  const client=requireDurable(status)
  const suffix=Date.now().toString(36)
  const {data,error}=await client.rpc('wae_enterprise22_start_workflow',{
    p_tenant_id:status.tenantId,
    p_company_id:status.companyId,
    p_idempotency_key:`ui-workflow-${suffix}`,
    p_workflow_key:'enterprise22.execution.readiness',
    p_correlation_id:`COR-WF-${suffix}`,
    p_owner_agents:['AURORA','NEXUS','NORM'],
    p_risk:'Medio',
    p_steps:[
      {key:'validate_context',owner:'AURORA'},
      {key:'policy_gate',owner:'NORM'},
      {key:'adapter_check',owner:'NEXUS'},
    ],
    p_context:{source:'Enterprise Control Plane'},
    p_evidence:{schema_version:status.schemaVersion},
  })
  if(error)throw error
  return String(data)
}
