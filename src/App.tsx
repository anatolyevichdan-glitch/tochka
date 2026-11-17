import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const pages = import.meta.glob<Record<string, ComponentType>>('./pages/*Page.tsx', { eager: true })
const routes = [
  ['/', 'HomePage'],
  ['/about', 'AboutPage'],
  ['/how-it-works', 'HowItWorksPage'],
  ['/help', 'HelpPage'],
  ['/appeal/new', 'NewAppealPage'],
  ['/appeal/check', 'CheckAppealPage'],
  ['/appeal/:id/chat', 'AppealChatPage'],
  ['/staff/login', 'StaffLoginPage'],
  ['/operator', 'OperatorPage'],
  ['/expert', 'ExpertPage'],
  ['/admin', 'AdminPage'],
  ['*', 'NotFoundPage'],
]

export function App() {
  return <Routes>
    <Route element={<Layout />}>
      {routes.map(([path, name]) => {
        const Page = pages['./pages/' + name + '.tsx']?.[name]
        return Page && <Route key={path} path={path} element={<Page />} />
      })}
    </Route>
  </Routes>
}
