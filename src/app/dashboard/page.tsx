"use client";
import AnalysisBars from "@/components/common/AnalysisBars";
import CountsCard from "@/components/common/CountsCard";
import {
  CandidateDetail,
  ClientDetail,
  JobPostingDetail,
} from "@/components/common/features";
import { SkeletonCard } from "@/components/common/Loader";
import { SheetModal } from "@/components/common/SheetModal";
import { Button } from "@/components/ui/button";
import { useCountCard } from "@/hooks/use-count-card";
import { useState } from "react";
import { useUser } from "../context/UserContext";

function Page() {
  const { user } = useUser();
  const [filters, setFilters] = useState<any>({});
  const checkUser = user?.userProfile?.designation === "company" ? false : true;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    { tableName?: string } | Record<string, any>
  >({});
  const countCards = [
    {
      title: "Clients",
      color: "text-gray-700",
      tableName: "clients",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
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

  const onOpenChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { dashboardData, loading, error } = useCountCard(countCards, filters);

  const renderPage = (name: string): React.ReactNode => {
    switch (name) {
      case "clients":
        return (
          <ClientDetail
            selectedItem={{
              applyCurrentUser: (selectedItem as Record<string, any>)
                ?.applyCurrentUser,
              assignId: (selectedItem as Record<string, any>)?.assignId,
              profileId: (selectedItem as Record<string, any>)?.profileId,
            }}
          />
        );
      case "candidates":
        return <CandidateDetail selectedItem={selectedItem} />;
      case "job_posting":
        return <JobPostingDetail selectedItem={selectedItem} />;
      default:
        return null;
    }
  };

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

  const onclick = (val: any) => {
    setSelectedItem(val);
    onOpenChange();
  };

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
      <CountsCard title="" onClick={onclick} data={dashboardData} />
      <div>
        <AnalysisBars title="Analysis" />
      </div>

      <div>
        <SheetModal
          onOpenChange={onOpenChange}
          isSheetOpen={isModalOpen}
          title="Details"
          className="w-full lg:max-w-3xl"
        >
          <div className="px-6 bg-gray-100 h-full overflow-y-scroll pb-10">
            {renderPage(selectedItem?.tableName)}
          </div>
        </SheetModal>
      </div>
    </div>
  );
}

export default Page;
