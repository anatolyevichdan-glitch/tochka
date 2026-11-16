import { HomePage } from './pages/HomePage'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageHeading } from './components/Common'

export function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<section className="wrap page"><PageHeading title="Отклик" /></section>} />
      <Route index element={<HomePage />} />
    </Route>
  </Routes>
}
