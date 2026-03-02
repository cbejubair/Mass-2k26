"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  CreditCard,
  Drama,
  Ticket,
  Users,
  Clock,
  ScanLine,
  DollarSign,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  color?: "indigo" | "green" | "amber" | "red" | "purple";
}

const colorMap: Record<string, string> = {
  indigo: "text-indigo-400",
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
  purple: "text-purple-400",
};

const iconMap: Record<string, LucideIcon> = {
  "📋": ClipboardList,
  "💳": CreditCard,
  "🎭": Drama,
  "🎫": Ticket,
  "👥": Users,
  "⏳": Clock,
  "📱": ScanLine,
  "💰": DollarSign,
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
}: StatCardProps) {
  const Icon = iconMap[icon];
  const accent = colorMap[color] || colorMap.indigo;

  return (
    <Card className="transition-transform hover:scale-[1.02]">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {title}
            </p>
            <p className={`text-xl sm:text-3xl font-bold mt-1 ${accent}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {Icon ? (
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${accent}`} />
          ) : (
            <span className="text-xl sm:text-2xl shrink-0">{icon}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
