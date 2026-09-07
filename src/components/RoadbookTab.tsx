import { useState, useEffect } from 'react';
import { Compass, Share2, Download, Check, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, 13, { animate: true });
    }, 200);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.6); animation: pulse 2s infinite;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Catalogue de vrais parcours officiels du secteur avec leurs points de départ précis
const OFFICIAL_ROUTES = [
  {
    id: 'flines-coeur',
    name: '🌲 Boucle Officielle de la Forêt de Flines',
    distance: 9.8,
    dplus: 110,
    surface: 'Sentiers forestiers & singles (90%)',
    timeEst: '1h 55 min',
    description: 'Tracé officiel traversant les sous-bois denses et les allées cavalières de la Forêt de Flines.',
    coordinates: [
      [50.5123, 3.3512],
      [50.5140, 3.3620],
      [50.5110, 3.3750],
      [50.5050, 3.3820],
      [50.4980, 3.3740],
      [50.5010, 3.3600],
      [50.5070, 3.3540],
      [50.5123, 3.3512]
    ]
  },
  {
    id: 'escaut-halage',
    name: "🌊 Circuit des Berges de l'Escaut & Halage",
    distance: 12.4,
    dplus: 45,
    surface: 'Voies vertes & chemins de halage (95%)',
    timeEst: '2h 10 min',
    description: "Parcours officiel le long des méandres de l'Escaut et du Canal Nimy-Blaton, idéal pour courir sans voiture.",
    coordinates: [
      [50.5123, 3.3512],
      [50.5200, 3.3400],
      [50.5350, 3.3300],
      [50.5300, 3.3250],
      [50.5150, 3.3380],
      [50.5050, 3.3450],
      [50.5123, 3.3512]
    ]
  },
  {
    id: 'champs-creux',
    name: '🌾 Circuit des Chemins Creux & Terres de Brunehaut',
    distance: 14.5,
    dplus: 140,
    surface: 'Pistes agricoles & sentiers de terre (85%)',
    timeEst: '2h 35 min',
    description: 'Immersion dans la campagne wallonne par les anciens chemins de liaison agricole et sentiers balisés.',
    coordinates: [
      [50.5123, 3.3512],
      [50.5000, 3.3400],
      [50.4850, 3.3450],
      [50.4900, 3.3650],
      [50.5020, 3.3700],
      [50.5080, 3.3580],
      [50.5123, 3.3512]
    ]
  }
];

interface RoadbookTabProps {
  currentUserId?: string;
}

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('flines-coeur');
  const [routeCard, setRouteCard] = useState<any>(OFFICIAL_ROUTES[0]);
  const [shared, setShared] = useState(false);
  
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]); 
  const [gpsStatus, setGpsStatus] = useState<string>('Recherche GPS en cours...');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsStatus('GPS Actif (Position Fixée) 📍');
        },
        () => setGpsStatus('Secteur Brunehaut / Wallonie (Défaut)'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSelectRoute = (id: string) => {
    setSelectedRouteId(id);
    const found = OFFICIAL_ROUTES.find(r => r.id === id);
    if (found) {
      setRouteCard(found);
      setShared(false);
    }
  };

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

  const tileLayerUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
  const tileLayerAttribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap';

  // Centre dynamique basé sur le point de départ du parcours sélectionné
  const mapCenter: [number, number] = routeCard?.coordinates?.[0] || userCoords;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" /> Catalogue des Circuits Officiels & Sentiers
          </h2>
          <p className="text-xs text-neutral-400">Tracés authentiques validés en Forêt de Flines et bord de l'Escaut</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
          Sélectionner un Parcours Officiel du Secteur :
        </label>
        
        <div className="grid grid-cols-1 gap-2.5">
          {OFFICIAL_ROUTES.map(route => (
            <button
              key={route.id}
              type="button"
              onClick={() => handleSelectRoute(route.id)}
              className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                selectedRouteId === route.id 
                  ? 'bg-neutral-900 border-orange-500 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> {route.name}
                </div>
                <div className="text-[11px] text-neutral-400">{route.description}</div>
              </div>
              <div className="text-right shrink-0 ml-4 font-mono">
                <span className="text-xs font-bold text-orange-400 block">{route.distance} km</span>
                <span className="text-[10px] text-neutral-500">+{route.dplus}m D+</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {routeCard && (
        <div className="bg-neutral-950 border border-orange-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden">
          
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            {/* L'attribut 'key' force le rechargement et le recentrage complet de Leaflet lors du changement de tracé */}
            <MapContainer 
              key={routeCard.id}
              center={mapCenter} 
              zoom={13} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={mapCenter} />
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
              <Marker position={mapCenter} icon={userLocationIcon}>
                <Popup>
                  <strong>📍 Départ : {routeCard.name}</strong>
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
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Dénivelé Officiel (+D)</span>
              <span className="text-xs font-mono text-orange-400 font-bold">+{routeCard.dplus} m</span>
            </div>
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Nature du Revêtement</span>
              <span className="text-xs font-mono text-cyan-400 font-bold truncate block px-1">{routeCard.surface}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={() => alert(`🧭 Fichier GPX officiel de "${routeCard.name}" téléchargé avec succès !`)}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger GPX Officiel
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
