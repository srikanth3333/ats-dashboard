"use client";

import { getListDataById, updateRecord } from "@/app/actions/action";
import MultiSelect from "@/components/common/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Book,
  Check,
  CheckCheck,
  Languages,
  User2Icon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Initialize Open AI client

// Validation schema using Zod
const formSchema = z.object({
  jobName: z
    .string()
    .min(3, "Job name must be at least 3 characters")
    .optional(),
  yearsOfExperience: z.number().min(0).max(100).optional(),
  seniorityLevel: z
    .enum(["fresher", "junior", "mid_level", "senior", "cxo"])
    .optional(),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "temporary", "volunteer"])
    .optional(),
  workplaceType: z.enum(["all", "on_site", "hybrid", "remote"]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  salaryCurrency: z.enum(["INR", "dollar"]).optional(),
  salaryFrom: z.number().min(0, "Salary must be positive").optional(),
  salaryTo: z.number().min(0, "Salary must be positive").optional(),
  salaryFrequency: z.enum(["hour", "month", "year"]).optional(),
  compensationTypes: z.array(z.string()).optional(),
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters"),
  skills_required: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const compensationTypes = [
  { id: "tips", label: "Tips" },
  { id: "sales-commission", label: "Sales commission" },
  { id: "profit-sharing", label: "Profit sharing" },
  { id: "bonus", label: "Bonus" },
  { id: "restricted-stock", label: "Restricted Stock Units (RSUs)" },
  { id: "stock-options", label: "Employee Stock Options (ESOs)" },
  { id: "overtime", label: "Overtime" },
  { id: "sign-on-bonus", label: "Sign-on bonus" },
];

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // State for dynamic skills, compensation, and loading
  const [skillsData, setSkillsData] = useState<{ id: string; label: string }[]>(
    []
  );
  const [compensationSelection, setCompensationSelection] = useState<string[]>(
    []
  );
  const [skillsSelection, setSkillsSelection] = useState<string[]>([]);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  // Initialize form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const fetchDefaultValues = async (jobDescription: string) => {
    if (!jobDescription) return;
    setIsLoadingDefaults(true);
    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      const prompt = `
                    Analyze the following job description and extract the following details in JSON format with the specified structure:

                    {
                    "jobName": string,
                    "yearsOfExperience": number,
                    "seniorityLevel": "fresher" | "junior" | "mid_level" | "senior" | "cxo",
                    "employmentType": "full_time" | "part_time" | "contract" | "temporary" | "volunteer",
                    "workplaceType": "all" | "on_site" | "hybrid" | "remote",
                    "jobDescription": string, // Combine summary, responsibilities, and requirements into one formatted string
                    "country": string,
                    "city": string,
                    "salaryCurrency": "INR" | "dollar",
                    "salaryFrom": number,
                    "salaryTo": number,
                    "salaryFrequency": "hour" | "month" | "year",
                    "compensationTypes": string[],
                    "skills_required": [{ "id": string, "label": string }]
                    }

                    - For the jobDescription field, format it as a **single string** in the following way:

                    Summary: <summary>

                    Responsibilities:
                    - <point 1>
                    - <point 2>

                    Requirements:
                    - <point 1>
                    - <point 2>

                    - If a field cannot be determined, return it as null (or an empty array for lists).
                    - For skills_required, suggest up to 8 relevant technical skills_required with lowercase hyphenated "id" and a readable "label".

                    Job Description:
                    ${jobDescription}
                    `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that extracts structured data and suggests relevant skills_required from job descriptions.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const extractedData = JSON.parse(
        response.choices[0].message.content || "{}"
      );
      // Set form values based on API response
      if (extractedData.jobName) setValue("jobName", extractedData.jobName);
      if (extractedData.yearsOfExperience !== null)
        setValue("yearsOfExperience", extractedData.yearsOfExperience);
      if (extractedData.seniorityLevel)
        setValue("seniorityLevel", extractedData.seniorityLevel);
      if (extractedData.employmentType)
        setValue("employmentType", extractedData.employmentType);
      if (extractedData.workplaceType)
        setValue("workplaceType", extractedData.workplaceType);
      if (extractedData.jobDescription)
        setValue("jobDescription", extractedData.jobDescription);
      if (extractedData.country) setValue("country", extractedData.country);
      if (extractedData.city) setValue("city", extractedData.city);
      if (extractedData.salaryCurrency)
        setValue("salaryCurrency", extractedData.salaryCurrency);
      if (extractedData.salaryFrom !== null)
        setValue("salaryFrom", extractedData.salaryFrom);
      if (extractedData.salaryTo !== null)
        setValue("salaryTo", extractedData.salaryTo);
      if (extractedData.salaryFrequency)
        setValue("salaryFrequency", extractedData.salaryFrequency);
      if (extractedData.compensationTypes?.length) {
        setCompensationSelection(extractedData.compensationTypes);
        setValue("compensationTypes", extractedData.compensationTypes);
      }
      if (extractedData.skills_required?.length) {
        setSkillsData(extractedData.skills_required);
        setSkillsSelection(
          extractedData.skills_required.map((skill: { id: string }) => skill.id)
        );
        setValue(
          "skills_required",
          extractedData.skills_required.map((skill: { id: string }) => skill.id)
        );
      } else {
        setSkillsData([]);
      }
    } catch (error) {
      console.error("Error fetching default values from Open AI:", error);
      alert(
        "Failed to fetch default values or skills_required. Please fill the form manually."
      );
      setSkillsData([]);
    } finally {
      setIsLoadingDefaults(false);
    }
  };

  const getData = async () => {
    const result: any = await getListDataById(
      "interviews",
      "*",
      id ?? undefined
    );
    if (result?.success) {
      fetchDefaultValues(result.data?.job_description);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    if (!id || typeof id !== "string") {
      alert("Invalid interview ID.");
      return;
    }
    const result: any = await updateRecord("interviews", id, {
      job_name: data.jobName,
      years_of_experience: data.yearsOfExperience,
      seniority_level: data.seniorityLevel,
      employment_type: data.employmentType,
      workplace_type: data.workplaceType,
      country: data.country,
      city: data.city,
      salary_currency: data.salaryCurrency,
      salary_from: data.salaryFrom,
      salary_to: data.salaryTo,
      salary_frequency: data.salaryFrequency,
      compensation_types: data.compensationTypes,
      job_description: data.jobDescription,
      skills_required: data.skills_required,
      job_description_ai: data.jobDescription,
    });
    if (result?.success && result.data) {
      router.push(`/dashboard/interviews/interview-context?id=${id}`);
    } else {
      alert("Failed to save job details.");
    }
  };

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
                <h2 className="text-lg font-semibold">Job Details</h2>
                <p className="text-sm text-gray-500">Next: Interview Context</p>
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
      <form onSubmit={handleSubmit(onSubmit)}>
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
          <div className="bg-white flex-2 shadow-md rounded-xl p-6">
            <h5 className="font-semibold text-lg flex gap-2 mb-4">
              <Book />
              Job Details
            </h5>
            <div>
              <div className="mb-4">
                <label className="font-medium text-sm text-gray-800">
                  Job Name
                </label>
                <Input
                  {...register("jobName")}
                  className="mt-1"
                  placeholder="Enter job name"
                />
                {errors.jobName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jobName.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm text-gray-800">
                    Years Of Experience
                  </label>
                  <p className="text-gray-800 font-semibold text-sm mt-1">
                    0 - {watch("yearsOfExperience") || 0} years
                  </p>
                </div>
                <Slider
                  className="mt-1"
                  value={[watch("yearsOfExperience") || 0]}
                  onValueChange={(value) =>
                    setValue("yearsOfExperience", value[0])
                  }
                  max={12}
                  step={1}
                />
                {errors.yearsOfExperience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.yearsOfExperience.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="font-medium text-sm text-gray-800">
                  Seniority Level
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue("seniorityLevel", value as any)
                  }
                  value={watch("seniorityLevel")}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Seniority Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid_level">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="cxo">CXO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.seniorityLevel && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.seniorityLevel.message}
                  </p>
                )}
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm text-gray-800">
                    Employment Type
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setValue("employmentType", value as any)
                    }
                    value={watch("employmentType")}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="full_time">Full-Time</SelectItem>
                        <SelectItem value="part_time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.employmentType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.employmentType.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-sm text-gray-800">
                    Workplace Type
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setValue("workplaceType", value as any)
                    }
                    value={watch("workplaceType")}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Workplace Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="on_site">On-Site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.workplaceType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workplaceType.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm text-gray-800">
                    Country
                  </label>
                  <Select
                    onValueChange={(value) => setValue("country", value)}
                    value={watch("country")}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ind">India</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-sm text-gray-800">
                    City
                  </label>
                  <Select
                    onValueChange={(value) => setValue("city", value)}
                    value={watch("city")}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="hyd">Hyderabad</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="font-medium text-sm text-gray-800">
                  Salary Range
                </label>
                <div className="flex gap-4 ">
                  <div>
                    <Select
                      onValueChange={(value) =>
                        setValue("salaryCurrency", value as any)
                      }
                      value={watch("salaryCurrency")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="INR">₹</SelectItem>
                          <SelectItem value="dollar">$</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register("salaryFrom", { valueAsNumber: true })}
                      className="mt-1"
                      placeholder="From"
                    />
                    {errors.salaryFrom && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.salaryFrom.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register("salaryTo", { valueAsNumber: true })}
                      className="mt-1"
                      placeholder="To"
                    />
                    {errors.salaryTo && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.salaryTo.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Select
                      onValueChange={(value) =>
                        setValue("salaryFrequency", value as any)
                      }
                      value={watch("salaryFrequency")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="hour">Per hour</SelectItem>
                          <SelectItem value="month">Per month</SelectItem>
                          <SelectItem value="year">Per year</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.salaryFrequency && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.salaryFrequency.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="font-medium text-sm text-gray-800">
                  Additional Compensation
                </label>
                <div className="mt-3">
                  <MultiSelect
                    title="Additional Compensation"
                    subtitle="Optional"
                    items={compensationTypes}
                    initialSelected={compensationSelection}
                    onSelectionChange={(selected) => {
                      setCompensationSelection(selected);
                      setValue("compensationTypes", selected);
                    }}
                    placeholder="Add compensation types"
                    maxVisibleUnselected={3}
                  />
                  {errors.compensationTypes && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.compensationTypes.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="font-medium text-sm text-gray-800">
                  Job Description
                </label>
                <Textarea
                  {...register("jobDescription")}
                  className="mt-4 h-50"
                  placeholder="Type or paste your job description here to proceed."
                />
                {errors.jobDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jobDescription.message}
                  </p>
                )}
                {isLoadingDefaults && (
                  <p className="text-gray-500 text-sm mt-1">
                    Fetching default values and skills...
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="font-medium text-base text-gray-800">
                  Skills Required
                </label>
                <div className="mt-3">
                  <MultiSelect
                    title="Add Skills"
                    subtitle=""
                    items={skillsData}
                    initialSelected={skillsData.map((skill) => skill.id)}
                    onSelectionChange={(selected) => {
                      setSkillsSelection(selected);
                      setValue("skills_required", selected);
                    }}
                    placeholder="Add skills"
                    maxVisibleUnselected={4}
                  />
                  {errors.skills_required && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.skills_required.message}
                    </p>
                  )}
                  {skillsData.length === 0 && !isLoadingDefaults && (
                    <p className="text-gray-500 text-sm mt-1">
                      No skills suggested yet. Enter a job description to
                      generate relevant skills.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 mt-4 fixed bottom-0 left-0 right-0">
          <div className="flex justify-end gap-4 items-center">
            <Button
              variant={"outline"}
              type="button"
              onClick={() => router.back()}
            >
              <ArrowLeft /> Go Back
            </Button>
            <Button
              variant={"animated"}
              type="submit"
              disabled={isSubmitting || isLoadingDefaults}
            >
              {isSubmitting ? "Submitting..." : "Continue"}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Page;
