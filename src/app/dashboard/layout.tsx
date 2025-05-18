import Sidebar from "@/components/common/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { UserProvider } from "../context/UserContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }
  return (
    <UserProvider>
      <Sidebar>{children}</Sidebar>
    </UserProvider>
  );
};

export default Layout;
