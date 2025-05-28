import { useCallback, useEffect, useRef, useState } from "react";

interface CountdownTimerResult {
  formattedTime: string;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

function useCountdownTimer(totalMinutes: number): CountdownTimerResult {
  const [timeLeft, setTimeLeft] = useState<number>(totalMinutes * 60); // seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTime = useRef<number>(totalMinutes * 60);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    if (intervalRef.current || isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    clear();
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    clear();
    setTimeLeft(initialTime.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    initialTime.current = totalMinutes * 60;
    resetTimer();

    return () => clear();
  }, [totalMinutes, resetTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { formattedTime, isRunning, startTimer, stopTimer, resetTimer };
}

export default useCountdownTimer;
