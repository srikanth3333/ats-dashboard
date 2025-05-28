"use client";
import { updateRecord } from "@/app/actions/action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Book,
  Check,
  CheckCheck,
  Languages,
  User2Icon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function Page() {
  const [jobDescription, setJobDescription] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const handleNavigate = async () => {
    if (!jobDescription || jobDescription?.length < 50) {
      alert("Please enter a valid job description.");
      return;
    }
    if (!id || typeof id !== "string") {
      alert("Invalid interview ID.");
      return;
    }
    const result: any = await updateRecord("interviews", id, {
      job_description: jobDescription,
    });
    if (result?.success && result.data) {
      router.push(`/dashboard/interviews/job-details?id=${id}`);
    }
  };

  return (
    <div>
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
        <div className="bg-white flex-2 shadow-md rounded-xl p-6">
          <span className="font-semibold">Enter Prompt or Job Description</span>
          <Textarea
            className="mt-4 h-50"
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Type or paste your job description here to proceed."
          />
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
}

export default Page;
