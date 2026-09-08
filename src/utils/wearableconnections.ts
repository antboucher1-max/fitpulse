// Statut de connexion partagé pour les intégrations wearables/tierces
// (Huawei, Garmin, Strava). Avant ce fichier, chaque intégration gérait son
// propre mécanisme de stockage local sans schéma commun :
//   - ProfileTab.tsx : clés 'fitpulse_garmin_connected' / 'fitpulse_strava_connected'
//   - StravaSyncButton.tsx : sa propre logique OAuth Strava, sans lien avec
//     le statut affiché dans ProfileTab (un utilisateur pouvait se connecter
//     via l'un sans que l'autre ne le sache)
//   - HuaweiSyncModal.tsx : aucun statut persistant, juste une action ponctuelle
//
// Ce fichier ne réécrit pas la logique OAuth de chacun (hors scope), mais
// centralise au moins la question "cette intégration est-elle connectée ?"
// pour qu'elle réponde pareil partout dans l'app.

export type WearableProvider = 'huawei' | 'garmin' | 'strava';

const STORAGE_PREFIX = 'fitpulse_wearable_';

export function isWearableConnected(provider: WearableProvider): boolean {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${provider}`) === 'true';
  } catch {
    return false;
  }
}

export function setWearableConnected(provider: WearableProvider, connected: boolean): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${provider}`, String(connected));
  } catch {
    // ignore (localStorage indisponible)
  }
}
