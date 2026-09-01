import React from 'react'
import ReactDOM from 'react-dom/client'
import DepartmentExperienceLayer from './DepartmentExperienceLayer'
import CompaniesPortalLayer from './CompaniesPortalLayer'
import ExecutionPersistenceLayer from './ExecutionPersistenceLayer'
import ExternalAdapterFabricLayer from './ExternalAdapterFabricLayer'
import AuroraExpertChatLayer from './AuroraExpertChatLayer'
import Enterprise22PrivateDock from './Enterprise22PrivateDock'

const host=document.createElement('div')
host.id='wae-department-experience-root'
document.body.appendChild(host)
ReactDOM.createRoot(host).render(
  <React.StrictMode>
    <DepartmentExperienceLayer/>
    <CompaniesPortalLayer/>
    <ExecutionPersistenceLayer/>
    <ExternalAdapterFabricLayer/>
    <AuroraExpertChatLayer/>
    <Enterprise22PrivateDock/>
  </React.StrictMode>
)
