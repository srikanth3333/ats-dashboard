"use client";
import { useUser } from "@/app/context/UserContext";
import CandidateInterviewGrid from "@/components/common/CandidateCard";
import CountsCard from "@/components/common/CountsCard";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import EmptyView from "@/components/common/EmptyView";
import { JobPostingDetail } from "@/components/common/features";
import { SkeletonCard } from "@/components/common/Loader";
import { SheetModal } from "@/components/common/SheetModal";
import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { useCountCard } from "@/hooks/use-count-card";
import { useList } from "@/hooks/use-list";
import { useState } from "react";

function Page() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    { tableName?: string } | Record<string, any>
  >({});
  const { user } = useUser();
  const countCards = [
    {
      title: "Total",
      color: "text-gray-700",
      tableName: "job_posting",
      profileId: user?.user?.id,
      assignId: user?.userProfile?.id,
      applyUserIdFilter: true,
      filters: {},
    },
    {
      title: "Active Jobs",
      tableName: "job_posting",
      color: "text-green-700",
      profileId: user?.user?.id,
      assignId: user?.userProfile?.id,
      applyUserIdFilter: true,
      filters: { job_status: "active" },
    },
    {
      title: "In Active",
      tableName: "job_posting",
      color: "text-red-500",
      profileId: user?.user?.id,
      assignId: user?.userProfile?.id,
      applyUserIdFilter: true,
      filters: { job_status: "inActive" },
    },
  ];

  const {
    dashboardData,
    loading: countsLoading,
    error: countsError,
  } = useCountCard(countCards, filters);

  const foreignKeys = {
    user_profile: ["id"],
    "client!inner(*)": ["id", "name", "contract_type"],
  };

  const listFilters = [
    {
      column: "company_id",
      operator: "eq",
      value: user?.company?.id,
    },
  ];

  const searchColumns = ["role"];
  const { data: assignData } = useList(
    "clients",
    "id, name",
    "name",
    "id",
    listFilters
  );

  const { data, loading, error, totalCount, currentPage, setCurrentPage } =
    useCardList(
      "job_posting",
      foreignKeys,
      filters,
      searchTerm,
      searchColumns,
      true,
      user?.user?.id,
      user?.userProfile?.id
    );

  const filterFields = [
    {
      name: "role",
      label: "Search Jobs",
      inputType: "text" as const,
      placeholder: "Search by role (e.g., Developer)",
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
    {
      name: "location",
      label: "Location",
      inputType: "combobox" as const,
      defaultValue: "all",
      options: [
        { value: "all", label: "All Locations" },
        { value: "Vijayawada", label: "Vijayawada" },
        { value: "loc 1", label: "loc 1" },
        { value: "Hyderabad", label: "Hyderabad" },
        { value: "Bangalore", label: "Bangalore" },
      ],
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
    {
      name: "client",
      label: "Client Name",
      inputType: "combobox" as const,
      defaultValue: "all",
      options: [{ value: "all", label: "All Clients" }, ...assignData],
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    const newFilters: Record<string, any> = {};
    setSearchTerm(values.role || "");
    if (values.location && values["location"] !== "all") {
      newFilters.location = {
        operator: "contains",
        value: JSON.stringify([values.location]),
      };
    }
    if (values["client"] && values["client"] !== "all") {
      newFilters[`client.id`] = {
        operator: "eq",
        value: Number(values["client"]),
      };
    }
    setFilters(newFilters);
  };

  const onOpenChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onclick = (val: any) => {
    setSelectedItem(val);
    onOpenChange();
  };

  if (loading || countsLoading) {
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

  if (error || countsError) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-lg">
        <p>Error Fetching item: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  return (
    <div>
      <CountsCard
        data={dashboardData}
        onClick={onclick}
        title="Report Tracker"
      />
      <div className="bg-white p-4 rounded-lg space-y-6">
        <h1 className="text-2xl font-bold mb-6">Job Postings</h1>
        <DynamicFilterForm
          fields={filterFields}
          onFilterChange={handleFilterChange}
          liveUpdate={true}
          submitButton={false}
        />
        <div className="mb-4">
          <p className="text-gray-600">Found {totalCount} job postings</p>
        </div>
        {data?.length > 0 ? (
          <CandidateInterviewGrid data={data} />
        ) : (
          <EmptyView />
        )}
        {totalCount > 10 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage * 10 >= totalCount}
              className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        <div>
          <SheetModal
            onOpenChange={onOpenChange}
            isSheetOpen={isModalOpen}
            title="Details"
            className="w-full lg:max-w-3xl"
          >
            <div className="px-6 bg-gray-100 h-full overflow-y-scroll pb-10">
              <JobPostingDetail selectedItem={selectedItem} />
            </div>
          </SheetModal>
        </div>
      </div>
    </div>
  );
}

export default Page;
