import { ErreurRecherche, type Station } from '../types';

export class ServiceCarburants {
  private readonly urlGeocodage = 'https://data.geopf.fr/geocodage/search';
  private readonly urlPrixCarburants =
    'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';

  async geocoderAdresse(adresse: string): Promise<{ latitude: number; longitude: number }> {
    let reponse: Response;

    try {
      reponse = await fetch(`${this.urlGeocodage}?q=${encodeURIComponent(adresse)}&limit=1`);
    } catch {
      throw new ErreurRecherche(
        'Impossible de contacter le service de géocodage.',
        'RESEAU'
      );
    }

    if (!reponse.ok) {
      throw new ErreurRecherche(
        'Le service de géocodage est temporairement indisponible.',
        'GEOCODAGE'
      );
    }

    const donnees = await reponse.json();
    const point = donnees?.features?.[0];

    if (!point) {
      throw new ErreurRecherche(
        `Aucune adresse trouvée pour « ${adresse} ».`,
        'GEOCODAGE'
      );
    }

    const [longitude, latitude] = point.geometry.coordinates;
    return { latitude, longitude };
  }

  async chercherStations(
    latitude: number,
    longitude: number,
    carburant: string,
    rayonMetres = 10_000
  ): Promise<Station[]> {
    const filtreGeo = `distance(geom, geom'POINT(${longitude} ${latitude})', ${rayonMetres}m)`;
    const url = `${this.urlPrixCarburants}?where=${encodeURIComponent(filtreGeo)}&limit=20`;

    let reponse: Response;

    try {
      reponse = await fetch(url);
    } catch {
      throw new ErreurRecherche(
        'Impossible de contacter le serveur des prix des carburants.',
        'RESEAU'
      );
    }

    if (!reponse.ok) {
      throw new ErreurRecherche(
        'Le service des prix de carburants est temporairement indisponible.',
        'FLUX_PRIX'
      );
    }

    const donnees = await reponse.json();
    const liste = donnees?.results || [];
    const champPrix = `${carburant.toLowerCase()}_prix`;

    return liste
      .filter((item: any) => item[champPrix] != null)
      .map((item: any) => ({
        adresse: item.adresse || 'Adresse inconnue',
        prixLitre: Number(item[champPrix]),
      }));
  }
}