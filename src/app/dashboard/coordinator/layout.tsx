import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { coordinatorDashboardRoles } from "@/lib/coordinators";
import PollPopup from "@/components/poll/poll-popup";

export const dynamic = "force-dynamic";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !coordinatorDashboardRoles.includes(
      session.role as (typeof coordinatorDashboardRoles)[number],
    )
  ) {
    const dest =
      session.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
    redirect(dest);
  }

  return (
    <div className="min-h-screen bg-background">
      <PollPopup />
      <Sidebar role={session.role} userName={session.name} />
      <main className="pt-14 md:pt-0 md:ml-64 p-4 md:p-6">{children}</main>
    </div>
  );
}
