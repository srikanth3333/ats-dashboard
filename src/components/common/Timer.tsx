import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

// Define the props for our component
interface CountdownTimerProps {
  fromDateTime: string; // ISO date string from Supabase
  hours: number; // Duration in hours
  onComplete?: () => void; // Optional callback when timer ends
  showHours?: boolean; // Option to show hours in the display
}

export default function CountdownTimer({
  fromDateTime,
  hours,
  onComplete,
  showHours = true,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Parse the fromDateTime properly
    const startTime = new Date(fromDateTime);

    // Check if the date is valid
    if (isNaN(startTime.getTime())) {
      console.error("Invalid date format provided:", fromDateTime);
      return;
    }

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + hours);

    const totalDurationMs = endTime.getTime() - startTime.getTime();

    const calculateTimeRemaining = () => {
      const now = new Date();

      if (now >= endTime) {
        setIsEnded(true);
        setProgress(0);
        if (onComplete && !isEnded) {
          onComplete();
        }
        return null;
      }

      const remainingMs = endTime.getTime() - now.getTime();

      // Calculate progress percentage
      const elapsedMs = now.getTime() - startTime.getTime();
      const progressPercentage = Math.max(
        0,
        100 - (elapsedMs / totalDurationMs) * 100
      );
      setProgress(progressPercentage);

      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds };
    };

    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fromDateTime, hours, onComplete, isEnded]);

  const formatTimeUnit = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  return (
    <>
      {isEnded ? (
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">Time's Up!</h2>
          <p className="text-slate-500 mt-1">The countdown has ended</p>
        </div>
      ) : (
        timeRemaining && (
          <div className="flex flex-col gap-4">
            <div
              className={`grid ${showHours ? "grid-cols-3" : "grid-cols-2"} gap-2 text-center`}
            >
              {showHours && (
                <div className="flex flex-col">
                  <span className="font-bold">
                    {formatTimeUnit(timeRemaining.hours)}
                  </span>
                  <span className="text-sm text-slate-500">Hours</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold">
                  {formatTimeUnit(timeRemaining.minutes)}
                </span>
                <span className="text-sm text-slate-500">Minutes</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">
                  {formatTimeUnit(timeRemaining.seconds)}
                </span>
                <span className="text-sm text-slate-500">Seconds</span>
              </div>
            </div>

            <div>
              <Progress value={progress} className="h-1" />
            </div>
          </div>
        )
      )}
    </>
  );
}
