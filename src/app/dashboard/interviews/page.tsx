"use client";
import { createRecord } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Page() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const checkUser = user?.userProfile?.designation === "company" ? false : true;
  const foreignKeys = {};
  const [updatedData, setUpdatedData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    "interviews",
    foreignKeys,
    filters,
    searchTerm,
    searchColumns,
    true,
    user?.user?.id,
    user?.company?.id,
    checkUser
  );

  const handleRowClick = () => {};

  async function appendInterviewCounts(jobs: any) {
    const supabase = await createClient();
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job: any) => {
        const { count, error } = await supabase
          .from("candidate_interview")
          .select("*", { count: "exact", head: true })
          .eq("job_id", job.id); // Adjust this if the key is "interview_id" instead

        if (error) {
          console.error(`Error for job ${job.id}:`, error.message);
          return { ...job, interview_count: { count: 0, link: job.id } }; // fallback
        }

        return { ...job, interview_count: { count: count || 0, link: job.id } };
      })
    );

    return jobsWithCounts;
  }

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true);
      const count = await appendInterviewCounts(data);
      setUpdatedData(count);
      setIsLoading(false);
    };

    fetchCount();
  }, [data?.length]);

  const columns = [
    { label: "Job Role", name: "job_name", type: "status" },
    { label: "Context", name: "job_skills", type: "array" },
    { label: "Expiry", name: "interview_expiry" },
    { label: "Responses", name: "interview_count", type: "link" },
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

  const handleNavigate = async () => {
    const result: any = await createRecord("interviews", {});
    if (result?.success && result.data) {
      router.push(`/dashboard/interviews/new-assement?id=${result.data.id}`);
    }
    // router.push("/dashboard/interviews/new-assement");
  };

  if (loading || isLoading) {
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
          <h1 className="text-2xl font-bold">Interviews</h1>
          <Button onClick={handleNavigate} variant={"animated"}>
            Create New Interview
          </Button>
        </div>
        <DynamicFilterForm
          fields={filterFields}
          onFilterChange={handleFilterChange}
          liveUpdate={true}
          submitButton={false}
        />
        <div>
          <DataTable
            jsonData={updatedData}
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
