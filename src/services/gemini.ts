import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function askFitBotAI(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Tu es FitBot, un coach sportif virtuel ultra motivant, bienveillant, expert en musculation, nutrition et fitness. Tu réponds de manière concise, percutante et dynamique avec des emojis.",
      },
    });
    return response.text || "Je suis en pleine forme et prêt à t'aider à tout casser à l'entraînement ! 💪 Dis-moi, quel est ton programme aujourd'hui ?";
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return "Oups, j'ai eu un petit coup de fatigue 🔋. Réessaie dans un instant !";
  }
}
