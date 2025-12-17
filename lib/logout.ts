"use server";
// import { destroySession } from "@/libs/session";
import { redirect } from "next/navigation";

export async function logout() {
  // await destroySession();
  redirect("/main"); // go to login
}
