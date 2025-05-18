'use server'
import { currentUser } from "@/app/actions/action";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const getUser = async () => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect("/auth/login");
      }
      const user = await currentUser();
      if (user?.success) {
        return {success:true,data:{...user,...data}}
      }
      redirect("/auth/login");
    } catch {
      redirect("/auth/login");
    }
};