import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "~/actions/user";
import { getAllCustomers } from "~/actions/receipts";
import CustomersClient from "./customersClient";

export default async function CustomersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserById(userId);

  if (!user) {
    redirect("/setup");
  }

  const customers = await getAllCustomers(userId);

  return (
    <div className="flex min-h-screen flex-col">
      <CustomersClient customers={customers} userId={userId} />
    </div>
  );
}
