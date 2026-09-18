import { redirect } from "next/navigation";

export default function RootPage() {
  // middleware.ts sends unauthenticated visitors to /login before this
  // ever renders; this only handles the authenticated "/" case.
  redirect("/dashboard");
}
