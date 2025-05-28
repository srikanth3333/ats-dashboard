"use client";
import { getListDataById } from "@/app/actions/action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Bell,
  Book,
  Briefcase,
  Check,
  CheckCheck,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Languages,
  MapPin,
  MoreHorizontal,
  Play,
  Send,
  User2Icon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Define interfaces for type safety
interface Notifications {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

interface JobData {
  id: string;
  job_name: string;
  job_description: string;
  years_of_experience: string;
  seniority_level: string;
  employment_type: string;
  workplace_type: string;
  city: string;
  country: string;
  salary_currency: string;
  salary_from: string;
  salary_to: string;
  salary_frequency: string;
  skills_required: string[];
  compensation_types: string[];
  pre_qualifying_questions: any[];
  expiry_date: string | null;
  notifications: Notifications;
}

interface ApiResponse {
  success: boolean;
  data?: JobData;
}

// Type the getListDataById function
const typedGetListDataById = getListDataById as (
  table: string,
  fields: string,
  id: string
) => Promise<ApiResponse>;

const InterviewModal = ({ isOpen, onClose, interviewLink }: any) => {
  const router = useRouter();
  const handleCopyLink = () => {
    navigator.clipboard.writeText(interviewLink);
  };

  const handleTryNow = () => {
    router.push(interviewLink);
  };

  const handleSendInvite = () => {
    console.log("Send invite clicked");
  };

  const handleViewInterview = () => {
    router.push("/dashboard/interviews");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Interview
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              AI Interviewer is live!
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Congratulations! Your interview is live now. You can now share
              <br />
              this interview with your candidates
            </p>
          </div>

          {/* Action Cards */}
          <div className="space-y-4 mb-8">
            {/* Try Interview Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    <Play className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Try Interview</h3>
                    <p className="text-sm text-gray-500">
                      Try this interview individually
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTryNow}
                  className="px-4 py-2"
                >
                  Try Now
                </Button>
              </div>
            </div>

            {/* Invite Candidates Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    <Send className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Invite Candidates
                    </h3>
                    <p className="text-sm text-gray-500">
                      Invite your candidates to take this interview
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSendInvite}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </div>

          {/* Interview Link Section */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Interview link</h3>
            <div className="flex items-center gap-2">
              <Input
                value={`http://localhost:3000${interviewLink}`}
                readOnly
                className="flex-1 bg-gray-50 text-sm text-gray-600"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="px-3 py-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* View Interview Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleViewInterview}
              className="text-gray-600 hover:text-gray-900 gap-2"
            >
              View Interview
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null); // Fix: Use JobData | null instead of any[]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Fix: Allow null for error state
  const [isOpen, setIsOpen] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

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
    void fetchData(); // Fix: Add void to satisfy ESLint for async useEffect
  }, [fetchData]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!jobData) return <div>No job data available</div>;

  // Truncate job description if longer than 150 characters
  const fullDescription = jobData.job_description ?? "";
  const truncatedDescription =
    fullDescription.length > 150
      ? `${fullDescription.slice(0, 150)}...`
      : fullDescription;

  // Map skills from SQL data
  const allSkills = jobData.skills_required ?? [];
  const visibleSkills = isSkillsExpanded ? allSkills : allSkills.slice(0, 3);

  // Format salary
  const salary =
    jobData.salary_from && jobData.salary_to
      ? `${jobData.salary_currency === "dollar" ? "$" : "₹"}${jobData.salary_from} - ${
          jobData.salary_currency === "dollar" ? "$" : "₹"
        }${jobData.salary_to} (per ${jobData.salary_frequency})`
      : "Not specified";

  // Format expiry date
  const expiryDate = jobData.expiry_date
    ? new Date(jobData.expiry_date).toLocaleDateString()
    : "No Expiry";

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
                <h2 className="text-lg font-semibold">Add Job Description</h2>
                <p className="text-sm text-gray-500">Next: Job Details</p>
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
        <div className="bg-white shadow-md flex-3 rounded-xl">
          {/* Header */}
          <div className="bg-green-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{jobData.job_name}</h1>
                <span className="bg-green-600 px-3 py-1 rounded text-sm font-medium">
                  {jobData.id.slice(0, 8).toUpperCase()}
                </span>
                <div className="flex gap-3 mt-4">
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Briefcase size={16} />
                    {jobData.years_of_experience}+ years
                  </span>
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                    {jobData.seniority_level.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                    {jobData.employment_type.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-green-200">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 9h6v6H9z" />
                  <path d="M9 1v6M15 1v6M9 17v6M15 17v6M1 9h6M1 15h6M17 9h6M17 15h6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className=" p-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 shadow-md rounded-lg border">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Briefcase size={16} />
                  <span className="text-sm">Workplace Type</span>
                </div>
                <p className="font-semibold">
                  {jobData.workplace_type.toUpperCase()}
                </p>
              </div>

              <div className="bg-white p-4 shadow-md rounded-lg border">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span className="text-sm">Job Location</span>
                </div>
                <p className="font-semibold">{`${jobData.city}, ${jobData.country.toUpperCase()}`}</p>
              </div>

              <div className="bg-white p-4 shadow-md rounded-lg border">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign size={16} />
                  <span className="text-sm">Salary Range</span>
                </div>
                <p className="font-semibold">{salary}</p>
              </div>

              <div className="bg-white p-4 shadow-md rounded-lg border">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Assessment Expiry</span>
                </div>
                <p className="font-semibold">{expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <h2 className="text-xl font-semibold">Job description</h2>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {isDescriptionExpanded ? fullDescription : truncatedDescription}
            </p>

            {fullDescription.length > 150 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-green-600 font-medium mt-2 hover:text-green-700 transition-colors"
              >
                {isDescriptionExpanded ? "Read Less" : "Read More"}
              </button>
            )}

            {/* Skills Required */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Skills required</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {visibleSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill.replace(/-/g, " ").toUpperCase()}
                  </span>
                ))}
                {allSkills.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                    className="bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Additional Compensations */}
            {jobData.compensation_types?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  Additional Compensations
                </h3>
                {jobData.compensation_types.map((comp, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium mr-2"
                  >
                    {comp.replace(/-/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Pre-Qualifying Questions */}
            {jobData.pre_qualifying_questions?.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-500" size={20} />
                  <h3 className="text-lg font-semibold">
                    Pre-Qualifying Questions
                  </h3>
                </div>
                {jobData.pre_qualifying_questions.map((question, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border mb-2"
                  >
                    <p className="mb-2">{`${index + 1}. ${question?.question}`}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Answer:</span>
                      <span className="font-medium">{question?.answer}</span>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        MUST HAVE QUALIFICATION
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notification Settings */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="text-yellow-500" size={20} />
                <h3 className="text-lg font-semibold">Notification</h3>
              </div>

              <div className="mb-4">
                <p className="font-medium mb-1">New candidate response</p>
                <p className="text-gray-600 text-sm">
                  Every time a candidate submits an assessment
                </p>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">Email</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled
                    checked={whatsappNotifications}
                    onChange={(e) => setWhatsappNotifications(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">Whatsapp</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-xl p-4 mt-4 fixed bottom-0 left-0 right-0">
        <div className="flex justify-end gap-4 items-center">
          <Button variant={"animated"} onClick={() => setIsOpen(!isOpen)}>
            Continue
            <ArrowRight />
          </Button>
        </div>
      </div>
      <InterviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(!isOpen)}
        interviewLink={`/jobseeker/ai-interview/preview?interviewId=${id}`}
      />
    </div>
  );
};

export default Page;
