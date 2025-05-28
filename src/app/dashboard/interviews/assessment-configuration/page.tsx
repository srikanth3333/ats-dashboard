"use client";
import { updateRecord } from "@/app/actions/action";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bell,
  Book,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Languages,
  Lock,
  MessageSquare,
  Monitor,
  RotateCcw,
  Scale,
  Shield,
  Trash2,
  User2Icon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

interface PreQualifyingQuestion {
  id: string;
  question: string;
  responseType: string;
  mustHaveQualification: boolean;
  answer?: string;
}

interface InterviewSettings {
  duration: number;
  preQualifyingQuestions: PreQualifyingQuestion[];
  newQuestion: {
    question: string;
    responseType: string;
    mustHaveQualification: boolean;
    answer: string;
  };
  fitScore: {
    technical: number;
    communication: number;
  };
  interviewExpiry: "date" | "responses" | "none";
  expiryDate?: string;
  maxResponses?: number;
  scorePrivacy: {
    overallScore: boolean;
    individualQuestionScore: boolean;
    communicationScore: boolean;
  };
  retakeSettings: {
    enabled: boolean;
    maxRetakes?: number;
  };
  remoteProctoringSettings: {
    enabled: boolean;
    tabChangesDetection: boolean;
    externalMonitorDetection: boolean;
    intermittentFaceDetection: boolean;
    multipleFacesDetection: boolean;
    multipleVoicesDetection: boolean;
    plagiarismCheck: boolean;
    enableScreenSharing: boolean;
  };
  lockInterviewLink: {
    enabled: boolean;
    password?: string;
  };
  notifications: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
  };
}

