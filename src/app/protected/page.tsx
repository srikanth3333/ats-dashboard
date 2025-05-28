// components/VoiceBot.tsx
import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceBot: React.FC = () => {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Text-to-Speech
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
      startListening();
    };
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Get AI Response from API
  const getAIResponse = async (inputText: string) => {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await res.json();
      const reply = data.response;
      setAiResponse(reply);
      speak(reply);
    } catch (err) {
      console.error(err);
      setAiResponse("Sorry, something went wrong.");
    }
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    startListening();
  }, []);

  // Detect question or sentence end
  useEffect(() => {
    if (transcript && !isSpeaking) {
      const trimmed = transcript.trim();
      const lastChar = trimmed.slice(-1);
      if (["?", "."].includes(lastChar)) {
        stopListening();
        getAIResponse(trimmed);
        resetTranscript();
      }
    }
  }, [transcript]);

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-xl space-y-4">
      <h2 className="text-2xl font-bold">🎤 AI Voice Bot</h2>
      <p className="text-gray-600">Listening: {listening ? "Yes" : "No"}</p>
      <p className="text-blue-600">You said: {transcript}</p>
      <p className="text-green-600">🤖 AI: {aiResponse}</p>
    </div>
  );
};

export default VoiceBot;
