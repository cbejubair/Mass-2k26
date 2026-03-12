import Link from "next/link";
import { notFound } from "next/navigation";
import {
  classSections,
  getDepartmentBySlug,
  getDepartmentCoordinatorCount,
} from "@/lib/coordinators";

export default async function DepartmentCoordinatorRoutePage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department: departmentSlug } = await params;
  const department = getDepartmentBySlug(departmentSlug);

  if (!department) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/coordinators"
          className="text-sm text-fuchsia-300 hover:text-fuchsia-200"
        >
          ← Back to coordinator router
        </Link>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.28em] text-fuchsia-400">
          Department Route
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          {department} Coordinators
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400 sm:text-base">
          Public route details for faculty and class-wise coordinators in the{" "}
          {department}
          department.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Department route</p>
              <p className="text-lg font-semibold text-white">
                /coordinators/{departmentSlug}
              </p>
            </div>
            <div className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">
              {getDepartmentCoordinatorCount(department)} total coordinators
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white">
              Class-wise routing map
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {classSections[department].map((section) => (
                <span
                  key={section}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-neutral-300"
                >
                  {department} · {section}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
