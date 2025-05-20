"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

function Home() {
  useEffect(() => {
    redirect("/auth/login");
  }, []);
  return <div></div>;
}

export default Home;
