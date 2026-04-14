import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { AppShellWrapper } from "./app-shell-wrapper";
import { AuthProvider } from "@/components/auth-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name || user?.email || "Benutzer";

  return (
    <AuthProvider initialUser={user}>
      <AppShellWrapper userName={userName} signOutAction={signOut}>
        {children}
      </AppShellWrapper>
    </AuthProvider>
  );
}
