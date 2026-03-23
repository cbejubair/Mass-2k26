"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  Loader2,
  Search,
  Store,
  Utensils,
  Package,
  Zap,
  ChefHat,
  SearchX,
  PhoneCall,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StallApplication {
  id: string;
  applicant_name: string;
  phone_number: string;
  email: string;
  stall_type: "food" | "product";
  stall_brand_name: string;
  items_to_sell: string;
  member_count: number;
  cooking_on_site: boolean;
  power_required: boolean;
  expected_space: string;
  previous_experience: string | null;
  special_requirements: string | null;
  created_at: string;
}

function stallTypeLabel(type: string): string {
  return type === "food" ? "Food" : "Product";
}

function statPct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function toTelHref(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[^+\d]/g, "");
  return `tel:${normalized}`;
}

export default function AdminStallsPage() {
  const [applications, setApplications] = useState<StallApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/stalls")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load stall applications");
        }
        return data;
      })
      .then((data) => setApplications(data.applications || []))
      .catch((err) => {
        setLoadError(
          err instanceof Error
            ? err.message
            : "Failed to load stall applications",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesType = typeFilter === "all" || app.stall_type === typeFilter;
      const matchesSearch =
        !query ||
        app.applicant_name.toLowerCase().includes(query) ||
        app.phone_number.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.stall_brand_name.toLowerCase().includes(query) ||
        app.items_to_sell.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [applications, search, typeFilter]);

  const total = applications.length;
  const foodCount = applications.filter((app) => app.stall_type === "food").length;
  const productCount = applications.filter(
    (app) => app.stall_type === "product",
  ).length;
  const powerCount = applications.filter((app) => app.power_required).length;
  const cookingCount = applications.filter((app) => app.cooking_on_site).length;

  const exportExcel = () => {
    const rows = filtered.map((app, index) => ({
      "S.No": index + 1,
      "Submitted At": new Date(app.created_at).toLocaleString(),
      "Applicant Name": app.applicant_name,
      "Phone Number": app.phone_number,
      Email: app.email,
      "Stall Type": stallTypeLabel(app.stall_type),
      "Stall/Brand Name": app.stall_brand_name,
      "Items To Sell": app.items_to_sell,
      "Member Count": app.member_count,
      "Cooking On Site": app.cooking_on_site ? "Yes" : "No",
      "Power Required": app.power_required ? "Yes" : "No",
      "Expected Space": app.expected_space,
      "Previous Experience": app.previous_experience || "",
      "Special Requirements": app.special_requirements || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stall Applications");
    XLSX.writeFile(wb, "stall_applications.xlsx");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-emerald-500/10 p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Store className="h-5 w-5 text-cyan-400" />
              Stall Applications
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage all public vendor submissions for event-day stalls.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportExcel}
            disabled={filtered.length === 0}
            className="w-full sm:w-auto border-cyan-400/30 hover:bg-cyan-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        <div className="relative mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold mt-1">{total}</p>
          </div>
          <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-3">
            <p className="text-xs text-orange-200/80 flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5" /> Food Stalls
            </p>
            <p className="text-xl font-bold mt-1 text-orange-200">
              {foodCount}
              <span className="text-xs ml-2 text-orange-100/70">
                {statPct(foodCount, total)}%
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-3">
            <p className="text-xs text-violet-200/80 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Product Stalls
            </p>
            <p className="text-xl font-bold mt-1 text-violet-200">
              {productCount}
              <span className="text-xs ml-2 text-violet-100/70">
                {statPct(productCount, total)}%
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-200/80 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Power Needed
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-200">
              {powerCount}
              <span className="text-xs ml-2 text-emerald-100/70">
                {statPct(powerCount, total)}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, phone, email, brand, items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue placeholder="Filter by stall type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stall Types</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>

            {(search || typeFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                }}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {applications.length} submissions
          <span className="mx-2">•</span>
          Cooking on-site: {cookingCount}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/40">
        {loadError && (
          <p className="px-4 py-3 text-sm text-red-400 border-b border-red-500/20 bg-red-500/10">
            {loadError}
          </p>
        )}

        <div className="md:hidden p-3 space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-border/70 bg-background/40 p-3 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold leading-tight">{app.applicant_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(app.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    app.stall_type === "food"
                      ? "bg-orange-500/15 text-orange-300 border-orange-500/20"
                      : "bg-violet-500/15 text-violet-300 border-violet-500/20"
                  }
                >
                  {stallTypeLabel(app.stall_type)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium mt-0.5">{app.phone_number}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-muted-foreground">Members</p>
                  <p className="font-medium mt-0.5">{app.member_count}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2 col-span-2">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium mt-0.5 break-all">{app.email}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2 col-span-2">
                  <p className="text-muted-foreground">Stall/Brand</p>
                  <p className="font-medium mt-0.5">{app.stall_brand_name}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2 col-span-2">
                  <p className="text-muted-foreground">Items</p>
                  <p className="mt-0.5 text-muted-foreground leading-relaxed">
                    {app.items_to_sell}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Badge variant={app.cooking_on_site ? "default" : "secondary"}>
                  <ChefHat className="w-3 h-3 mr-1" />
                  {app.cooking_on_site ? "Cooking: Yes" : "Cooking: No"}
                </Badge>
                <Badge variant={app.power_required ? "default" : "secondary"}>
                  <Zap className="w-3 h-3 mr-1" />
                  {app.power_required ? "Power: Yes" : "Power: No"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-muted-foreground">Expected Space</p>
                  <p className="mt-0.5">{app.expected_space}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-muted-foreground">Experience</p>
                  <p className="mt-0.5 truncate">{app.previous_experience || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2 col-span-2">
                  <p className="text-muted-foreground">Special Requirements</p>
                  <p className="mt-0.5">
                    {app.special_requirements || "-"}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <a href={toTelHref(app.phone_number)}>
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                  Quick Call
                </a>
              </Button>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stall/Brand</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Cooking</TableHead>
              <TableHead>Power</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Special Requirements</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id} className="hover:bg-white/[0.03]">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(app.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{app.applicant_name}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <p>{app.phone_number}</p>
                      <p className="text-muted-foreground">{app.email}</p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 px-2.5 text-xs border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <a href={toTelHref(app.phone_number)}>
                        <PhoneCall className="w-3.5 h-3.5 mr-1" />
                        Quick Call
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        app.stall_type === "food"
                          ? "bg-orange-500/15 text-orange-300 border-orange-500/20"
                          : "bg-violet-500/15 text-violet-300 border-violet-500/20"
                      }
                    >
                      {stallTypeLabel(app.stall_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.stall_brand_name}</TableCell>
                  <TableCell className="max-w-[230px]">
                    <span className="text-xs text-muted-foreground block truncate">
                      {app.items_to_sell}
                    </span>
                  </TableCell>
                  <TableCell>{app.member_count}</TableCell>
                  <TableCell>
                    <Badge variant={app.cooking_on_site ? "default" : "secondary"}>
                      <ChefHat className="w-3 h-3 mr-1" />
                      {app.cooking_on_site ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.power_required ? "default" : "secondary"}>
                      <Zap className="w-3 h-3 mr-1" />
                      {app.power_required ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.expected_space}</TableCell>
                  <TableCell className="max-w-[180px]">
                    {app.previous_experience ? (
                      <span className="text-xs text-muted-foreground block truncate">
                        {app.previous_experience}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    {app.special_requirements ? (
                      <span className="text-xs text-muted-foreground block truncate">
                        {app.special_requirements}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <SearchX className="w-9 h-9 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No stall applications found for your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
