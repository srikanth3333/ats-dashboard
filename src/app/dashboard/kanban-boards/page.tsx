"use client";

import { fetchTableDataWithForeignKey } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import { ApplicationBoard } from "@/components/common/application-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { GridIcon, ListIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Candidate {
  id: number;
  created_at: string;
  name: string;
  email: string;
  email_verified: boolean | null;
  phone_verified: boolean | null;
  exp_min: number;
  exp_max: number;
  ctc: number;
  current_company: string;
  current_location: string;
  preferred_location: string;
  notice_period: number;
  remarks: string;
  resume_url: string;
  user_id: string;
  job_status: string;
}

interface Applications {
  new: Candidate[];
  reviewed: Candidate[];
  interviewScheduled: Candidate[];
  rejected: Candidate[];
  offered: Candidate[];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Applications>({
    new: [],
    reviewed: [],
    interviewScheduled: [],
    rejected: [],
    offered: [],
  });
  const [view, setView] = useState<"board" | "list">("board");
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();
  const checkUser = user?.userProfile?.designation === "company" ? false : true;

  const getData = async () => {
    try {
      const { data } = await fetchTableDataWithForeignKey<Candidate>({
        tableName: "candidates",
        page: 1,
        pageSize: 100,
        filters: {},
        searchTerm: "",
        searchColumns: [],
        applyUserIdFilter: true,
        profileId: user?.user?.id,
        assignId: user?.company?.id,
        applyCurrentUser: checkUser,
      });
      return data || [];
    } catch (error) {
      console.error("Error fetching initial data:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const candidates = await getData();
      setData(candidates);
      // Group candidates by job_status
      const groupedApplications = candidates.reduce(
        (acc: Applications, candidate: Candidate) => {
          const status = (candidate.job_status || "new") as keyof Applications;
          if (!acc[status as keyof Applications])
            acc[status as keyof Applications] = [];
          acc[status as keyof Applications].push(candidate);
          return acc;
        },
        {
          new: [],
          reviewed: [],
          interviewScheduled: [],
          rejected: [],
          offered: [],
        }
      );
      setApplications(groupedApplications);
      setLoading(false);
    };
    fetchData();
  }, []);

  const applyFilters = async (
    filters: Record<string, any> = {},
    searchTerm: string = ""
  ) => {
    try {
      const filteredData = await fetchTableDataWithForeignKey<Candidate>({
        tableName: "candidates",
        page: 1,
        pageSize: 100,
        filters,
        searchTerm,
        searchColumns: searchTerm
          ? [
              "name",
              "email",
              "current_company",
              "current_location",
              "preferred_location",
              "job_status",
            ]
          : [],
        applyUserIdFilter: true,
        profileId: user?.user?.id,
        assignId: user?.company?.id,
        applyCurrentUser: checkUser,
      });
      setData(filteredData?.data || []);
      const groupedApplications = filteredData.data.reduce(
        (acc: Applications, candidate: Candidate) => {
          const status = candidate.job_status || "new";
          if (!acc[status as keyof Applications])
            acc[status as keyof Applications] = [];
          acc[status as keyof Applications].push(candidate);
          return acc;
        },
        {
          new: [],
          reviewed: [],
          interviewScheduled: [],
          rejected: [],
          offered: [],
        }
      );
      setApplications(groupedApplications);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleStatusChange = async (
    candidateId: number,
    newStatus: string,
    oldStatus: string
  ) => {
    const candidate = applications[oldStatus as keyof Applications]?.find(
      (c) => c.id === candidateId
    );
    if (!candidate) return;

    const supabase = await createClient();
    const { error } = await supabase
      .from("candidates")
      .update({ job_status: newStatus })
      .eq("id", candidateId);

    if (error) {
      toast.error("Failed to update candidate status");
      console.error("Error updating status:", error);
      return;
    }

    // Update local state
    const updatedOldStatusArray = applications[
      oldStatus as keyof Applications
    ].filter((c) => c.id !== candidateId);
    const updatedNewStatusArray = [
      ...(applications[newStatus as keyof Applications] || []),
      { ...candidate, job_status: newStatus },
    ];

    setApplications({
      ...applications,
      [oldStatus]: updatedOldStatusArray,
      [newStatus]: updatedNewStatusArray,
    });

    toast.success(
      `Moved ${candidate.name} to ${newStatus
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()}`
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    applyFilters({}, searchTerm);
  };

  console.log(applications);

  return (
    <div>
      <div className="space-y-6 bg-white p-6 shadow-lg rounded">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Board</h1>
          <div className="flex gap-2">
            <Button
              variant={view === "board" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("board")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 ">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-8"
              onChange={handleSearch}
            />
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <ApplicationBoard
            applications={applications}
            onStatusChange={handleStatusChange}
            view={view}
          />
        )}
      </div>
    </div>
  );
}
