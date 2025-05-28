"use client";

import {
  createRecordWithoutUser,
  getListDataById,
  updateRecord,
} from "@/app/actions/action";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { useSpeaker } from "@/hooks/use-speaker";
import useCountdownTimer from "@/hooks/use-timer";
import { useVideoRecorder } from "@/hooks/use-video-recorder";
import { useVoiceDetectionWithNoiseSuppression } from "@/hooks/use-voice-detector";
import { useWebcam } from "@/hooks/use-web-cam";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@ai-sdk/react";
import { Camera, LogOut, Mic, Timer } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default async function Page() {
  return (
    <Suspense>
      <Dictaphone />
    </Suspense>
  );
}

async function uploadVideoBlob(
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: "video/webm",
    });

    const filePath = `recordings/${file.name}`;
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from("videos") // Make sure the bucket is named "videos"
      .upload(filePath, file, {
        contentType: "video/webm",
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return {
      url: null,
      error: err.message || "Unexpected error during upload.",
    };
  }
}

const Dictaphone = () => {
  const { formattedTime, isRunning, startTimer } = useCountdownTimer(1);
  const [jobData, setJobData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [interview, setInterview] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTriggeredSave, setHasTriggeredSave] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get("interviewId");
  const router = useRouter();

  const { speak, isSpeaking, stop } = useSpeaker();
  const { noVoiceDetected } = useVoiceDetectionWithNoiseSuppression();
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const saveTriggeredRef = useRef(false);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const { startWebcam, videoRef } = useWebcam();
  const {
    validateAndStartRecording,
    stopRecording,
    recordedBlob,
    isRecording,
  } = useVideoRecorder();

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    body: {
      role: jobData?.job_name,
      name: "",
      skills: jobData?.job_skills,
    },
  });

  const fetchData = useCallback(async () => {
    if (!id) {
      setError("No job ID provided");
      return;
    }

    try {
      setIsDataLoading(true);
      const result = await getListDataById("interviews", "*", id);
      if (result?.success && result.data) {
        setJobData(result.data);
      } else {
        setError("No data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch interview data");
    } finally {
      setIsDataLoading(false);
    }
  }, [id]);

  const callInterviewAnalysis = async (recordId: any) => {
    const apiUrl =
      "https://urrntgajwowrjxuyiiau.supabase.co/functions/v1/hello-world";
    const payload = {
      name: "",
      questionAnswerArray: interview,
      id: recordId,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm50Z2Fqd293cmp4dXlpaWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNTA4MTksImV4cCI6MjA2MTgyNjgxOX0.GGziq9iaztJ2db3W-JM2c_Pg_flGwmUHpDuaXI88ctw",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Analysis API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Analysis Result:", result);
      return result;
    } catch (error) {
      console.error("Error calling analysis API:", error);
      throw error;
    }
  };

  const saveRecording = useCallback(async () => {
    // Prevent multiple executions
    if (
      saveTriggeredRef.current ||
      isSaving ||
      !recordedBlob ||
      !id ||
      hasTriggeredSave
    ) {
      console.log("Save recording blocked:", {
        alreadySaving: saveTriggeredRef.current,
        isSaving,
        hasBlob: !!recordedBlob,
        hasId: !!id,
        hasTriggeredSave,
      });
      return;
    }

    // Set flags to prevent re-execution
    saveTriggeredRef.current = true;
    setHasTriggeredSave(true);
    setIsSaving(true);

    try {
      console.log("Starting save recording process...");

      // Create interview record and upload video in parallel
      const [uploadResult, recordResult] = await Promise.all([
        uploadVideoBlob(recordedBlob),
        createRecordWithoutUser("candidate_interview", {
          interview_data: interview,
          job_id: id,
          status: "completed",
        }),
      ]);

      console.log("Upload result:", uploadResult);
      console.log("Record result:", recordResult);

      if (
        !uploadResult?.url ||
        !recordResult?.success ||
        !recordResult?.data?.id
      ) {
        throw new Error("Failed to upload video or create record");
      }

      // Update record with video URL
      const updateResult = await updateRecord(
        "candidate_interview",
        recordResult.data.id,
        { video_url: uploadResult.url }
      );

      console.log("Update result:", updateResult);

      if (!updateResult?.success) {
        throw new Error("Failed to update record with video URL");
      }

      // Call analysis API
      try {
        const analysisResult = await callInterviewAnalysis(
          recordResult.data.id
        );
        console.log("Analysis completed:", analysisResult);
      } catch (analysisError) {
        console.error("Analysis failed, but continuing:", analysisError);
      }

      // Navigate to results page
      router.push(
        `/jobseeker/ai-interview/candidate-details?interviewId=${id}&id=${recordResult.data.id}`
      );
    } catch (error) {
      console.error("Error saving recording:", error);
      setError("Failed to save interview. Please try again.");
      setInterviewEnded(false);
      // Reset flags on error so user can retry
      saveTriggeredRef.current = false;
      setHasTriggeredSave(false);
    } finally {
      setIsSaving(false);
    }
  }, [recordedBlob, id, interview, isSaving, hasTriggeredSave, router]);

  const startListening = async () => {
    try {
      const result = await validateAndStartRecording();
      if (result) {
        setIsOpen(false);
        startTimer();
        startWebcam();
        handleSubmit(undefined, { allowEmptySubmit: true });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      setError("Failed to start recording. Please check permissions.");
    }
  };

  const endInterview = useCallback(() => {
    // Prevent multiple calls
    if (interviewEnded || saveTriggeredRef.current) {
      console.log("End interview blocked - already ended or saving");
      return;
    }

    console.log("Ending interview...");

    // Stop all recording and listening
    SpeechRecognition.stopListening();
    stopRecording();
    stop();

    // Set interview ended state
    setInterviewEnded(true);
  }, [stopRecording, stop, interviewEnded]);

  // Handle timer end
  useEffect(() => {
    if (!isRunning && isRecording && !interviewEnded) {
      console.log("Timer ended, ending interview");
      endInterview();
    }
  }, [isRunning, isRecording, interviewEnded, endInterview]);

  // Handle speech recognition and AI responses
  useEffect(() => {
    if (isSpeaking) {
      SpeechRecognition.stopListening();
      avatarVideoRef.current?.play();
    } else {
      avatarVideoRef.current?.pause();
      if (avatarVideoRef.current) {
        avatarVideoRef.current.currentTime = 0;
      }

      // Only restart listening if interview is active
      if (!interviewEnded && isRunning && isRecording) {
        SpeechRecognition.startListening({ continuous: true });
      }
    }
  }, [isSpeaking, interviewEnded, isRunning, isRecording]);

  // Handle AI message responses
  useEffect(() => {
    if (!isLoading && isRunning && !interviewEnded) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role !== "user" && latestMessage?.content) {
        speak(latestMessage.content);
      }
    }
  }, [messages, isLoading, isRunning, interviewEnded, speak]);

  // Handle voice detection and transcript processing
  useEffect(() => {
    if (
      noVoiceDetected &&
      transcript.trim() !== "" &&
      isRunning &&
      isRecording &&
      !interviewEnded
    ) {
      console.log("Voice detected, processing transcript:", transcript);

      SpeechRecognition.stopListening();
      setInput(transcript);

      // Add to interview data
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role !== "user") {
        setInterview((prev) => [
          ...prev,
          { question: latestMessage?.content || "", answer: transcript },
        ]);
      }
    }
  }, [
    noVoiceDetected,
    transcript,
    setInput,
    isRunning,
    isRecording,
    interviewEnded,
    messages,
  ]);

  // Handle input submission
  useEffect(() => {
    if (input.trim() !== "" && !interviewEnded) {
      handleSubmit(undefined, { allowEmptySubmit: false });
      resetTranscript();
    }
  }, [input, handleSubmit, resetTranscript, interviewEnded]);

  // Handle interview end and saving
  useEffect(() => {
    if (
      interviewEnded &&
      !isSpeaking &&
      !isSaving &&
      !hasTriggeredSave &&
      !saveTriggeredRef.current
    ) {
      console.log("Interview ended, triggering save recording...");
      saveRecording();
    }
  }, [interviewEnded, isSpeaking, isSaving, hasTriggeredSave, saveRecording]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Browser doesn't support speech recognition.
          </p>
          <p className="text-gray-600 mt-2">
            Please use Chrome, Safari, or Edge.
          </p>
        </div>
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "No data available"}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-lvh bg-gray-100">
      <div className="bg-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-semibold text-lg">
            JOB WARP{" "}
            <span className="bg-primary p-1 text-white">AI INTERVIEW</span>
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 shadow-lg mt-[10vh] max-w-6xl mx-auto rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-end">
            <h2 className="text-xl font-bold uppercase">AI Interview</h2>
            <span className="rounded-full border border-gray-300 px-4 border-2 text-sm font-medium">
              English
            </span>
            <span className="rounded-full border border-gray-300 px-4 border-2 text-sm font-medium">
              {jobData?.job_name || "Frontend Developer"}
            </span>
            <span className="rounded-full border border-gray-300 px-4 border-2 text-sm font-medium">
              Text
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer />
            <h2 className="text-lg font-semibold">
              Interview Time Left:{" "}
              <span className="font-bold">{formattedTime}</span>
            </h2>
          </div>
        </div>

        <div className="my-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="bg-gray-300 flex-2 rounded-lg h-[50vh]">
              <div className="h-full w-full overflow-hidden relative">
                {isRecording && (
                  <div className="absolute top-5 right-5 z-[1]">
                    <div className="flex justify-between">
                      <div className="flex gap-1 items-center border border-2 border-red-500 px-2 rounded bg-white">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="font-semibold text-red-500 text-xs">
                          REC
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute w-full">
                  <video
                    ref={videoRef}
                    className="rounded mx-auto d-block object-cover h-full w-full"
                    loop
                    muted
                  />
                </div>

                <div className="absolute left-5 bottom-5 z-[1]">
                  <div>
                    <iframe
                      className="h-10 w-10"
                      src="https://lottie.host/embed/b1a2b0be-ad67-4377-8916-81fc6738bb67/aCTlalSQ92.lottie"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-gray-100 bg-gradient-to-b from-black/10 to-white/70 p-2 rounded-lg h-[30vh] flex items-end overflow-hidden hide-scrollbar">
                <div className="overflow-y-scroll h-[30vh] flex items-end rounded-lg py-5 px-2 hide-scrollbar">
                  <div>
                    {messages?.reverse()?.map((message) => (
                      <div key={message.id} className="whitespace-pre-wrap">
                        {message.role === "user" ? (
                          <span className="font-bold text-gray-900">You</span>
                        ) : (
                          <span className="font-bold text-gray-900">AI</span>
                        )}
                        {message.parts.map((part, i) => {
                          if (part.type === "text") {
                            return (
                              <div
                                key={`${message.id}-${i}`}
                                className="mb-2 font-normal"
                              >
                                {part.text}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ))}
                    {transcript && (
                      <div className="text-gray-800">
                        <span className="font-bold text-gray-900">You</span>{" "}
                        <br />
                        {transcript}
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
              </div>

              <div className="bg-rose-100/40 p-2 mt-3 rounded-lg h-[20vh] relative overflow-hidden">
                <video
                  src="/ai-video.mp4"
                  className="absolute top-0 rounded left-0 w-full h-full object-contain"
                  ref={avatarVideoRef}
                  loop
                  muted
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex gap-3 justify-center items-center">
            <button
              onClick={endInterview}
              className="p-2 border border-3 cursor-pointer rounded-full border-gray-400 rotate-180 hover:bg-red-50"
              disabled={interviewEnded}
            >
              <LogOut className="text-red-500" />
            </button>
            <div
              className={`p-2 border border-3 rounded-full border-gray-400 ${isSpeaking ? "bg-green-50" : ""}`}
            >
              <Mic className="text-green-500" />
            </div>
            <div
              className={`p-2 border border-3 rounded-full border-gray-400 ${isRecording ? "bg-green-50" : ""}`}
            >
              <Camera className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Initial Modal */}
      <Modal
        isOpen={isOpen}
        className="w-[500px]"
        onOpenChange={() => setIsOpen(!isOpen)}
        title="Please Share Full Screen for Recording"
      >
        <div className="text-center">
          <Image
            height={500}
            width={300}
            src={"/screen-share.png"}
            alt="Screen share illustration"
            className="mx-auto d-block"
          />
        </div>
        <div className="flex justify-around mt-5">
          <Button variant={"destructive"} onClick={() => router.push("/")}>
            Cancel Interview
          </Button>
          <Button variant={"animated"} onClick={startListening}>
            Continue to share
          </Button>
        </div>
      </Modal>

      {/* Interview End Modal */}
      <Modal
        isOpen={interviewEnded}
        className="w-[500px]"
        onOpenChange={() => {}} // Prevent manual closing
        title="Interview Completed"
      >
        <div className="text-center">
          <iframe
            src="https://lottie.host/embed/4c408ed0-25d6-4ab2-9a35-683e144fb766/BMSOjqBNTP.lottie"
            className="w-full h-48"
          />
          <h2 className="mt-4">
            {isSaving
              ? "Saving your interview data..."
              : "Processing your interview results..."}
          </h2>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </Modal>
    </div>
  );
};
