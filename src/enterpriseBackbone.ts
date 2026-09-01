export type BackboneRisk='Bajo'|'Medio'|'Alto'|'Crítico'
export type Confidence='Alta'|'Media'|'Baja'
export type EventStatus='Observed'|'Validated'|'Consumed'|'Rejected'
export type CommandStatus='Requested'|'Awaiting approval'|'Approved'|'Queued'|'Blocked'|'Adapter pending'
export type WorkflowStatus='Running'|'Waiting approval'|'Blocked'|'Completed'

export type BackboneEvent={
  id:string;tenantId:string;type:string;source:string;targets:string[];correlationId:string;
  risk:BackboneRisk;confidence:Confidence;status:EventStatus;summary:string;evidence:string;createdAt:string
}
export type BackboneCommand={
  id:string;tenantId:string;type:string;source:string;target:string;correlationId:string;risk:BackboneRisk;
  status:CommandStatus;approvalRequired:boolean;approver:string;summary:string;evidence:string;createdAt:string
}
export type WorkflowRun={
  id:string;name:string;owner:string;correlationId:string;status:WorkflowStatus;step:number;totalSteps:number;
  risk:BackboneRisk;current:string;next:string;evidence:string
}
export type PolicyGate={id:string;name:string;scope:string;rule:string;mode:'Enforced'|'Observe';coverage:number;owner:string}
export type AuditEntry={id:string;correlationId:string;actor:string;action:string;result:string;evidence:string;createdAt:string}
export type BackboneState={events:BackboneEvent[];commands:BackboneCommand[];workflows:WorkflowRun[];audit:AuditEntry[]}

