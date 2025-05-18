"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const getUser = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    console.log(data);
    if (data?.user) {
      redirect("/dashboard");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return <>{children}</>;
}
