import { isBudget } from "@/config/app-target";
import { redirect } from "next/navigation";
import HomeClient from "./page-client";

export default function Home() {
  if (isBudget) redirect("/budget-app/landing");
  return <HomeClient />;
}
