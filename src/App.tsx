import { HelpPage } from './pages/HelpPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageHeading } from './components/Common'

export function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<section className="wrap page"><PageHeading title="Отклик" /></section>} />
      <Route index element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Route>
  </Routes>
}
