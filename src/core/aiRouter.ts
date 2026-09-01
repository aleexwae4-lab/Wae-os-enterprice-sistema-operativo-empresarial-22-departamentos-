export type AIModality = 'text' | 'vision' | 'audio' | 'ocr' | 'tools'
export type AIProviderState = 'healthy' | 'degraded' | 'offline'

export type AIProvider = {
  id: string
  modalities: AIModality[]
  state: AIProviderState
  priority: number
  estimatedLatencyMs: number
  estimatedCost: number
  privateFallback?: boolean
}

export type AIRouteRequest = {
  modality: AIModality
  needsTools?: boolean
  lowLatency?: boolean
  privateOnly?: boolean
}

export const defaultProviders: AIProvider[] = [
  {id:'openai',modalities:['text','vision','audio','tools'],state:'healthy',priority:1,estimatedLatencyMs:900,estimatedCost:3},
  {id:'gemini',modalities:['text','vision','audio'],state:'healthy',priority:2,estimatedLatencyMs:850,estimatedCost:2},
  {id:'mistral',modalities:['text','ocr'],state:'healthy',priority:3,estimatedLatencyMs:700,estimatedCost:2},
  {id:'groq',modalities:['text'],state:'healthy',priority:4,estimatedLatencyMs:250,estimatedCost:1},
  {id:'local',modalities:['text'],state:'healthy',priority:5,estimatedLatencyMs:1300,estimatedCost:0,privateFallback:true},
]

export function routeAI(request:AIRouteRequest, providers:AIProvider[]=defaultProviders){
  const candidates=providers
    .filter(p=>p.state!=='offline')
    .filter(p=>p.modalities.includes(request.modality))
    .filter(p=>!request.needsTools || p.modalities.includes('tools'))
    .filter(p=>!request.privateOnly || p.privateFallback)
    .sort((a,b)=>{
      if(request.lowLatency && a.estimatedLatencyMs!==b.estimatedLatencyMs) return a.estimatedLatencyMs-b.estimatedLatencyMs
      if(a.state!==b.state) return a.state==='healthy'?-1:1
      if(a.estimatedCost!==b.estimatedCost) return a.estimatedCost-b.estimatedCost
      return a.priority-b.priority
    })

  return {
    primary:candidates[0] ?? null,
    fallbacks:candidates.slice(1,4),
    reason:candidates.length?'selected by modality, health, latency, cost and policy':'no compatible provider',
  }
}
