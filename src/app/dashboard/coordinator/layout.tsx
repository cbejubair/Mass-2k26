import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

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

  if (session.role !== "class_coordinator") {
    const dest =
      session.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
    redirect(dest);
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="class_coordinator" userName={session.name} />
      <main className="pt-14 md:pt-0 md:ml-64 p-4 md:p-6">{children}</main>
    </div>
  );
}
