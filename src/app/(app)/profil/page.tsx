import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import { ProfilClient } from "./profil-client";

export const metadata = {
  title: "Profil & Einstellungen",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { profile, email } = await getProfile();

  if (!profile || !email) redirect("/login");

  return <ProfilClient profile={profile} email={email} />;
}
