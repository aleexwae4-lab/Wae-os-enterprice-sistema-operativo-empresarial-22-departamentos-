import React from 'react'
import ReactDOM from 'react-dom/client'
import DepartmentExperienceLayer from './DepartmentExperienceLayer'
import CompaniesPortalLayer from './CompaniesPortalLayer'

const host=document.createElement('div')
host.id='wae-department-experience-root'
document.body.appendChild(host)
ReactDOM.createRoot(host).render(
  <React.StrictMode>
    <DepartmentExperienceLayer/>
    <CompaniesPortalLayer/>
  </React.StrictMode>
)
