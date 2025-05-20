/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { updateRecord } from "@/app/actions/action";
import { useUser } from "@/app/context/UserContext";
import DataTable from "@/components/common/data-table";
import DynamicFilterForm from "@/components/common/DynamicFilterForm";
import { SkeletonCard } from "@/components/common/Loader";
import { Modal } from "@/components/common/modal";
import SubmitForm from "@/components/common/submit-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCardList } from "@/hooks/use-card-list";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function Page() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>({});
  const [defaultValuesCompany, setDefaultValuesCompany] = useState<any>(
    user?.company
  );
  const [currentTab, setCurrentTab] = useState("account");
  const [searchTerm, setSearchTerm] = useState("");
  const userProfile = user?.userProfile;
  const router = useRouter();

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

  const columns = [
    { label: "Email ID", name: "email_id", type: "email" },
    { label: "Role", name: "job_role" },
  ];

  const handleRowClick = (row: Record<string, any>) => {
    console.log("Row clicked:", row);
  };

  const onOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const formInputs = () => [
    {
      type: "text" as const,
      name: "f_name",
      label: "First Name",
      required: false,
      colSpan: "col-span-4",
      placeholder: "First Name",
    },
    {
      type: "text" as const,
      name: "l_name",
      label: "Last Name",
      required: false,
      colSpan: "col-span-4",
      placeholder: "Last Name",
    },
    {
      type: "text" as const,
      name: "email_id",
      label: "Email",
      required: false,
      disabled: true,
      colSpan: "col-span-8",
      placeholder: "Email",
    },
    {
      type: "text" as const,
      name: "mobile_no",
      label: "Phone Number",
      required: false,
      errorMsg: "Phone number is required",
      colSpan: "col-span-6",
    },
    {
      type: "text" as const,
      name: "job_role",
      label: "Designation",
      required: false,
      colSpan: "col-span-8",
      placeholder: "Designation",
    },
  ];

  const valuesData = data?.find((item: any) => item.id === userProfile?.id);
  const createInitialValues = () => ({
    f_name: valuesData?.f_name || "",
    l_name: valuesData?.l_name || "",
    mobile_no: valuesData?.mobile_no || "",
    job_role: valuesData?.job_role || "",
    email_id: valuesData?.email_id || "",
  });

  console.log(valuesData);
  const createInitialValuesCompany = () => ({
    org_name: defaultValuesCompany?.org_name || "",
    org_linkedin_profile: defaultValuesCompany?.org_linkedin_profile || "",
    org_website_link: defaultValuesCompany?.org_website_link || "",
    country: defaultValuesCompany?.country || "",
    city: defaultValuesCompany?.city || "",
  });

  const formInputsCompany = () => [
    {
      type: "text" as const,
      name: "org_name",
      label: "Organization Name",
      required: false,
      disabled: true,
      colSpan: "col-span-8",
      placeholder: "Organization Name",
    },
    {
      type: "text" as const,
      name: "country",
      label: "Country",
      required: false,
      disabled: true,
      colSpan: "col-span-5",
      placeholder: "Country",
    },
    {
      type: "text" as const,
      name: "city",
      label: "City",
      required: false,
      disabled: true,
      colSpan: "col-span-3",
      placeholder: "City",
    },
    {
      type: "text" as const,
      name: "org_linkedin_profile",
      label: "Organization Linkedin Profile",
      required: false,
      disabled: true,
      colSpan: "col-span-8",
      placeholder: "Organization Linkedin Profile",
    },
    {
      type: "text" as const,
      name: "org_website_link",
      label: "Organization Website Link",
      required: false,
      disabled: true,
      colSpan: "col-span-8",
      placeholder: "Organization Website Link",
    },
  ];

  const formInputsEdit = [
    {
      type: "text" as const,
      name: "fname",
      label: "First Name",
      required: false,
      colSpan: "col-span-6",
      placeholder: "First Name",
    },
    {
      type: "text" as const,
      name: "lname",
      label: "Last Name",
      required: false,
      colSpan: "col-span-6",
      placeholder: "Last Name",
    },
    {
      type: "text" as const,
      name: "email",
      label: "Email",
      required: false,
      colSpan: "col-span-12",
      placeholder: "Email",
    },
    {
      type: "text" as const,
      name: "designation",
      label: "Designation",
      required: false,
      colSpan: "col-span-12",
      placeholder: "Designation",
    },
  ];

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await updateRecord(
        "user_profile",
        userProfile?.id,
        values
      );
      if (result?.success) {
        loadData(1);
        window.location.reload();
        toast("Profile updated successfully!");
      } else {
        toast(result?.error?.message || "Failed to update profile");
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

  const handleSubmitCompany = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await updateRecord("company", user?.company?.id, values);
      if (result?.success) {
        toast("Profile updated successfully!");
      } else {
        toast(result?.error?.message || "Failed to update profile");
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

  const filterFields = [
    {
      name: "name",
      label: "Search",
      inputType: "text" as const,
      placeholder: "Search by name or email",
      colSpan: "col-span-12 sm:col-span-6 lg:col-span-6",
    },
  ];

  const handleFilterChange = (values: Record<string, any>) => {
    setSearchTerm(values.name || "");
  };

  if (loading) {
    return (
      <div>
        <SkeletonCard grids={1} width="w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-7">
      <Tabs
        onValueChange={(val) => setCurrentTab(val)}
        defaultValue={currentTab}
        className="w-full"
      >
        <TabsList className="w-full h-16 p-2">
          <TabsTrigger value="account">My Profile</TabsTrigger>
          <TabsTrigger value="company">My Company</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="mt-4">
            <SubmitForm
              formPostUrl="/dashboard/settings"
              inputs={formInputs()}
              btnTxt="Save Changes"
              onSubmit={handleSubmit}
              btnWidth="w-38"
              initialValues={createInitialValues()}
            />
          </div>
        </TabsContent>
        <TabsContent value="company">
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-6">Company Details</h1>
            <SubmitForm
              formPostUrl="/dashboard/settings"
              inputs={formInputsCompany()}
              btnTxt="Save Changes"
              onSubmit={handleSubmitCompany}
              initialValues={createInitialValuesCompany()}
              btnWidth="w-38"
            />
          </div>
        </TabsContent>
        <TabsContent value="team">
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Team Members</h1>
            </div>
            <div className="mb-4">
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
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="mt-4 p-1">
            <div className="items-top flex space-x-2">
              <Checkbox defaultChecked id="terms1" />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms1"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Common
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive all notifications
                </p>
              </div>
            </div>
            <div className="items-top flex space-x-2 mt-4">
              <Checkbox id="terms2" />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms2"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Promotions
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive Promotional Notifications through email
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant={"animated"}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div>
        <Modal
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          title="Update Member"
        >
          <SubmitForm
            formPostUrl="/dashboard/clients"
            inputs={formInputsEdit}
            btnTxt="Update Member"
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </div>
  );
}

export default Page;
