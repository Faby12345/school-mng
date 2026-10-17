import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppNavigation } from "@/components/navigation/app-navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-frame">
      {children}
      <AppNavigation />
    </div>
  );
}

