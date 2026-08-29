export async function askFitBotAI(prompt: string): Promise<string> {
  try {
    const text = prompt.toLowerCase();
    if (text.includes('bonjour') || text.includes('salut')) {
      return "Salut l'athlète ! Comment se passe ta séance aujourd'hui ? 💪";
    }
    if (text.includes('pec') || text.includes('pectoraux')) {
      return "Pour les pecs, je te conseille le développé couché, les dips et les écartés à la poulie pour un max de congestion ! 🔥";
    }
    return "En tant que coach FitBot IA, je te conseille de bien t'hydrater, de t'échauffer et de maintenir une surcharge progressive sur tes exercices ! 🚀";
  } catch (error) {
    return "Désolé, une petite erreur est survenue avec le coach IA.";
  }
}
