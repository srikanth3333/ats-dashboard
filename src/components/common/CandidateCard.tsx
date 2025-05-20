import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Share2 } from "lucide-react";
import Timer from "./Timer";

interface CandidateData {
  id: string;
  user_profile?: {
    name: string;
    role: string;
  };
  role: string;
  client?: {
    name: string;
    contract_type: string;
  };
  created_at: string;
  exp_min: number;
  exp_max: number;
  budget_min: number;
  budget_max: number;
  location: string[];
  skills: string[];
  mode_of_job: string;
  employment_type: string;
  job_status: string;
  job_description: string;
}

export default function CandidateInterviewGrid({
  data,
}: {
  data: CandidateData[];
}) {
  return (
    <div>
      {/* Selected candidate card */}
      <div className="space-y-5">
        {data?.map((record) => (
          <CandidateCard key={record?.id} candidate={record} />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: any }) {
  const {
    user_profile,
    exp_min,
    exp_max,
    budget_min,
    budget_max,
    client,
    location,
    mode_of_job,
    job_description,
    position,
    job_status,
  } = candidate;

  const name = user_profile?.name || "N/A";
  const role = candidate.role || position;
  const company = client?.name || "N/A";
  const locations = location.join(", ");
  console.log(candidate?.date_of_posting);
  return (
    <Card className="w-full bg-white shadow-md hover:shadow-xl rounded-2xl transition-all duration-300 border border-gray-200">
      <CardContent className="px-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex">
              <h3 className="font-bold text-xl text-gray-900">{company}</h3>
            </div>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium">Experience</p>
            <p>
              {exp_min} - {exp_max} years
            </p>
          </div>
          <div>
            <p className="font-medium">Budget</p>
            <p>
              ${budget_min}K - ${budget_max}K
            </p>
          </div>
          <div>
            <p className="font-medium">Company</p>
            <p>{company}</p>
          </div>
          <div>
            <p className="font-medium">Location</p>
            <p>{locations}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">{mode_of_job}</Badge>
          <Badge variant="outline">{job_status}</Badge>
          <Badge variant="default">{client?.contract_type}</Badge>
        </div>

        {/* <div className="flex flex-wrap justify-between items-center gap-5">
          <div className="bg-primary cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full">
            <span className="mr-2 text-xl font-bold">12</span>Assigned
          </div>
          <div className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full">
            <span className="mr-2 text-xl font-bold">12</span>Reviewed
          </div>
          <div className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full">
            <span className="mr-2 text-xl font-bold">12</span>Offered
          </div>
          <div className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full">
            <span className="mr-2 text-xl font-bold">12</span>New
          </div>
        </div> */}

        <div className="pt-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500 flex-3">
            <span className="text-gray-600 font-bold">JD:</span>{" "}
            {job_description?.slice(0, 150)}{" "}
            <span className="text-link underline text-blue-900 font-medium">
              Read More
            </span>
          </p>
          <div className="flex-1">
            <Timer
              fromDateTime={candidate?.date_of_posting}
              hours={candidate?.timer}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
