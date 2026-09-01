import { useCallback, useEffect, useRef, useState } from 'react'

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }
type RecognitionLike = { continuous:boolean; interimResults:boolean; lang:string; start:()=>void; stop:()=>void; onresult:((event:RecognitionEvent)=>void)|null; onend:(()=>void)|null; onerror:(()=>void)|null }

declare global { interface Window { SpeechRecognition?:new()=>RecognitionLike; webkitSpeechRecognition?:new()=>RecognitionLike } }
const KEY='wae-enterprise22-voice-enabled'

export function voiceReadyText(value:string){
  return value.replace(/```[\s\S]*?```/g,' Código disponible en pantalla. ').replace(/`([^`]+)`/g,'$1')
    .replace(/https?:\/\/\S+/g,' enlace disponible en pantalla ').replace(/^\s{0,3}#{1,6}\s+/gm,'')
    .replace(/^\s*[-*+]\s+/gm,'').replace(/^\s*\d+[.)]\s+/gm,'').replace(/[*_~>|#]+/g,' ')
    .replace(/[→⇒]/g,' después ').replace(/[•▪◦]/g,' ').replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'')
    .replace(/\s+/g,' ').trim()
}

export function usePremiumVoice(onTranscript:(text:string)=>void){
  const [enabled,setEnabledState]=useState(()=>localStorage.getItem(KEY)!=='false')
  const [listening,setListening]=useState(false)
  const recognition=useRef<RecognitionLike|null>(null)
  const setEnabled=useCallback((value:boolean)=>{setEnabledState(value);localStorage.setItem(KEY,String(value));if(!value)window.speechSynthesis?.cancel()},[])
  const speak=useCallback((raw:string)=>{
    if(!enabled||!('speechSynthesis' in window))return
    const text=voiceReadyText(raw);if(!text)return
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text)
    utterance.lang='es-MX';utterance.rate=.98;utterance.pitch=1
    const voices=window.speechSynthesis.getVoices();utterance.voice=voices.find(v=>v.lang.toLowerCase()==='es-mx')??voices.find(v=>v.lang.toLowerCase().startsWith('es'))??null
    window.speechSynthesis.speak(utterance)
  },[enabled])
  const toggleListening=useCallback(()=>{
    if(listening){recognition.current?.stop();setListening(false);return}
    const Recognition=window.SpeechRecognition??window.webkitSpeechRecognition;if(!Recognition)return
    const instance=new Recognition();instance.lang='es-MX';instance.continuous=false;instance.interimResults=true;let finalText=''
    instance.onresult=event=>{let interim='';for(let i=0;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)finalText+=result[0].transcript;else interim+=result[0].transcript}onTranscript((finalText||interim).trim())}
    instance.onend=()=>setListening(false);instance.onerror=()=>setListening(false);recognition.current=instance;setListening(true);instance.start()
  },[listening,onTranscript])
  useEffect(()=>()=>{recognition.current?.stop();window.speechSynthesis?.cancel()},[])
  return{enabled,listening,supported:!!(window.SpeechRecognition??window.webkitSpeechRecognition),setEnabled,speak,toggleListening}
}
