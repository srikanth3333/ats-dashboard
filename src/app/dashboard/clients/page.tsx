"use client";
import { createRecord } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import CountsCard from "@/components/common/CountsCard";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import { Modal } from "@/components/common/modal";
import RestrictButton from "@/components/common/RestrictButton";
import SubmitForm from "@/components/common/submit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCardList } from "@/hooks/use-card-list";
import { useCountCard } from "@/hooks/use-count-card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const countCards = [
    {
      title: "Total",
      color: "text-gray-700",
      tableName: "clients",
      profileId: user?.user?.id,
      assignId: user?.company?.id,
      applyUserIdFilter: true,
      filters: {},
    },
  ];

  const {
    dashboardData,
    loading: countsLoading,
    error: countsError,
  } = useCountCard(countCards, {});

  const {
    pageSize,
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    setPageSize,
    loadData,
  } = useCardList(
    "clients",
    {},
    {},
    searchTerm,
    ["name", "contract_type"],
    true,
    user?.user?.id,
    user?.company?.id
  );

  const columns = [
    { label: "Client Name", name: "name", type: "status" },
    { label: "Contract Type", name: "contract_type", type: "badge" },
    { label: "Start Date", name: "start_date", type: "date" },
  ];

  const contractTypes = [
    { value: "contract", label: "Contract" },
    { value: "full_time", label: "Full Time" },
    { value: "sub_vendor", label: "Sub Vendor" },
  ];

  const formInputs = [
    {
      type: "text" as const,
      name: "name",
      label: "Client Name",
      required: true,
      colSpan: "col-span-12",
      placeholder: "client name",
      errorMsg: "Client name is required",
    },
    {
      type: "combobox" as const,
      name: "contract_type",
      label: "Contract Type",
      options: contractTypes,
      required: true,
      colSpan: "col-span-12",
      errorMsg: "Contract Type is required",
    },
    {
      type: "date" as const,
      name: "start_date",
      label: "Start Date",
      required: true,
      colSpan: "col-span-12",
      errorMsg: "Start Date name is required",
    },
  ];

  const handleRowClick = () => {};

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecord("clients", {
        ...values,
        company_id: user?.userProfile?.company_id,
      });
      if (result?.success) {
        loadData(1);
        setCurrentPage(1);
        toast("Client submitted successfully!");
        onOpenChange();
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

  const onOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const filterFields = [
    {
      name: "name",
      label: "Client Name",
      inputType: "text" as const,
      placeholder: "Search by client name,contract type",
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    setSearchTerm(values.name || "");
  };

  if (loading || countsLoading) {
    return (
      <div>
        <SkeletonCard grids={1} width="w-full h-[400px] space-y-4 mt-4" />
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
      {/* <RecruitingDashboard title="Clients Report" /> */}
      <CountsCard data={dashboardData} title="" />
      <Card className="w-full bg-white shadow-md hover:shadow-xl rounded-xl transition-all duration-300 border border-gray-200">
        <CardContent className="px-6 space-y-4 ">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Clients</h1>
            <RestrictButton
              variant="animated"
              onClick={onOpenChange}
              icon={<Plus />}
              btnTxt="Create New Client"
              page="client"
              type="create"
            />
          </div>
          <div>
            <DynamicFilterForm
              fields={filterFields}
              onFilterChange={handleFilterChange}
              liveUpdate={true}
              submitButton={false}
            />
          </div>
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
        </CardContent>
      </Card>
      <Modal
        onOpenChange={onOpenChange}
        isOpen={isOpen}
        title="Create New Client"
      >
        <SubmitForm
          formPostUrl="/dashboard/clients"
          inputs={formInputs}
          btnTxt="Save Client"
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export default page;
