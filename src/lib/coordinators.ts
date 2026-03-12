/**
 * Coordinator configuration for ~50 role-based coordinators.
 * Includes class-wise coordinators and faculty coordinators with
 * department/role assignments and access levels.
 */

export type CoordinatorRole =
  | "staff_coordinator"
  | "overall_student_coordinator"
  | "class_coordinator"
  | "faculty_coordinator"
  | "event_head"
  | "technical_coordinator"
  | "discipline_coordinator";

export type AccessLevel = "full" | "department" | "class" | "event";

export interface CoordinatorConfig {
  id: string;
  name: string;
  role: CoordinatorRole;
  department?: string;
  year?: string;
  section?: string;
  phone: string;
  photo: string;
  accessLevel: AccessLevel;
  canManagePayments: boolean;
  canApprovePerformances: boolean;
  canScanQR: boolean;
  canViewStats: boolean;
}

export const coordinatorDashboardRoles = [
  "staff_coordinator",
  "overall_student_coordinator",
  "class_coordinator",
  "faculty_coordinator",
  "event_head",
  "technical_coordinator",
  "discipline_coordinator",
] as const;

export type CoordinatorDashboardRole =
  (typeof coordinatorDashboardRoles)[number];

export const publicCoordinatorRoutes = [
  "/coordinators",
  "/coordinators/faculty",
  "/coordinators/class-wise",
] as const;

/**
 * All coordinator role labels for display
 */
export const coordinatorRoleLabels: Record<CoordinatorRole, string> = {
  staff_coordinator: "Staff Coordinator",
  overall_student_coordinator: "Overall Student Coordinator",
  class_coordinator: "Class Coordinator",
  faculty_coordinator: "Faculty Coordinator",
  event_head: "Event Head",
  technical_coordinator: "Technical Coordinator",
  discipline_coordinator: "Discipline Coordinator",
};

/**
 * Role-based permissions defaults
 */
export const rolePermissions: Record<
  CoordinatorRole,
  {
    canManagePayments: boolean;
    canApprovePerformances: boolean;
    canScanQR: boolean;
    canViewStats: boolean;
    accessLevel: AccessLevel;
  }
> = {
  staff_coordinator: {
    canManagePayments: true,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
    accessLevel: "full",
  },
  overall_student_coordinator: {
    canManagePayments: true,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
    accessLevel: "full",
  },
  class_coordinator: {
    canManagePayments: true,
    canApprovePerformances: false,
    canScanQR: true,
    canViewStats: true,
    accessLevel: "class",
  },
  faculty_coordinator: {
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
    accessLevel: "department",
  },
  event_head: {
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: false,
    canViewStats: true,
    accessLevel: "event",
  },
  technical_coordinator: {
    canManagePayments: false,
    canApprovePerformances: false,
    canScanQR: true,
    canViewStats: true,
    accessLevel: "full",
  },
  discipline_coordinator: {
    canManagePayments: false,
    canApprovePerformances: false,
    canScanQR: true,
    canViewStats: false,
    accessLevel: "full",
  },
};

/**
 * Department list
 */
export const departments = [
  "CSE",
  "ECE",
  "BME",
  "AGRI",
  "MECH",
  "IT",
  "AI & DS",
  "AI & ML",
] as const;

export type Department = (typeof departments)[number];

/**
 * Class sections per department
 */
export const classSections: Record<Department, string[]> = {
  CSE: ["I-A", "I-B", "II-A", "II-B", "III", "IV"],
  ECE: ["I", "II", "III", "IV"],
  BME: ["I", "II", "III", "IV"],
  AGRI: ["I", "II", "III", "IV"],
  MECH: ["I", "II", "III", "IV"],
  IT: ["I-A", "I-B", "II", "III", "IV"],
  "AI & DS": ["I", "II", "III", "IV"],
  "AI & ML": ["I", "II", "III"],
};

/**
 * Faculty coordinators (one per department)
 */
