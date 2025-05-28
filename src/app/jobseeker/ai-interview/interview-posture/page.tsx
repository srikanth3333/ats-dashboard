"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ExternalLink,
  Mic,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function InterviewReadinessCheck() {
  const [cameraPermission, setCameraPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [micPermission, setMicPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [agreedToRecord, setAgreedToRecord] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("interviewId");

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
    } catch (error) {
      setCameraPermission("denied");
    }
  };

  const checkMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
    } catch (error) {
      setMicPermission("denied");
    }
  };

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop all tracks after getting permission
      stream.getTracks().forEach((track) => track.stop());

      setCameraPermission("granted");
      setMicPermission("granted");
    } catch (error) {
      // Check individual permissions
      await checkCameraPermission();
      await checkMicPermission();
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleNavigate = () => {
    router.push(`/jobseeker/ai-interview/conversational-ai?interviewId=${id}`);
  };

  const canStartInterview =
    // cameraPermission === "granted" &&
    micPermission === "granted" && agreedToRecord;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Camera/Mic Setup */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gray-100 rounded-2xl p-12 mb-6 relative">
                  <div className="flex justify-center items-center gap-8">
                    {/* Microphone Icon */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                        <Mic className="w-10 h-10 text-gray-600" />
                      </div>
                      {micPermission === "denied" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Camera Icon */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-400 rounded-xl flex items-center justify-center">
                        <Camera className="w-10 h-10 text-gray-600" />
                      </div>
                      {cameraPermission === "denied" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Enable mic and camera access
                </h2>

                <Button
                  onClick={requestPermissions}
                  disabled={
                    isCheckingPermissions ||
                    (cameraPermission === "granted" &&
                      micPermission === "granted")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
                >
                  {isCheckingPermissions ? "Checking..." : "Allow Mic & Camera"}
                </Button>
              </div>

              {/* Guidelines Link */}
              <div className="border-t pt-6">
                <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="font-medium text-sm underline">
                    Read interview guidelines & best practices
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Readiness Check */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8 uppercase">
                  Interview readiness check
                </h1>

                <div className="space-y-6">
                  {/* Camera Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium text-gray-700">
                      Enable your camera
                    </span>
                    <div className="flex items-center gap-2">
                      {cameraPermission === "granted" ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Camera enabled
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          <span className="text-sm font-medium">
                            Camera not enabled
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="agreement"
                      checked={agreedToRecord}
                      onCheckedChange={(checked) =>
                        setAgreedToRecord(checked as boolean)
                      }
                      className="mt-1"
                    />
                    <label
                      htmlFor="agreement"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      I agree to{" "}
                      <button className="text-blue-600 hover:text-blue-800 underline">
                        record and use
                      </button>{" "}
                      my video, audio, and screenshots for evaluation purposes.
                    </label>
                  </div>

                  {/* Status Alerts */}
                  {cameraPermission === "denied" && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Camera access denied. Please enable camera permissions
                        in your browser settings to continue.
                      </AlertDescription>
                    </Alert>
                  )}

                  {micPermission === "denied" && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Microphone access denied. Please enable microphone
                        permissions in your browser settings to continue.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Start Interview Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleNavigate}
                      variant={"animated"}
                      className="w-full"
                      disabled={!canStartInterview}
                    >
                      Start Interview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
