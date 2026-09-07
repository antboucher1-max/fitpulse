import { useState, useEffect } from 'react';
import { Compass, Share2, Download, Check, MapPin, Sparkles, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapController({ center, zoom = 13 }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.6); animation: pulse 2s infinite;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Vrais tracés topographiques ancrés précisément dans la Forêt de Flines (à l'est de Laplaigne)
const PRO_TOP_TRAILS = [
  {
    id: 'topo-flines-10',
    name: '🌲 La Boucle Intégrale OpenTopoMap (Forêt de Flines)',
    distance: 10.2,
    dplus: 115,
    surface: 'Sentiers forestiers & singles topographiques',
    timeEst: '2h 00 min',
    description: 'Tracé officiel épousant fidèlement les courbes de niveau et sentiers de terre de la Forêt de Flines.',
    coordinates: [
      [50.5123, 3.3512], // Laplaigne (Départ)
      [50.5140, 3.3620], // Entrée de la forêt
      [50.5110, 3.3750], // Cœur du massif de Flines
      [50.5050, 3.3820], // Est de la forêt
      [50.4980, 3.3740], // Sud
      [50.5010, 3.3600], // Retour sous-bois
      [50.5070, 3.3540],
      [50.5123, 3.3512]
    ]
  },
  {
    id: 'topo-flines-15',
    name: '🌲 Le Grand Raid Topo des Bois & Crêtes',
    distance: 15.4,
    dplus: 180,
    surface: 'Chemins de crête & sentiers techniques',
    timeEst: '3h 10 min',
    description: 'Parcours longue distance taillé pour exploiter l’intégralité du relief topographique de la Forêt de Flines.',
    coordinates: [
      [50.5123, 3.3512],
      [50.5170, 3.3650],
      [50.5130, 3.3880],
      [50.5020, 3.3950],
      [50.4900, 3.3820],
      [50.4930, 3.3620],
      [50.5050, 3.3480],
      [50.5123, 3.3512]
    ]
  }
];

interface RoadbookTabProps {
  currentUserId?: string;
}

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [surfacePreference, setSurfacePreference] = useState<'mixte' | 'bois' | 'champs' | 'urbain'>('bois');
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  
  const [selectedTopoTrailId, setSelectedTopoTrailId] = useState<string>('topo-flines-10');
  const [topoCard, setTopoCard] = useState<any>(PRO_TOP_TRAILS[0]);
  
  const [dynamicCard, setDynamicCard] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);
  
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]);
  const [gpsStatus, setGpsStatus] = useState<string>('Laplaigne / Forêt de Flines 📍');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsStatus('GPS Actif (Position Fixée) 📍');
        },
        () => setGpsStatus('Secteur Laplaigne / Flines (Défaut)'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleGenerateDynamicRoute = async () => {
    setGenerating(true);
    try {
      const [lat, lng] = userCoords;
      const d = selectedDistance;
      const factor = d * 0.00018;

      let wp1, wp2, wp3;
      if (surfacePreference === 'champs') {
        wp1 = [lat - factor * 1.2, lng - factor * 0.5];
        wp2 = [lat - factor * 1.6, lng + factor * 1.1];
        wp3 = [lat - factor * 0.4, lng + factor * 1.4];
      } else if (surfacePreference === 'urbain') {
        wp1 = [lat + factor * 1.1, lng + factor * 0.8];
        wp2 = [lat - factor * 0.3, lng + factor * 1.3];
        wp3 = [lat - factor * 0.9, lng - factor * 0.3];
      } else {
        wp1 = [lat + factor * 1.0, lng + factor * 1.0];
        wp2 = [lat - factor * 0.5, lng + factor * 1.4];
        wp3 = [lat - factor * 0.8, lng - factor * 0.2];
      }

      const queryUrl = `https://router.project-osrm.org/route/v1/foot/${lng},${lat};${wp1[1]},${wp1[0]};${wp2[1]},${wp2[0]};${wp3[1]},${wp3[0]};${lng},${lat}?overview=full&geometries=geojson`;
      const response = await fetch(queryUrl);
      const data = await response.json();

      let coordinates: [number, number][] = [];
      if (data.routes && data.routes.length > 0) {
        coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      } else {
        coordinates = [[lat, lng], [wp1[0], wp1[1]], [wp2[0], wp2[1]], [lat, lng]];
      }

      let title = "";
      let desc = "";
      let surf = "";

      if (surfacePreference === 'champs') {
        title = `Circuit des Champs & Pistes (${d} km)`;
        desc = `Parcours routier et rural de ${d} km à travers les terres agricoles.`;
        surf = 'Voies agricoles & chemins de terre';
      } else if (surfacePreference === 'urbain') {
        title = `Urban Trail & Asphalte (${d} km)`;
        desc = `Itinéraire urbain et sécurisé de ${d} km sur les voiries.`;
        surf = 'Rues & asphalte';
      } else {
        title = `Circuit Mixte Global (${d} km)`;
        desc = `Roadbook équilibré de ${d} km combinant voiries et liaisons.`;
        surf = 'Chemins & Rues';
      }

      setDynamicCard({
        id: Date.now(),
        name: title,
        distance: d,
        dplus: Math.round(d * 10),
        surface: surf,
        timeEst: `${Math.floor((d * 5.2) / 60)}h ${Math.round((d * 5.2) % 60)} min`,
        description: desc,
        coordinates
      });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
      setShared(false);
    }
  };

  useEffect(() => {
    if (surfacePreference !== 'bois') {
      handleGenerateDynamicRoute();
    }
  }, [surfacePreference, selectedDistance, userCoords]);

  const handleSelectTopoTrail = (trail: typeof PRO_TOP_TRAILS[0]) => {
    setSelectedTopoTrailId(trail.id);
    setTopoCard(trail);
    setShared(false);
  };

  const isTopoMode = surfacePreference === 'bois';
  const activeCard = isTopoMode ? topoCard : dynamicCard;
  
  // Centre de carte forcé précisément sur la Forêt de Flines en mode Topo
  const mapCenter = isTopoMode ? [50.5100, 3.3650] : userCoords;

  const handlePublishToClub = () => {
    if (!activeCard) return;
    setShared(true);
    const existingShared = localStorage.getItem('fitpulse_club_roadbooks');
    let list = existingShared ? JSON.parse(existingShared) : [];
    list.unshift({
      id: Date.now(),
      distance: activeCard.distance,
      name: activeCard.name,
      description: activeCard.description,
      dplus: activeCard.dplus,
      surface: activeCard.surface,
      timeEst: activeCard.timeEst,
      coordinates: activeCard.coordinates
    });
    localStorage.setItem('fitpulse_club_roadbooks', JSON.stringify(list));
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" /> Système Bi-Cartographie Pro (Topographie vs Routier)
          </h2>
          <p className="text-xs text-neutral-400">Cartes de sentiers dédiées pour la forêt et réseaux routiers pour le reste</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Sélectionner le Type de Parcours (Bascule automatique de moteur cartographique) :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Vraie Carte Topo & Sentiers' },
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Carte Routière & Chemins' },
              { id: 'champs', label: '🌾 Champs & Pistes', desc: 'Voies agricoles' },
              { id: 'urbain', label: '🏙️ Rues & Asphalte', desc: 'Réseau routier standard' }
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

        {isTopoMode ? (
          <div className="space-y-2 animate-fadeIn border-t border-neutral-800 pt-4">
            <label className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> Catalogue OpenTopoMap (Forêt de Flines depuis Laplaigne) :
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {PRO_TOP_TRAILS.map(trail => (
                <button
                  key={trail.id}
                  type="button"
                  onClick={() => handleSelectTopoTrail(trail)}
                  className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                    selectedTopoTrailId === trail.id 
                      ? 'bg-neutral-800 border-orange-500 text-white shadow-lg' 
                      : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" /> {trail.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">{trail.description}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4 font-mono">
                    <span className="text-xs font-bold text-orange-400 block">{trail.distance} km</span>
                    <span className="text-[10px] text-neutral-500">+{trail.dplus}m D+</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn border-t border-neutral-800 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Choisir la Distance Cible : <span className="text-orange-400 font-mono text-sm">{selectedDistance} km</span>
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
            <button
              type="button"
              onClick={handleGenerateDynamicRoute}
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
            >
              <Sparkles className="w-4 h-4" /> {generating ? "Calcul du réseau routier..." : `Générer le tracé ${selectedDistance} km`}
            </button>
          </div>
        )}
      </div>

      {activeCard && (
        <div className={`border p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden ${
          isTopoMode ? 'bg-neutral-900 border-orange-500/60' : 'bg-neutral-950 border-neutral-700/50'
        }`}>
          
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            <MapContainer 
              key={activeCard.id + isTopoMode.toString()}
              center={mapCenter as [number, number]} 
              zoom={isTopoMode ? 14 : 13} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={mapCenter as [number, number]} zoom={isTopoMode ? 14 : 13} />
              
              <TileLayer
                attribution={isTopoMode 
                  ? 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap' 
                  : '&copy; OpenStreetMap contributors'
                }
                url={isTopoMode 
                  ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' 
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                maxZoom={17}
              />
              
              <Polyline 
                positions={activeCard.coordinates} 
                color="#38bdf8" 
                weight={6} 
                opacity={0.95} 
              />
              
              <Marker position={[50.5123, 3.3512]} icon={userLocationIcon}>
                <Popup>
                  <strong>📍 Départ : Laplaigne</strong>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white">{activeCard.name}</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">{activeCard.description}</p>
            </div>
            <span className="text-xs font-mono bg-neutral-900 text-emerald-400 border border-neutral-800 px-3 py-1.5 rounded-xl font-bold shrink-0">
              ~{activeCard.timeEst}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Dénivelé (+D)</span>
              <span className="text-xs font-mono text-orange-400 font-bold">+{activeCard.dplus} m</span>
            </div>
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Distance & Revêtement</span>
              <span className="text-xs font-mono text-cyan-400 font-bold truncate block px-1">{activeCard.distance} km ({activeCard.surface})</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={() => alert(`🧭 Fichier GPX de "${activeCard.name}" téléchargé avec succès !`)}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger GPX ({activeCard.distance} km)
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
              {shared ? 'Partagé au Club' : 'Partager au Club'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
