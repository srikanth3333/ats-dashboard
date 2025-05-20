"use client";
import { createRecordWithoutUser } from "@/app/actions/action";
import SubmitForm from "@/components/common/submit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { pagesAcess, rolesAcess } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

function page() {
  const formInputs = [
    {
      type: "text" as const,
      name: "name",
      label: "Name",
      required: true,
      colSpan: "col-span-12",
      placeholder: "Name",
    },
    {
      type: "text" as const,
      name: "email",
      label: "Email Id",
      required: true,
      colSpan: "col-span-12",
      placeholder: "Email Address",
    },
    {
      type: "text" as const,
      name: "org_name",
      label: "Organization Name",
      required: true,
      colSpan: "col-span-12",
      placeholder: "Organization Name",
    },
    {
      type: "password" as const,
      name: "password",
      label: "Password",
      required: true,
      colSpan: "col-span-12",
      placeholder: "Enter password",
    },
  ];

  const roles = rolesAcess["company"];
  const pages = pagesAcess["company"];

  const handleSubmit = async (values?: Record<string, any>) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase.auth.signUp({
        email: values?.email,
        password: values?.password,
      });
      if (error) {
        toast("Failed to create user");
        return { success: false, error: error.message };
      }
      const { data: company, error: companyError } =
        await createRecordWithoutUser("company", {
          name: values?.org_name,
          org_name: values?.org_name,
          user_id: user?.user?.id,
        });
      console.log("company", company, company?.id);
      const { data: profile, error: profileError } =
        await createRecordWithoutUser("user_profile", {
          email_id: values?.email,
          password: values?.password,
          user_id: user?.user?.id,
          company_id: company?.id,
          designation: "company",
          pages: pages,
          acess_roles: roles,
        });
      return { success: true };
    } catch (error) {
      toast("Failed to submit form");
      return { success: false, error: "Submission failed" };
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Company Registration</CardTitle>
              <CardDescription>Register you company Details</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmitForm
                formPostUrl="/dashboard"
                inputs={formInputs}
                btnTxt="Submit"
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default page;
