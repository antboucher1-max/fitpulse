import { useState } from 'react';
import { Ticket, Copy, Check, MapPin } from 'lucide-react';
import { getClubPassport, PARTNER_CLUBS } from '../utils/clubPassport';

interface ClubPassportCardProps {
  currentUserId?: string;
  homeClub?: string;
}

// Innovation #3 : passeport inter-clubs. Voir la réserve honnête détaillée
// dans utils/clubPassport.ts — cette V1 est une démonstration de concept
// fonctionnelle (le code se génère et s'affiche vraiment), mais la
// vérification côté club reste à construire pour un vrai déploiement
// multi-clubs.
export default function ClubPassportCard({ currentUserId = 'demo-user', homeClub = 'Club Tournai (Bastion)' }: ClubPassportCardProps) {
  const [copied, setCopied] = useState(false);
  const passport = getClubPassport(currentUserId, homeClub);
  const otherClubs = PARTNER_CLUBS.filter((c) => c !== homeClub);

  const handleCopy = () => {
    navigator.clipboard.writeText(passport.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/30 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
          <Ticket className="w-4 h-4" /> Ton Passeport Inter-Clubs
        </div>
        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
          Bêta 🧪
        </span>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed relative z-10">
        Présente ce code à l'accueil de n'importe quel club partenaire pour un accès invité. Ton club de rattachement : <strong className="text-white">{homeClub}</strong>.
      </p>

      <div className="bg-neutral-950 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-2 relative z-10">
        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Ton code passeport</span>
        <div className="text-3xl font-black text-emerald-400 font-mono tracking-widest">{passport.code}</div>
        <button
          type="button"
          onClick={handleCopy}
          className="mx-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié !' : 'Copier le code'}
        </button>
      </div>

      <div className="space-y-2 relative z-10">
        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Clubs partenaires ({otherClubs.length})</span>
        <div className="flex flex-wrap gap-1.5">
          {otherClubs.map((club) => (
            <span key={club} className="text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-emerald-500" /> {club.replace('Club ', '')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
