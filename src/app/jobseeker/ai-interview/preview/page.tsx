"use client";

import { getListDataById } from "@/app/actions/action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Briefcase,
  Building,
  Clock,
  DollarSign,
  Globe,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface JobSkill {
  name: string;
  difficulty: number;
  suggestions: string[];
  addedConcepts: string[];
  customConcept: string;
}

interface InterviewData {
  id: string;
  created_at: string;
  job_description: string;
  user_id: string;
  job_name: string;
  years_of_experience: string;
  seniority_level: string;
  employment_type: string;
  workplace_type: string;
  country: string;
  city: string;
  salary_currency: string;
  salary_from: string;
  salary_to: string;
  salary_frequency: string;
  compensation_types: string[];
  skills_required: string[];
  job_description_ai: string;
  context: string;
  job_skills: JobSkill[];
  duration: string;
  pre_qualifying_questions: any[];
  fit_score: {
    technical: number;
    communication: number;
  };
  interview_expiry: string;
  expiry_date: string;
  max_responses: string;
  score_privacy: {
    overallScore: boolean;
    communicationScore: boolean;
    individualQuestionScore: boolean;
  };
  retake_settings: {
    enabled: boolean;
  };
  remote_proctoring_settings: {
    enabled: boolean;
    plagiarismCheck: boolean;
    enableScreenSharing: boolean;
    tabChangesDetection: boolean;
    multipleFacesDetection: boolean;
    multipleVoicesDetection: boolean;
    externalMonitorDetection: boolean;
    intermittentFaceDetection: boolean;
  };
  lock_interview_link: {
    enabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
  };
}

interface ApiResponse {
  success: boolean;
  data?: any;
}

// Mock function - replace with your actual API call
const typedGetListDataById = getListDataById as (
  table: string,
  fields: string,
  id: string
) => Promise<ApiResponse>;

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("interviewId");
  const router = useRouter();
  const [jobData, setJobData] = useState<InterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) {
      setError("No job ID provided");
      return;
    }

    try {
      setIsLoading(true);
      const result = await typedGetListDataById("interviews", "*", id);
      if (result?.success && result.data) {
        setJobData(result.data);
        setEmailNotifications(result.data.notifications.emailNotifications);
        setWhatsappNotifications(
          result.data.notifications.whatsappNotifications
        );
      } else {
        setError("No data found");
      }
    } catch (err) {
      setError("Failed to fetch interview data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatSalary = (
    from: string,
    to: string,
    currency: string,
    frequency: string
  ) => {
    const currencySymbol = currency === "dollar" ? "$" : "₹";
    const freq =
      frequency === "hour"
        ? "per hour"
        : frequency === "month"
          ? "per mo."
          : "per year";
    return `${currencySymbol}${from} - ${currencySymbol}${to} (${freq})`;
  };

  const formatExperience = (years: string, level: string) => {
    const levelMap: { [key: string]: string } = {
      entry_level: "Entry Level (0-2 Years)",
      mid_level: "Mid Level (3-6 Years)",
      senior_level: "Senior Level (7+ Years)",
    };
    return levelMap[level] || `${years}+ Years Experience`;
  };

  const formatEmploymentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      full_time: "Full-Time",
      part_time: "Part-Time",
      contract: "Contract",
      internship: "Internship",
    };
    return typeMap[type] || type;
  };

  const formatWorkplaceType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "On-Site",
    };
    return typeMap[type] || type;
  };

  const formatLocation = (city: string, country: string) => {
    const countryMap: { [key: string]: string } = {
      ind: "India",
      usa: "United States",
      uk: "United Kingdom",
    };
    const cityMap: { [key: string]: string } = {
      hyd: "Hyderabad",
      ban: "Bangalore",
      del: "Delhi",
    };
    return `${cityMap[city] || city}, ${countryMap[country] || country}`;
  };

  const formatSkillName = (skill: string) => {
    return skill
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleNavigate = () => {
    router.push(`/jobseeker/ai-interview/interview-posture?interviewId=${id}`);
  };

  if (isLoading) {
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

  console.log(jobData);
  return (
    <div className="min-h-screen overflow-y-scroll pb-20 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white  shadow-md rounded-xl p-4 fixed top-0 left-0 right-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-start  gap-4 items-center">
            <h1 className="font-semibold">
              JOB WARP{" "}
              <span className="bg-primary text-white p-1">
                AI Interview
              </span>{" "}
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-15">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Hey there, interview champion! Ready to crush it?
                  </h1>
                  <p className="text-gray-600 text-sm">
                    We appreciate your participation and look forward to
                    providing you with a seamless, efficient, and professional
                    interview experience that will assess communication,
                    technical skills and suitability to the interview
                    owner(employer)
                  </p>
                </div>

                {/* Job Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Job Role
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {jobData.job_name}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Work Experience
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatExperience(
                        jobData.years_of_experience,
                        jobData.seniority_level
                      )}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        Salary Range
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatSalary(
                        jobData.salary_from,
                        jobData.salary_to,
                        jobData.salary_currency,
                        jobData.salary_frequency
                      )}
                    </p>
                  </div>
                </div>

                {/* Interview Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <span>x Company</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{jobData.duration}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>Video Interview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </div>
                </div>

                {/* Additional Compensations */}
                {jobData.compensation_types &&
                  jobData.compensation_types.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Additional Compensations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {jobData.compensation_types.map((comp, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50"
                          >
                            {formatSkillName(comp)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="prose prose-sm max-w-none mt-4">
                  {jobData.job_description
                    .split("\n")
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="mb-3 text-gray-700 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  ... Read More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Workplace Type
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatWorkplaceType(jobData.workplace_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Employment Type
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatEmploymentType(jobData.employment_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Location
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatLocation(jobData.city, jobData.country)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Major Skills to be accessed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills_required.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {formatSkillName(skill)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="bg-white  shadow-md rounded-xl p-4 fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end  gap-4 items-center">
            <Button
              variant="animated"
              onClick={handleNavigate}
              // disabled={isLoading || isLoadingConcepts}
            >
              Continue To Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
