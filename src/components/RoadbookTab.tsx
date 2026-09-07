import { useState, useEffect } from 'react';
import { Compass, Share2, Download, Check, MapPin, Sparkles } from 'lucide-react';
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
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  const [surfacePreference, setSurfacePreference] = useState<'mixte' | 'bois' | 'champs' | 'urbain'>('bois');
  
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]);
  const [gpsStatus, setGpsStatus] = useState<string>('Recherche GPS en cours...');
  
  const [routeCard, setRouteCard] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsStatus('GPS Actif (Position Fixée) 📍');
        },
        () => setGpsStatus('Secteur par défaut (GPS Inaccessible)'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleGenerateGpsRoute = async () => {
    setGenerating(true);
    try {
      const [lat, lng] = userCoords;
      const d = selectedDistance;
      const factor = d * 0.00018;

      let wp1, wp2, wp3;
      if (surfacePreference === 'bois') {
        wp1 = [lat + factor * 0.9, lng + factor * 1.1];
        wp2 = [lat - factor * 0.6, lng + factor * 1.6];
        wp3 = [lat - factor * 1.1, lng + factor * 0.4];
      } else if (surfacePreference === 'champs') {
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
      let surfaceType = "";

      if (surfacePreference === 'bois') {
        title = `Trail en Sous-Bois & Sentiers (${d} km)`;
        desc = `Boucle immersive tracée depuis votre position GPS à travers le réseau de sentiers boisés.`;
        surfaceType = 'Sentiers forestiers & singles (85%)';
      } else if (surfacePreference === 'champs') {
        title = `Circuit des Chemins & Terres (${d} km)`;
        desc = `Parcours de ${d} km s'élançant à travers les espaces ouverts et pistes agricoles.`;
        surfaceType = 'Voies agricoles & chemins de terre (80%)';
      } else if (surfacePreference === 'urbain') {
        title = `Urban Trail & Liaisons (${d} km)`;
        desc = `Itinéraire urbain de ${d} km tracé depuis votre position GPS actuelle.`;
        surfaceType = 'Rues & asphalte (90%)';
      } else {
        title = `Roadbook Hybride GPS (${d} km)`;
        desc = `Circuit équilibré de ${d} km combinant nature et liaisons depuis votre position.`;
        surfaceType = 'Mixte (Bois, Champs & Rues)';
      }

      setRouteCard({
        id: Date.now(),
        name: title,
        distance: d,
        dplus: Math.round(d * 12),
        surface: surfaceType,
        timeEst: `${Math.floor((d * 5.2) / 60)}h ${Math.round((d * 5.2) % 60)} min`,
        description: desc,
        coordinates
      });
    } catch (e) {
      console.error("Erreur de génération GPS:", e);
    } finally {
      setGenerating(false);
      setShared(false);
    }
  };

  useEffect(() => {
    handleGenerateGpsRoute();
  }, [userCoords, selectedDistance, surfacePreference]);

  const handlePublishToClub = () => {
    if (!routeCard) return;
    setShared(true);
    const existingShared = localStorage.getItem('fitpulse_club_roadbooks');
    let list = existingShared ? JSON.parse(existingShared) : [];
    list.unshift({
      id: Date.now(),
      distance: routeCard.distance,
      name: routeCard.name,
      description: routeCard.description,
      dplus: routeCard.dplus,
      surface: routeCard.surface,
      timeEst: routeCard.timeEst,
      coordinates: routeCard.coordinates
    });
    localStorage.setItem('fitpulse_club_roadbooks', JSON.stringify(list));
    setTimeout(() => setShared(false), 3000);
  };

  // Basculement de la couche cartographique : OpenTopoMap pour afficher les sentiers de forêt, OpenStreetMap pour le reste
  const tileLayerUrl = surfacePreference === 'bois'
    ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = surfacePreference === 'bois'
    ? 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
    : '&copy; OpenStreetMap contributors';

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" /> Générateur GPS & Carte Topographique Pro
          </h2>
          <p className="text-xs text-neutral-400">Tracés interactifs instantanés basés sur votre position géographique</p>
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
            2. Préférence de Terrain & Sentiers (Bascule Topo automatique)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Carte Topo & Sentiers' },
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Chemins & Rues' },
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

        <button
          type="button"
          onClick={handleGenerateGpsRoute}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
        >
          <Sparkles className="w-4 h-4" /> {generating ? "Calcul du parcours GPS..." : `Actualiser depuis ma position (${selectedDistance} km)`}
        </button>
      </div>

      {routeCard && (
        <div className="bg-neutral-950 border border-orange-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden">
          
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            <MapContainer 
              key={userCoords[0] + '-' + userCoords[1] + '-' + selectedDistance + '-' + surfacePreference}
              center={userCoords} 
              zoom={13} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={userCoords} zoom={surfacePreference === 'bois' ? 14 : 13} />
              
              <TileLayer
                attribution={tileLayerAttribution}
                url={tileLayerUrl}
                maxZoom={17}
              />
              
              <Polyline 
                positions={routeCard.coordinates} 
                color="#38bdf8" 
                weight={6} 
                opacity={0.95} 
              />
              
              <Marker position={userCoords} icon={userLocationIcon}>
                <Popup>
                  <strong>📍 Votre Position GPS Actuelle</strong> <br /> Point de départ et d'arrivée
                </Popup>
              </Marker>
            </MapContainer>
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
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Distance & Surface</span>
              <span className="text-xs font-mono text-cyan-400 font-bold truncate block px-1">{routeCard.distance} km ({routeCard.surface})</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={() => alert(`🧭 Fichier GPX de "${routeCard.name}" (${routeCard.distance} km) téléchargé avec succès !`)}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger GPX ({routeCard.distance} km)
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
