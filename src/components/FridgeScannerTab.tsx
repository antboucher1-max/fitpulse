import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Sparkles, ArrowLeft, Apple, Flame, CheckCircle2, RefreshCw, Share2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FridgeScannerTabProps {
  onBack?: () => void;
  currentUserId?: string;
  currentUsername?: string;
  currentUserProfile?: any;
  userAvatarUrl?: string;
  onRefreshFeed?: () => void;
}

export default function FridgeScannerTab({
  onBack,
  currentUserId,
  currentUsername = 'Athlète',
  currentUserProfile,
  userAvatarUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
  onRefreshFeed
}: FridgeScannerTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipeResult, setRecipeResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setRecipeResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFridge = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);

    // Simulation intelligente d'analyse IA de précision sportive (post-effort)
    setTimeout(() => {
      setIsAnalyzing(false);
      setRecipeResult({
        title: "Bowl Récupération Hybride & Œufs Pochés",
        prepTime: "12 min",
        difficulty: "Facile",
        target: "Optimal Reconstitution Glycogène & Réparation Tissulaire",
        ingredientsDetected: ["Œufs frais", "Épinards", "Avocat", "Riz basmati (restes)", "Tomates cerises"],
        macros: {
          calories: 540,
          protein: 32,
          carbs: 58,
          fats: 21
        },
        steps: [
          "Faire chauffer les restes de riz basmati à la poêle avec un filet d'huile d'olive.",
          "Ajouter les épinards frais et les tomates cerises coupées pour les faire tomber rapidement.",
          "Pocher ou cuire deux œufs au plat et les déposer délicatement sur le lit de riz et légumes.",
          "Dresser avec des tranches d'avocat frais et assaisonner selon vos envies (sel, poivre, piment d'Espelette)."
        ],
        proTip: "Idéal 45 minutes après un WOD intense ou un footing long pour recharger les stocks de glycogène tout en apportant des acides aminés essentiels."
      });
    }, 2000);
  };

  const handlePublishRecipe = async () => {
    if (!currentUserId || !recipeResult) return;

    const caption = `🍳 [Scan Frigo Post-WOD] Recette générée : ${recipeResult.title}\n• Protéines : ${recipeResult.macros.protein}g | Glucides : ${recipeResult.macros.carbs}g\n• Conseil : ${recipeResult.proTip}`;

    const { error } = await supabase.from('posts').insert([{
      user_id: currentUserId,
      username: currentUsername,
      avatar_url: currentUserProfile?.avatar_url || userAvatarUrl,
      club_name: currentUserProfile?.home_club || 'Tournai (Quais de l’Escaut & Parc)',
      session_type: 'Nutrition Post-WOD 🍳',
      caption: caption,
      image_url: selectedImage,
      exercises: [],
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: false
    }]);

    if (!error) {
      alert("🚀 Recette et photo publiées avec succès sur le fil d'actualité de la communauté !");
      if (onRefreshFeed) onRefreshFeed();
      if (onBack) onBack();
    } else {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* 🔙 BOUTON RETOUR */}
      {onBack && (
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      {/* EN-TÊTE MODERNE */}
      <div className="bg-gradient-to-r from-orange-950/80 via-neutral-900 to-neutral-900 border border-orange-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Scan Frigo de la Faim Pro
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Nutrition de Précision Post-Effort</h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Prends ton frigo en photo. L'IA analyse tes stocks pour te concocter une recette sur-mesure calibrée pour ta récupération sportive.
          </p>
        </div>
      </div>

      {/* ZONE DE CAPTURE PHOTO */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          onChange={handleImageSelect} 
          className="hidden" 
        />

        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-700 hover:border-orange-500/60 rounded-2xl p-8 text-center space-y-3 cursor-pointer transition bg-neutral-950 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto group-hover:scale-110 transition">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Photographier l'intérieur du frigo</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">Ou importer une image depuis votre galerie</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden h-56 border border-neutral-800 bg-black">
              <img src={selectedImage} alt="Frigo" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setSelectedImage(null); setRecipeResult(null); }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Changer de photo 📸
              </button>
            </div>

            {!recipeResult && (
              <button
                type="button"
                onClick={analyzeFridge}
                disabled={isAnalyzing}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyse des ingrédients & macros en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Générer la recette post-WOD ⚡
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* FICHE RECETTE PRO RÉSULTAT */}
      {recipeResult && (
        <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-6 space-y-5 shadow-2xl animate-fadeIn">
          <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-widest">
                {recipeResult.target}
              </span>
              <h3 className="text-base font-black text-white mt-2">{recipeResult.title}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-neutral-400 block font-bold">⏱️ {recipeResult.prepTime}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{recipeResult.difficulty}</span>
            </div>
          </div>

          {/* MACROS NUTRITIONNELLES */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
              <span className="text-[9px] text-neutral-400 uppercase font-bold block">Calories</span>
              <span className="text-sm font-black text-white">{recipeResult.macros.calories} <span className="text-[9px] font-normal text-neutral-500">kcal</span></span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
              <span className="text-[9px] text-neutral-400 uppercase font-bold block">Protéines</span>
              <span className="text-sm font-black text-orange-400">{recipeResult.macros.protein}g</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
              <span className="text-[9px] text-neutral-400 uppercase font-bold block">Glucides</span>
              <span className="text-sm font-black text-cyan-400">{recipeResult.macros.carbs}g</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
              <span className="text-[9px] text-neutral-400 uppercase font-bold block">Lipides</span>
              <span className="text-sm font-black text-amber-400">{recipeResult.macros.fats}g</span>
            </div>
          </div>

          {/* INGREDIENTS DÉTECTÉS */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-400 block">🛒 Ingrédients détectés dans le frigo :</span>
            <div className="flex flex-wrap gap-1.5">
              {recipeResult.ingredientsDetected.map((ing: string, i: number) => (
                <span key={i} className="text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-1 rounded-xl font-medium">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* ÉTAPES DE PRÉPARATION */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-400 block">👨‍🍳 Préparation pas à pas :</span>
            <div className="space-y-2">
              {recipeResult.steps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-xs">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-neutral-200 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CONSEIL PRO DU COACH */}
          <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 text-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">💡 Conseil du Coach Sportif</span>
            <p className="text-neutral-300 leading-relaxed">{recipeResult.proTip}</p>
          </div>

          {/* BOUTON DE PARTAGE COMMUNAUTAIRE */}
          <button
            type="button"
            onClick={handlePublishRecipe}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Partager ma recette sur le fil d'actualité 🚀
          </button>
        </div>
      )}
    </div>
  );
}
