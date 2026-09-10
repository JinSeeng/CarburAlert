import { ErreurRecherche, type Station } from '../types';
interface EnregistrementBrut {
  adresse?: string;
  [champ: string]: unknown;
}
export class ServiceCarburants {
  private readonly urlGeocodage = 'https://data.geopf.fr/geocodage/search';

  private readonly urlPrixCarburants =
    'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/' +
    'prix-des-carburants-en-france-flux-instantane-v2/records';

  
  async geocoderAdresse(
    adresse: string
  ): Promise<{ latitude: number; longitude: number }> {
    const params = new URLSearchParams({ q: adresse, limit: '1' });

    let reponse: Response;
    try {
      reponse = await fetch(`${this.urlGeocodage}?${params.toString()}`);
    } catch {
      throw new ErreurRecherche(
        'Impossible de contacter le service de géocodage.',
        'RESEAU'
      );
    }

    if (!reponse.ok) {
      throw new ErreurRecherche(
        `Le service de géocodage a répondu une erreur (${reponse.status}).`,
        'GEOCODAGE'
      );
    }

    const donnees = await reponse.json();
    const premiereFeature = donnees?.features?.[0];

    if (!premiereFeature) {
      throw new ErreurRecherche(
        `Aucune adresse trouvée pour « ${adresse} ».`,
        'GEOCODAGE'
      );
    }

    const [longitude, latitude] = premiereFeature.geometry.coordinates;
    return { latitude, longitude };
  }

  async chercherStations(
    latitude: number,
    longitude: number,
    carburant: string,
    rayonMetres = 10_000
  ): Promise<Station[]> {
   
    const filtreGeo = `distance(geom, geom'POINT(${longitude} ${latitude})', ${rayonMetres}m)`;
    const params = new URLSearchParams({ where: filtreGeo, limit: '20' });

    let reponse: Response;
    try {
      reponse = await fetch(`${this.urlPrixCarburants}?${params.toString()}`);
    } catch {
      throw new ErreurRecherche(
        'Impossible de contacter le flux des prix carburants.',
        'RESEAU'
      );
    }

    if (!reponse.ok) {
      throw new ErreurRecherche(
        `Le flux des prix a répondu une erreur (${reponse.status}).`,
        'FLUX_PRIX'
      );
    }

    const donnees = await reponse.json();
    const enregistrements: EnregistrementBrut[] = donnees?.results ?? [];
    const champPrix = `${carburant.toLowerCase()}_prix`;

    return enregistrements
      .filter((enregistrement) => enregistrement[champPrix] != null)
      .map((enregistrement) => ({
        adresse: enregistrement.adresse ?? 'Adresse inconnue',
        prixLitre: Number(enregistrement[champPrix]),
      }));
  }
}