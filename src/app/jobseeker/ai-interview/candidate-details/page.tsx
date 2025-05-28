"use client";

import { getListDataById, updateRecord } from "@/app/actions/action";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Assuming you have a Calendar component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { format } from "date-fns"; // Use date-fns for formatting
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default async function Page() {
  return (
    <Suspense>
      <JobApplicationPage />
    </Suspense>
  );
}

const JobApplicationPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("interviewId");
  const jobId = searchParams.get("id");
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [jobData, setJobData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    experienceYears: "",
    experienceMonths: "",
    currency: "USD",
    currentSalary: "",
    expectedSalary: "",
    joiningDate: "", // Store as string in YYYY-MM-DD format
  });

  const fetchData = async () => {
    if (!id) {
      setError("No job ID provided");
      return;
    }

    try {
      setIsLoading(true);
      const result = await getListDataById("interviews", "*", id);
      if (result?.success && result.data) {
        setJobData(result.data);
      } else {
        setError("No data found");
      }
    } catch (err) {
      setError("Failed to fetch interview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Simulate upload progress
  useEffect(() => {
    if (isUploading && uploadProgress < 100) {
      const timer = setTimeout(() => {
        const increment = Math.random() * 15;
        const newProgress = Math.min(uploadProgress + increment, 100);
        setUploadProgress(newProgress);

        if (newProgress >= 100) {
          setIsUploading(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [uploadProgress, isUploading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle date selection from calendar
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd"); // Format for Supabase
      handleInputChange("joiningDate", formattedDate);
    } else {
      handleInputChange("joiningDate", "");
    }
  };

  const handleSubmit = async () => {
    if (!jobId) {
      return;
    }
    const payload = {
      exp_years: formData.experienceYears,
      exp_months: formData.experienceMonths,
      currency: formData.currency,
      current_salary: formData.currentSalary,
      exp_salary: formData.expectedSalary,
      joining_date: formData.joiningDate || null,
    };

    const result = await updateRecord("candidate_interview", jobId, payload);
    if (result?.success) {
      alert("Thanks you for updating details we will get back to you soon");
      router.push("/");
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex max-w-7xl mx-auto flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Job Details */}
        {/* <div className="flex-1 bg-white border-r border-gray-200 p-8 lg:p-10">
          <div className="max-w-lg">
            <h1 className="text-2xl font-semibold text-gray-600 mb-8">
              JOB DETAILS
            </h1>

            <Card className="mb-8 bg-gray-50 border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Frontend Developer
                </h2>
                <p className="text-gray-600 text-lg">Mid Level (3-6 Years)</p>
              </CardContent>
            </Card>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">
                    Employment & Workplace Type
                  </h3>
                  <p className="text-gray-900 font-medium">Full-Time On-Site</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Location</h3>
                  <p className="text-gray-900 font-medium">Hyderabad, India</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We are seeking a talented and detail-oriented Frontend Developer
                to join our dynamic team. The role involves building and
                maintaining user interfaces that are visually appealing, highly
                responsive,...
                <button className="text-blue-600 font-medium ml-1 hover:underline">
                  Read More
                </button>
              </p>
            </div>
          </div>
        </div> */}

        {/* Right Panel - Form */}
        <div className="flex-1 bg-white p-8 lg:p-10 relative">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              A few last questions
            </h2>

            {/* Total Work Experience */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-3 block">
                Total Work Experience
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={formData.experienceYears}
                    onValueChange={(value) =>
                      handleInputChange("experienceYears", value)
                    }
                  >
                    <SelectTrigger className="h-12 text-base w-full">
                      <SelectValue placeholder="Years" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={formData.experienceMonths}
                    onValueChange={(value) =>
                      handleInputChange("experienceMonths", value)
                    }
                  >
                    <SelectTrigger className="h-12 text-base w-full">
                      <SelectValue placeholder="Months" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4">
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger className="h-12 text-base w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">$ (USD)</SelectItem>
                    <SelectItem value="INR">₹ (INR)</SelectItem>
                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                    <SelectItem value="GBP">£ (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Current Annual Salary
                </Label>
                <Input
                  className="text-base"
                  value={formData.currentSalary}
                  onChange={(e) =>
                    handleInputChange("currentSalary", e.target.value)
                  }
                  placeholder=""
                />
              </div>
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Expected Annual Salary
                </Label>
                <Input
                  className="text-base"
                  value={formData.expectedSalary}
                  onChange={(e) =>
                    handleInputChange("expectedSalary", e.target.value)
                  }
                  placeholder=""
                />
              </div>
            </div>

            {/* Expected Joining Date */}
            <div className="max-w-sm">
              <Label className="text-base font-medium text-gray-900 mb-3 block">
                Expected Joining Date
              </Label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !formData.joiningDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.joiningDate ? (
                        format(new Date(formData.joiningDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.joiningDate
                          ? new Date(formData.joiningDate)
                          : undefined
                      }
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-8 right-8 flex items-center space-x-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold"
              // disabled={isUploading}
              onClick={handleSubmit}
            >
              Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
