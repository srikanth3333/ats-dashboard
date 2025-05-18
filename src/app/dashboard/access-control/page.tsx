"use client";
import { createRecordWithoutUser } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import { Modal } from "@/components/common/modal";
import SubmitForm from "@/components/common/submit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCardList } from "@/hooks/use-card-list";
import { sendEmail } from "@/lib/mail";
import { pagesAcess, roles, rolesAcess } from "@/utils/constants";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditModal from "./features/EditModal";

function page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [row, setRow] = useState(null);
  const { user } = useUser();

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
    "user_profile",
    {},
    {},
    searchTerm,
    ["email_id", "designation", "job_role"],
    true,
    user?.user?.id,
    user?.company?.id
  );

  interface OnChangeParams {
    val: any;
    type: string;
    action: string;
  }

  const onChange = (
    val: OnChangeParams["val"],
    type: OnChangeParams["type"],
    action: OnChangeParams["action"]
  ): void => {
    if (action === "edit") {
      setShowEdit(!showEdit);
    }
  };

  const columns = [
    { label: "Email ID", name: "email_id", type: "email" },
    { label: "Role", name: "designation" },
    { label: "action", name: "id", type: "action", onChange: onChange },
  ];

  const formInputs = [
    {
      type: "text" as const,
      name: "email_id",
      label: "Email",
      required: true,
      colSpan: "col-span-12",
      placeholder: "Email Address",
    },
    {
      type: "combobox" as const,
      name: "designation",
      label: "Designation",
      options: roles,
      required: true,
      colSpan: "col-span-12",
      placeholder: "Enter Designation",
    },
  ];

  const handleRowClick = (row: any) => {
    setRow(row);
  };

  type Designation = keyof typeof pagesAcess;

  const handleSubmit = async (values?: Record<string, any>) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecordWithoutUser("user_profile", {
        ...values,
        company_id: user?.company?.id,
        pages: pagesAcess[values.designation as Designation],
        acess_roles: rolesAcess[values.designation as Designation],
      });

      if (result?.success) {
        await sendEmail(
          values.email_id,
          "ATS Invitation",
          '<p>Follow this link to accept invitation <a href="http://localhost:3000/auth/sign-up">Aceept Invitation</a></p>'
        );
        loadData(1);
        setCurrentPage(1);
        toast("User created successfully!");
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

  if (loading) {
    return (
      <div>
        <SkeletonCard grids={1} width="w-full h-[400px] space-y-4 mt-4" />
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
      <Card className="w-full bg-white shadow-md hover:shadow-xl rounded-xl transition-all duration-300 border border-gray-200">
        <CardContent className="px-6 space-y-4 ">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Users</h1>
            <Button variant="animated" onClick={onOpenChange}>
              <Plus /> Create New User
            </Button>
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
        title="Create New User"
        className="w-[500px]"
      >
        <SubmitForm
          formPostUrl="/dashboard/access-control"
          inputs={formInputs}
          btnTxt="Send Invitation"
          onSubmit={handleSubmit}
        />
      </Modal>
      <EditModal row={row} isOpen={showEdit} setIsOpen={setShowEdit} />
    </div>
  );
}

export default page;
