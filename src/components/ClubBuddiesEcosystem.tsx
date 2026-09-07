import { useState } from 'react';
import { MapPin, Share2, Compass, Plus, Users } from 'lucide-react';

interface ClubRoadbook {
  id: string;
  clubName: string;
  title: string;
  distanceKm: number;
  elevationGainM: number;
  gpxFileUrl: string;
  createdBy: string;
}

export default function ClubBuddiesEcosystem() {
  const [roadbooks, setRoadbooks] = useState<ClubRoadbook[]>([
    {
      id: '1',
      clubName: 'Club Tournai (Quais & Bastion)',
      title: 'Boucle des Écluses & Sentier de l’Escaut',
      distanceKm: 14.5,
      elevationGainM: 120,
      gpxFileUrl: '#',
      createdBy: 'Antoine Boucher'
    },
    {
      id: '2',
      clubName: 'CrossFit Box Indépendante',
      title: 'Trail Urbain & Côtes de la Citadelle',
      distanceKm: 9.2,
      elevationGainM: 240,
      gpxFileUrl: '#',
      createdBy: 'Coach Thomas'
    }
  ]);

  const [title, setTitle] = useState('');
  const [clubName, setClubName] = useState('Club Tournai (Quais & Bastion)');
  const [distanceKm, setDistanceKm] = useState(10);
  const [elevationGainM, setElevationGainM] = useState(100);

  const handleAddRoadbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook: ClubRoadbook = {
      id: Date.now().toString(),
      clubName,
      title: title.trim(),
      distanceKm: Number(distanceKm),
      elevationGainM: Number(elevationGainM),
      gpxFileUrl: '#',
      createdBy: 'Athlète FitPulse'
    };

    setRoadbooks([newBook, ...roadbooks]);
    setTitle('');
  };

  const formatRoadbookSummary = (roadbook: ClubRoadbook): string => {
    return `🗺️ [Roadbook Club] ${roadbook.title} (${roadbook.distanceKm} km | D+ ${roadbook.elevationGainM}m) - Partagé par ${roadbook.clubName}`;
  };

  const handleShare = (rb: ClubRoadbook) => {
    const summary = formatRoadbookSummary(rb);
    navigator.clipboard.writeText(summary);
    alert("📋 Roadbook copié dans le presse-papier ! Prêt à être partagé en privé avec votre club.");
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
          <Users className="w-4 h-4" /> Pilier 3 : Écosystème Club & Roadbooks GPS
        </div>
        <span className="text-xs font-bold bg-neutral-950 text-neutral-300 px-3 py-1 rounded-full border border-neutral-800">
          Espace B2B / B2C Privé
        </span>
      </div>

      {/* Formulaire de partage de roadbook */}
      <form onSubmit={handleAddRoadbook} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Partager un Roadbook de Sentier / Trail :</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input 
            type="text" placeholder="Titre du parcours (ex: Tour du Lac)..." 
            value={title} onChange={e => setTitle(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            required
          />
          <input 
            type="text" placeholder="Nom de votre Club / Box..." 
            value={clubName} onChange={e => setClubName(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-400 block mb-1">Distance (km)</label>
            <input 
              type="number" step="0.1" value={distanceKm} onChange={e => setDistanceKm(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 block mb-1">Dénivelé (m D+)</label>
            <input 
              type="number" value={elevationGainM} onChange={e => setElevationGainM(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
        <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Publier le Roadbook dans le Club
        </button>
      </form>

      {/* Liste des roadbooks disponibles */}
      <div className="space-y-3">
        {roadbooks.map(rb => (
          <div key={rb.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-white">{rb.title}</h4>
              </div>
              <p className="text-[10px] text-neutral-400">
                {rb.distanceKm} km • D+ {rb.elevationGainM}m • Écurie : <span className="text-emerald-400 font-semibold">{rb.clubName}</span>
              </p>
            </div>
            <button 
              onClick={() => handleShare(rb)}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 rounded-xl text-xs font-bold border border-neutral-800 transition flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Copier GPX / Infos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
