import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface SpotSearchInputProps {
  selectedSpot: string;
  onSelectSpot: (spot: string) => void;
}

export default function SpotSearchInput({ selectedSpot, onSelectSpot }: SpotSearchInputProps) {
  const [query, setQuery] = useState(selectedSpot);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer les suggestions si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Requête API Nominatim (OpenStreetMap) gratuite et mondiale pour l'autocomplétion
  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length < 3 || query === '🌐 Tous les spots (Global)') {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=settlement`
        );
        const data = await response.json();
        const places = data.map((item: any) => item.display_name.split(',')[0] + ' (' + item.display_name.split(',').slice(-2).join(',').trim() + ')');
        setSuggestions(places);
        setIsOpen(true);
      } catch (error) {
        console.error("Erreur de récupération des spots globaux", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 400);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
        <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Rechercher une ville, une salle, un spot..."
          className="bg-transparent text-[11px] font-bold text-orange-400 focus:outline-none w-full truncate placeholder-neutral-500"
        />
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin ml-1" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div 
            onClick={() => {
              setQuery('🌐 Tous les spots (Global)');
              onSelectSpot('🌐 Tous les spots (Global)');
              setIsOpen(false);
            }}
            className="px-3.5 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 font-semibold"
          >
            🌐 Tous les spots (Global)
          </div>
          {suggestions.map((place, index) => (
            <div
              key={index}
              onClick={() => {
                setQuery(place);
                onSelectSpot(place);
                setIsOpen(false);
              }}
              className="px-3.5 py-2.5 text-xs text-white hover:bg-orange-500/20 hover:text-orange-400 cursor-pointer transition truncate flex items-center gap-2"
            >
              <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="truncate">{place}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
