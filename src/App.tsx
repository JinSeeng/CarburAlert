import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { StationDetailPage } from './pages/StationDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SkipLink } from './components/SkipLink'

function App() {
  return (
    <>
      <SkipLink />
      <div id="contenu-principal" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations/:id" element={<StationDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
