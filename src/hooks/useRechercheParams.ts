import { useSearchParams } from 'react-router-dom'

export type Recherche = {
  adresse: string
  carburant: string
}

export function useRechercheParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const recherche: Recherche = {
    adresse: searchParams.get('adresse') ?? '',
    carburant: searchParams.get('carburant') ?? '',
  }

  function lancerRecherche(nouvelleRecherche: Recherche) {
    const nouveauxParams = new URLSearchParams()

    if (nouvelleRecherche.adresse) {
      nouveauxParams.set('adresse', nouvelleRecherche.adresse)
    }
    if (nouvelleRecherche.carburant) {
      nouveauxParams.set('carburant', nouvelleRecherche.carburant)
    }

    setSearchParams(nouveauxParams)
  }

  return { recherche, lancerRecherche }
}
