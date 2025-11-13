import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/actions/user";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await auth();
  const email = clerkUser.sessionClaims?.email as string;

  const user = await getUserByEmail(email);
  if (!user) {
    redirect("/setup");
  }

  return <CustomersClient userId={user.id} />;
}
