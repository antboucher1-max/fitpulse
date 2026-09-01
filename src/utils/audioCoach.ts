export const audioCoach = {
  // Bip simple (changement d'intervalle ou repère)
  playBeep(frequency = 440, duration = 150) {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      console.log("Audio non supporté ou bloqué par le navigateur", e);
    }
  },

  // Annonce vocale de synthèse (ex: "Allure trop lente, accélère !")
  speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stoppe la précédente phrase si besoin
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
};
