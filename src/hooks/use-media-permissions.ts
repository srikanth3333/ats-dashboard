import { useEffect, useState } from "react";

export const useMediaPermissions = () => {
  const [micPermission, setMicPermission] = useState<PermissionState | null>(
    null
  );
  const [camPermission, setCamPermission] = useState<PermissionState | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const mic = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        const cam = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        setMicPermission(mic.state);
        setCamPermission(cam.state);

        mic.onchange = () => setMicPermission(mic.state);
        cam.onchange = () => setCamPermission(cam.state);
      } catch (err) {
        setError("Permission API not supported or permission denied.");
      }
    };

    checkPermissions();
  }, []);

  const requestAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setError(null);
    } catch (err) {
      setError("Permission denied.");
    }
  };

  return { micPermission, camPermission, requestAccess, error };
};
