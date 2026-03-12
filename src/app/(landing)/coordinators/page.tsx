import Link from "next/link";
import {
  coordinatorRoleLabels,
  departments,
  facultyCoordinators,
  getCoordinatorRoleCount,
  getPublicCoordinatorRouteDetails,
  getTotalCoordinatorCount,
  slugifyDepartment,
} from "@/lib/coordinators";

export default function PublicCoordinatorDirectoryPage() {
  const routeDetails = getPublicCoordinatorRouteDetails();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-black/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-fuchsia-400">
            Public Coordinator Router
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Coordinator Directory
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-neutral-400 sm:text-base">
            Public routing for approximately {getTotalCoordinatorCount()}{" "}
            coordinators, including class-wise coordinators, faculty
            coordinators, and overall role-based coordinator access.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {routeDetails.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-fuchsia-500/40 hover:bg-white/[0.04]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-400">
                Public Route
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {route.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                {route.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-500">{route.href}</span>
                <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-fuchsia-300">
                  {route.total}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white">Role Coverage</h2>
            <div className="mt-5 space-y-3">
              {Object.entries(coordinatorRoleLabels).map(([role, label]) => (
                <div
                  key={role}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
                >
                  <span className="text-sm text-neutral-200">{label}</span>
                  <span className="text-sm font-semibold text-fuchsia-300">
                    {getCoordinatorRoleCount(
                      role as keyof typeof coordinatorRoleLabels,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-2xl font-bold text-white">Department Router</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Public department routes for faculty and class-wise coordinator
              details.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {departments.map((department) => (
                <Link
                  key={department}
                  href={`/coordinators/${slugifyDepartment(department)}`}
                  className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4 text-sm text-neutral-200 transition hover:border-cyan-500/30 hover:text-white"
                >
                  <div className="font-semibold">{department}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Faculty + class-wise routes
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-neutral-400">
              Faculty routes available: {facultyCoordinators.length}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
