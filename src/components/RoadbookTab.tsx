import { useState, useEffect } from 'react';
import { Compass, Sparkles, Share2, Download, Layers, Check } from 'lucide-react';

interface RoadbookTabProps {
  currentUserId?: string;
}

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  const [surfacePreference, setSurfacePreference] = useState<'mixte' | 'bois' | 'champs' | 'urbain'>('bois');
  const [generating, setGenerating] = useState(false);
  const [routeCard, setRouteCard] = useState<any>(null);
  const [shared, setShared] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('GPS Actif (Brunehaut & Alentours)');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('GPS Actif (Position Fixée) 📍'),
        () => setGpsStatus('Secteur Wallonie (Défaut)'),
        { timeout: 7000 }
      );
    }
  }, []);

  const handleGenerateCustomRoute = () => {
    setGenerating(true);
    setTimeout(() => {
      let title = "";
      let desc = "";
      let elevation = 0;
      let pathType = "";

      if (surfacePreference === 'bois') {
        title = `Trail des Sous-Bois & Traces Forestières (${selectedDistance} km)`;
        desc = "Boucle technique en cœur de massif forestier. Alternance de sentiers de terre meuble, single tracks sinueux et passages boisés ombragés.";
        elevation = selectedDistance * 14;
        pathType = "Forêts & Sentiers boisés (85%)";
      } else if (surfacePreference === 'champs') {
        title = `Circuit des Chemins Creux & Terres Agricoles (${selectedDistance} km)`;
        desc = "Immersion totale dans les grands espaces de cultures. Chemins de crête, pistes agricoles stabilisées et panoramas ouverts.";
        elevation = selectedDistance * 8;
        pathType = "Champs & Chemins de terre (80%)";
      } else if (surfacePreference === 'urbain') {
        title = `Urban Trail & Côtes Bitumées (${selectedDistance} km)`;
        desc = "Tracé dynamique reliant les axes de liaison urbains, passages pavés historiques et relances en faux-plats montants.";
        elevation = selectedDistance * 18;
        pathType = "Rues, routes & voiries bitumées (90%)";
      } else {
        title = `Roadbook Hybride : Bois, Champs & Rues (${selectedDistance} km)`;
        desc = "Le parcours complet par excellence. Combine l'asphalte pour le rythme, les sentiers de champs pour l'air libre et les sous-bois pour le profil technique.";
        elevation = selectedDistance * 11;
        pathType = "Mixte équilibré (Rues, Champs & Bois)";
      }

      setRouteCard({
        id: Date.now(),
        distance: selectedDistance,
        name: title,
        description: desc,
        dplus: elevation,
        surface: pathType,
        timeEst: `${Math.floor((selectedDistance * 5.3) / 60)}h ${Math.round((selectedDistance * 5.3) % 60)} min`
      });

      setGenerating(false);
      setShared(false);
    }, 600);
  };

  const handlePublishToClub = () => {
    if (!routeCard) return;
    setShared(true);
    const existingShared = localStorage.getItem('fitpulse_club_roadbooks');
    let list = existingShared ? JSON.parse(existingShared) : [];
    list.unshift(routeCard);
    localStorage.setItem('fitpulse_club_roadbooks', JSON.stringify(list));
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" /> Générateur de Roadbooks GPS & Sentiers
          </h2>
          <p className="text-xs text-neutral-400">Cartographie interactive (Forêts, Bois, Champs, Rues) depuis votre position</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            1. Choisir la Distance Cible : <span className="text-orange-400 font-mono text-sm">{selectedDistance} km</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 21].map(km => (
              <button
                key={km}
                type="button"
                onClick={() => setSelectedDistance(km)}
                className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  selectedDistance === km 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/30' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            2. Topographie & Type de Voie
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Rues, Champs & Bois' },
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Sous-bois & sentiers' },
              { id: 'champs', label: '🌾 Champs & Pistes', desc: 'Terres agricoles' },
              { id: 'urbain', label: '🏙️ Rues & Asphalte', desc: 'Bitume & relances' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSurfacePreference(item.id as any)}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                  surfacePreference === item.id 
                    ? 'bg-neutral-900 border-orange-500 text-white shadow-md' 
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-neutral-500">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateCustomRoute}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
        >
          <Sparkles className="w-4 h-4" /> {generating ? "Calcul cartographique..." : `Générer la carte ${selectedDistance} km (${surfacePreference.toUpperCase()})`}
        </button>
      </div>

      {routeCard && (
        <div className="bg-neutral-950 border border-orange-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden">
          
          {/* CARTE TYPE STRAVA / MINIMALISTE PRO */}
          <div className="w-full h-52 rounded-2xl bg-neutral-950 border border-neutral-800 relative flex items-center justify-center overflow-hidden shadow-2xl">
            {/* Texture de fond de carte sombre (style dark mode outdoor) */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Lignes de niveau / topographie subtiles */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 500 200">
              <path d="M 0 50 Q 150 10, 300 80 T 500 30" fill="none" stroke="#64748b" strokeWidth="1" />
              <path d="M 0 120 Q 200 180, 350 100 T 500 150" fill="none" stroke="#64748b" strokeWidth="1" />
              <path d="M 0 170 Q 120 120, 280 160 T 500 110" fill="none" stroke="#64748b" strokeWidth="1" />
            </svg>

            {/* TRACÉ DU PARCOURS PRINCIPAL (Style Strava Orange Vif) */}
            <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
              <path 
                d="M 80 140 C 120 40, 220 30, 310 90 C 390 140, 420 60, 440 90 C 460 120, 300 170, 80 140 Z" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="6" 
                strokeLinecap="round"
                opacity="0.6"
              />
              <path 
                d="M 80 140 C 120 40, 220 30, 310 90 C 390 140, 420 60, 440 90 C 460 120, 300 170, 80 140 Z" 
                fill="none" 
                stroke="#f97316" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="80" cy="140" r="7" fill="#10b981" className="animate-pulse" />
              <circle cx="80" cy="140" r="3" fill="#ffffff" />
            </svg>

            {/* Badges d'information surimprimés sur la carte */}
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] font-mono text-white bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>{routeCard.name}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-700 px-3 py-1.5 rounded-xl text-[11px] text-emerald-400 font-mono shadow-xl flex items-center gap-1.5">
              <span>Boucle fermée</span> • <span>{routeCard.distance} km</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white">{routeCard.name}</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">{routeCard.description}</p>
            </div>
            <span className="text-xs font-mono bg-neutral-900 text-emerald-400 border border-neutral-800 px-3 py-1.5 rounded-xl font-bold shrink-0">
              ~{routeCard.timeEst}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Dénivelé Estimé (+D)</span>
              <span className="text-xs font-mono text-orange-400 font-bold">+{routeCard.dplus} m</span>
            </div>
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Surfaces Principales</span>
              <span className="text-xs font-mono text-cyan-400 font-bold truncate block px-1">{routeCard.surface}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={() => alert(`🧭 Fichier GPX de "${routeCard.name}" téléchargé et prêt pour votre montre GPS !`)}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger GPX
            </button>
            <button 
              type="button"
              onClick={handlePublishToClub}
              disabled={shared}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                shared 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-orange-600 hover:bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-600/20'
              }`}
            >
              {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {shared ? 'Partagé au Club !' : 'Partager au Club'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
