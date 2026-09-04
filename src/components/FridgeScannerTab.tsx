import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Sparkles, RefreshCw, CheckCircle2, Utensils, ArrowLeft } from 'lucide-react';

interface FridgeScannerTabProps {
  onBack?: () => void;
}

export default function FridgeScannerTab({ onBack }: FridgeScannerTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipeResult, setRecipeResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        runProAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const runProAnalysis = () => {
    setIsAnalyzing(true);
    setRecipeResult(null);

    // Simulation haut de gamme avec un temps de calcul réaliste de l'IA (2 secondes)
    setTimeout(() => {
      setIsAnalyzing(false);
      setRecipeResult({
        title: "Bowl Recovery Poulet & Quinoa du Frigo",
        prepTime: "5 min",
        detectedItems: ["Blancs de poulet (restes)", "Quinoa cuit", "Avocat mûr", "Ciboulette"],
        macros: {
          protein: "42g",
          carbs: "48g",
          fats: "16g",
          calories: "510 kcal"
        },
        steps: [
          "Émince les restes de blancs de poulet et fais-les réchauffer rapidement à la poêle avec un filet d'huile d'olive.",
          "Dispose le quinoa cuit au fond d'un bol pour recharger tes stocks de glycogène.",
          "Ajoute le poulet chaud par-dessus, puis des tranches d'avocat pour les bons lipides et l'apport en magnésium.",
          "Assaisonne avec de la ciboulette, du sel, du poivre et un trait de jus de citron. C'est prêt à être savouré !"
        ]
      });
    }, 2000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-2xl relative animate-fadeIn">
      
      {/* 🔙 BOUTON RETOUR */}
      {onBack && (
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      {/* EN-TÊTE PRO */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              Scan Post-WOD de la Faim <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/30">Pro 🚀</span>
            </h3>
            <p className="text-[11px] text-neutral-400">Analyse optique & génération de macros sur-mesure.</p>
          </div>
        </div>
      </div>

      {!selectedImage ? (
        <div className="space-y-4 text-center py-6">
          <div className="w-16 h-16 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-orange-500 shadow-inner">
            <Camera className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Prends ton frigo en photo</h4>
            <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
              L'algorithme analyse les stocks visuels et calibre ta recette de récupération en 5 min chrono.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(234,88,12,0.4)] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Ouvrir l'appareil photo / Importer
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aperçu de la photo */}
          <div className="relative rounded-2xl overflow-hidden h-48 border border-neutral-800 bg-neutral-950">
            <img src={selectedImage} alt="Frigo" className="w-full h-full object-cover opacity-80" />
            <button 
              type="button"
              onClick={() => { setSelectedImage(null); setRecipeResult(null); }}
              className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-xl border border-neutral-700 cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refaire une photo
            </button>
          </div>

          {/* État d'analyse IA */}
          {isAnalyzing && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-black text-white">Analyse visuelle en cours...</h5>
                <p className="text-[10px] text-neutral-400">Croisement des stocks avec les besoins post-WOD.</p>
              </div>
            </div>
          )}

          {/* Résultat de la recette */}
          {recipeResult && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    Chrono {recipeResult.prepTime} ⚡
                  </span>
                  <h4 className="text-sm font-black text-white pt-1">{recipeResult.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-orange-400">{recipeResult.macros.calories}</span>
                </div>
              </div>

              {/* Ingrédients détectés */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ingrédients du frigo utilisés :</span>
                <div className="flex flex-wrap gap-1.5">
                  {recipeResult.detectedItems.map((item: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-xl font-medium">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Macros cibles */}
              <div className="grid grid-cols-3 gap-2 bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">Protéines</span>
                  <span className="text-xs font-black text-white">{recipeResult.macros.protein}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">Glucides</span>
                  <span className="text-xs font-black text-cyan-400">{recipeResult.macros.carbs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase block font-bold">Lipides</span>
                  <span className="text-xs font-black text-amber-400">{recipeResult.macros.fats}</span>
                </div>
              </div>

              {/* Étapes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Préparation express :</span>
                <ol className="space-y-2">
                  {recipeResult.steps.map((step: string, idx: number) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800/50">
                      <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button 
                type="button"
                onClick={() => alert("Recette validée et enregistrée dans ton carnet nutritionnel ! 🚀")}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition border border-neutral-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> C'est cuisiné, valider le repas ✅
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
