"use client";

import {
  createRecordWithoutUser,
  getListDataById,
  updateRecord,
} from "@/app/actions/action";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { useSpeaker } from "@/hooks/use-speaker";
import useCountdownTimer from "@/hooks/use-timer";
import { useVideoRecorder } from "@/hooks/use-video-recorder";
import { useVoiceDetectionWithNoiseSuppression } from "@/hooks/use-voice-detector";
import { useWebcam } from "@/hooks/use-web-cam";
import { createClient } from "@/utils/supabase/client";
import { Camera, LogOut, Mic, Timer } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const Dictaphone = () => {
  const { formattedTime, isRunning, startTimer } = useCountdownTimer(1);
  const [jobData, setJobData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get("interviewId");
  const router = useRouter();

  const { speak, isSpeaking, stop } = useSpeaker();
  const { noVoiceDetected } = useVoiceDetectionWithNoiseSuppression();
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const saveTriggeredRef = useRef(false);
  const speechProcessingRef = useRef(false);
  const lastTranscriptRef = useRef("");

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

  // Memoize reversed messages to prevent flickering
  const displayMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

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
        .from("videos")
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

  function extractQuestionsAndAnswersAdvanced(messages: any[]): any[] {
    const qaPairs: any[] = [];
    const chronologicalMessages = [...messages].reverse();

    let currentQuestion = "";

    for (const message of chronologicalMessages) {
      if (message.role === "assistant" && message.content.trim() !== "") {
        currentQuestion = message.content.trim();
      } else if (
        message.role === "user" &&
        message.content.trim() !== "" &&
        currentQuestion !== ""
      ) {
        qaPairs.push({
          question: currentQuestion,
          answer: message.content.trim(),
        });
        currentQuestion = "";
      }
    }

    return qaPairs;
  }

  const callInterviewAnalysis = async (recordId: any) => {
    const apiUrl =
      "https://urrntgajwowrjxuyiiau.supabase.co/functions/v1/hello-world";
    const dataArray = extractQuestionsAndAnswersAdvanced(messages);
    const payload = {
      name: "",
      questionAnswerArray: dataArray,
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
    if (saveTriggeredRef.current || isSaving || !recordedBlob || !id) {
      return;
    }

    saveTriggeredRef.current = true;
    setIsSaving(true);
    const dataArray = extractQuestionsAndAnswersAdvanced(messages);

    try {
      console.log("Starting save recording process...");

      const [uploadResult, recordResult] = await Promise.all([
        uploadVideoBlob(recordedBlob),
        createRecordWithoutUser("candidate_interview", {
          interview_data: dataArray,
          job_id: id,
          status: "completed",
        }),
      ]);

      if (
        !uploadResult?.url ||
        !recordResult?.success ||
        !recordResult?.data?.id
      ) {
        throw new Error("Failed to upload video or create record");
      }

      const updateResult = await updateRecord(
        "candidate_interview",
        recordResult.data.id,
        { video_url: uploadResult.url }
      );

      if (!updateResult?.success) {
        throw new Error("Failed to update record with video URL");
      }

      try {
        await callInterviewAnalysis(recordResult.data.id);
      } catch (analysisError) {
        console.error("Analysis failed, but continuing:", analysisError);
      }

      router.push(
        `/jobseeker/ai-interview/candidate-details?interviewId=${id}&id=${recordResult.data.id}`
      );
    } catch (error) {
      console.error("Error saving recording:", error);
      setError("Failed to save interview. Please try again.");
      setInterviewEnded(false);
      saveTriggeredRef.current = false;
    } finally {
      setIsSaving(false);
    }
  }, [recordedBlob, id, messages, router]);

  const startListening = async () => {
    try {
      const result = await validateAndStartRecording();
      if (result) {
        setIsOpen(false);
        startTimer();
        startWebcam();
        handleSubmit(undefined);
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      setError("Failed to start recording. Please check permissions.");
    }
  };

  const endInterview = useCallback(() => {
    if (interviewEnded || saveTriggeredRef.current) {
      return;
    }

    console.log("Ending interview...");
    SpeechRecognition.stopListening();
    stopRecording();
    stop();
    setInterviewEnded(true);
  }, [stopRecording, stop, interviewEnded]);

  // Process voice input with debouncing
  const processVoiceInput = useCallback(async () => {
    if (
      speechProcessingRef.current ||
      isProcessingVoice ||
      !transcript.trim() ||
      transcript === lastTranscriptRef.current ||
      interviewEnded ||
      !isRunning
    ) {
      return;
    }

    speechProcessingRef.current = true;
    setIsProcessingVoice(true);
    lastTranscriptRef.current = transcript;

    try {
      console.log("Processing voice input:", transcript);
      SpeechRecognition.stopListening();
      setInput(transcript);
      resetTranscript();
    } catch (error) {
      console.error("Error processing voice input:", error);
    } finally {
      speechProcessingRef.current = false;
      setIsProcessingVoice(false);
    }
  }, [
    transcript,
    setInput,
    resetTranscript,
    interviewEnded,
    isRunning,
    isProcessingVoice,
  ]);

  // Handle timer end
  useEffect(() => {
    if (!isRunning && isRecording && !interviewEnded) {
      console.log("Timer ended, ending interview");
      endInterview();
    }
  }, [isRunning, isRecording, interviewEnded, endInterview]);

  // Handle speech recognition state
  useEffect(() => {
    if (isSpeaking) {
      SpeechRecognition.stopListening();
      avatarVideoRef.current?.play();
    } else {
      avatarVideoRef.current?.pause();
      if (avatarVideoRef.current) {
        avatarVideoRef.current.currentTime = 0;
      }

      // Restart listening with delay to avoid conflicts
      if (!interviewEnded && isRunning && isRecording && !isProcessingVoice) {
        setTimeout(() => {
          if (!isSpeaking && !interviewEnded && isRunning && isRecording) {
            SpeechRecognition.startListening({ continuous: true });
          }
        }, 500);
      }
    }
  }, [isSpeaking, interviewEnded, isRunning, isRecording, isProcessingVoice]);

  // Handle AI responses
  useEffect(() => {
    if (!isLoading && isRunning && !interviewEnded) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role === "assistant" && latestMessage?.content) {
        speak(latestMessage.content);
      }
    }
  }, [messages, isLoading, isRunning, interviewEnded, speak]);

  // Handle voice detection with debouncing
  useEffect(() => {
    if (noVoiceDetected && transcript.trim() !== "" && !isProcessingVoice) {
      const timeoutId = setTimeout(() => {
        processVoiceInput();
      }, 1000); // 1 second delay to ensure complete sentence

      return () => clearTimeout(timeoutId);
    }
  }, [noVoiceDetected, transcript, processVoiceInput, isProcessingVoice]);

  // Handle input submission
  useEffect(() => {
    if (input.trim() !== "" && !interviewEnded && !isLoading) {
      const submitTimeout = setTimeout(() => {
        handleSubmit(undefined);
      }, 100);

      return () => clearTimeout(submitTimeout);
    }
  }, [input, handleSubmit, interviewEnded, isLoading]);

  // Handle interview end and saving
  useEffect(() => {
    if (
      interviewEnded &&
      !isSpeaking &&
      !isSaving &&
      !saveTriggeredRef.current
    ) {
      const saveTimeout = setTimeout(() => {
        saveRecording();
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [interviewEnded, isSpeaking, isSaving, saveRecording]);

  // Auto-scroll to bottom with throttling
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages.length, transcript]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderMessageContent = useCallback((content: any) => {
    if (typeof content === "string") {
      return <div className="mb-2 font-normal">{content}</div>;
    }

    if (Array.isArray(content)) {
      return content.map((part: any, i: number) => {
        if (part.type === "text") {
          return (
            <div key={i} className="mb-2 font-normal">
              {part.text}
            </div>
          );
        }
        return null;
      });
    }

    return null;
  }, []);

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
                <div className="overflow-y-scroll h-[30vh] w-full rounded-lg py-5 px-2 hide-scrollbar">
                  <div className="flex flex-col">
                    {/* Display messages in original order (latest at bottom) */}
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className="whitespace-pre-wrap mb-3"
                      >
                        {message.role === "user" ? (
                          <span className="font-bold text-gray-900">You</span>
                        ) : (
                          <span className="font-bold text-gray-900">AI</span>
                        )}
                        {/* Handle both string content and parts array */}
                        {typeof message.content === "string" ? (
                          <div className="mb-2 font-normal">
                            {message.content}
                          </div>
                        ) : Array.isArray(message.content) ? (
                          (message.content as Array<any>).map(
                            (part: any, i: any) => {
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
                            }
                          )
                        ) : null}
                      </div>
                    ))}

                    {/* Show current transcript if available */}
                    {transcript && (
                      <div className="text-gray-800 mb-3">
                        <span className="font-bold text-gray-900">You</span>{" "}
                        <br />
                        <span className="text-blue-600 italic">
                          {transcript}
                        </span>
                      </div>
                    )}

                    {/* This div will be scrolled to automatically */}
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
              className={`p-2 border border-3 rounded-full border-gray-400 ${
                isSpeaking ? "bg-green-50" : ""
              }`}
            >
              <Mic className="text-green-500" />
            </div>
            <div
              className={`p-2 border border-3 rounded-full border-gray-400 ${
                isRecording ? "bg-green-50" : ""
              }`}
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
        onOpenChange={() => {}}
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
