import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { calculateDistanceKm } from '../utils/geo';

interface GeolocSpotFilterProps {
  onRadiusSelect: (radiusKm: number, userCoords: { lat: number; lng: number } | null) => void;
}

export default function GeolocSpotFilter({ onRadiusSelect }: GeolocSpotFilterProps) {
  const [loading, setLoading] = useState(false);
  const [activeRadius, setActiveRadius] = useState<number | null>(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ton navigateur.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLoading(false);
        setActiveRadius(10); // Rayon par défaut de 10 km
        onRadiusSelect(10, coords);
      },
      (error) => {
        setLoading(false);
        alert("Impossible de récupérer ta position GPS. Vérifie tes paramètres.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleReset = () => {
    setActiveRadius(null);
    onRadiusSelect(0, null);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-white">
          {activeRadius ? `Spots à moins de ${activeRadius} km (GPS actif)` : "Filtrer par géolocalisation"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {activeRadius ? (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold rounded-xl transition cursor-pointer"
          >
            Désactiver
          </button>
        ) : (
          <button
            onClick={handleLocateMe}
            disabled={loading}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            Autour de moi (10km)
          </button>
        )}
      </div>
    </div>
  );
}

// Fonction calculateDistanceKm déplacée dans utils/geo.ts (elle était
// dupliquée à l'identique dans LiveGpsTracker.tsx). Toujours exportée ici
// par ré-export pour ne casser aucun import existant ailleurs dans le projet.
export { calculateDistanceKm } from '../utils/geo';
