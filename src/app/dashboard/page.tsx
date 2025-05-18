"use client";
import AnalysisBars from "@/components/common/AnalysisBars";
import CountsCard from "@/components/common/CountsCard";
import { SkeletonCard } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useCountCard } from "@/hooks/use-count-card";
import { useState } from "react";
import { useUser } from "../context/UserContext";

function Page() {
  const { user } = useUser();
  const [filters, setFilters] = useState<any>({});
  const checkUser = user?.userProfile?.designation === "company" ? false : true;
  console.log(checkUser);
  const countCards = [
    {
      title: "Clients",
      color: "text-gray-700",
      tableName: "clients",
      profileId: user?.user?.id,
      assignId: user?.userProfile?.id,
      applyUserIdFilter: true,
      filters: filters,
    },
    {
      title: "Candidates",
      tableName: "candidates",
      color: "text-gray-700",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
      applyUserIdFilter: true,
      applyCurrentUser: checkUser,
      filters: filters,
    },
    {
      title: "Job Postings",
      tableName: "job_posting",
      color: "text-gray-700",
      profileId: user?.user?.id,
      assignId: user?.userProfile?.id,
      applyUserIdFilter: true,
      filters: filters,
    },
    {
      title: "Offered",
      tableName: "candidates",
      color: "text-green-700",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
      applyUserIdFilter: true,
      applyCurrentUser: checkUser,
      filters: { job_status: "offered" },
    },
    {
      title: "Rejected",
      tableName: "candidates",
      color: "text-red-400",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
      applyUserIdFilter: true,
      applyCurrentUser: checkUser,
      filters: { job_status: "rejected" },
    },
    {
      title: "Scheduled",
      tableName: "candidates",
      color: "text-purple-500",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
      applyUserIdFilter: true,
      applyCurrentUser: checkUser,
      filters: { job_status: "interviewScheduled" },
    },
  ];

  const filterFields = [
    {
      name: "created_at",
      label: "Start Date",
      inputType: "date" as const,
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-3",
    },
    {
      name: "end_date",
      label: "End Date",
      inputType: "date" as const,
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-3",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    setFilters({
      created_at: values.created_at,
      end_date: values.end_date,
    });
  };

  const { dashboardData, loading, error } = useCountCard(countCards, filters);

  if (loading) {
    return (
      <div>
        <SkeletonCard
          grids={3}
          width="grid grid-cols-3 gap-4"
          title="Reports Tracker"
        />
        <div className="bg-white rounded-lg p-5 mt-9">
          <SkeletonCard grids={3} width="w-full space-y-4 mt-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-lg">
        <p>Error Fetching item: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* <DynamicFilterForm
          fields={filterFields}
          onFilterChange={handleFilterChange}
          liveUpdate={true}
          submitButton={false}
        /> */}
      </div>
      <CountsCard title="" data={dashboardData} />
      <div>
        <AnalysisBars title="Analysis" />
      </div>
    </div>
  );
}

export default Page;
