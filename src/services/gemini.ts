// src/services/gemini.ts

export async function askFitBotAI(userPrompt: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Tu es FitBot, un coach sportif expert en musculation, fitness et nutrition, motivant, direct et chaleureux. Tu réponds toujours en français avec des emojis dynamiques." },
              { text: userPrompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Gemini brute :", response.status, errorText);
      return `Erreur API (${response.status}) : Vérifie ta clé ou ton solde Google AI Studio 🤖`;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé l'athlète, je n'ai pas pu analyser ta requête. 💪";
  } catch (error) {
    console.error("Erreur réseau FitBot :", error);
    return "Erreur de connexion au serveur Gemini. Vérifie ta configuration réseau ! 🔌";
  }
}
