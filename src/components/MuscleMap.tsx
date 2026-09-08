import type { ExerciseCategory } from './GymLogTab';

type MuscleKey =
  | 'chest'
  | 'abs'
  | 'shoulders'
  | 'arms_upper'
  | 'arms_lower'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'glutes'
  | 'back';

interface CategoryProfile {
  view: 'front' | 'back';
  primary: MuscleKey[];
  secondary: MuscleKey[];
}

// Profil "carte musculaire" par catégorie : quelle vue du corps afficher, et
// quels groupes sont ciblés en principal (couleur pleine) / en secondaire (dégradé léger).
const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  Jambes: { view: 'front', primary: ['quads'], secondary: ['calves'] },
  Fessiers: { view: 'back', primary: ['glutes'], secondary: ['hamstrings'] },
  'Dos/Biceps': { view: 'back', primary: ['back'], secondary: ['arms_upper'] },
  'Pecs/Triceps': { view: 'front', primary: ['chest'], secondary: ['arms_upper'] },
  Bras: { view: 'front', primary: ['arms_upper'], secondary: ['arms_lower'] },
  'Épaules/Abdos': { view: 'front', primary: ['shoulders'], secondary: ['abs'] },
  'Mobilité Hybride': { view: 'front', primary: ['abs'], secondary: [] },
};

const DEFAULT_PROFILE: CategoryProfile = { view: 'front', primary: ['abs'], secondary: [] };

export const MUSCLE_LABELS: Record<MuscleKey, string> = {
  chest: 'Pectoraux',
  abs: 'Abdominaux',
  shoulders: 'Épaules',
  arms_upper: 'Biceps/Triceps',
  arms_lower: 'Avant-bras',
  quads: 'Quadriceps',
  hamstrings: 'Ischio-jambiers',
  calves: 'Mollets',
  glutes: 'Fessiers',
  back: 'Dorsaux',
};

export function getTargetedMusclesLabel(category: string): string {
  const profile = CATEGORY_PROFILES[category] || DEFAULT_PROFILE;
  return [...profile.primary, ...profile.secondary].map((k) => MUSCLE_LABELS[k]).join(', ');
}

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = { sm: 34, md: 60, lg: 100 };

interface MuscleMapProps {
  category: ExerciseCategory | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Carte musculaire minimaliste inspirée des visuels "corps + zone ciblée en
// surbrillance" façon Lyfta : silhouette neutre, muscles actifs en dégradé
// orange (couleur d'accent de l'app), muscles secondaires atténués.
export default function MuscleMap({ category, size = 'md', className }: MuscleMapProps) {
  const profile = CATEGORY_PROFILES[category] || DEFAULT_PROFILE;
  const px = SIZE_PX[size];
  const primarySet = new Set(profile.primary);
  const secondarySet = new Set(profile.secondary);

  const fillFor = (k: MuscleKey) => {
    if (primarySet.has(k)) return 'url(#mm-primary)';
    if (secondarySet.has(k)) return 'url(#mm-secondary)';
    return '#1c1917';
  };
  const opacityFor = (k: MuscleKey) => (primarySet.has(k) || secondarySet.has(k) ? 1 : 0.5);

  return (
    <svg
      viewBox="0 0 120 240"
      width={px}
      height={px * 2}
      className={className}
      role="img"
      aria-label={`Zones ciblées : ${getTargetedMusclesLabel(category)}`}
    >
      <defs>
        <linearGradient id="mm-primary" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="mm-secondary" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Silhouette de base (tête, tronc, membres) */}
      <g fill="#1c1917" stroke="#3f3f46" strokeWidth="1.5">
        <circle cx="60" cy="18" r="14" />
        <rect x="54" y="30" width="12" height="10" />
        <rect x="35" y="38" width="50" height="72" rx="18" />
        <rect x="14" y="45" width="16" height="42" rx="8" />
        <rect x="90" y="45" width="16" height="42" rx="8" />
        <rect x="12" y="86" width="14" height="38" rx="7" />
        <rect x="94" y="86" width="14" height="38" rx="7" />
        <circle cx="19" cy="128" r="7" />
        <circle cx="101" cy="128" r="7" />
        <rect x="38" y="108" width="44" height="24" rx="12" />
        <rect x="36" y="130" width="20" height="48" rx="10" />
        <rect x="64" y="130" width="20" height="48" rx="10" />
        <rect x="38" y="178" width="16" height="44" rx="8" />
        <rect x="66" y="178" width="16" height="44" rx="8" />
        <ellipse cx="46" cy="228" rx="10" ry="6" />
        <ellipse cx="74" cy="228" rx="10" ry="6" />
      </g>

      {/* Surcouches musculaires ciblées, selon la vue avant/arrière du profil */}
      {profile.view === 'front' ? (
        <>
          <ellipse cx="60" cy="52" rx="20" ry="13" fill={fillFor('chest')} opacity={opacityFor('chest')} />
          <rect x="44" y="68" width="32" height="34" rx="7" fill={fillFor('abs')} opacity={opacityFor('abs')} />
          <circle cx="30" cy="46" r="10" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />
          <circle cx="90" cy="46" r="10" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />
          <rect x="14" y="45" width="16" height="42" rx="8" fill={fillFor('arms_upper')} opacity={opacityFor('arms_upper')} />
          <rect x="90" y="45" width="16" height="42" rx="8" fill={fillFor('arms_upper')} opacity={opacityFor('arms_upper')} />
          <rect x="12" y="86" width="14" height="38" rx="7" fill={fillFor('arms_lower')} opacity={opacityFor('arms_lower')} />
          <rect x="94" y="86" width="14" height="38" rx="7" fill={fillFor('arms_lower')} opacity={opacityFor('arms_lower')} />
          <rect x="36" y="130" width="20" height="48" rx="10" fill={fillFor('quads')} opacity={opacityFor('quads')} />
          <rect x="64" y="130" width="20" height="48" rx="10" fill={fillFor('quads')} opacity={opacityFor('quads')} />
          <rect x="38" y="178" width="16" height="44" rx="8" fill={fillFor('calves')} opacity={opacityFor('calves')} />
          <rect x="66" y="178" width="16" height="44" rx="8" fill={fillFor('calves')} opacity={opacityFor('calves')} />
        </>
      ) : (
        <>
          <path
            d="M40 40 Q60 34 80 40 L80 90 Q60 100 40 90 Z"
            fill={fillFor('back')}
            opacity={opacityFor('back')}
          />
          <rect x="38" y="108" width="44" height="24" rx="12" fill={fillFor('glutes')} opacity={opacityFor('glutes')} />
          <rect x="36" y="130" width="20" height="48" rx="10" fill={fillFor('hamstrings')} opacity={opacityFor('hamstrings')} />
          <rect x="64" y="130" width="20" height="48" rx="10" fill={fillFor('hamstrings')} opacity={opacityFor('hamstrings')} />
          <rect x="38" y="178" width="16" height="44" rx="8" fill={fillFor('calves')} opacity={opacityFor('calves')} />
          <rect x="66" y="178" width="16" height="44" rx="8" fill={fillFor('calves')} opacity={opacityFor('calves')} />
          <rect x="14" y="45" width="16" height="42" rx="8" fill={fillFor('arms_upper')} opacity={opacityFor('arms_upper')} />
          <rect x="90" y="45" width="16" height="42" rx="8" fill={fillFor('arms_upper')} opacity={opacityFor('arms_upper')} />
        </>
      )}
    </svg>
  );
}
