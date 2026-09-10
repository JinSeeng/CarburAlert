import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchStationById } from '../api/stationsApi'
import type { Station } from '../types/station'
import { usePageTitle } from '../hooks/usePageTitle'
import { NotFoundContent } from './NotFoundPage'

type Etat =
  | { statut: 'chargement' }
  | { statut: 'erreur' }
  | { statut: 'non-trouvee' }
  | { statut: 'succes'; station: Station }

function titrePour(id: string | undefined, etat: Etat): string {
  if (!id || etat.statut === 'non-trouvee') {
    return "Station introuvable - Carbur'Alerte"
  }
  if (etat.statut === 'succes') {
    return `${etat.station.adresse}, ${etat.station.ville} - Carbur'Alerte`
  }
  return "Fiche station - Carbur'Alerte"
}

export function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [idCharge, setIdCharge] = useState(id)
  const [etat, setEtat] = useState<Etat>({ statut: 'chargement' })

  if (id !== idCharge) {
    setIdCharge(id)
    setEtat({ statut: 'chargement' })
  }

  useEffect(() => {
    if (!id) return

    let annule = false

    fetchStationById(id)
      .then((station) => {
        if (annule) return
        setEtat(station ? { statut: 'succes', station } : { statut: 'non-trouvee' })
      })
      .catch(() => {
        if (!annule) {
          setEtat({ statut: 'erreur' })
        }
      })

    return () => {
      annule = true
    }
  }, [id])

  usePageTitle(titrePour(id, etat))

  if (!id || etat.statut === 'non-trouvee') {
    return <NotFoundContent />
  }

  if (etat.statut === 'chargement') {
    return (
      <main>
        <p>Chargement de la fiche station...</p>
      </main>
    )
  }

  if (etat.statut === 'erreur') {
    return (
      <main>
        <h1>Problème de connexion</h1>
        <p>
          Impossible de récupérer les informations de cette station pour le
          moment. Réessayez plus tard.
        </p>
      </main>
    )
  }

  return <FicheStation station={etat.station} />
}

function FicheStation({ station }: { station: Station }) {
  const carburantsAvecPrix = station.prix.filter((carburant) => carburant.prix !== null)

  return (
    <main>
      <h1>{station.adresse}</h1>
      <p>
        {station.codePostal} {station.ville}
      </p>

      <section>
        <h2>Prix des carburants</h2>
        {station.ouvert24h && <p>Station en libre-service 24h/24.</p>}

        {carburantsAvecPrix.length === 0 ? (
          <p>Aucun prix disponible pour cette station actuellement.</p>
        ) : (
          <ul>
            {carburantsAvecPrix.map((carburant) => (
              <li key={carburant.nom}>
                {carburant.nom} : {carburant.prix?.toFixed(3)} € / L
                {carburant.maj && (
                  <span>
                    {' '}
                    (mis à jour le {new Date(carburant.maj).toLocaleString('fr-FR')})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {station.carburantsIndisponibles.length > 0 && (
          <p>En rupture actuellement : {station.carburantsIndisponibles.join(', ')}</p>
        )}
      </section>

      {station.horaires.length > 0 && (
        <section>
          <h2>Horaires d'ouverture</h2>
          <ul>
            {station.horaires.map((jour) => (
              <li key={jour.nom}>
                {jour.nom} : {jour.ferme ? 'fermé' : 'ouvert'}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
