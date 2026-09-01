import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import CompaniesModule from './CompaniesModule'
import './companies-portal.css'

function companiesViewActive(){
  const active=[...document.querySelectorAll('.nav-group button.active')].find(b=>b.textContent?.trim()==='Empresas')
  return Boolean(active)
}

export default function CompaniesPortalLayer(){
  const [active,setActive]=useState(false)
  const [target,setTarget]=useState<HTMLElement|null>(null)

  useEffect(()=>{
    const sync=()=>{
      setActive(companiesViewActive())
      const content=document.querySelector('.content')
      setTarget(content instanceof HTMLElement?content:null)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})
    return()=>observer.disconnect()
  },[])

  if(!active||!target)return null
  return createPortal(<CompaniesModule/>,target)
}
