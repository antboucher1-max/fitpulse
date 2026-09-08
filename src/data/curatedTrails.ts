// Bibliothèque de sentiers curatés RÉELS — par opposition aux itinéraires
// générés par formule mathématique (baseLat + distance × multiplicateur),
// qui produisent des tracés en zigzag dès qu'ils tombent sur un village
// plutôt qu'un vrai chemin.
//
// CE FICHIER DÉMARRE VOLONTAIREMENT VIDE. Il n'y a aucune donnée GPS
// inventée ici — seulement de vrais tracés que toi (ou tes futurs clubs)
// aurez ajoutés, par l'une de ces deux méthodes :
//
//   1. Importer un vrai fichier GPX (IGN Belgique, OpenStreetMap, un club de
//      rando local, ou un tracé que tu as toi-même enregistré) via la
//      fonction d'import déjà présente dans RunningTab.tsx, puis copier les
//      coordonnées obtenues ici.
//
//   2. Faire vraiment la sortie avec le GPS Live de l'app (LiveGpsTracker),
//      et "promouvoir" le tracé obtenu en sentier de référence une fois
//      rentré — ce tracé sera alors garanti réel puisque tu l'auras
//      physiquement parcouru.
//
// Tant que ce fichier est vide (ou ne contient pas d'entrée correspondant à
// la zone/distance demandée), RunningTab.tsx doit continuer à utiliser la
// génération par formule EN LE DISANT CLAIREMENT à l'utilisateur — jamais en
// le faisant passer pour un sentier vérifié.

export interface CuratedTrail {
  id: string;
  name: string;
  region: string; // ex: "Tournai", "Lamain", "Forêt de Flines"
  terrain: 'bois' | 'carrieres' | 'champs';
  distanceKm: number;
  dPlusM: number;
  // Coordonnées réelles du tracé, au format [lat, lng], dans l'ordre de
  // parcours. Obtenues par import GPX ou par un vrai enregistrement GPS —
  // jamais générées par calcul.
  waypoints: Array<[number, number]>;
  source: 'gpx_import' | 'live_gps_recording';
  addedAt: string; // ISO date
}

export const CURATED_TRAILS: CuratedTrail[] = [
  // Vide pour l'instant — voir les instructions en haut du fichier pour
  // ajouter un premier vrai sentier.
];

/**
 * Cherche un sentier curaté correspondant approximativement au terrain et à
 * la distance demandés (± 20% de tolérance sur la distance). Retourne `null`
 * si aucun sentier réel n'est disponible — dans ce cas, l'appelant doit
 * utiliser la génération par formule ET l'indiquer clairement à l'utilisateur.
 */
export function findCuratedTrail(
  terrain: CuratedTrail['terrain'],
  targetDistanceKm: number
): CuratedTrail | null {
  const tolerance = 0.2;
  const matches = CURATED_TRAILS.filter((trail) => {
    if (trail.terrain !== terrain) return false;
    const diff = Math.abs(trail.distanceKm - targetDistanceKm) / targetDistanceKm;
    return diff <= tolerance;
  });

  if (matches.length === 0) return null;

  // S'il y a plusieurs correspondances, prend la plus proche en distance.
  matches.sort((a, b) => Math.abs(a.distanceKm - targetDistanceKm) - Math.abs(b.distanceKm - targetDistanceKm));
  return matches[0];
}
