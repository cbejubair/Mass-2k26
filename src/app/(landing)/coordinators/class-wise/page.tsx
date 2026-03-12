import Link from "next/link";
import {
  classSections,
  departments,
  slugifyDepartment,
} from "@/lib/coordinators";

export default function ClassWiseCoordinatorRoutesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-fuchsia-400">
          Public Coordinator Router
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Class-wise Coordinators
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400 sm:text-base">
          Public routing by department, year, and section for all class
          coordinator assignments.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <div
              key={department}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {department}
                </h2>
                <Link
                  href={`/coordinators/${slugifyDepartment(department)}`}
                  className="text-xs text-fuchsia-300 hover:text-fuchsia-200"
                >
                  Open route
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {classSections[department].map((section) => (
                  <span
                    key={section}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
