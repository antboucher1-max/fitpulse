// Innovation #3 : "Passeport inter-clubs" — génère un code personnel que
// l'utilisateur peut présenter dans n'importe quel club partenaire pour un
// accès invité.
//
// RÉSERVE HONNÊTE (à lire avant de vendre cette fonctionnalité à un club) :
// cette V1 génère un code vérifiable visuellement par un membre du staff,
// mais il n'y a PAS encore de vraie vérification serveur ni de compteur
// d'utilisation partagé entre clubs — c'est un code local, pas encore relié
// à une table Supabase avec validation. Pour une vraie mise en prod
// multi-clubs, il faudrait : une table `partner_clubs`, une table
// `passport_redemptions` (qui a utilisé le passeport, où, quand), et un
// écran "scanner" côté club qui vérifie le code contre la base plutôt que de
// se fier à l'affichage visuel seul (sinon rien n'empêche un code inventé).

export interface ClubPassport {
  code: string;
  homeClub: string;
  issuedAt: string;
}

// Liste des clubs partenaires. Reprend les mêmes noms que ClubLeaderboard.tsx
// pour rester cohérent — idéalement, cette liste devrait venir d'une table
// Supabase plutôt que d'être dupliquée ici (voir l'audit initial sur les
// listes de clubs codées en dur).
export const PARTNER_CLUBS = [
  'Club Tournai (Bastion)',
  'Club Tournai (les jeunesses)',
  'Club Antoing',
  'Club Péruwelz',
  'Club Leuze',
  'Club Ath',
  'Club Mouscron',
  'Club Ronse',
  'Club St-Ghislain',
  'Club Mons',
  'Club Jurbise',
];

function generateCode(userId: string, homeClub: string): string {
  // Code court, lisible à voix haute par un membre du staff en cas de besoin,
  // dérivé de façon déterministe de l'utilisateur + son club (pas aléatoire à
  // chaque appel, pour que le code reste stable tant qu'il n'est pas régénéré).
  const base = `${userId}-${homeClub}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  const code = hash.toString(36).toUpperCase().slice(0, 6).padStart(6, '0');
  return `FP-${code}`;
}

export function getClubPassport(userId: string, homeClub: string): ClubPassport {
  return {
    code: generateCode(userId, homeClub),
    homeClub,
    issuedAt: new Date().toISOString(),
  };
}
