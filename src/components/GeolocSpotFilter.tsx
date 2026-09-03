import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

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

// Fonction utilitaire pour calculer la distance entre deux coordonnées GPS (Formule de Haversine)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
