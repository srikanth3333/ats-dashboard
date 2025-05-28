import { useEffect, useRef, useState } from "react";

const VOICE_THRESHOLD = 0.01;
const NO_VOICE_TIMEOUT = 2000; // 2 seconds

export function useVoiceDetectionWithNoiseSuppression() {
  const [noVoiceDetected, setNoVoiceDetected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastVoiceTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          },
        });

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        source.connect(analyser);

        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const checkVoice = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;

          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

          let sumSquares = 0;
          for (let i = 0; i < dataArrayRef.current.length; i += 1) {
            const normalized = dataArrayRef.current[i] / 128 - 1;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
          const now = Date.now();
          if (rms > VOICE_THRESHOLD) {
            lastVoiceTimeRef.current = now;
            if (noVoiceDetected) setNoVoiceDetected(false);
          } else {
            if (now - lastVoiceTimeRef.current > NO_VOICE_TIMEOUT) {
              if (!noVoiceDetected) setNoVoiceDetected(true);
            }
          }

          rafIdRef.current = requestAnimationFrame(checkVoice);
        };

        checkVoice();
      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    };

    void initAudio();

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [noVoiceDetected]);

  return { noVoiceDetected };
}
