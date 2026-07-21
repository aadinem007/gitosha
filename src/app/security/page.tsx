import { redirect } from "next/navigation";

/** Old URL — removed from public navigation. */
export default function SecurityRedirect() {
  redirect("/");
}
