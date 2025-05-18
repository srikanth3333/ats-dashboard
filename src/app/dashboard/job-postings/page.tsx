"use client";
import { createRecord } from "@/app/actions/action";
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
import cities from "@/lib/mock/cities.json";
import jobs from "@/lib/mock/jobs.json";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function Page() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useUser();
  const foreignKeys = {
    user_profile: ["id", "company_id"],
    "client!inner(*)": ["id", "name", "contract_type"],
  };

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

  const onOpenChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  const searchColumns = ["role", "position"];
  const listFilters = [
    {
      column: "company_id",
      operator: "eq",
      value: user?.company?.id,
    },
  ];

  const { data: assignData } = useList(
    "clients",
    "id, name",
    "name",
    "id",
    listFilters
  );
  const { data: assignUser } = useList(
    "user_profile",
    "id, email_id",
    "email_id",
    "id",
    listFilters
  );

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
    "job_posting",
    foreignKeys,
    filters,
    searchTerm,
    searchColumns,
    true,
    user?.user?.id,
    user?.userProfile?.id
  );

  const handleRowClick = () => {};

  const columns = [
    { label: "Role", name: "role", type: "status" },
    { label: "Client", name: "client", type: "foreignkey" },
    { label: "Location", name: "location", type: "array" },
    { label: "Skills", name: "skills", type: "array" },
    { label: "Mode Of Job", name: "mode_of_job" },
    { label: "Job Status", name: "job_status" },
    { label: "Budget Min", name: "budget_min" },
    { label: "Budget Max", name: "budget_max" },
  ];

  const filterFields = [
    {
      name: "role",
      label: "Search Jobs",
      inputType: "text" as const,
      placeholder: "Search by role (e.g., Developer)",
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-8",
    },
    {
      name: "location",
      label: "Location",
      inputType: "select" as const,
      defaultValue: "all",
      options: [
        { value: "all", label: "All Locations" },
        { value: "Vijayawada", label: "Vijayawada" },
        { value: "loc 1", label: "loc 1" },
        { value: "Hyderabad", label: "Hyderabad" },
        { value: "Bangalore", label: "Bangalore" },
      ],
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-4",
    },
  ];

  const contractTypes = [
    { value: "contract", label: "Contract" },
    { value: "full_time", label: "Full Time" },
    { value: "sub_vendor", label: "Sub Vendor" },
  ];

  const formInputs = [
    {
      type: "combobox" as "combobox",
      name: "client",
      label: "Client",
      options: assignData,
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
    },
    {
      type: "text" as "text",
      name: "role",
      label: "Job Role",
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Job Role is required",
    },
    {
      type: "multiselect" as "multiselect",
      name: "skills",
      label: "Skills",
      required: true,
      options: jobs,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Skills is required",
    },
    {
      type: "multiselect" as "multiselect",
      name: "location",
      label: "Location",
      required: true,
      options: cities,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "location is required",
    },

    {
      type: "number" as "number",
      name: "exp_min",
      label: "Experience min",
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Experience min is required",
    },
    {
      type: "number" as "number",
      name: "exp_max",
      label: "Experience Max",
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Experience Max is required",
    },
    {
      type: "number" as "number",
      name: "budget_min",
      label: "Budget Min",
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Budget Min is required",
    },
    {
      type: "number" as "number",
      name: "budget_max",
      label: "Budget Max",
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "Budget Max is required",
    },
    {
      type: "combobox" as "combobox",
      name: "employment_type",
      label: "Employment Type",
      options: contractTypes,
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
    },
    {
      type: "combobox" as "combobox",
      name: "mode_of_job",
      label: "Mode Of Job",
      options: [
        { label: "Remote", value: "remote" },
        { label: "Work From Office", value: "wfo" },
        { label: "On Site", value: "onSite" },
      ],
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
    },
    {
      type: "combobox" as "combobox",
      name: "job_status",
      label: "Job Status",
      options: [
        { label: "active", value: "active" },
        { label: "In active", value: "inActive" },
      ],
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
      errorMsg: "job status is required",
    },
    {
      type: "combobox" as "combobox",
      name: "assign",
      label: "Assign To",
      options: assignUser,
      required: true,
      colSpan: "col-span-12 lg:col-span-6",
    },
    {
      type: "textarea" as "textarea",
      name: "job_description",
      label: "Job Description",
      required: true,
      colSpan: "col-span-12 lg:col-span-12",
      errorMsg: "Job Description is required",
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
      newFilters[`client.name`] = {
        operator: "ilike",
        value: values["client"],
      };
    }
    setFilters(newFilters);
  };

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecord("job_posting", {
        ...values,
        status: "new",
        company_id: user?.userProfile?.company_id,
        timer: new Date(),
      });

      if (result?.success) {
        loadData(1);
        setCurrentPage(1);
        onOpenChange();
        toast("Job Posting submitted successfully!");
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
          title="Job Postings"
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
      <CountsCard data={dashboardData} title="Report Tracker" />
      <div className="bg-white p-4 rounded-lg space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <RestrictButton
            variant="animated"
            onClick={onOpenChange}
            icon={<Plus />}
            btnTxt="Create Job Posting"
            page="job_posting"
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
                formPostUrl="/dashboard/job-postings"
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
