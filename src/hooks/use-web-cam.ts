// hooks/useWebcam.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebcamReturn {
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
}

export const useWebcam = (): UseWebcamReturn => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Ensure client-side execution
  useEffect(() => {
    setIsClient(true);
  }, []);

  const startWebcam = useCallback(async () => {
    if (!isClient || typeof window === "undefined" || !navigator.mediaDevices) {
      setError("Webcam is not supported in this environment.");
      return;
    }

    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // Set to true if you also want audio
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError("Failed to access webcam. Ensure permissions are granted.");
      setIsStreaming(false);
    }
  }, [isClient]);

  const stopWebcam = useCallback(() => {
    if (!isClient || streamRef.current == null) {
      return;
    }

    // Stop all tracks in the stream
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, [isClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return { startWebcam, stopWebcam, videoRef, isStreaming, error };
};
