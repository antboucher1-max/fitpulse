import { useState, useEffect, useCallback } from 'react';
import { Compass, Share2, Download, Check, Sparkles, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapController({ center, zoom = 13 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.6); animation: pulse 2s infinite;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface RoadbookTabProps {
  currentUserId?: string;
}

interface RouteCard {
  id: number;
  name: string;
  distance: number;
  actualDistanceKm: number;
  dplus: number;
  surface: string;
  timeEst: string;
  description: string;
  coordinates: [number, number][];
}

type Surface = 'mixte' | 'bois' | 'champs' | 'urbain';

// --- Géométrie : conversion km <-> degrés (approximation locale, suffisante à cette échelle) ---
const kmToDegLat = (km: number) => km / 111.32;
const kmToDegLng = (km: number, atLat: number) => km / (111.32 * Math.cos((atLat * Math.PI) / 180));

// Profil de forme par type de terrain : nombre de points de la boucle + "chaos" angulaire/radial.
// Plus de points et plus de jitter = boucle plus sinueuse (forêt), moins = boucle plus régulière (ville).
const SHAPE_PROFILES: Record<Surface, { points: number; angleJitter: number; radiusJitter: number }> = {
  bois: { points: 6, angleJitter: 0.35, radiusJitter: 0.35 },
  champs: { points: 4, angleJitter: 0.25, radiusJitter: 0.3 },
  urbain: { points: 5, angleJitter: 0.1, radiusJitter: 0.15 },
  mixte: { points: 5, angleJitter: 0.2, radiusJitter: 0.25 },
};

// Génère une boucle de waypoints répartis autour du point de départ, dont le
// périmètre approximatif correspond à la distance cible. shapeFactor compense le
// fait que la route réelle (calculée par OSRM) est toujours plus longue que le
// polygone théorique (virages, détours du terrain) ; radiusScale est ajusté par
// la boucle de correction ci-dessous si la distance réelle est trop éloignée.
function generateLoopWaypoints(
  lat: number,
  lng: number,
  distanceKm: number,
  surface: Surface,
  radiusScale = 1
): [number, number][] {
  const { points, angleJitter, radiusJitter } = SHAPE_PROFILES[surface];
  const shapeFactor = 0.16;
  const baseRadiusKm = distanceKm * shapeFactor * radiusScale;

  const waypoints: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const baseAngle = (i / points) * 2 * Math.PI;
    const angle = baseAngle + (Math.random() - 0.5) * angleJitter * ((2 * Math.PI) / points);
    const radiusKm = baseRadiusKm * (1 + (Math.random() - 0.5) * radiusJitter);

    const dLat = kmToDegLat(radiusKm * Math.cos(angle));
    const dLng = kmToDegLng(radiusKm * Math.sin(angle), lat);
    waypoints.push([lat + dLat, lng + dLng]);
  }
  return waypoints;
}

async function fetchOsrmRoute(lat: number, lng: number, waypoints: [number, number][]) {
  const allPoints: [number, number][] = [[lat, lng], ...waypoints, [lat, lng]];
  const coordsParam = allPoints.map(([plat, plng]) => `${plng},${plat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coordsParam}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`OSRM: ${data.code || 'no route'}`);
  }

  const coordinates: [number, number][] = data.routes[0].geometry.coordinates.map(
    (c: [number, number]) => [c[1], c[0]]
  );
  const distanceKm = data.routes[0].distance / 1000;
  return { coordinates, distanceKm };
}

// Génère une boucle réaliste et tente jusqu'à 3 fois de se rapprocher de la
// distance cible, en corrigeant le rayon proportionnellement à l'écart mesuré
// sur la distance réellement renvoyée par OSRM.
async function generateRealisticLoop(lat: number, lng: number, distanceKm: number, surface: Surface) {
  let radiusScale = 1;
  let best: { coordinates: [number, number][]; distanceKm: number } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const waypoints = generateLoopWaypoints(lat, lng, distanceKm, surface, radiusScale);
    try {
      const result = await fetchOsrmRoute(lat, lng, waypoints);
      if (!best || Math.abs(result.distanceKm - distanceKm) < Math.abs(best.distanceKm - distanceKm)) {
        best = result;
      }
      const ratio = distanceKm / Math.max(result.distanceKm, 0.1);
      if (Math.abs(1 - ratio) < 0.12) break; // à moins de 12% de la cible : on garde
      radiusScale *= ratio; // corrige le rayon pour le prochain essai
    } catch {
      radiusScale *= 1.15; // en cas d'échec (pas de route trouvée), on élargit et on retente
    }
  }

  if (!best) throw new Error('Impossible de générer un parcours depuis cette position.');
  return best;
}

function buildGpx(name: string, coords: [number, number][]) {
  const points = coords.map(([lat, lng]) => `<trkpt lat="${lat}" lon="${lng}"></trkpt>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FitPulse" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>${name}</name><trkseg>${points}</trkseg></trk>
</gpx>`;
}

function downloadGpx(name: string, coords: [number, number][]) {
  const xml = buildGpx(name, coords);
  const blob = new Blob([xml], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const SURFACE_META: Record<Surface, { title: (d: number) => string; desc: (d: number) => string; surf: string }> = {
  bois: {
    title: (d) => `Boucle Forêt & Sentiers Balisés (${d} km)`,
    desc: (d) => `Boucle de ${d} km générée depuis votre position, en suivant le réseau de chemins praticables à pied.`,
    surf: 'Sentiers forestiers & chemins balisés',
  },
  champs: {
    title: (d) => `Circuit des Champs & Pistes (${d} km)`,
    desc: (d) => `Parcours rural de ${d} km s'élançant de votre position actuelle.`,
    surf: 'Voies agricoles & chemins de terre',
  },
  urbain: {
    title: (d) => `Urban Trail & Asphalte (${d} km)`,
    desc: (d) => `Itinéraire urbain et sécurisé de ${d} km depuis votre position.`,
    surf: 'Rues & asphalte',
  },
  mixte: {
    title: (d) => `Circuit Mixte Global (${d} km)`,
    desc: (d) => `Roadbook équilibré de ${d} km combinant voiries et liaisons depuis votre position.`,
    surf: 'Chemins & Rues',
  },
};

export default function RoadbookTab({ currentUserId }: RoadbookTabProps) {
  const [surfacePreference, setSurfacePreference] = useState<Surface>('bois');
  const [selectedDistance, setSelectedDistance] = useState<number>(10);

  // Position GPS réelle de l'appareil (initialisée à Laplaigne par défaut)
  const [userCoords, setUserCoords] = useState<[number, number]>([50.5123, 3.3512]);
  const [gpsStatus, setGpsStatus] = useState<string>('Recherche GPS en cours...');

  const [activeCard, setActiveCard] = useState<RouteCard | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Récupération de la position GPS de l'utilisateur, avec un message d'erreur explicite
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('GPS non disponible sur cet appareil');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus('GPS Actif (Position Fixée) 📍');
      },
      (err) => {
        setGpsStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Localisation refusée (position par défaut)'
            : 'Secteur Laplaigne (Défaut GPS)'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Génération de la boucle : waypoints placés sur un cercle dimensionné pour la
  // distance cible, puis routage à pied via OSRM avec correction itérative de la distance.
  const handleGenerateRouteFromGps = useCallback(async () => {
    setGenerating(true);
    setErrorMsg(null);
    try {
      const [lat, lng] = userCoords;
      const d = selectedDistance;
      const { coordinates, distanceKm } = await generateRealisticLoop(lat, lng, d, surfacePreference);
      const meta = SURFACE_META[surfacePreference];

      setActiveCard({
        id: Date.now(),
        name: meta.title(d),
        distance: d,
        actualDistanceKm: Math.round(distanceKm * 10) / 10,
        dplus: Math.round(d * 10),
        surface: meta.surf,
        timeEst: `${Math.floor((distanceKm * 5.2) / 60)}h ${Math.round((distanceKm * 5.2) % 60)} min`,
        description: meta.desc(d),
        coordinates,
      });
    } catch (e) {
      console.error(e);
      setErrorMsg('Impossible de générer un parcours ici, réessayez ou changez de type de terrain.');
    } finally {
      setGenerating(false);
      setShared(false);
    }
  }, [userCoords, selectedDistance, surfacePreference]);

  useEffect(() => {
    handleGenerateRouteFromGps();
  }, [handleGenerateRouteFromGps]);

  const isTopoMode = surfacePreference === 'bois';
  const mapZoom = isTopoMode ? 14 : 13;

  const handlePublishToClub = () => {
    if (!activeCard) return;
    setShared(true);
    const existingShared = localStorage.getItem('fitpulse_club_roadbooks');
    const list = existingShared ? JSON.parse(existingShared) : [];
    list.unshift(activeCard);
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
          <p className="text-xs text-neutral-400">Mode Forêt spécialisé avec affichage direct des sentiers balisés</p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {gpsStatus}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Sélectionner le Type de Parcours :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bois', label: '🌲 Forêts & Bois', desc: 'Carte Topo & Sentiers Balisés' },
              { id: 'mixte', label: '⚖️ Mixte Global', desc: 'Carte Routière' },
              { id: 'champs', label: '🌾 Champs & Pistes', desc: 'Voies agricoles' },
              { id: 'urbain', label: '🏙️ Rues & Asphalte', desc: 'Réseau routier' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSurfacePreference(item.id as Surface)}
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

        <div className="space-y-4 animate-fadeIn border-t border-neutral-800 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Choisir la Distance Cible : <span className="text-orange-400 font-mono text-sm">{selectedDistance} km</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 21].map((km) => (
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
              <a
                href="https://hiking.waymarkedtrails.org"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800"
              >
                🥾 Waymarked Trails <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://geoportail.wallonie.be"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800"
              >
                🌐 WalOnMap <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://chemins.be"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-orange-400 flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800"
              >
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
          <Sparkles className="w-4 h-4" />{' '}
          {generating ? 'Calcul depuis votre position...' : `Actualiser le parcours GPS (${selectedDistance} km)`}
        </button>

        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{errorMsg}</p>
        )}
      </div>

      {activeCard && (
        <div
          className={`border p-5 rounded-2xl space-y-4 animate-fadeIn shadow-2xl relative overflow-hidden ${
            isTopoMode ? 'bg-neutral-900 border-orange-500/60' : 'bg-neutral-950 border-neutral-700/50'
          }`}
        >
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl z-0">
            <MapContainer center={userCoords} zoom={mapZoom} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
              <MapController center={userCoords} zoom={mapZoom} />

              <TileLayer
                attribution={
                  isTopoMode
                    ? 'Map data: &copy; OpenStreetMap contributors, SRTM | Sentiers: &copy; Waymarked Trails'
                    : '&copy; OpenStreetMap contributors'
                }
                url={
                  isTopoMode
                    ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                maxZoom={17}
              />

              {isTopoMode && (
                <TileLayer url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png" opacity={0.85} maxZoom={18} />
              )}

              <Polyline positions={activeCard.coordinates} color="#38bdf8" weight={6} opacity={0.95} />

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
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Distance réelle</span>
              <span className="text-xs font-mono text-cyan-400 font-bold truncate block px-1">
                {activeCard.actualDistanceKm} km ({activeCard.surface})
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => downloadGpx(activeCard.name, activeCard.coordinates)}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger GPX ({activeCard.actualDistanceKm} km)
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
