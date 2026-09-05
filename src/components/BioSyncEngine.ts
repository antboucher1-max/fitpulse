export interface BioSyncInput {
  sessionType: 'running' | 'crossfit' | 'muscu' | 'repos';
  sncScore: number; // 0 à 100 (Indice de récupération du Système Nerveux Central)
  fridgeItems: string[]; // Ex: ['riz blanc', 'œufs', 'avocat', 'poulet', 'épinards']
}

export interface BioSyncResult {
  title: string;
  metabolicPriority: string;
  timingSteps: Array<{
    stepNumber: number;
    timing: string;
    foodToEat: string;
    biologicalReason: string;
  }>;
  coachWarning: string;
}

export function generateBioSyncPrescription(input: BioSyncInput): BioSyncResult {
  const isFatigued = input.sncScore < 60;
  
  // Logique d'ordonnancement métabolique selon la fatigue du SNC
  if (input.sessionType === 'running' || input.sessionType === 'crossfit') {
    return {
      title: "Protocole de Restauration Glycémique & Inflammatoire",
      metabolicPriority: isFatigued ? "Priorité absolue : Neutralisation du cortisol post-effort" : "Priorité : Supercompensation rapide des stocks de glycogène",
      timingSteps: [
        {
          stepNumber: 1,
          timing: "Immédiat (0 - 15 min post-WOD)",
          foodToEat: input.fridgeItems.find(i => i.toLowerCase().includes('riz') || i.toLowerCase().includes('patate') || i.toLowerCase().includes('sucre')) || "Glucides à assimilation rapide (Riz blanc / Flocons)",
          biologicalReason: "Créer un pic d'insuline contrôlé pour couper instantanément le catabolisme musculaire et stopper l'hormone de stress (cortisol)."
        },
        {
          stepNumber: 2,
          timing: "Dans les 45 minutes",
          foodToEat: input.fridgeItems.find(i => i.toLowerCase().includes('poulet') || i.toLowerCase().includes('œufs') || i.toLowerCase().includes('viande') || i.toLowerCase().includes('poisson')) || "Protéines hautement biodisponibles (Blanc de poulet / Œufs)",
          biologicalReason: "Fournir les acides aminés essentiels (leucine) pour enclencher la synthèse protéique au moment où les récepteurs musculaires sont ouverts."
        },
        {
          stepNumber: 3,
          timing: "Au repas principal (Soir)",
          foodToEat: input.fridgeItems.filter(i => !i.toLowerCase().includes('riz') && !i.toLowerCase().includes('poulet') && !i.toLowerCase().includes('œufs')).join(', ') || "Légumes verts & Lipides sains (Avocat / Huile d'olive)",
          biologicalReason: isFatigued 
            ? "Attention : Ton SNC est bas. On décale les graisses en fin de digestion pour ne pas surcharger ton système digestif pendant la phase de sommeil." 
            : "Apport de micronutriments pour stabiliser l'inflammation cellulaire."
        }
      ],
      coachWarning: isFatigued 
        ? "⚠️ SNC fatigué détecté : Évite les graisses saturées et l'alcool ce soir. Ton système nerveux a besoin d'un sommeil paradoxal propre pour reconstruire tes axones." 
        : "⚡ Métabolisme réceptif. Ton corps va assimiler ce repas comme un carburant de première classe."
    };
  } else {
    // Protocole Muscu / Force
    return {
      title: "Protocole de Réparation Tissulaire & Neurologique",
      metabolicPriority: "Priorité : Réparation des micro-fissures myofibrillaires et relance nerveuse",
      timingSteps: [
        {
          stepNumber: 1,
          timing: "Immédiat (0 - 30 min)",
          foodToEat: input.fridgeItems.find(i => i.toLowerCase().includes('œufs') || i.toLowerCase().includes('poulet') || i.toLowerCase().includes('fromage')) || "Protéines et peptides de structure",
          biologicalReason: "Saturer le pool d'acides aminés sanguins pour stopper la dégradation des fibres après la tension mécanique lourde."
        },
        {
          stepNumber: 2,
          timing: "Dans l'heure qui suit",
          foodToEat: input.fridgeItems.find(i => i.toLowerCase().includes('riz') || i.toLowerCase().includes('pâtes') || i.toLowerCase().includes('pain')) || "Glucides complexes modérés",
          biologicalReason: "Reconstituer le glycogène intrafasciculaire sans provoquer de léthargie post-prandiale."
        }
      ],
      coachWarning: "💡 Conseil Bio-Sync : Hydrate-toi avec des électrolytes (sodium/magnésium) pour faciliter la conduction nerveuse d'ici ta prochaine séance de force."
    };
  }
}
