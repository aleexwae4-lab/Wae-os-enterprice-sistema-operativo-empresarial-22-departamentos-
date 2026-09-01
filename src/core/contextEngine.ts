export type ContextSource = 'system'|'business'|'state'|'memory'|'rag'|'conversation'|'request'

export type ContextChunk = {
  id: string
  source: ContextSource
  text: string
  relevance: number
  freshness: number
  priority: number
  tokenEstimate: number
  critical?: boolean
  documentId?: string
  section?: string
}

export type ContextSelection = {
  selected: ContextChunk[]
  tokenEstimate: number
  dropped: string[]
}

const sourceWeight:Record<ContextSource,number>={system:1,business:.96,state:.9,memory:.82,rag:.94,conversation:.72,request:1}

export function selectContext(chunks:ContextChunk[],budget:number):ContextSelection{
  const ranked=[...chunks].sort((a,b)=>{
    if(Boolean(a.critical)!==Boolean(b.critical)) return a.critical?-1:1
    const score=(x:ContextChunk)=>x.relevance*.45+x.freshness*.2+x.priority*.25+sourceWeight[x.source]*.1
    return score(b)-score(a)
  })
  const selected:ContextChunk[]=[]
  const dropped:string[]=[]
  let used=0
  for(const chunk of ranked){
    if(chunk.critical || used+chunk.tokenEstimate<=budget){selected.push(chunk);used+=chunk.tokenEstimate}
    else dropped.push(chunk.id)
  }
  return {selected,tokenEstimate:used,dropped}
}

export type CacheScope={tenantId:string;permissionScope:string;documentVersion?:string;policyVersion?:string}

export function deterministicCacheKey(input:string,scope:CacheScope){
  const normalized=input.trim().toLowerCase().replace(/\s+/g,' ')
  const raw=[scope.tenantId,scope.permissionScope,scope.documentVersion??'na',scope.policyVersion??'na',normalized].join('|')
  let hash=2166136261
  for(let i=0;i<raw.length;i++){hash^=raw.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return `wae:${(hash>>>0).toString(16)}`
}

export function canReuseSemanticCache(a:CacheScope,b:CacheScope){
  return a.tenantId===b.tenantId &&
    a.permissionScope===b.permissionScope &&
    a.documentVersion===b.documentVersion &&
    a.policyVersion===b.policyVersion
}

export type EvidenceCitation={documentId:string;section?:string;fragment:string}
export type EvidenceAnswer={text:string;citations:EvidenceCitation[];usedCorporateKnowledge:boolean;insufficientEvidence?:boolean}

export function validateEvidenceAnswer(answer:EvidenceAnswer){
  if(answer.usedCorporateKnowledge && !answer.citations.length){return {valid:false,reason:'corporate claims require citations'}}
  if(answer.insufficientEvidence && answer.citations.length===0){return {valid:true,reason:'explicitly declared insufficient evidence'}}
  const invalid=answer.citations.some(c=>!c.documentId || !c.fragment.trim())
  return invalid?{valid:false,reason:'citation missing document or fragment'}:{valid:true,reason:'evidence policy satisfied'}
}