export const facultyCoordinators: Omit<CoordinatorConfig, "id">[] = [
  {
    name: "Mr. Nithya Prakash",
    role: "staff_coordinator",
    department: "Overall",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "full",
    canManagePayments: true,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "staff_coordinator",
    department: "Overall",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "full",
    canManagePayments: true,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "CSE",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "ECE",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "BME",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "AGRI",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "MECH",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "IT",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "AI & DS",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
  {
    name: "TBA",
    role: "faculty_coordinator",
    department: "AI & ML",
    phone: "",
    photo: "/coordinator/boy.jpeg",
    accessLevel: "department",
    canManagePayments: false,
    canApprovePerformances: true,
    canScanQR: true,
    canViewStats: true,
  },
];

/**
 * Calculate total coordinator count
 */
export function getTotalCoordinatorCount(): number {
  let count = 0;
  // Staff coordinators
  count += 2;
  // Overall student coordinators
  count += 3;
  // Faculty coordinators (1 per dept)
  count += departments.length;
  // Class coordinators
  for (const dept of departments) {
    count += classSections[dept].length;
  }
  return count;
}

/**
 * Dashboard routes available for coordinators based on their role
 */
export function getCoordinatorRoutes(role: CoordinatorRole): string[] {
  const baseRoutes = ["/dashboard/coordinator"];

  switch (role) {
    case "staff_coordinator":
    case "overall_student_coordinator":
      return [
        ...baseRoutes,
        "/dashboard/coordinator/students",
        "/dashboard/coordinator/payments",
        "/dashboard/coordinator/scanner",
        "/dashboard/coordinator/performances",
        "/dashboard/coordinator/stats",
      ];
    case "class_coordinator":
      return [
        ...baseRoutes,
        "/dashboard/coordinator/students",
        "/dashboard/coordinator/payments",
        "/dashboard/coordinator/scanner",
      ];
    case "faculty_coordinator":
      return [
        ...baseRoutes,
        "/dashboard/coordinator/students",
        "/dashboard/coordinator/performances",
        "/dashboard/coordinator/scanner",
        "/dashboard/coordinator/stats",
      ];
    case "event_head":
      return [
        ...baseRoutes,
        "/dashboard/coordinator/performances",
        "/dashboard/coordinator/stats",
      ];
    case "technical_coordinator":
      return [
        ...baseRoutes,
        "/dashboard/coordinator/scanner",
        "/dashboard/coordinator/stats",
      ];
    case "discipline_coordinator":
      return [...baseRoutes, "/dashboard/coordinator/scanner"];
    default:
      return baseRoutes;
  }
}

export function slugifyDepartment(department: string): string {
  return department
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDepartmentBySlug(slug: string): Department | null {
  return (
    departments.find((department) => slugifyDepartment(department) === slug) ||
    null
  );
}

export function getDepartmentCoordinatorCount(department: Department): number {
  const facultyCount = facultyCoordinators.filter(
    (coordinator) => coordinator.department === department,
  ).length;

  return facultyCount + classSections[department].length;
}

export function getCoordinatorRoleCount(role: CoordinatorRole): number {
  if (role === "staff_coordinator") return 2;
  if (role === "overall_student_coordinator") return 3;
  if (role === "faculty_coordinator") return departments.length;
  if (role === "class_coordinator") {
    return departments.reduce((count, department) => {
      return count + classSections[department].length;
    }, 0);
  }

  return 0;
}

export function getPublicCoordinatorRouteDetails() {
  return [
    {
      title: "Coordinator Directory",
      href: "/coordinators",
      description:
        "Public directory for all coordinator roles and departments.",
      total: getTotalCoordinatorCount(),
    },
    {
      title: "Faculty Coordinators",
      href: "/coordinators/faculty",
      description: "Department-wise faculty coordinator routing.",
      total: getCoordinatorRoleCount("faculty_coordinator"),
    },
    {
      title: "Class-wise Coordinators",
      href: "/coordinators/class-wise",
      description: "Public access to class and section coordinator routing.",
      total: getCoordinatorRoleCount("class_coordinator"),
    },
    ...departments.map((department) => ({
      title: `${department} Coordinators`,
      href: `/coordinators/${slugifyDepartment(department)}`,
      description: `Department route for ${department} class-wise and faculty coordinators.`,
      total: getDepartmentCoordinatorCount(department),
    })),
  ];
}
