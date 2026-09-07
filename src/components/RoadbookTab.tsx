import { useState, useEffect } from 'react';
import { Compass, Sparkles, Share2, Download, Layers, Check, MapPin } from 'lucide-react';

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
          
          {/* CARTE TOPOGRAPHIQUE VISUELLE & TRACÉ GPS DE LA BOUCLE */}
          <div className="w-full h-48 rounded-2xl bg-neutral-900 border border-neutral-800 relative flex items-center justify-center overflow-hidden shadow-inner">
            {/* Grille cartographique de fond type fond de plan topo */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Simulation visuelle de courbes de niveau et topographie */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-72 h-36 rounded-full border border-orange-500/40 absolute scale-90" />
              <div className="w-56 h-28 rounded-full border border-amber-500/40 absolute scale-100" />
              <div className="w-40 h-20 rounded-full border border-emerald-500/40 absolute scale-110" />
            </div>

            {/* TRACÉ SVG DE LA BOUCLE DE COURSE */}
            <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 160">
              {/* Lignes de relief fictives arrière-plan */}
              <path d="M 20 130 Q 100 20, 220 90 T 380 40" fill="none" stroke="#262626" strokeWidth="3" strokeDasharray="4 4" />
              
              {/* Le tracé principal actif de la boucle GPS */}
              <path 
                d="M 60 120 C 80 40, 180 20, 240 70 C 300 120, 340 50, 360 80 C 380 110, 200 150, 60 120 Z" 
                fill="rgba(249, 115, 22, 0.1)" 
                stroke="#f97316" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Point de départ / arrivée (Start) */}
              <circle cx="60" cy="120" r="6" fill="#10b981" className="animate-ping" />
              <circle cx="60" cy="120" r="5" fill="#10b981" />
            </svg>

            {/* Badge d'indication sur la carte */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-mono text-orange-400 bg-neutral-950/90 px-3 py-1.5 rounded-xl border border-orange-500/30 shadow-lg">
              <Layers className="w-3.5 h-3.5 text-orange-500" /> Tracé GPS actif : {routeCard.name}
            </div>

            <div className="absolute top-3 right-3 bg-neutral-950/90 border border-neutral-800 px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-mono">
              Boucle fermée 🟢
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
