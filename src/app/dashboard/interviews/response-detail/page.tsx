"use client";
import { useUser } from "@/app/context/UserContext";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [filters, setFilters] = useState<Record<string, any>>({ job_id: id });
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const checkUser = user?.userProfile?.designation === "company" ? false : true;
  const foreignKeys = {};
  const searchColumns = ["job_name"];

  const {
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
  } = useCardList(
    "candidate_interview",
    foreignKeys,
    filters,
    searchTerm,
    searchColumns,
    true,
    user?.user?.id,
    user?.company?.id,
    checkUser
  );

  const handleRowClick = (row: any) => {
    router.push(`/dashboard/interviews/response-report?id=${row?.id}`);
  };

  const columns = [
    { label: "Score %", name: "score" },
    { label: "Interview Status", name: "status" },
    { label: "Fit level", name: "fit_level" },
    { label: "Hiring Stage", name: "hiring_stage" },
  ];

  const filterFields = [
    {
      name: "name",
      label: "Search candidates",
      inputType: "text" as const,
      placeholder: "Search by name",
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    const newFilters: Record<string, any> = {};
    setSearchTerm(values.name || "");
    setFilters(newFilters);
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

  return (
    <div>
      <div className="bg-white p-4 rounded-lg space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Interviews Detail</h1>
        </div>
        <DynamicFilterForm
          fields={filterFields}
          onFilterChange={handleFilterChange}
          liveUpdate={true}
          submitButton={false}
        />
        <div>
          <DataTable
            jsonData={data}
            arrayData={columns}
            paginate={true}
            pageSizeSelected={pageSize}
            onchangePageSize={(value) => setPageSize(value)}
            totalItems={totalCount}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
