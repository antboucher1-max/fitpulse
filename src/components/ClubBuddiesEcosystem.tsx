import { useState } from 'react';
import { MapPin, Share2, Compass, Users, RefreshCw, ArrowRight } from 'lucide-react';

// Avant ce fichier, ce composant gérait sa propre liste fictive de roadbooks
// en mémoire (perdue au rechargement de la page), complètement déconnectée
// de RoadbookTab.tsx qui génère de vrais itinéraires GPS (routage OSRM réel,
// export GPX) et les publie dans localStorage sous 'fitpulse_club_roadbooks'
// via son bouton "Partager au Club".
//
// Ce composant affiche maintenant ces mêmes roadbooks réels au lieu d'en
// inventer une liste séparée. Limitation assumée : le stockage reste local à
// l'appareil (pas de table Supabase partagée) — donc "publié au club" ne veut
// dire pour l'instant que "visible sur cet appareil". Pour un vrai partage
// entre athlètes, il faudrait migrer 'fitpulse_club_roadbooks' vers une table
// Supabase ; hors scope de cette passe de nettoyage.

interface PublishedRoadbook {
  id: number;
  name: string;
  distance: number;
  actualDistanceKm: number;
  dplus: number;
  surface: string;
  timeEst: string;
  description: string;
}

interface ClubBuddiesEcosystemProps {
  onNavigateTab?: (tab: 'home' | 'training' | 'health' | 'nutrition' | 'community' | 'profile') => void;
}

function loadPublishedRoadbooks(): PublishedRoadbook[] {
  try {
    const saved = localStorage.getItem('fitpulse_club_roadbooks');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function ClubBuddiesEcosystem({ onNavigateTab }: ClubBuddiesEcosystemProps) {
  const [roadbooks, setRoadbooks] = useState<PublishedRoadbook[]>(loadPublishedRoadbooks);

  const handleRefresh = () => {
    setRoadbooks(loadPublishedRoadbooks());
  };

  const handleShare = (rb: PublishedRoadbook) => {
    const summary = `🗺️ [Roadbook Club] ${rb.name} (${rb.actualDistanceKm} km | D+ ${rb.dplus}m)`;
    navigator.clipboard.writeText(summary);
    alert("📋 Roadbook copié dans le presse-papier ! Prêt à être partagé en privé avec votre club.");
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
          <Users className="w-4 h-4" /> Roadbooks Publiés par le Club
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition cursor-pointer"
          title="Actualiser la liste"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {roadbooks.length === 0 ? (
        <div className="bg-neutral-950 border border-dashed border-neutral-800 rounded-2xl p-6 text-center space-y-3">
          <Compass className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-xs text-neutral-400">
            Aucun roadbook publié pour le moment. Génère un itinéraire GPS réel et partage-le depuis l'onglet Clubs & Ligue.
          </p>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('community')}
              className="mx-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              Générer un roadbook <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {roadbooks.map((rb) => (
            <div key={rb.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-xs text-white">{rb.name}</h4>
                </div>
                <p className="text-[10px] text-neutral-400">
                  {rb.actualDistanceKm} km • D+ {rb.dplus}m • {rb.surface} • ~{rb.timeEst}
                </p>
              </div>
              <button
                onClick={() => handleShare(rb)}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 rounded-xl text-xs font-bold border border-neutral-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Copier
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
