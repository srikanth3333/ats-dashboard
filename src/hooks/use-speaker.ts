// hooks/useTextToSpeech.ts
import { useCallback, useEffect, useState } from "react";

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  error: string | null;
}

export const useSpeaker = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Ensure code runs only on the client side
  useEffect(() => {
    setIsClient(true); // Set flag to indicate client-side execution
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Only execute if running on the client
      if (
        !isClient ||
        typeof window === "undefined" ||
        !window.speechSynthesis
      ) {
        setError("Text-to-speech is not supported in this environment.");
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language (customizable)
      utterance.volume = 1; // 0 to 1
      utterance.rate = 1; // 0.1 to 10
      utterance.pitch = 1; // 0 to 2

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setError("An error occurred during speech synthesis.");
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isClient]
  );

  const stop = useCallback(() => {
    // Only execute if running on the client
    if (!isClient || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isClient]);

  return { speak, stop, isSpeaking, error };
};