const InterviewSettingsComponent = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    duration: true,
    preQualifying: false,
    fitScore: false,
    expiry: false,
    privacy: false,
    retake: false,
    proctoring: false,
    lock: false,
    notifications: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const handleNavigate = async () => {
    if (!id) {
      alert("Interview ID is missing.");
      return;
    }
    const result: any = await updateRecord("interviews", id, {
      duration: settings?.duration,
      pre_qualifying_questions: settings?.preQualifyingQuestions,
      fit_score: settings?.fitScore,
      interview_expiry: settings?.interviewExpiry,
      expiry_date: settings?.expiryDate,
      max_responses: settings?.maxResponses,
      score_privacy: settings?.scorePrivacy,
      retake_settings: settings?.retakeSettings,
      remote_proctoring_settings: settings?.remoteProctoringSettings,
      lock_interview_link: settings?.lockInterviewLink,
      notifications: settings?.notifications,
      interview_url: `/jobseeker/ai-interview/preview?interviewId=${id}`,
    });
    if (result?.success && result.data) {
      router.push(`/dashboard/interviews/review-publish?id=${id}`);
    }
  };

  const [settings, setSettings] = useState<InterviewSettings>({
    duration: 10,
    preQualifyingQuestions: [
      {
        id: "1",
        question: "tell about yourself",
        responseType: "text",
        mustHaveQualification: true,
        answer: "Yes",
      },
    ],
    newQuestion: {
      question: "",
      responseType: "",
      mustHaveQualification: false,
      answer: "",
    },
    fitScore: {
      technical: 49,
      communication: 51,
    },
    interviewExpiry: "none",
    expiryDate: "2025-05-25",
    maxResponses: 10,
    scorePrivacy: {
      overallScore: false,
      individualQuestionScore: false,
      communicationScore: false,
    },
    retakeSettings: {
      enabled: true,
    },
    remoteProctoringSettings: {
      enabled: true,
      tabChangesDetection: true,
      externalMonitorDetection: true,
      intermittentFaceDetection: true,
      multipleFacesDetection: true,
      multipleVoicesDetection: true,
      plagiarismCheck: true,
      enableScreenSharing: true,
    },
    lockInterviewLink: {
      enabled: false,
    },
    notifications: {
      emailNotifications: true,
      whatsappNotifications: false,
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDurationChange = (duration: number) => {
    setSettings((prev) => ({ ...prev, duration }));
  };

  const handleFitScoreChange = (technical: number) => {
    const communication = 100 - technical;
    setSettings((prev) => ({
      ...prev,
      fitScore: { technical, communication },
    }));
  };

  const addPreQualifyingQuestion = () => {
    if (settings.newQuestion.question.trim()) {
      const newQuestion: PreQualifyingQuestion = {
        id: Date.now().toString(),
        question: settings.newQuestion.question,
        responseType: settings.newQuestion.responseType || "text",
        mustHaveQualification: settings.newQuestion.mustHaveQualification,
        answer: settings.newQuestion.answer || "Yes",
      };

      setSettings((prev) => ({
        ...prev,
        preQualifyingQuestions: [...prev.preQualifyingQuestions, newQuestion],
        newQuestion: {
          question: "",
          responseType: "",
          mustHaveQualification: false,
          answer: "",
        },
      }));
    }
  };

  const removePreQualifyingQuestion = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      preQualifyingQuestions: prev.preQualifyingQuestions.filter(
        (q) => q.id !== id
      ),
    }));
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    sectionKey,
    subtitle,
  }: {
    icon: React.ElementType;
    title: string;
    sectionKey: string;
    subtitle?: string;
  }) => (
    <div
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b"
      onClick={() => toggleSection(sectionKey)}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <div className="text-center font-semibold text-xl">
        Create New Interview
      </div>
      <div className="bg-white shadow-md rounded-xl p-4 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <Book />
              <div>
                <h2 className="text-lg font-semibold">
                  Interview Configuration
                </h2>
                <p className="text-sm text-gray-500">Next: Review & Publish</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item}>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Check size={15} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 items-start">
        <div className="bg-white shadow-md flex-1 rounded-xl p-6">
          <div className="flex gap-2 items-center">
            <Languages />
            <h5 className="text-gray-600 text-sm uppercase">
              Interview Language
            </h5>
          </div>
          <div className="flex gap-2 items-center mt-3">
            <CheckCheck />
            <h5 className="font-semibold">English</h5>
          </div>
          <hr className="my-4" />
          <div className="flex gap-2 items-center">
            <User2Icon />
            <h5 className="text-gray-600 text-sm uppercase">AI Avatar</h5>
          </div>
          <div className="flex gap-2 items-center mt-3">
            <CheckCheck />
            <h5 className="font-semibold">Mike</h5>
          </div>
        </div>
        <div className="bg-white flex-2 shadow-md rounded-xl ">
          {/* Interview Duration */}
          <SectionHeader
            icon={Clock}
            title="Interview Duration"
            sectionKey="duration"
            subtitle="Change the time duration for the interview session as needed."
          />
          {expandedSections.duration && (
            <div className="p-6 border-b">
              <div className="flex gap-2">
                {[10, 15, 20, 25, 30].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => handleDurationChange(duration)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      settings.duration === duration
                        ? "bg-green-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {duration} mins
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pre-Qualifying Questions */}
          <SectionHeader
            icon={MessageSquare}
            title="Pre-Qualifying Questions"
            sectionKey="preQualifying"
          />
          {expandedSections.preQualifying && (
            <div className="p-6 border-b">
              <p className="text-sm text-gray-600 mb-4">
                Pre-qualifying questions are presented to candidates ahead of
                interview. The answers to these questions determine if candidate
                satisfy requirements of the job.{" "}
                <strong>
                  Only if all questions are answered as required, they proceed
                  to the tests.
                </strong>
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-4">
                  Add New Pre-Qualifying Question
                </h4>
                <input
                  type="text"
                  placeholder="Try asking 'What's your total years of experience?'"
                  value={settings.newQuestion.question}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newQuestion: {
                        ...prev.newQuestion,
                        question: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 border rounded-lg mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Response Type
                    </label>
                    <select
                      value={settings.newQuestion.responseType}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          newQuestion: {
                            ...prev.newQuestion,
                            responseType: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-3 border rounded-lg text-gray-700"
                    >
                      {/* <option value="">Response Type</option>
                      <option value="text">Text</option>
                      <option value="multiple-choice">Multiple Choice</option> */}
                      <option value="yes-no">Yes/No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Answer
                    </label>
                    <select
                      value={settings.newQuestion.answer}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          newQuestion: {
                            ...prev.newQuestion,
                            answer: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-3 border rounded-lg text-gray-700"
                    >
                      <option value="">Answer</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={settings.newQuestion.mustHaveQualification}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        newQuestion: {
                          ...prev.newQuestion,
                          mustHaveQualification: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Must have qualification</span>
                </label>
                <button
                  onClick={addPreQualifyingQuestion}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Question
                </button>
              </div>

              <div>
                <h4 className="font-medium mb-4">
                  Added Pre-Qualifying Questions (
                  {settings.preQualifyingQuestions.length}/5)
                </h4>
                {settings.preQualifyingQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white border rounded-lg p-4 mb-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">
                            Answer: <strong>{question.answer || "Yes"}</strong>
                          </span>
                          {question.mustHaveQualification && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                              MUST HAVE QUALIFICATION
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            removePreQualifyingQuestion(question.id)
                          }
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fit Score Weightage */}
          <SectionHeader
            icon={Scale}
            title="Fit Score Weightage"
            sectionKey="fitScore"
          />
          {expandedSections.fitScore && (
            <div className="p-6 border-b">
              <p className="text-sm text-gray-600 mb-4">
                Adjust the weight of Technical and Communication scores to
                define how the Fit Score is calculated. You can modify this
                anytime based on the job requirements.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Technical
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    Communication
                  </span>
                </div>
                <div className="relative">
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    <div
                      className="bg-blue-400 flex items-center justify-center text-white font-medium"
                      style={{ width: `${settings.fitScore.technical}%` }}
                    >
                      {settings.fitScore.technical}%
                    </div>
                    <div
                      className="bg-orange-400 flex items-center justify-center text-white font-medium"
                      style={{ width: `${settings.fitScore.communication}%` }}
                    >
                      {settings.fitScore.communication}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.fitScore.technical}
                    onChange={(e) =>
                      handleFitScoreChange(parseInt(e.target.value))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interview Expiry */}
          <SectionHeader
            icon={Calendar}
            title="Interview Expiry"
            sectionKey="expiry"
          />
          {expandedSections.expiry && (
            <div className="p-6 border-b">
              <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded mb-4">
                Interview link expires on a specific date or after reaching the
                responses count
              </p>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${settings.interviewExpiry === "date" ? "border-black border-2" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="expiry"
                      value="date"
                      checked={settings.interviewExpiry === "date"}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          interviewExpiry: e.target.value as any,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span>Set Date</span>
                  </div>
                  {settings.interviewExpiry === "date" && (
                    <input
                      type="date"
                      value={settings.expiryDate}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          expiryDate: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                    />
                  )}
                </label>
                <label
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${settings.interviewExpiry === "responses" ? "border-black border-2" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="expiry"
                      value="responses"
                      checked={settings.interviewExpiry === "responses"}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          interviewExpiry: e.target.value as any,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span>Set Responses Count</span>
                  </div>
                  {settings.interviewExpiry === "responses" && (
                    <input
                      type="number"
                      placeholder="Responses Count"
                      value={settings.maxResponses || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          maxResponses: parseInt(e.target.value) || undefined,
                        }))
                      }
                      className="p-2 border rounded w-32"
                    />
                  )}
                </label>
                {settings.interviewExpiry === "responses" &&
                  !settings.maxResponses && (
                    <p className="text-red-500 text-sm ml-8">
                      Responses count is required
                    </p>
                  )}
                <label
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${settings.interviewExpiry === "none" ? "border-black border-2" : ""}`}
                >
                  <input
                    type="radio"
                    name="expiry"
                    value="none"
                    checked={settings.interviewExpiry === "none"}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        interviewExpiry: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>No Expiry</span>
                </label>
              </div>
            </div>
          )}

          {/* Score Privacy */}
          <SectionHeader
            icon={Shield}
            title="Score Privacy"
            sectionKey="privacy"
          />
          {expandedSections.privacy && (
            <div className="p-6 border-b">
              <p className="text-sm text-gray-600 mb-4">
                Do you want to reveal scores to candidates?
              </p>
              <div className="space-y-4">
                {[
                  { key: "overallScore", label: "Overall score" },
                  {
                    key: "individualQuestionScore",
                    label: "Individual question score",
                  },
                  { key: "communicationScore", label: "Communication score" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings.scorePrivacy[
                            key as keyof typeof settings.scorePrivacy
                          ]
                        }
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            scorePrivacy: {
                              ...prev.scorePrivacy,
                              [key]: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 rounded-full ${
                          settings.scorePrivacy[
                            key as keyof typeof settings.scorePrivacy
                          ]
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            settings.scorePrivacy[
                              key as keyof typeof settings.scorePrivacy
                            ]
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          } mt-0.5`}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retake Settings */}
          <SectionHeader
            icon={RotateCcw}
            title="Retake Settings"
            sectionKey="retake"
          />
          {expandedSections.retake && (
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Full Interview Retake Request</h4>
                  <p className="text-sm text-gray-600">
                    Candidate can send the retake request
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.retakeSettings.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        retakeSettings: {
                          ...prev.retakeSettings,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full ${
                      settings.retakeSettings.enabled
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.retakeSettings.enabled
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Remote Proctoring Settings */}
          <SectionHeader
            icon={Monitor}
            title="Remote Proctoring Settings"
            sectionKey="proctoring"
          />
          {expandedSections.proctoring && (
            <div className="p-6 border-b">
              <div className="space-y-4">
                {[
                  {
                    key: "tabChangesDetection",
                    title: "Tab changes detection",
                    description:
                      "Monitor and detect any unauthorized tab switching during the session",
                  },
                  {
                    key: "externalMonitorDetection",
                    title: "External monitor detection",
                    description:
                      "Identify the use of external monitors connected to the device",
                  },
                  {
                    key: "intermittentFaceDetection",
                    title: "Intermittent face out of view detection",
                    description:
                      "Detect when candidate's face is intermittently out of the camera's view",
                  },
                  {
                    key: "multipleFacesDetection",
                    title: "Multiple faces detection",
                    description:
                      "Detect the presence of more than one face in the video",
                  },
                  {
                    key: "multipleVoicesDetection",
                    title: "Multiple voices detection",
                    description:
                      "Identify when more than one voice is detected in the audio",
                  },
                  {
                    key: "plagiarismCheck",
                    title: "Plagiarism Check",
                    description:
                      "Detect content originality to ensure responses are authentic",
                  },
                  {
                    key: "enableScreenSharing",
                    title: "Enable Screen Sharing",
                    description:
                      "Ask candidates to allow screen sharing for full-screen access, recording, and screenshot capturing.",
                  },
                ].map(({ key, title, description }) => (
                  <div key={key} className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{title}</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={
                          settings.remoteProctoringSettings[
                            key as keyof typeof settings.remoteProctoringSettings
                          ] as boolean
                        }
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            remoteProctoringSettings: {
                              ...prev.remoteProctoringSettings,
                              [key]: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 rounded-full ${
                          settings.remoteProctoringSettings[
                            key as keyof typeof settings.remoteProctoringSettings
                          ]
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            settings.remoteProctoringSettings[
                              key as keyof typeof settings.remoteProctoringSettings
                            ]
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          } mt-0.5`}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lock Interview Link */}
          <SectionHeader
            icon={Lock}
            title="Lock Interview Link"
            sectionKey="lock"
          />
          {expandedSections.lock && (
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Disable public visibility</h4>
                  <p className="text-sm text-gray-600">
                    Select if you want only invited candidates to take this
                    interview
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lockInterviewLink.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        lockInterviewLink: {
                          ...prev.lockInterviewLink,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full ${
                      settings.lockInterviewLink.enabled
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.lockInterviewLink.enabled
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications */}
          <SectionHeader
            icon={Bell}
            title="Notifications"
            sectionKey="notifications"
          />
          {expandedSections.notifications && (
            <div className="p-6 border-b">
              <div>
                <h4 className="font-medium mb-2">New candidate response</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Every time a candidate submits an assessment
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.whatsappNotifications}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            whatsappNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Whatsapp</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white shadow-md rounded-xl p-4 mt-4 fixed bottom-0 left-0 right-0">
        <div className="flex justify-end gap-4 items-center">
          <Button variant={"animated"} onClick={handleNavigate}>
            Continue
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSettingsComponent;
