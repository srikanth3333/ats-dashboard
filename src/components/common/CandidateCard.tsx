import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bell,
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";

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
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <div>
      {/* Selected candidate card */}
      <div className="space-y-5">
        {data?.map((record) => (
          <CandidateCard
            key={record?.id}
            candidate={record}
            setOpenSheet={setOpenSheet}
          />
        ))}
      </div>

      {/* Detailed info sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="lg:w-[700px] lg:w-[500px] max-h-screen overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle className="text-2xl">Job Posting Details</SheetTitle>
          </SheetHeader>

          {data?.map((job, index) => (
            <div key={index} className="mt-6 space-y-4 border-b pb-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Posted By</p>
                  <p className="text-sm text-gray-500">
                    {job.user_profile?.name} ({job.user_profile?.role})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <p className="text-sm text-gray-500">{job.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Client</p>
                  <p className="text-sm text-gray-500">
                    {job.client?.name} ({job.client?.contract_type})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Posted On</p>
                  <p className="text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-500">
                  {job.exp_min}-{job.exp_max} years
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Budget</p>
                <p className="text-sm text-gray-500">
                  ₹{job.budget_min}k - ₹{job.budget_max}k
                </p>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Locations</p>
                  <p className="text-sm text-gray-500">
                    {job.location.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Skills</p>
                <p className="text-sm text-gray-500">{job.skills.join(", ")}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Mode</p>
                <p className="text-sm text-gray-500 capitalize">
                  {job.mode_of_job}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">
                  Employment Type
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {job.employment_type}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Job Status</p>
                <Badge variant="outline" className="capitalize">
                  {job.job_status}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-500">{job.job_description}</p>
              </div>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CandidateCard({
  candidate,
  setOpenSheet,
}: {
  candidate: any;
  setOpenSheet: (open: boolean) => void;
}) {
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

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-xl rounded-2xl transition-all duration-300 border border-gray-200">
      <CardContent className="px-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{company}</h3>
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

        <div className="flex flex-wrap justify-between items-center gap-5">
          <div
            onClick={() => setOpenSheet(true)}
            className="bg-primary cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full"
          >
            <span className="mr-2 text-xl font-bold">12</span>Assigned
          </div>
          <div
            onClick={() => setOpenSheet(true)}
            className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full"
          >
            <span className="mr-2 text-xl font-bold">12</span>Reviewed
          </div>
          <div
            onClick={() => setOpenSheet(true)}
            className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full"
          >
            <span className="mr-2 text-xl font-bold">12</span>Offered
          </div>
          <div
            onClick={() => setOpenSheet(true)}
            className="bg-gray-400 cursor-pointer hover:shadow-none flex items-center justify-center py-2 text-white shadow-xl font-semibold text-base px-2 flex-1 rounded-full"
          >
            <span className="mr-2 text-xl font-bold">12</span>New
          </div>
        </div>

        <div className="pt-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            <span className="text-gray-600 font-bold">JD:</span>{" "}
            {job_description?.slice(0, 300)}{" "}
            <span className="text-link underline text-blue-900 font-medium">
              Read More
            </span>
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-1"
            onClick={() => setOpenSheet(true)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
