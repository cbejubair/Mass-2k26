import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type StudentUser = {
  id: string;
  name: string;
  register_number: string | null;
  department: string | null;
  year: string | null;
  class_section: string | null;
};

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number | null;
  payment_status: "pending" | "approved" | "rejected";
  payment_mode: string | null;
  transaction_ref: string | null;
  screenshot_url: string | null;
  verified_by: string | null;
  created_at: string | null;
  verified_at: string | null;
};

type LoginLog = {
  user_id: string;
  logged_in_at: string;
  ip_address: string | null;
};

type CoordinatorUser = {
  id: string;
  name: string;
  register_number: string | null;
  mobile_number: string;
  department: string | null;
  year: string | null;
  class_section: string | null;
};

const makeClassKey = (
  department: string | null | undefined,
  year: string | null | undefined,
  section: string | null | undefined,
) => `${department || "Unknown"}|${year || "Unknown"}|${section || "Unknown"}`;

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const [studentsRes, paymentsRes, logsRes, coordinatorsRes] =
      await Promise.all([
        supabaseAdmin
          .from("users")
          .select("id, name, register_number, department, year, class_section")
          .eq("role", "student"),
        supabaseAdmin
          .from("payments")
          .select(
            "id, user_id, amount, payment_status, payment_mode, transaction_ref, screenshot_url, verified_by, created_at, verified_at",
          ),
        supabaseAdmin
          .from("login_logs")
          .select("user_id, logged_in_at, ip_address")
          .eq("role", "student")
          .order("logged_in_at", { ascending: false })
          .limit(200),
        supabaseAdmin
          .from("users")
          .select(
            "id, name, register_number, mobile_number, department, year, class_section",
          )
          .eq("role", "class_coordinator")
          .order("department", { ascending: true }),
      ]);

    if (studentsRes.error) throw studentsRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    if (logsRes.error) throw logsRes.error;
    if (coordinatorsRes.error) throw coordinatorsRes.error;

    const students = (studentsRes.data || []) as StudentUser[];
    const payments = (paymentsRes.data || []) as PaymentRow[];
    const loginLogs = (logsRes.data || []) as LoginLog[];
    const coordinators = (coordinatorsRes.data || []) as CoordinatorUser[];

    const studentById = new Map(
      students.map((student) => [student.id, student]),
    );

    const departmentWise = new Map<
      string,
      {
        department: string;
        studentCount: number;
        paidCount: number;
        approvedRevenue: number;
        pendingCount: number;
      }
    >();
    const yearWise = new Map<
      string,
      {
        year: string;
        studentCount: number;
        paidCount: number;
        approvedRevenue: number;
        pendingCount: number;
      }
    >();
    const classWise = new Map<
      string,
      {
        key: string;
        department: string;
        year: string;
        classSection: string;
        studentCount: number;
        paidCount: number;
        approvedRevenue: number;
        pendingCount: number;
      }
    >();

    for (const student of students) {
      const department = student.department || "Unknown";
      const year = student.year || "Unknown";
      const classSection = student.class_section || "Unknown";
      const classKey = makeClassKey(department, year, classSection);

      if (!departmentWise.has(department)) {
        departmentWise.set(department, {
          department,
          studentCount: 0,
          paidCount: 0,
          approvedRevenue: 0,
          pendingCount: 0,
        });
      }
      if (!yearWise.has(year)) {
        yearWise.set(year, {
          year,
          studentCount: 0,
          paidCount: 0,
          approvedRevenue: 0,
          pendingCount: 0,
        });
      }
      if (!classWise.has(classKey)) {
        classWise.set(classKey, {
          key: classKey,
          department,
          year,
          classSection,
          studentCount: 0,
          paidCount: 0,
          approvedRevenue: 0,
          pendingCount: 0,
        });
      }

      departmentWise.get(department)!.studentCount += 1;
      yearWise.get(year)!.studentCount += 1;
      classWise.get(classKey)!.studentCount += 1;
    }

    const coordinatorByClass = new Map<string, CoordinatorUser>();
    for (const coordinator of coordinators) {
      const classKey = makeClassKey(
        coordinator.department,
        coordinator.year,
        coordinator.class_section,
      );
      if (!coordinatorByClass.has(classKey)) {
        coordinatorByClass.set(classKey, coordinator);
      }
    }

    const coordinatorMetrics = new Map<
      string,
      {
        coordinator: CoordinatorUser;
        studentsInClass: number;
        verifiedCount: number;
        approvedCount: number;
        rejectedCount: number;
      }
    >();

    for (const coordinator of coordinators) {
      const classKey = makeClassKey(
        coordinator.department,
        coordinator.year,
        coordinator.class_section,
      );

      coordinatorMetrics.set(coordinator.id, {
        coordinator,
        studentsInClass: classWise.get(classKey)?.studentCount || 0,
        verifiedCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      });
    }

    let approvedRevenueTotal = 0;
    let pendingAmountTotal = 0;

    const pendingPayments = [] as Array<{
      id: string;
      amount: number;
      paymentMode: string | null;
      transactionRef: string | null;
      screenshotUrl: string | null;
      createdAt: string | null;
      student: {
        id: string;
        name: string;
        registerNumber: string | null;
        department: string;
        year: string;
        classSection: string;
      };
      classCoordinator: {
        id: string;
        name: string;
        registerNumber: string | null;
        mobileNumber: string;
      } | null;
    }>;

    for (const payment of payments) {
      const student = studentById.get(payment.user_id);
      if (!student) continue;

      const department = student.department || "Unknown";
      const year = student.year || "Unknown";
      const classSection = student.class_section || "Unknown";
      const classKey = makeClassKey(department, year, classSection);
      const amount = Number(payment.amount || 0);

      if (payment.payment_status === "approved") {
        approvedRevenueTotal += amount;
        departmentWise.get(department)!.paidCount += 1;
        yearWise.get(year)!.paidCount += 1;
        classWise.get(classKey)!.paidCount += 1;
        departmentWise.get(department)!.approvedRevenue += amount;
        yearWise.get(year)!.approvedRevenue += amount;
        classWise.get(classKey)!.approvedRevenue += amount;
      }

      if (payment.payment_status === "pending") {
        pendingAmountTotal += amount;
        departmentWise.get(department)!.pendingCount += 1;
        yearWise.get(year)!.pendingCount += 1;
        classWise.get(classKey)!.pendingCount += 1;

        const classCoordinator = coordinatorByClass.get(classKey);
        pendingPayments.push({
          id: payment.id,
          amount,
          paymentMode: payment.payment_mode,
          transactionRef: payment.transaction_ref,
          screenshotUrl: payment.screenshot_url,
          createdAt: payment.created_at,
          student: {
            id: student.id,
            name: student.name,
            registerNumber: student.register_number,
            department,
            year,
            classSection,
          },
          classCoordinator: classCoordinator
            ? {
                id: classCoordinator.id,
                name: classCoordinator.name,
                registerNumber: classCoordinator.register_number,
                mobileNumber: classCoordinator.mobile_number,
              }
            : null,
        });
      }

      if (payment.verified_by && coordinatorMetrics.has(payment.verified_by)) {
        const metric = coordinatorMetrics.get(payment.verified_by)!;
        metric.verifiedCount += 1;
        if (payment.payment_status === "approved") metric.approvedCount += 1;
        if (payment.payment_status === "rejected") metric.rejectedCount += 1;
      }
    }

    const recentStudentLogins = loginLogs
      .map((log) => {
        const student = studentById.get(log.user_id);
        if (!student) return null;
        return {
          userId: log.user_id,
          name: student.name,
          registerNumber: student.register_number,
          department: student.department || "Unknown",
          year: student.year || "Unknown",
          classSection: student.class_section || "Unknown",
          ipAddress: log.ip_address,
          loggedInAt: log.logged_in_at,
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));

    const todayDate = new Date().toISOString().slice(0, 10);
    const todayLoginCount = recentStudentLogins.filter(
      (entry) => entry.loggedInAt.slice(0, 10) === todayDate,
    ).length;

    pendingPayments.sort((a, b) => {
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return bt - at;
    });

    return NextResponse.json({
      overview: {
        totalStudents: students.length,
        totalApprovedPayments: payments.filter(
          (p) => p.payment_status === "approved",
        ).length,
        approvedRevenueTotal,
        pendingPayments: payments.filter((p) => p.payment_status === "pending")
          .length,
        pendingAmountTotal,
        totalStudentLogins: recentStudentLogins.length,
        todayStudentLogins: todayLoginCount,
      },
      departmentWise: Array.from(departmentWise.values()).sort((a, b) =>
        a.department.localeCompare(b.department),
      ),
      yearWise: Array.from(yearWise.values()).sort((a, b) =>
        a.year.localeCompare(b.year, undefined, { numeric: true }),
      ),
      classWise: Array.from(classWise.values()).sort((a, b) => {
        const dept = a.department.localeCompare(b.department);
        if (dept !== 0) return dept;
        const year = a.year.localeCompare(b.year, undefined, { numeric: true });
        if (year !== 0) return year;
        return a.classSection.localeCompare(b.classSection);
      }),
      classCoordinators: Array.from(coordinatorMetrics.values())
        .map((value) => ({
          id: value.coordinator.id,
          name: value.coordinator.name,
          registerNumber: value.coordinator.register_number,
          mobileNumber: value.coordinator.mobile_number,
          department: value.coordinator.department || "Unknown",
          year: value.coordinator.year || "Unknown",
          classSection: value.coordinator.class_section || "Unknown",
          studentsInClass: value.studentsInClass,
          verifiedCount: value.verifiedCount,
          approvedCount: value.approvedCount,
          rejectedCount: value.rejectedCount,
        }))
        .sort((a, b) => {
          const dept = a.department.localeCompare(b.department);
          if (dept !== 0) return dept;
          const year = a.year.localeCompare(b.year, undefined, {
            numeric: true,
          });
          if (year !== 0) return year;
          return a.classSection.localeCompare(b.classSection);
        }),
      pendingPayments,
      recentStudentLogins,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
