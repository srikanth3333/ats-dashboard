"use client";
import { createRecord, uploadResume } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import CountsCard from "@/components/common/CountsCard";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import RestrictButton from "@/components/common/RestrictButton";
import { SheetModal } from "@/components/common/SheetModal";
import SubmitForm from "@/components/common/submit-form";
import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { useCountCard } from "@/hooks/use-count-card";
import { useList } from "@/hooks/use-list";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function Page() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useUser();
  const checkUser = user?.userProfile?.designation === "company" ? false : true;
  const foreignKeys = {
    "user_profile!inner(*)": ["id", "designation"],
  };
  const listFilters = [
    {
      column: "company_id",
      operator: "eq",
      value: user?.company?.id,
    },
  ];

  const listFiltersUser = [
    {
      column: "assign",
      operator: "eq",
      value: user?.userProfile?.id,
    },
  ];

  const countCards = [
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

  const {
    dashboardData,
    loading: countsLoading,
    error: countsError,
    fetchCounts,
  } = useCountCard(countCards, filters);
  const { data: assignJobPost } = useList(
    "job_posting",
    "id, role, assign!inner(*)",
    "role",
    "id",
    !checkUser ? listFilters : listFiltersUser
  );
  const onOpenChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  const uploadFile = async (document: File) => {
    const result = await uploadResume(document);
    return result;
  };

  const searchColumns = ["name"];
  const {
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    loadData,
  } = useCardList(
    "candidates",
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

  const columns = [
    { label: "Name", name: "name", type: "status" },
    { label: "Email", name: "email" },
    { label: "Experience", name: "exp_max" },
    { label: "CTC", name: "ctc" },
    { label: "Current Company", name: "current_company" },
    { label: "Resume", name: "resume_url", type: "link" },
    { label: "Job Status", name: "job_status", type: "hiring-stage" },
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

  const formInputs = [
    {
      type: "upload" as "upload",
      name: "resume_url",
      label: "Resume",
      required: true,
      colSpan: "col-span-12",
      errorMsg: "Resume is required",
    },
    {
      type: "text" as "text",
      name: "name",
      label: "Name",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Name is required",
    },
    {
      type: "text" as "text",
      name: "email",
      label: "Email",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Email is required",
    },
    {
      type: "number" as "number",
      name: "exp_min",
      label: "Experience min",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Experience min is required",
    },
    {
      type: "number" as "number",
      name: "exp_max",
      label: "Experience Max",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Experience Max is required",
    },
    {
      type: "number" as "number",
      name: "ctc",
      label: "CTC",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "CTC is required",
    },
    {
      type: "text" as "text",
      name: "current_company",
      label: "Current Company",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Current Company is required",
    },
    {
      type: "text" as "text",
      name: "current_location",
      label: "Current Location",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Current Location is required",
    },
    {
      type: "text" as "text",
      name: "preferred_location",
      label: "Preferred Location",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Preferred Location is required",
    },
    {
      type: "number" as "number",
      name: "notice_period",
      label: "Notice Period",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Notice Period is required",
    },
    {
      type: "text" as "text",
      name: "remarks",
      label: "Remarks",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Remarks is required",
    },
    {
      type: "combobox" as "combobox",
      name: "job_posting",
      label: "Assign Job",
      options: assignJobPost,
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Assign Job is required",
    },
  ];

  const countData = [
    {
      title: "Total Applications",
      value: 5672,
      percentChange: 74,
      trend: "+14% Inc",
      color: "purple",
    },
    {
      title: "Total Applications",
      value: 5672,
      percentChange: 74,
      trend: "+14% Inc",
      color: "purple",
    },
    {
      title: "Total Applications",
      value: 5672,
      percentChange: 74,
      trend: "+14% Inc",
      color: "purple",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    const newFilters: Record<string, any> = {};
    setSearchTerm(values.name || "");
    setFilters(newFilters);
  };

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      let uploadResult;
      if (values?.resume_url) {
        uploadResult = await uploadFile(values.resume_url);
        if (uploadResult.error) {
          toast("Error Uploading File");
          return { success: false, error: "Error uploading file" };
        }
      }
      const result = await createRecord("candidates", {
        ...values,
        resume_url: uploadResult?.data?.url,
        job_status: "new",
        company_id: user?.userProfile?.company_id,
        user_profile: user?.userProfile?.id,
      });
      if (result?.success) {
        loadData(1);
        fetchCounts();
        setCurrentPage(1);
        onOpenChange();
        toast("Candidate submitted successfully!");
      }
      return {
        success: result.success,
        error: result.error ? result.error.message : undefined,
      };
    } catch (error) {
      toast("Failed to submit form");
      return { success: false, error: "Submission failed" };
    }
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
      <CountsCard data={dashboardData} title="" />
      <div className="bg-white p-4 rounded-lg space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <RestrictButton
            variant="animated"
            onClick={onOpenChange}
            icon={<Plus />}
            btnTxt="Add Candidate"
            page="candidate"
            type="create"
          />
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
        <div>
          <SheetModal
            onOpenChange={onOpenChange}
            isSheetOpen={isModalOpen}
            title="Create Job Posting"
            className="w-full lg:max-w-3xl"
          >
            <div className="px-6 h-full overflow-y-scroll pb-10">
              <SubmitForm
                formPostUrl="/dashboard/candidates"
                inputs={formInputs}
                btnTxt="Save Job"
                onSubmit={handleSubmit}
              />
            </div>
          </SheetModal>
        </div>
      </div>
    </div>
  );
}

export default Page;