const STORAGE_KEY='wae-enterprise22-backbone-v1'
const TENANT='aurora-dynamics-demo'
const now=()=>new Date().toISOString()
const uid=(prefix:string)=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`

const seedState:BackboneState={
  events:[
    {id:'EVT-260901-101',tenantId:TENANT,type:'invoice.overdue',source:'INVOICER',targets:['STERLING','CLOSER','AURORA'],correlationId:'COR-AR-199879',risk:'Alto',confidence:'Alta',status:'Validated',summary:'Cartera vencida requiere coordinación comercial y financiera.',evidence:'INVOICER demo · overdue portfolio',createdAt:'2026-09-01T09:18:00-06:00'},
    {id:'EVT-260901-102',tenantId:TENANT,type:'capacity.overloaded',source:'ORBIT',targets:['TALENT','NEXUS','PMO'],correlationId:'COR-CAP-N2',risk:'Alto',confidence:'Alta',status:'Observed',summary:'Soporte N2 supera capacidad planificada.',evidence:'ORBIT CAP-02 demo',createdAt:'2026-09-01T09:21:00-06:00'},
    {id:'EVT-260901-103',tenantId:TENANT,type:'security.exposure.priority',source:'SENTINEL',targets:['NEXUS','NORM','AURORA'],correlationId:'COR-SEC-GW',risk:'Crítico',confidence:'Alta',status:'Validated',summary:'Exposición contextual prioritaria sobre gateway crítico.',evidence:'SENTINEL exposure model demo',createdAt:'2026-09-01T09:24:00-06:00'},
    {id:'EVT-260901-104',tenantId:TENANT,type:'document.obligation.due',source:'ARCHIVE',targets:['JUSTITIA','NORM'],correlationId:'COR-DOC-OBL',risk:'Medio',confidence:'Media',status:'Observed',summary:'Obligación documental próxima a revisión.',evidence:'ARCHIVE obligation demo',createdAt:'2026-09-01T09:26:00-06:00'},
  ],
  commands:[
    {id:'CMD-260901-41',tenantId:TENANT,type:'collections.coordinate',source:'AURORA',target:'CLOSER',correlationId:'COR-AR-199879',risk:'Medio',status:'Queued',approvalRequired:false,approver:'Policy auto-pass',summary:'Preparar plan de cobranza coordinado; no ejecutar cobro automático.',evidence:'EVT-260901-101',createdAt:'2026-09-01T09:19:00-06:00'},
    {id:'CMD-260901-42',tenantId:TENANT,type:'iam.privilege.change',source:'SENTINEL',target:'NEXUS',correlationId:'COR-SEC-GW',risk:'Crítico',status:'Awaiting approval',approvalRequired:true,approver:'CISO + authorized admin',summary:'Revisar cambio de privilegio; ejecución bloqueada hasta aprobación.',evidence:'EVT-260901-103',createdAt:'2026-09-01T09:25:00-06:00'},
  ],
  workflows:[
    {id:'WF-01',name:'Revenue Recovery',owner:'AURORA + STERLING + CLOSER',correlationId:'COR-AR-199879',status:'Running',step:2,totalSteps:5,risk:'Alto',current:'Validar cuenta / relación comercial',next:'Proponer estrategia de recuperación',evidence:'INVOICER + CLOSER demo'},
    {id:'WF-02',name:'Critical Security Exposure',owner:'SENTINEL + NEXUS + NORM',correlationId:'COR-SEC-GW',status:'Waiting approval',step:3,totalSteps:6,risk:'Crítico',current:'Policy gate de cambio privilegiado',next:'Aplicar adapter real cuando exista autorización',evidence:'SENTINEL evidence demo'},
    {id:'WF-03',name:'Capacity Rebalance',owner:'ORBIT + TALENT + PMO',correlationId:'COR-CAP-N2',status:'Blocked',step:2,totalSteps:5,risk:'Alto',current:'Validar skill fit',next:'Aprobar reasignación',evidence:'ORBIT capacity demo'},
  ],
  audit:[
    {id:'AUD-BB-001',correlationId:'COR-AR-199879',actor:'AURORA',action:'command.requested',result:'Queued',evidence:'CMD-260901-41',createdAt:'2026-09-01T09:19:00-06:00'},
    {id:'AUD-BB-002',correlationId:'COR-SEC-GW',actor:'SENTINEL',action:'command.requested',result:'Approval required',evidence:'CMD-260901-42',createdAt:'2026-09-01T09:25:00-06:00'},
  ],
}

export const policyGates:PolicyGate[]=[
  {id:'PG-01',name:'Tenant isolation',scope:'Todos los eventos/comandos',rule:'tenantId debe coincidir con el contexto activo.',mode:'Enforced',coverage:100,owner:'SENTINEL + NEXUS'},
  {id:'PG-02',name:'High-risk approval',scope:'Alto / Crítico',rule:'Cambios sensibles requieren approval explícito y evidencia.',mode:'Enforced',coverage:92,owner:'AURORA + NORM'},
  {id:'PG-03',name:'Evidence before execution',scope:'Legal / Finance / Security',rule:'No ejecutar afirmaciones o cambios sensibles sin evidencia referenciable.',mode:'Enforced',coverage:88,owner:'ARCHIVE + NORM'},
  {id:'PG-04',name:'Adapter availability',scope:'Comandos cross-module',rule:'Si no existe adapter backend real, el comando queda Adapter pending.',mode:'Enforced',coverage:100,owner:'NEXUS'},
  {id:'PG-05',name:'AI runtime truthfulness',scope:'Generación / RAG / Vision',rule:'Configured no equivale a Available; fail closed si runtime no está validado.',mode:'Enforced',coverage:100,owner:'NEXUS + SENTINEL'},
]

function safeLoad():BackboneState{
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    if(!raw)return structuredClone(seedState)
    const parsed=JSON.parse(raw) as BackboneState
    if(!parsed.events||!parsed.commands||!parsed.workflows||!parsed.audit)return structuredClone(seedState)
    return parsed
  }catch{return structuredClone(seedState)}
}
let state:BackboneState=typeof window==='undefined'?structuredClone(seedState):safeLoad()
const listeners=new Set<()=>void>()
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{};listeners.forEach(fn=>fn())}
function audit(correlationId:string,actor:string,action:string,result:string,evidence:string){
  state.audit=[{id:uid('AUD-BB'),correlationId,actor,action,result,evidence,createdAt:now()},...state.audit].slice(0,80)
}

export function getBackboneSnapshot():BackboneState{return structuredClone(state)}
export function subscribeBackbone(fn:()=>void){listeners.add(fn);return()=>listeners.delete(fn)}

export function publishEvent(input:Omit<BackboneEvent,'id'|'tenantId'|'createdAt'|'status'>){
  const event:BackboneEvent={...input,id:uid('EVT'),tenantId:TENANT,createdAt:now(),status:'Observed'}
  state.events=[event,...state.events].slice(0,80);audit(event.correlationId,input.source,'event.published','Observed',event.id);persist();return event
}

export function requestCommand(input:Omit<BackboneCommand,'id'|'tenantId'|'createdAt'|'status'|'approvalRequired'|'approver'>){
  const approvalRequired=input.risk==='Alto'||input.risk==='Crítico'
  const command:BackboneCommand={...input,id:uid('CMD'),tenantId:TENANT,createdAt:now(),approvalRequired,approver:approvalRequired?'Authorized approver required':'Policy auto-pass',status:approvalRequired?'Awaiting approval':'Queued'}
  state.commands=[command,...state.commands].slice(0,80);audit(command.correlationId,input.source,'command.requested',command.status,command.id);persist();return command
}

export function approveCommand(id:string,actor='Authorized approver'){
  state.commands=state.commands.map(c=>c.id===id&&c.status==='Awaiting approval'?{...c,status:'Approved',approver:actor}:c)
  const command=state.commands.find(c=>c.id===id);if(command)audit(command.correlationId,actor,'command.approved',command.status,command.id);persist()
}

export function queueAdapter(id:string){
  state.commands=state.commands.map(c=>c.id===id&&(c.status==='Approved'||c.status==='Queued')?{...c,status:'Adapter pending'}:c)
  const command=state.commands.find(c=>c.id===id);if(command)audit(command.correlationId,'NEXUS','adapter.check',command.status,'No backend adapter wired in this phase');persist()
}

export function advanceWorkflow(id:string){
  state.workflows=state.workflows.map(w=>{
    if(w.id!==id||w.status==='Completed'||w.status==='Waiting approval'||w.status==='Blocked')return w
    const step=Math.min(w.totalSteps,w.step+1)
    return {...w,step,status:step===w.totalSteps?'Completed':'Running',current:w.next,next:step===w.totalSteps?'Completed':'Siguiente policy/evidence gate'}
  })
  const wf=state.workflows.find(w=>w.id===id);if(wf)audit(wf.correlationId,'AURORA','workflow.advanced',wf.status,wf.id);persist()
}

export function resetBackboneDemo(){state=structuredClone(seedState);persist()}
