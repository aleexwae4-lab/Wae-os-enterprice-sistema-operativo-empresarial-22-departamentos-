import { createPortal } from 'react-dom'
import { Boxes, type LucideProps } from 'lucide-react'
import InventoryModule from './InventoryModule'
import './inventory.css'

export default function InventoryDepartmentIcon(props:LucideProps) {
  const size = typeof props.size === 'number' ? props.size : Number(props.size ?? 24)
  const target = typeof document !== 'undefined' ? document.querySelector('.content') : null
  const shouldMountModule = size >= 28 && target instanceof HTMLElement

  const backToCEO = () => {
    const button = document.querySelector('.ceo-return-fab')
    if (button instanceof HTMLButtonElement) button.click()
  }

  return <>
    <Boxes {...props}/>
    {shouldMountModule && createPortal(<InventoryModule onBackCEO={backToCEO}/>, target)}
  </>
}
