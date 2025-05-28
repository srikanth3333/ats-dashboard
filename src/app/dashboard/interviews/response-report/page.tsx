"use client";
import { getListDataById } from "@/app/actions/action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  FileText,
  Flag,
  MapPin,
  MessageSquare,
  Mic,
  Sparkles,
  Star,
  User,
  Users,
  Volume2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface HiringInterviewReportProps {
  data: any;
}

const HiringInterviewReport: React.FC<HiringInterviewReportProps> = ({
  data,
}) => {
  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Hyring Interview Report
            </h1>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Two-way Interview
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-start justify-between bg-white p-4">
        {/* Left Section - Candidate Info */}
        <div className="flex gap-6">
          {/* Profile Image */}
          <div className="w-20 h-20  rounded-full overflow-hidden border-2 border-gray-200 justify-center items-center flex">
            <User height={50} width={50} />
          </div>

          {/* Candidate Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Interview User
              </h2>

              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{data?.job?.job_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{data?.job?.city}</span>
                </div>
              </div>
            </div>

            {/* Interview Details */}
            <div className="flex gap-8 text-sm text-gray-600">
              <div>
                <span className="font-medium">Interviewed on:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {data?.job?.create_at}
                </span>
              </div>
              <div>
                <span className="font-medium">Total time taken:</span>
                <span className="ml-2 font-semibold text-gray-900">10m</span>
              </div>
              <div>
                <span className="font-medium">Interview location:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {data?.job?.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Score */}
        <div className="flex items-center gap-4">
          {/* Score Circle */}
          <div className="relative w-32 h-32">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#ef4444"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${data?.score * 2.51} ${(100 - data?.score) * 2.51}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900">
                {data?.score}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateSummaryStats: React.FC<any> = ({
  totalExperience = "12 years",
  currentSalary = "$2500000",
  expectedSalary = "$3200000",
  expectedJoiningDate = "12 May 2025",
}: any) => {
  const stats = [
    {
      label: "Total Work Experience",
      value: totalExperience,
    },
    {
      label: "Current Annual Salary",
      value: currentSalary,
    },
    {
      label: "Expected Annual Salary",
      value: expectedSalary,
    },
    {
      label: "Expected Joining Date",
      value: expectedJoiningDate,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {stats.map((stat, index) => (
          <div key={index} className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TechnicalScore: React.FC<any> = ({
  data = {
    tag: "average",
    percentage: "43",
    question_asked: [
      {
        question_name:
          "API Integrations - Tell me about your experience with RESTful APIs and how you handle authentication?",
      },
      {
        question_name:
          "Database Management - How do you optimize SQL queries for better performance?",
      },
      {
        question_name:
          "System Architecture - Explain your approach to designing scalable microservices?",
      },
      {
        question_name:
          "Security Protocols - What are the key security measures you implement in web applications?",
      },
      {
        question_name:
          "Cloud Services - Describe your experience with AWS or Azure deployment strategies?",
      },
      {
        question_name:
          "Version Control - How do you manage code conflicts in Git when working with large teams?",
      },
      {
        question_name:
          "Testing Strategies - What is your approach to unit testing and integration testing?",
      },
      {
        question_name:
          "Performance Optimization - How do you identify and resolve application bottlenecks?",
      },
      {
        question_name:
          "DevOps Practices - Explain your experience with CI/CD pipelines and automation?",
      },
      {
        question_name:
          "Code Review - What do you look for when reviewing another developer's code?",
      },
      {
        question_name:
          "Error Handling - How do you implement comprehensive error handling in applications?",
      },
      {
        question_name:
          "Data Structures - When would you use a HashMap vs TreeMap in Java?",
      },
      {
        question_name:
          "Algorithms - Explain the time complexity of different sorting algorithms?",
      },
      {
        question_name:
          "Design Patterns - Give an example of when you would use the Observer pattern?",
      },
    ],
    total_question: 14,
  },
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const percentage = parseInt(data.percentage) || 43;
  const totalQuestions = data.total_question || 14;

  // Create segmented chart data for individual questions
  const segmentValue = 100 / totalQuestions;
  const chartData = data.question_asked.map((question: any, index: any) => ({
    name: `Q${index + 1}`,
    value: segmentValue,
    question: question.question_name,
    index: index,
  }));

  // Get colors based on score range
  const getScoreColor = (score: number) => {
    if (score >= 70) return "#10b981"; // Green for good
    if (score >= 40) return "#3b82f6"; // Blue for average
    return "#ef4444"; // Red for poor
  };

  const getSegmentColor = (
    index: number,
    totalQuestions: number,
    percentage: number
  ) => {
    const answeredQuestions = Math.round((percentage / 100) * totalQuestions);

    if (index < answeredQuestions) {
      // Answered questions - use score-based color
      return getScoreColor(percentage);
    } else {
      // Unanswered questions - light gray
      return "#f3f4f6";
    }
  };

  const getTagLabel = (tag: string, score: number) => {
    if (tag === "good" || score >= 70) return "EXCELLENT";
    if (tag === "average" || (score >= 40 && score < 70)) return "AVERAGE";
    return "POOR";
  };

  const scoreColor = getScoreColor(percentage);
  const tagLabel = getTagLabel(data.tag, percentage);
  const tagBgColor =
    tagLabel === "EXCELLENT"
      ? "bg-green-600"
      : tagLabel === "AVERAGE"
        ? "bg-orange-500"
        : "bg-red-500";

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0] && hoveredSegment !== null) {
      const data = payload[0].payload;
      return null; // We'll handle tooltip manually
    }
    return null;
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-gray-900">Technical Score</h3>
        <span
          className={`px-3 py-1 text-xs font-medium text-white rounded ${tagBgColor}`}
        >
          {tagLabel}
        </span>
      </div>

      {/* Chart Container */}
      <div className="flex items-center justify-center relative">
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
                onMouseEnter={(_, index) => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {chartData.map((entry: any, index: any) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getSegmentColor(index, totalQuestions, percentage)}
                    className="hover:opacity-80 cursor-pointer transition-opacity"
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {percentage}%
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {totalQuestions} Questions
            </div>
          </div>
        </div>

        {/* Custom Popover */}
        {hoveredSegment !== null && chartData[hoveredSegment] && (
          <div
            className="fixed z-50 bg-black text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: "translate(0, -100%)",
            }}
          >
            <div className="font-medium mb-1">
              {chartData[hoveredSegment].name} |{" "}
              {chartData[hoveredSegment].question.split(" - ")[0]}
            </div>
            <div className="text-xs opacity-90">
              {chartData[hoveredSegment].question}
            </div>
          </div>
        )}
      </div>

      {/* Questions Summary */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Hover over segments to see individual questions</p>
      </div>
    </div>
  );
};

const CommunicationScore: React.FC<any> = ({
  data = {
    tag: "average",
    Fluency: 2,
    Grammar: 3,
    Vocabulary: 2,
    Pronunciation: 3,
    Minimal_Filler_Words: 4,
  },
}) => {
  // Transform data for radar chart
  const radarData = [
    {
      skill: "PRONUNCIATION",
      value: data.Pronunciation,
      fullMark: 5,
    },
    {
      skill: "GRAMMAR",
      value: data.Grammar,
      fullMark: 5,
    },
    {
      skill: "VOCABULARY",
      value: data.Vocabulary,
      fullMark: 5,
    },
    {
      skill: "MINIMAL\nFILLER WORDS",
      value: data.Minimal_Filler_Words,
      fullMark: 5,
    },
    {
      skill: "FLUENCY",
      value: data.Fluency,
      fullMark: 5,
    },
  ];

  const getTagLabel = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "excellent":
      case "good":
        return "EXCELLENT";
      case "average":
        return "AVERAGE";
      case "poor":
      case "bad":
        return "POOR";
      default:
        return "AVERAGE";
    }
  };

  const tagLabel = getTagLabel(data.tag);
  const tagBgColor =
    tagLabel === "EXCELLENT"
      ? "bg-green-600"
      : tagLabel === "AVERAGE"
        ? "bg-orange-500"
        : "bg-red-500";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Communication Score
        </h3>
        <span
          className={`px-3 py-1 text-xs font-medium text-white rounded ${tagBgColor}`}
        >
          {tagLabel}
        </span>
      </div>

      {/* Radar Chart */}
      <div className="flex items-center justify-center">
        <div className="w-80 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" strokeWidth={1} radialLines={true} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                  fontWeight: 500,
                }}
                className="text-xs"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Communication Skills"
                dataKey="value"
                stroke="#d97706"
                fill="#d97706"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#92400e",
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const AISummary: React.FC<any> = ({
  summaryPoints = [
    "The interviewee demonstrated a lack of knowledge in the area of ethical hacking, specifically in the use of Burp Suite and other web application security tools.",
    "The interviewee's communication was average, with some room for improvement in vocabulary and fluency.",
    "Overall, the interviewee does not seem to be a good fit for a role requiring expertise in ethical hacking.",
  ],
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">AI Summary</h3>
      </div>

      {/* Summary Points */}
      <div className="space-y-4">
        {summaryPoints.map((point: any, index: any) => (
          <div key={index} className="flex items-start gap-3">
            {/* Check Icon */}
            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </div>

            {/* Summary Text */}
            <p className="text-gray-700 text-sm leading-relaxed flex-1">
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const InterviewIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("integrity");

  const integritySignals: any[] = [
    {
      id: "tab-changes",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Tab Changes",
      detected: true,
    },
    {
      id: "face-out-of-view",
      icon: <EyeOff className="w-5 h-5" />,
      label: "Face out of view",
      detected: true,
    },
    {
      id: "multiple-faces",
      icon: <Users className="w-5 h-5" />,
      label: "Multiple faces detected",
      detected: true,
    },
    {
      id: "eye-gaze",
      icon: <Eye className="w-5 h-5" />,
      label: "Eye gaze tracking",
      detected: true,
    },
    {
      id: "multiple-voices",
      icon: <Volume2 className="w-5 h-5" />,
      label: "Multiple voices detected",
      detected: true,
    },
    {
      id: "lip-sync",
      icon: <Mic className="w-5 h-5" />,
      label: "Lip sync issues",
      detected: true,
    },
    {
      id: "plagiarism",
      icon: <FileText className="w-5 h-5" />,
      label: "Plagiarism detected",
      detected: true,
    },
  ];

  const tabs = [
    { id: "integrity", label: "Integrity Signals" },
    { id: "engagement", label: "Engagement Vibes" },
    { id: "cognitive", label: "Cognitive Insights" },
  ];

  return (
    <div className="bg-white p-5 shadow-md rounded-lg">
      <div className="">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Interview Intelligence
          </h1>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            BETA
          </Badge>
        </div>

        <div className="flex gap-2 mb-3">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === "integrity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integritySignals.map((signal) => (
            <Card
              key={signal.id}
              className="border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="px-2 py-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600">{signal.icon}</div>
                    <span className="text-gray-900 font-medium">
                      {signal.label}
                    </span>
                  </div>
                  {signal.detected && (
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-green-600" />
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "engagement" && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Engagement Vibes</p>
            <p className="text-sm">Coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === "cognitive" && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Cognitive Insights</p>
            <p className="text-sm">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SkillRatings: React.FC = () => {
  const skillRatings: any[] = [
    {
      id: "api-integrations",
      name: "API Integrations",
      questionCount: 3,
      rating: 2.0,
      maxRating: 5,
      color: "orange",
    },
    {
      id: "visualforce",
      name: "Visualforce",
      questionCount: 3,
      rating: 1.0,
      maxRating: 5,
      color: "red",
    },
    {
      id: "lightning-components",
      name: "Lightning Components",
      questionCount: 2,
      rating: 2.0,
      maxRating: 5,
      color: "orange",
    },
    {
      id: "copado",
      name: "Copado",
      questionCount: 2,
      rating: 1.3,
      maxRating: 5,
      color: "orange",
    },
    {
      id: "apex",
      name: "Apex",
      questionCount: 3,
      rating: 2.7,
      maxRating: 5,
      color: "blue",
    },
  ];

  const getStarColor = (color: string) => {
    switch (color) {
      case "orange":
        return "text-orange-500";
      case "red":
        return "text-red-500";
      case "blue":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1);
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Skill Ratings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillRatings.map((skill, index) => (
          <div key={skill.id}>
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-900 font-medium">
                    {skill.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({skill.questionCount} Question
                    {skill.questionCount !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star
                  className={`w-4 h-4 ${getStarColor(skill.color)} fill-current`}
                />
                <span className={`font-semibold ${getStarColor(skill.color)}`}>
                  {formatRating(skill.rating)}/{skill.maxRating}
                </span>
              </div>
            </div>
            {index < skillRatings.length - 1 && (
              <div className="border-b border-gray-100"></div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

function page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>({});
  const videoRef = useRef(null);

  const jumpTo = (seconds: any) => {
    const video = videoRef.current;
    // if (video && seconds <= video.duration) {
    //   video.currentTime = seconds;
    //   video.play();
    // }
  };

  const getData = async () => {
    if (!id) {
      return;
    }
    const result = await getListDataById(
      "candidate_interview",
      "*, job:job_id(*)",
      id
    );
    console.log(result);
    if (result?.error) {
      return;
    }
    setData(result?.data);
  };

  useEffect(() => {
    getData();
  }, []);

  console.log("data", data?.video_url);
  return (
    <div>
      <HiringInterviewReport data={data} />
      <div className="mt-3">
        <CandidateSummaryStats
          totalExperience={data?.exp_years}
          currentSalary={data?.current_salary}
          expectedSalary={data?.exp_salary}
          expectedJoiningDate={data?.joining_date}
        />
      </div>
      <div
        className="grid grid-cols-1 lg:grid-cols-3
        gap-3 mt-3 items-stretch"
      >
        <div className="">
          <TechnicalScore data={data?.technical_score} />
        </div>
        <div className="">
          <CommunicationScore data={data?.communication_score} />
        </div>
        <div>
          <AISummary data={data?.ai_summary} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <div>
          <InterviewIntelligence />
        </div>
        <div>
          <SkillRatings />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-5 shadow-md rounded-lg overflow-hidden">
          <div className="shadow-sm">
            <h2 className="text-lg font-semibold">Transcriptions</h2>
          </div>
          <div className="space-y-4 h-[50vh] overflow-y-scroll hide-scrollbar">
            {data?.interview_data?.map((record: any) => (
              <div className="">
                <div className="border-b-1 border-gray-400 py-4">
                  <span className="text-green-500 text-lg font-semibold">
                    AI Interviewer
                  </span>
                  <h6 className="mt-2">{record?.question}</h6>
                </div>
                <div className="border-b-1 border-gray-400 py-4">
                  <div className="flex gap-2">
                    <User />
                    <span className="text-gray-900 text-lg font-semibold">
                      User
                    </span>
                  </div>
                  <h6 className="text-gray-800 mt-2">{record?.answer}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 shadow-md rounded-lg">
          {data?.video_url && (
            <video ref={videoRef} width="100%" controls>
              <source src={data?.video_url} type="video/webm" />
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
