import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

// Prevent caching — session must be checked fresh on every request
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    const dest =
      session.role === "class_coordinator"
        ? "/dashboard/coordinator"
        : "/dashboard/student";
    redirect(dest);
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="admin" userName={session.name} />
      <main className="pt-14 md:pt-0 md:ml-64 p-4 md:p-6">{children}</main>
    </div>
  );
}
