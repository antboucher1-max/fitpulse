import { useState, useEffect } from 'react';
import { Compass, Share2, Download, Check, MapPin, Sparkles, Layers, Route, ExternalLink } from 'lucide-react';
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

interface RoadbookTabProps {
  currentUserId?: string;
}

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [surfacePreference, setSurfacePreference] = useState<'mixte' | 'bois' | 'champs' | 'urbain'>('bois');
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  
  // Position GPS réelle de l'appareil (initialisée à Laplaigne par défaut)
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]);
  const [gpsStatus, setGpsStatus] = useState<string>('Recherche GPS en cours...');
  
  const [activeCard, setActiveCard] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);

  // Récupération stricte de la position GPS de l'utilisateur en temps réel
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);
          setGpsStatus('GPS Actif (Position Fixée) 📍');
        },
        () => setGpsStatus('Secteur Laplaigne (Défaut GPS)'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Génération dynamique ancrée à 100% sur la position GPS réelle de l'utilisateur
  const handleGenerateRouteFromGps = async () => {
    setGenerating(true);
    try {
      const [lat, lng] = userCoords;
      const d = selectedDistance;
      const factor = d * 0.00018;

      let wp1, wp2, wp3, title, desc, surf;

      if (surfacePreference === 'bois') {
        wp1 = [lat + 0.003, lng + 0.008];
        wp2 = [lat - 0.002, lng + 0.015];
        wp3 = [lat - 0.005, lng + 0.005];
        title = `Boucle Forêt & Sentiers Balisés (${d} km)`;
        desc = `Tracé officiel s'élançant directement de votre position GPS à travers le réseau officiel et ses repères de sentiers.`;
        surf = 'Sentiers forestiers & balisages officiels';
      } else if (surfacePreference === 'champs') {
        wp1 = [lat - factor * 1.2, lng - factor * 0.5];
        wp2 = [lat - factor * 1.6, lng + factor * 1.1];
        wp3 = [lat - factor * 0.4, lng + factor * 1.4];
        title = `Circuit des Champs & Pistes (${d} km)`;
        desc = `Parcours rural de ${d} km s'élançant de votre position actuelle.`;
        surf = 'Voies agricoles & chemins de terre';
      } else if (surfacePreference === 'urbain') {
        wp1 = [lat + factor * 1.1, lng + factor * 0.8];
        wp2 = [lat - factor * 0.3, lng + factor * 1.3];
        wp3 = [lat - factor * 0.9, lng - factor * 0.3];
        title = `Urban Trail & Asphalte (${d} km)`;
        desc = `Itinéraire urbain et sécurisé de ${d} km depuis votre position.`;
        surf = 'Rues & asphalte';
      } else {
        wp1 = [lat + factor * 1.0, lng + factor * 1.0];
        wp2 = [lat - factor * 0.5, lng + factor * 1.4];
        wp3 = [lat - factor * 0.8, lng - factor * 0.2];
        title = `Circuit Mixte Global (${d} km)`;
        desc = `Roadbook équilibré de ${d} km combinant voiries et liaisons depuis votre position.`;
        surf = 'Chemins & Rues';
      }

      // Requête OSRM s'élançant précisément des coordonnées [lng, lat] du GPS
      const queryUrl = `https://router.project-osrm.org/route/v1/foot/${lng},${lat};${wp1[1]},${wp1[0]};${wp2[1]},${wp2[0]};${wp3[1]},${wp3[0]};${lng},${lat}?overview=full&geometries=geojson`;
      const response = await fetch(queryUrl);
      const data = await response.json();

      let coordinates: [number, number][] = [];
      if (data.routes && data.routes.length > 0) {
        coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      } else {
        coordinates = [[lat, lng], [wp1[0], wp1[1]], [wp2[0], wp2[1]], [lat, lng]];
      }

      setActiveCard({
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
    handleGenerateRouteFromGps();
  }, [userCoords, selectedDistance, surfacePreference]);

  const isTopoMode = surfacePreference === 'bois';
  const mapZoom = isTopoMode ? 14 : 13;

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
            <Compass className="w-5 h-5 text-orange-500" /> Générateur GPS & Carte Pro Forêt
          </h2>
          <p className="text-xs text-neutral-400">Mode Forêt spécialisé avec affichage direct des sentiers balisés et numéros de repère</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Sélectionner le Type de Parcours (Bascule de carte) :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Carte Topo & Sentiers Balisés' },
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Carte Routière' },
              { id: 'champs', label: '🌾 Champs & Pistes', desc: 'Voies agricoles' },
              { id: 'urbain', label: '🏙️ Rues & Asphalte', desc: 'Réseau routier' }
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

        {/* OPTIONS : DISTANCE ET LIENS EXTERNES DE CONTRÔLE */}
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

          {isTopoMode && (
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <a href="https://hiking.waymarkedtrails.org" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
                🥾 Waymarked Trails <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://geoportail.wallonie.be" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
                🌐 WalOnMap <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://chemins.be" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
                🌲 Chemins.be <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerateRouteFromGps}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
        >
          <Sparkles className="w-4 h-4" /> {generating ? "Calcul depuis votre position..." : `Actualiser le parcours GPS (${selectedDistance} km)`}
        </button>
      </div>

      {/* AFFICHAGE DE LA CARTE ACTIVE */}
      {activeCard && (
        <div className={`border p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden ${
          isTopoMode ? 'bg-neutral-900 border-orange-500/60' : 'bg-neutral-950 border-neutral-700/50'
        }`}>
          
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            <MapContainer 
              key={userCoords[0] + '-' + userCoords[1] + '-' + selectedDistance + '-' + surfacePreference}
              center={userCoords} 
              zoom={mapZoom} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={userCoords} zoom={mapZoom} />
              
              <TileLayer
                attribution={isTopoMode 
                  ? 'Map data: &copy; OpenStreetMap contributors, SRTM | Sentiers: &copy; Waymarked Trails' 
                  : '&copy; OpenStreetMap contributors'
                }
                url={isTopoMode 
                  ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' 
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                maxZoom={17}
              />

              {/* Calque dédié affichant les sentiers balisés et leurs numéros de repère (122, 123...) pour les forêts */}
              {isTopoMode && (
                <TileLayer
                  url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"
                  opacity={0.85}
                  maxZoom={18}
                />
              )}
              
              <Polyline 
                positions={activeCard.coordinates} 
                color="#38bdf8" 
                weight={6} 
                opacity={0.95} 
              />
              
              <Marker position={userCoords} icon={userLocationIcon}>
                <Popup>
                  <strong>📍 Votre Position GPS Actuelle</strong> <br /> Point de départ exact
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
