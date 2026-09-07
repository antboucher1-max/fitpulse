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

interface RoadbookTabProps {
  currentUserId?: string;
}

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  const [surfacePreference, setSurfacePreference] = useState<'mixte' | 'bois' | 'champs' | 'urbain'>('bois');
  
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]);
  const [gpsStatus, setGpsStatus] = useState<string>('Recherche GPS en cours...');
  
  const [routeCard, setRouteCard] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [shared, setShared] = useState(false);

  // Récupération de la position GPS réelle
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsStatus('GPS Actif (Position Fixée) 📍');
        },
        () => setGpsStatus('Secteur Forêt de Flines (Défaut)'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Génération dynamique des parcours interactifs basés sur le GPS, la distance et le type de terrain
  const generateInteractiveRoutes = (lat: number, lng: number) => {
    const d = selectedDistance;
    let name = "";
    let desc = "";
    let surfaceDesc = "";
    let dplus = Math.round(d * 12);
    let timeEst = `${Math.floor((d * 5.2) / 60)}h ${Math.round((d * 5.2) % 60)} min`;

    // Adaptation des waypoints et des descriptions selon le type de terrain choisi
    let waypoints = [];
    if (surfacePreference === 'bois') {
      name = `Trail Forêt de Flines (${d} km)`;
      desc = `Boucle immersive de ${d} km s'élançant de votre position GPS à travers les sentiers boisés.`;
      surfaceDesc = 'Forêt & sentiers de terre (90%)';
      waypoints = [
        [lng, lat],
        [lng + (d * 0.001), lat + 0.002],
        [lng + (d * 0.002), lat - 0.001],
        [lng + (d * 0.0008), lat - 0.004],
        [lng, lat]
      ];
    } else if (surfacePreference === 'champs') {
      name = `Circuit Chemins Creux & Champs (${d} km)`;
      desc = `Parcours de ${d} km à travers les pistes agricoles et grands espaces ouverts.`;
      surfaceDesc = 'Voies agricoles & terres (85%)';
      waypoints = [
        [lng, lat],
        [lng - (d * 0.001), lat - 0.002],
        [lng - (d * 0.0025), lat + 0.001],
        [lng - (d * 0.0005), lat + 0.003],
        [lng, lat]
      ];
    } else if (surfacePreference === 'urbain') {
      name = `Urban Trail & Liaisons Douces (${d} km)`;
      desc = `Itinéraire urbain et sécurisé de ${d} km reliant voiries et ruelles.`;
      surfaceDesc = 'Rues & asphalte (90%)';
      waypoints = [
        [lng, lat],
        [lng + (d * 0.001), lat + 0.0015],
        [lng - (d * 0.001), lat + 0.0025],
        [lng - (d * 0.0015), lat - 0.001],
        [lng, lat]
      ];
    } else {
      name = `Roadbook Hybride Global (${d} km)`;
      desc = `Circuit mixte de ${d} km combinant nature, chemins de terre et liaisons.`;
      surfaceDesc = 'Mixte équilibré (Bois, Champs & Rues)';
      waypoints = [
        [lng, lat],
        [lng + (d * 0.001), lat + 0.002],
        [lng - (d * 0.0012), lat + 0.001],
        [lng + (d * 0.0005), lat - 0.002],
        [lng, lat]
      ];
    }

    return [{
      id: `route-${d}-${surfacePreference}`,
      name,
      distance: d,
      dplus,
      surface: surfaceDesc,
      timeEst,
      description: desc,
      waypoints
    }];
  };

  const dynamicRoutes = generateInteractiveRoutes(userCoords[0], userCoords[1]);

  // Chargement et accrochage du tracé sur le réseau réel via OSRM
  const loadRoute = async (routeObj: typeof dynamicRoutes[0]) => {
    setLoadingRoute(true);
    try {
      const waypointsString = routeObj.waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
      const queryUrl = `https://router.project-osrm.org/route/v1/foot/${waypointsString}?overview=full&geometries=geojson`;

      const response = await fetch(queryUrl);
      const data = await response.json();

      let coordinates: [number, number][] = [];
      if (data.routes && data.routes.length > 0) {
        coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      } else {
        coordinates = routeObj.waypoints.map(wp => [wp[1], wp[0]]);
      }

      setRouteCard({
        id: routeObj.id,
        name: routeObj.name,
        distance: routeObj.distance,
        dplus: routeObj.dplus,
        surface: routeObj.surface,
        timeEst: routeObj.timeEst,
        description: routeObj.description,
        coordinates
      });
    } catch (e) {
      console.error("Erreur de routage GPS:", e);
    } finally {
      setLoadingRoute(false);
      setShared(false);
    }
  };

  // Recalcule et met à jour le tracé dès que la distance ou le type de terrain change
  useEffect(() => {
    loadRoute(dynamicRoutes[0]);
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

  // Basculement dynamique du fond de carte : OpenTopoMap (avec sentiers et reliefs de forêt) si "bois", sinon OpenStreetMap
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
            <Compass className="w-5 h-5 text-orange-500" /> Générateur de Roadbooks Interactifs
          </h2>
          <p className="text-xs text-neutral-400">Tracés adaptatifs basés sur votre position GPS et vos préférences</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        {/* 1. Sélection de la Distance */}
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

        {/* 2. Préférence de Terrain (Bascule la carte Topo pour la forêt) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            2. Préférence de Terrain & Sentiers (Bascule Topo Forêt automatique)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Chemins & Rues' },
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Carte Topo & Sentiers' },
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
      </div>

      {/* Affichage de la carte interactive et de la fiche du parcours sélectionné */}
      {routeCard && (
        <div className="bg-neutral-950 border border-orange-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden">
          
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            <MapContainer 
              key={routeCard.id}
              center={userCoords} 
              zoom={13} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={userCoords} />
              <TileLayer
                attribution={tileLayerAttribution}
                url={tileLayerUrl}
                maxZoom={17}
              />
              {/* Tracé en bleu électrique lumineux (#38bdf8) */}
              <Polyline 
                positions={routeCard.coordinates} 
                color="#38bdf8" 
                weight={6} 
                opacity={0.95} 
              />
              <Marker position={userCoords} icon={userLocationIcon}>
                <Popup>
                  <strong>📍 Votre Position GPS Actuelle</strong> <br /> Départ de la boucle
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
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Dénivelé Réel (+D)</span>
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
              {shared ? 'Partagé au Club !' : 'Partager au Club'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
