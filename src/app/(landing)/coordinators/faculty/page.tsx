import Link from "next/link";
import {
  departments,
  facultyCoordinators,
  slugifyDepartment,
} from "@/lib/coordinators";

export default function FacultyCoordinatorRoutesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-fuchsia-400">
          Public Coordinator Router
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Faculty Coordinators
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400 sm:text-base">
          Department-level public routes for faculty coordinators across all
          core departments.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {departments.map((department) => {
            const route = `/coordinators/${slugifyDepartment(department)}`;
            return (
              <Link
                key={department}
                href={route}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-fuchsia-500/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {department}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Faculty coordinator route
                    </p>
                  </div>
                  <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300">
                    {route}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-neutral-400">
          Total faculty coordinator slots: {facultyCoordinators.length}
        </div>
      </div>
    </main>
  );
}
