import type { Station } from '../types/station'

export async function fetchStationById(id: string): Promise<Station | null> {
  throw new Error(`fetchStationById("${id}"): pas encore implémenté`)
}
