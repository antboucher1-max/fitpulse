import { useState, useEffect } from 'react';
import { Navigation, Play, Square } from 'lucide-react';

interface LiveGpsTrackerProps {
  onUpdateDistance: (distanceKm: number, currentPace: number) => void;
}

export default function LiveGpsTracker({ onUpdateDistance }: LiveGpsTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastCoords, setLastCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Formule de Haversine pour calculer la distance réelle entre deux points GPS en km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ton navigateur.");
      return;
    }

    setIsTracking(true);
    setDistance(0);
    setLastCoords(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setLastCoords((prev) => {
          if (prev) {
            const distDelta = calculateDistance(prev.latitude, prev.longitude, latitude, longitude);
            // Ignore les micro-sauts GPS aberrants de moins de 2 mètres
            if (distDelta > 0.002) {
              setDistance((currentDist) => {
                const newDist = currentDist + distDelta;
                onUpdateDistance(Number(newDist.toFixed(2)), 300); // Allure indicative
                return newDist;
              });
            }
          }
          return { latitude, longitude };
        });
      },
      (error) => {
        console.error("Erreur GPS :", error);
        alert("Impossible de récupérer la position GPS. Vérifie que le GPS est activé.");
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    setWatchId(id);
  };

  const stopGpsTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Navigation className="w-4 h-4 animate-pulse" /> GPS Live (Téléphone)
        </span>
        <span className="text-2xl font-black text-white">{distance.toFixed(2)} km</span>
      </div>

      {!isTracking ? (
        <button
          type="button"
          onClick={startGpsTracking}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
        >
          <Play className="w-4 h-4 fill-neutral-950" /> Démarrer le suivi GPS réel 🚀
        </button>
      ) : (
        <button
          type="button"
          onClick={stopGpsTracking}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
        >
          <Square className="w-4 h-4 fill-white" /> Arrêter la course
        </button>
      )}
    </div>
  );
}
