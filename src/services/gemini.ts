import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askFitBotAI(prompt: string): Promise<string> {
  try {
    if (!apiKey) {
      return "⚠️ Clé API Gemini manquante dans les variables Vercel.";
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent(
      "Tu es FitBot, un coach sportif expert en musculation et nutrition. Réponds de façon motivante et concise avec des emojis à : " + prompt
    );
    const response = await result.response;
    return response.text() || "Prêt pour l'entraînement ! 💪";
  } catch (error: any) {
    console.error("Erreur Gemini détaillée:", error);
    // On affiche l'erreur exacte pour comprendre (ex: clé invalide, quota dépassé, etc.)
    return `Oups, erreur technique : ${error?.message || 'Inconnue'} 🔋`;
  }
}
