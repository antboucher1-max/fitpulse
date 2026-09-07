import PaywallGate from './PaywallGate';
import { useState, useEffect, useRef } from 'react';
import { 
  Mountain, Compass as CompassIcon, Trophy, Award, Zap, ChevronDown, ChevronUp, ArrowLeft, Upload, Edit3, X, Download, Trees, Footprints, CheckCircle2, ListOrdered
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';
import gpxParser from 'gpxparser';

function MapController({ center, plannedRoute }: { center: [number, number], plannedRoute?: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (plannedRoute && plannedRoute.length > 0) {
      map.fitBounds(L.latLngBounds(plannedRoute), { padding: [50, 50], animate: true });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, plannedRoute, map]);
  return null;
}

// --- GUIDE DE BIENVENUE ---
function WelcomeGuideModal({ username, onClose }: { username: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <div className="text-center space-y-2">
          <span className="text-2xl">🌲</span>
          <h3 className="text-lg font-black text-white">Bienvenue dans ton QG Trail, {username} !</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Planificateur de sentiers pro, génération de table de marche altimétrique et export GPX pour votre montre.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
        >
          Accéder au QG 🚀
        </button>
      </div>
    </div>
  );
}

// --- FITBOT SNC ---
function FitBotSNC({ readinessScore = 78, weeklyLoad = 45 }: { readinessScore?: number; weeklyLoad?: number }) {
  const isLocked = readinessScore < 50 || weeklyLoad > 80;
  return (
    <div className={`border rounded-3xl p-4 space-y-2 shadow-xl ${isLocked ? 'bg-red-950/20 border-red-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase text-orange-400">
        <Zap className="w-4 h-4 animate-pulse" /> FitBot SNC (Auto-Régulation IA)
      </div>
      <p className="text-xs text-neutral-300">
        {isLocked ? "🚨 [ALERTE SNC] Fatigue nerveuse détectée. Intensité verrouillée." : "⚡ [SNC Optimal] Système nerveux paré pour l'effort."}
      </p>
    </div>
  );
}

// --- FUEL-LOCK POST-WOD ---
function FuelLockPostWod({ lastRunDistanceKm = 10, bodyWeightKg = 70 }: { lastRunDistanceKm?: number; bodyWeightKg?: number }) {
  const [recipe, setRecipe] = useState<any>(null);
  const targetCarbs = Math.round(lastRunDistanceKm * 8);
  const targetProt = Math.round(bodyWeightKg * 0.4);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-black text-cyan-400 uppercase">
        <span>Fuel-Lock Post-Effort 🧬</span>
        <span>Cible : {targetCarbs}g Glucides</span>
      </div>
      {!recipe ? (
        <button onClick={() => setRecipe({ title: "Bowl Récupération Poulet / Patate Douce", macros: `Glucides : ~${targetCarbs}g | Protéines : ~${targetProt}g` })} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs uppercase cursor-pointer">
          Générer la recette 🥗
        </button>
      ) : (
        <div className="bg-neutral-950 p-3 rounded-xl border border-cyan-500/30 text-xs space-y-1">
          <div className="font-bold text-cyan-300">{recipe.title}</div>
          <div className="text-emerald-400 font-mono">{recipe.macros}</div>
        </div>
      )}
    </div>
  );
}

export default function RunningTab({
  currentUserProfile,
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  onSaveRunPost,
  onUpdateShoeKm,
  onBack
}: any) {
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => !localStorage.getItem('fitpulse_runner_guide_seen'));
  const [activeTabSection, setActiveTabSection] = useState<'none' | 'terrains' | 'ravito' | 'gear'>('terrains');

  // Planificateur d'itinéraires Pro & Table de marche
  const [selectedTerrain, setSelectedTerrain] = useState<'bois' | 'carrieres' | 'champs'>('bois');
  const [targetDistanceKm, setTargetDistanceKm] = useState<number>(10);
  const [basePaceMin, setBasePaceMin] = useState<number>(5);
  const [basePaceSec, setBasePaceSec] = useState<number>isBasePaceSecValid => 30; // 5'30"/km de base
  const [plannedRoutePositions, setPlannedRoutePositions] = useState<Array<[number, number]>>([[50.505, 3.325], [50.512, 3.335], [50.508, 3.345], [50.502, 3.330], [50.505, 3.325]]);
  const [plannedDPlus, setPlannedDPlus] = useState<number>(150);
  const [roadbook, setRoadbook] = useState<Array<{ km: number; elevation: number; targetPace: string; cumulativeTime: string }>>([]);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState<boolean>(false);

  // Bilan Post-Effort (import GPX)
  const [importedRunData, setImportedRunData] = useState<{ distance: number; dPlus: number; timeSec: number } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavingRun, setIsSavingRun] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDist, setManualDist] = useState<string>('10');
  const [manualDPlus, setManualDPlus] = useState<string>('150');
  const [manualHours, setManualHours] = useState<string>('0');
  const [manualMins, setManualMins] = useState<string>('55');

  // Planificateur de ravitaillement
  const [durationHours, setDurationHours] = useState<number>(1);
  const [durationMins, setDurationMins] = useState<number>(30);

  const usernameToUse = currentUserProfile?.username || "Runner";

  const handleCloseGuide = () => {
    localStorage.setItem('fitpulse_runner_guide_seen', 'true');
    setShowWelcomeGuide(false);
  };

  // --- GÉNÉRATEUR DE ROADBOOK & TABLE DE MARCHE ALTIMÉTRIQUE ---
  const generateRoadbookAndRoute = async () => {
    setIsGeneratingRoute(true);
    try {
      const baseLat = 50.505;
      const baseLng = 3.325;
      
      let latMultiplier = 0.015;
      let lngMultiplier = 0.02;
      if (selectedTerrain === 'carrieres') { latMultiplier = 0.02; lngMultiplier = 0.012; }
      else if (selectedTerrain === 'champs') { latMultiplier = 0.008; lngMultiplier = 0.035; }

      const targetLat = baseLat + (targetDistanceKm / 10) * latMultiplier;
      const targetLng = baseLng + (targetDistanceKm / 10) * lngMultiplier;

      const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${baseLng},${baseLat};${targetLng},${targetLat};${baseLng + 0.01},${baseLat - 0.01};${baseLng},${baseLat}?overview=full&geometries=geojson`);
      const data = await res.json();

      if (data?.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        setPlannedRoutePositions(coords);
      }

      const totalD = selectedTerrain === 'carrieres' ? Math.round(targetDistanceKm * 28) : selectedTerrain === 'bois' ? Math.round(targetDistanceKm * 18) : Math.round(targetDistanceKm * 8);
      setPlannedDPlus(totalD);

      // Calcul des splits km par km avec impact du relief
      const baseSecPerKm = basePaceMin * 60 + basePaceSec;
      let cumulativeSec = 0;
      const newRoadbook = [];

      for (let i = 1; i <= targetDistanceKm; i++) {
        // Simulation d'une variation de dénivelé par kilomètre selon le terrain
        const kmEle = Math.round((Math.sin(i * 1.5) * (selectedTerrain === 'carrieres' ? 25 : 12)) + (totalD / targetDistanceKm));
        
        // Ajustement de l'allure : chaque mètre de D+ positif rajoute 2.5 secondes au kilomètre
        const paceAdjustment = kmEle > 0 ? kmEle * 2.5 : -1;
        const kmSec = Math.max(200, baseSecPerKm + paceAdjustment);
        
        cumulativeSec += kmSec;
        const mins = Math.floor(kmSec / 60);
        const secs = Math.round(kmSec % 60);

        const totalH = Math.floor(cumulativeSec / 3600);
        const totalM = Math.floor((cumulativeSec % 3600) / 60);
        const totalS = Math.round(cumulativeSec % 60);
        const timeStr = totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m ${totalS}s`;

        newRoadbook.push({
          km: i,
          elevation: kmEle,
          targetPace: `${mins}'${secs.toString().padStart(2, '0')}"`,
          cumulativeTime: timeStr
        });
      }

      setRoadbook(newRoadbook);
    } catch {
      alert("Erreur lors de la génération du parcours.");
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  // --- EXPORT GPX VERS MONTRE ---
  const handleExportGpx = () => {
    if (plannedRoutePositions.length === 0) return alert("Aucun itinéraire à exporter.");
    
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="FitPulse Pro">\n  <trk>\n    <name>FitPulse - Boucle ${selectedTerrain.toUpperCase()} (${targetDistanceKm}km)</name>\n    <trkseg>\n`;
    
    plannedRoutePositions.forEach(([lat, lon], idx) => {
      const ele = 40 + Math.sin(idx) * (selectedTerrain === 'carrieres' ? 25 : 12);
      gpxContent += `      <trkpt lat="${lat}" lon="${lon}"><ele>${ele.toFixed(1)}</ele></trkpt>\n`;
    });

    gpxContent += `    </trkseg>\n  </trk>\n</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitPulse_${selectedTerrain}_${targetDistanceKm}km.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`✅ Fichier GPX exporté ! Transférez-le sur votre montre (Garmin / Coros / Wahoo).`);
  };

  // --- PARSEUR GPX POST-EFFORT AVEC FILTRE ALTIMÉTRIQUE AVANCÉ ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const gpx = new gpxParser();
        gpx.parse(evt.target?.result as string);
        const tracks = gpx.tracks[0];
        if (tracks?.points?.length > 0) {
          const km = Number((tracks.distance.total / 1000).toFixed(2));
          let dPlus = 0;
          const elevations = tracks.points.map((p: any) => p.ele).filter((ele: any) => ele !== undefined);

          if (elevations.length > 0) {
            let climbingBuffer = 0;
            let lastEle = elevations[0];
            for (let i = 1; i < elevations.length; i++) {
              const diff = elevations[i] - lastEle;
              if (diff > 0) climbingBuffer += diff;
              else if (diff < -1.5) {
                if (climbingBuffer >= 2.5) dPlus += climbingBuffer;
                climbingBuffer = 0;
                lastEle = elevations[i];
              }
              if (elevations[i] > lastEle) lastEle = elevations[i];
            }
            if (climbingBuffer >= 2.5) dPlus += climbingBuffer;
          } else {
            dPlus = km * 20;
          }

          const timeSec = Math.round(km * (basePaceMin * 60 + basePaceSec));
          setImportedRunData({ distance: km, dPlus: Math.round(dPlus), timeSec });
          setIsReportModalOpen(true);
        }
      } catch {
        alert("Erreur de lecture du fichier GPX.");
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(manualDist) || 0;
    const dP = parseInt(manualDPlus) || 0;
    const timeSec = (parseInt(manualHours) || 0) * 3600 + (parseInt(manualMins) || 0) * 60;
    if (dist <= 0) return alert("Indique une distance valide.");
    setImportedRunData({ distance: dist, dPlus: dP, timeSec });
    setIsManualModalOpen(false);
    setIsReportModalOpen(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPaceFormatted = (dist: number, secs: number) => {
    if (dist <= 0 || secs <= 0) return '--:--';
    const totalSecsPerKm = secs / dist;
    const mins = Math.floor(totalSecsPerKm / 60);
    const remainSecs = Math.round(totalSecsPerKm % 60);
    return `${mins}'${remainSecs.toString().padStart(2, '0')}"`;
  };

  const totalActiveHours = durationHours + durationMins / 60;
  const totalCarbs = Math.round(60 * totalActiveHours);
  const totalWaterMl = Math.round(600 * totalActiveHours);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {showWelcomeGuide && <WelcomeGuideModal username={usernameToUse} onClose={handleCloseGuide} />}

      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      {/* =========================================================================
          1. ARCHITECTE DE SENTIERS & TABLE DE MARCHE PRO
          ========================================================================= */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Architecte de Sentiers Pro</span>
            <h2 className="text-xl font-black text-white tracking-tight pt-0.5">Planificateur & Table de Marche</h2>
          </div>
          <span className="text-xs font-bold bg-sky-500/20 text-sky-400 px-3.5 py-1.5 rounded-full border border-sky-500/30">
            Roadbook 🧭
          </span>
        </div>

        {/* Sélecteur de Terrains */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setSelectedTerrain('bois')}
            className={`py-3 px-3 rounded-2xl font-bold text-xs uppercase flex flex-col items-center gap-1.5 transition cursor-pointer border ${selectedTerrain === 'bois' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <Trees className="w-4 h-4" /> Bois / Forêt
          </button>
          <button 
            onClick={() => setSelectedTerrain('carrieres')}
            className={`py-3 px-3 rounded-2xl font-bold text-xs uppercase flex flex-col items-center gap-1.5 transition cursor-pointer border ${selectedTerrain === 'carrieres' ? 'bg-orange-950/60 border-orange-500 text-orange-400 shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <Mountain className="w-4 h-4" /> Carrières
          </button>
          <button 
            onClick={() => setSelectedTerrain('champs')}
            className={`py-3 px-3 rounded-2xl font-bold text-xs uppercase flex flex-col items-center gap-1.5 transition cursor-pointer border ${selectedTerrain === 'champs' ? 'bg-sky-950/60 border-sky-500 text-sky-400 shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
          >
            <Footprints className="w-4 h-4" /> Champs & Chemins
          </button>
        </div>

        {/* Contrôles Distance & Allure de Base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex justify-between text-xs font-bold text-neutral-300">
              <span>Distance cible :</span>
              <span className="text-emerald-400 font-mono text-sm">{targetDistanceKm} km</span>
            </div>
            <input 
              type="range" min="5" max="30" step="1" 
              value={targetDistanceKm} 
              onChange={e => setTargetDistanceKm(Number(e.target.value))} 
              className="w-full accent-emerald-500 cursor-pointer" 
            />
          </div>

          <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex justify-between text-xs font-bold text-neutral-300">
              <span>Allure de base :</span>
              <span className="text-orange-400 font-mono text-sm">{basePaceMin}'{basePaceSec.toString().padStart(2, '0')}" /km</span>
            </div>
            <div className="flex gap-2">
              <select 
                value={basePaceMin} 
                onChange={e => setBasePaceMin(Number(e.target.value))} 
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 text-white font-mono text-xs"
              >
                {[4, 5, 6, 7].map(m => <option key={m} value={m}>{m} min</option>)}
              </select>
              <select 
                value={basePaceSec} 
                onChange={e => setBasePaceSec(Number(e.target.value))} 
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 text-white font-mono text-xs"
              >
                {[0, 15, 30, 45].map(s => <option key={s} value={s}>{s.toString().padStart(2, '0')} sec</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Boutons d'Action Itinéraire */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={generateRoadbookAndRoute} 
            disabled={isGeneratingRoute}
            className="py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            {isGeneratingRoute ? "Calcul..." : "Générer le Roadbook & la Boucle ⚡"}
          </button>
          <button 
            onClick={handleExportGpx}
            className="py-3.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer border border-emerald-500/40 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Exporter le .GPX Montre 📥
          </button>
        </div>

        {/* Affichage de la Table de Marche Prévisionnelle (Roadbook) */}
        {roadbook.length > 0 && (
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-sky-400">
              <ListOrdered className="w-4 h-4" /> Table de Marche Prévisionnelle (Ajustée au relief)
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {roadbook.map((row) => (
                <div key={row.km} className="flex justify-between items-center bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800/60">
                  <span className="text-neutral-300 font-bold">Km {row.km}</span>
                  <span className={row.elevation >= 0 ? 'text-emerald-400' : 'text-cyan-400'}>
                    {row.elevation >= 0 ? `+${row.elevation}m` : `${row.elevation}m`} D±
                  </span>
                  <span className="text-orange-400">Allure : {row.targetPace}</span>
                  <span className="text-neutral-400">Temps : {row.cumulativeTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu Carte Leaflet */}
        <div className="w-full h-56 rounded-2xl overflow-hidden border border-neutral-800">
          <MapContainer center={plannedRoutePositions[0] || [50.505, 3.325]} zoom={14} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
            <MapController center={plannedRoutePositions[0] || [50.505, 3.325]} plannedRoute={plannedRoutePositions} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={plannedRoutePositions} pathOptions={{ color: '#38bdf8', weight: 6 }} />
          </MapContainer>
        </div>
      </div>

      <FitBotSNC readinessScore={78} weeklyLoad={45} />

      {/* =========================================================================
          2. CENTRE D'ANALYSE POST-EFFORT (IMPORT GPX & SAISIE MANUELLE)
          ========================================================================= */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Carnet d'Entraînement</span>
            <h2 className="text-xl font-black text-white tracking-tight pt-0.5">Analyser une Sortie Réalisée</h2>
          </div>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
            Post-Effort 📊
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Importez votre fichier GPX de montre ou enregistrez votre effort manuellement pour mettre à jour vos chaussures et vos stats de club.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center justify-center gap-2.5 py-4 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer text-center">
            <Upload className="w-4 h-4" /> Importer ma trace .GPX 🛰️
            <input type="file" accept=".gpx" onChange={handleFileUpload} className="hidden" />
          </label>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center justify-center gap-2.5 py-4 px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer border border-neutral-700 text-center"
          >
            <Edit3 className="w-4 h-4 text-orange-400" /> Saisie manuelle ⏱️
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. TIROIRS DU QG (Ravitaillement & Gear Tracker)
          ========================================================================= */}
      <div className="space-y-3">
        {/* Ravitaillement */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button onClick={() => setActiveTabSection(activeTabSection === 'ravito' ? 'none' : 'ravito')} className="w-full p-4 flex justify-between items-center text-xs font-bold text-orange-400 cursor-pointer">
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Planificateur de Ravitaillement 🍎</span>
            {activeTabSection === 'ravito' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {activeTabSection === 'ravito' && (
            <div className="p-4 pt-0 border-t border-neutral-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block mb-1">Heures :</span>
                  <input type="number" min="0" max="12" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1">Minutes :</span>
                  <input type="number" min="0" max="55" step="5" value={durationMins} onChange={e => setDurationMins(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block uppercase">Glucides requis</span>
                  <b className="text-orange-400">{totalCarbs}g</b>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block uppercase">Hydratation</span>
                  <b className="text-cyan-400">{(totalWaterMl / 1000).toFixed(2)}L</b>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gear Tracker */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button onClick={() => setActiveTabSection(activeTabSection === 'gear' ? 'none' : 'gear')} className="w-full p-4 flex justify-between items-center text-xs font-bold text-emerald-400 cursor-pointer">
            <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Gear Tracker (Chaussures & Usure) 👟</span>
            {activeTabSection === 'gear' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {activeTabSection === 'gear' && (
            <div className="p-4 pt-0 border-t border-neutral-800">
              <GearTrackerSection shoes={shoes} onAddShoe={onAddShoe} onDeleteShoe={onDeleteShoe} onSetActiveShoe={onSetActiveShoe} />
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODALE DE SAISIE MANUELLE
          ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-400" /> Saisie manuelle d'une sortie
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="p-2 text-neutral-400 rounded-xl bg-neutral-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-bold block mb-1">Distance (km) :</label>
                <input type="number" step="0.01" value={manualDist} onChange={e => setManualDist(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono" required />
              </div>
              <div>
                <label className="text-neutral-400 font-bold block mb-1">Dénivelé positif (m D+) :</label>
                <input type="number" value={manualDPlus} onChange={e => setManualDPlus(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Heures :</label>
                  <input type="number" min="0" max="24" value={manualHours} onChange={e => setManualHours(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Minutes :</label>
                  <input type="number" min="0" max="59" value={manualMins} onChange={e => setManualMins(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-lg mt-2">
                Valider et voir le bilan 🎯
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE BILAN DE COURSE POST-EFFORT & FUEL-LOCK
          ========================================================================= */}
      {isReportModalOpen && importedRunData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" /> Bilan de Course Certifié
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-neutral-400 rounded-xl bg-neutral-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <div><span className="text-[9px] text-neutral-400 block font-bold">Distance</span><b className="text-white">{importedRunData.distance.toFixed(2)}km</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Vrai D+</span><b className="text-emerald-400">+{importedRunData.dPlus}m</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Allure</span><b className="text-orange-400">{getPaceFormatted(importedRunData.distance, importedRunData.timeSec)}</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Chrono</span><b className="text-cyan-400">{formatTime(importedRunData.timeSec)}</b></div>
            </div>

            <FuelLockPostWod lastRunDistanceKm={importedRunData.distance} />

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => { 
                  setIsSavingRun(true); 
                  onSaveRunPost?.(`🎯 [SORTIE CLUB] ${importedRunData.distance} km en ${formatTime(importedRunData.timeSec)} (+${importedRunData.dPlus}m D+) 🚀`, importedRunData.distance); 
                  setIsReportModalOpen(false); 
                  setIsSavingRun(false); 
                }} 
                disabled={isSavingRun} 
                className="w-full py-3.5 bg-orange-600 text-white font-black rounded-2xl text-xs uppercase cursor-pointer"
              >
                Publier sur le Fil du Club 🏆
              </button>
              <button 
                onClick={() => { 
                  setIsSavingRun(true); 
                  if(shoes.length > 0 && onUpdateShoeKm) { 
                    const s = shoes.find((x:any)=>x.is_active||x.active); 
                    if(s) onUpdateShoeKm(s.id||s._id, importedRunData.distance); 
                  } 
                  setIsReportModalOpen(false); 
                  setIsSavingRun(false); 
                }} 
                disabled={isSavingRun} 
                className="w-full py-3 bg-neutral-800 text-neutral-300 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Enregistrer en privé & Mettre à jour chaussures 🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
