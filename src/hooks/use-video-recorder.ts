"use client";

import { useCallback, useRef, useState } from "react";

interface UseVideoRecorderReturn {
  startRecording: (displayStream?: MediaStream) => Promise<void>;
  stopRecording: () => void;
  validateAndStartRecording: () => Promise<boolean>;
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;
  screenSettings: any;
  UseVideoRecorderReturn?: any | null;
}

export const useVideoRecorder = (): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screenSettings, setSettings] = useState({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Validate screen recording dimensions and sharing mode
  const validateScreenStream = useCallback(
    async (stream: MediaStream): Promise<boolean> => {
      try {
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        const minScreenWidth = 1200; // Minimum expected screen width
        const minScreenHeight = 700; // Minimum expected screen height

        console.log("Screen capture settings:", settings);
        setSettings(settings);
        // Check if the capture is likely a full screen or a window
        const isFullScreen =
          "displaySurface" in settings &&
          (settings.displaySurface === "monitor" ||
            settings.displaySurface === "screen");

        if (
          !settings.width ||
          !settings.height ||
          settings.width < minScreenWidth ||
          settings.height < minScreenHeight
        ) {
          const shareType = isFullScreen ? "screen" : "window or tab";
          throw new Error(
            `Invalid capture size for ${shareType}: ${settings.width}x${settings.height}. Please select "Entire Screen".`
          );
        }

        if (!isFullScreen) {
          throw new Error(
            `Please select "Entire Screen" instead of a window or tab. Current capture size: ${settings.width}x${settings.height}`
          );
        }

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.warn("No system audio detected in screen capture");
        }

        return true;
      } catch (err) {
        console.error("Screen validation failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to validate screen recording. Please select 'Entire Screen'."
        );
        return false;
      }
    },
    []
  );

  const startRecording = useCallback(async (displayStream?: MediaStream) => {
    try {
      // Use provided displayStream or request a new one
      const streamToUse =
        displayStream ??
        (await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        }));

      // Get microphone stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Create AudioContext to mix audio tracks
      const audioContext = new AudioContext();
      const systemSource = audioContext.createMediaStreamSource(streamToUse);
      const micSource = audioContext.createMediaStreamSource(micStream);
      const destination = audioContext.createMediaStreamDestination();

      systemSource.connect(destination);
      micSource.connect(destination);

      // Combine streams
      const combinedStream = new MediaStream([
        ...streamToUse.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      streamRef.current = combinedStream;
      chunksRef.current = [];
      setRecordedBlob(null);
      setRecordedUrl(null);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);

        // Clean up
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Recording error:", err);
      setError("Failed to start recording. Ensure permissions are granted.");
      setIsRecording(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Failed to stop recording:", err);
      }
    } else {
      console.warn("MediaRecorder not available or not recording.");
    }
  }, []);

  // Combined validation and recording start
  const validateAndStartRecording = useCallback(async (): Promise<boolean> => {
    try {
      // Get display stream for validation
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Validate the stream
      const isValid = await validateScreenStream(displayStream);
      if (!isValid) {
        displayStream.getTracks().forEach((track) => track.stop());
        return false;
      }

      // Proceed with recording using the validated stream
      await startRecording(displayStream);
      return true;
    } catch (err) {
      console.error("Validation and recording failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start recording. Please select 'Entire Screen' and grant all permissions."
      );
      return false;
    }
  }, [validateScreenStream, startRecording]);

  return {
    startRecording,
    stopRecording,
    validateAndStartRecording,
    isRecording,
    recordedBlob,
    recordedUrl,
    screenSettings,
    error,
  };
};
