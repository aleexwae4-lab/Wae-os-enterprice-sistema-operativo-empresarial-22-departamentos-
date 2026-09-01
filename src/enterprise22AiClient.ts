import type { Department } from './data'

export type ExpertHistoryMessage={role:'user'|'assistant';content:string}
type StreamArgs={department:Department;input:string;history:ExpertHistoryMessage[];onDelta:(chunk:string)=>void;onMeta?:(meta:Record<string,unknown>)=>void}

function eventBlocks(buffer:string){const normalized=buffer.replace(/\r\n/g,'\n');const blocks=normalized.split('\n\n');return{blocks:blocks.slice(0,-1),rest:blocks.at(-1)??''}}
function parseBlock(block:string){let event='message',data='';for(const line of block.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();if(line.startsWith('data:'))data+=line.slice(5).trim()}let payload:Record<string,unknown>={};if(data){try{const parsed=JSON.parse(data);if(parsed&&typeof parsed==='object')payload=parsed as Record<string,unknown>}catch{payload={text:data}}}return{event,payload}}

export async function streamEnterprise22Expert({department,input,history,onDelta,onMeta}:StreamArgs){
  const controller=new AbortController()
  const timeout=window.setTimeout(()=>controller.abort(),65000)
  try{
    const response=await fetch('/api/expert-chat/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({department_id:department.id,input,history:history.slice(-12)}),signal:controller.signal})
    const contentType=response.headers.get('content-type')||''
    if(!response.ok){let error='cloud_expert_unavailable';if(contentType.includes('application/json')){const body=await response.json().catch(()=>({}));if(body&&typeof body.error==='string')error=body.error}throw new Error(error)}
    if(!response.body)throw new Error('empty_cloud_stream')
    const reader=response.body.getReader(),decoder=new TextDecoder()
    let buffer='',full='',done=false
    while(true){const read=await reader.read();if(read.done)break;buffer+=decoder.decode(read.value,{stream:true});const parsed=eventBlocks(buffer);buffer=parsed.rest;for(const block of parsed.blocks){const {event,payload}=parseBlock(block);if(event==='meta'){onMeta?.(payload);continue}if(event==='delta'){const text=typeof payload.text==='string'?payload.text:'';if(text){full+=text;onDelta(text)}continue}if(event==='handoff')throw new Error('specialist_handoff');if(event==='error')throw new Error(typeof payload.error==='string'?payload.error:'cloud_stream_failed');if(event==='done')done=true}}
    if(buffer.trim()){const {event,payload}=parseBlock(buffer);if(event==='delta'&&typeof payload.text==='string'){full+=payload.text;onDelta(payload.text)}if(event==='error')throw new Error(typeof payload.error==='string'?payload.error:'cloud_stream_failed');if(event==='done')done=true}
    if(!full.trim())throw new Error(done?'empty_cloud_response':'incomplete_cloud_response')
    return{content:full,runtime:'cloud' as const}
  }finally{window.clearTimeout(timeout)}
}
