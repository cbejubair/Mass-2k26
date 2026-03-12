import type { JWTPayload } from "@/lib/auth";
import {
  coordinatorDashboardRoles,
  rolePermissions,
  type CoordinatorDashboardRole,
  type CoordinatorRole,
} from "@/lib/coordinators";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface CoordinatorScope {
  role: CoordinatorDashboardRole;
  accessLevel: "full" | "department" | "class" | "event";
  department: string | null;
  year: string | null;
  classSection: string | null;
  label: string;
  canManagePayments: boolean;
  canApprovePerformances: boolean;
  canScanQR: boolean;
  canViewStats: boolean;
}

const roleMap: Record<CoordinatorDashboardRole, CoordinatorRole> = {
  staff_coordinator: "staff_coordinator",
  overall_student_coordinator: "overall_student_coordinator",
  class_coordinator: "class_coordinator",
  faculty_coordinator: "faculty_coordinator",
  event_head: "event_head",
  technical_coordinator: "technical_coordinator",
  discipline_coordinator: "discipline_coordinator",
};

export const paymentCoordinatorRoles: CoordinatorDashboardRole[] = [
  "staff_coordinator",
  "overall_student_coordinator",
  "class_coordinator",
];

export const scannerCoordinatorRoles: CoordinatorDashboardRole[] =
  coordinatorDashboardRoles.filter(
    (role) => rolePermissions[roleMap[role]].canScanQR,
  );

export function isCoordinatorDashboardRole(
  role: string,
): role is CoordinatorDashboardRole {
  return coordinatorDashboardRoles.includes(role as CoordinatorDashboardRole);
}

export async function getCoordinatorScope(
  session: JWTPayload,
): Promise<CoordinatorScope> {
  if (!isCoordinatorDashboardRole(session.role)) {
    throw new Error("Forbidden");
  }

  const { data: coordinatorRow } = await supabaseAdmin
    .from("users")
    .select("department, year, class_section")
    .eq("id", session.userId)
    .single();

  const department = coordinatorRow?.department ?? session.department;
  const year = coordinatorRow?.year ?? session.year;
  const classSection = coordinatorRow?.class_section ?? session.classSection;
  const permissions = rolePermissions[roleMap[session.role]];

  if (
    permissions.accessLevel === "class" &&
    (!department || !year || !classSection)
  ) {
    throw new Error("Coordinator has no class assignment. Contact admin.");
  }

  if (permissions.accessLevel === "department" && !department) {
    throw new Error("Coordinator has no department assignment. Contact admin.");
  }

  let label = "All Departments";
  if (permissions.accessLevel === "class") {
    label = `${department} - ${year} ${classSection}`;
  } else if (permissions.accessLevel === "department") {
    label = `${department} Department`;
  } else if (permissions.accessLevel === "event") {
    label = "Event Scope";
  }

  return {
    role: session.role,
    accessLevel: permissions.accessLevel,
    department,
    year,
    classSection,
    label,
    canManagePayments: permissions.canManagePayments,
    canApprovePerformances: permissions.canApprovePerformances,
    canScanQR: permissions.canScanQR,
    canViewStats: permissions.canViewStats,
  };
}

export function applyStudentScope<T>(query: T, scope: CoordinatorScope): T {
  if (scope.accessLevel === "class") {
    return (query as any)
      .eq("department", scope.department)
      .eq("year", scope.year)
      .eq("class_section", scope.classSection);
  }

  if (scope.accessLevel === "department") {
    return (query as any).eq("department", scope.department);
  }

  return query;
}
