import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { StationDetailPage } from './pages/StationDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stations/:id" element={<StationDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
