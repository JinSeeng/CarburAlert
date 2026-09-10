import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundContent() {
  return (
    <main>
      <h1>Page introuvable</h1>
      <p>Cette page n'existe pas, ou la station demandée est introuvable.</p>
      <Link to="/">Retour à l'accueil</Link>
    </main>
  )
}

export function NotFoundPage() {
  usePageTitle("Page introuvable - Carbur'Alerte")
  return <NotFoundContent />
}
