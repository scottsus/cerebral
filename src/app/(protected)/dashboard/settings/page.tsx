import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByEmail } from "~/actions/user";
import SettingsClient from "./settingsClient";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByEmail({ email });

  if (!dbUser) {
    redirect("/setup");
  }

  return <SettingsClient user={dbUser} />;
}
