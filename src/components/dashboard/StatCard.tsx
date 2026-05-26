import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, percent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  trend?: number;
  onClick?: () => void;
}

export function StatCard({ label, value, helper, icon: Icon, trend, onClick }: StatCardProps) {
  const TrendIcon = trend && trend < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-left", onClick && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
    >
      <Card className="h-full transition hover:border-primary/40 hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
              <Icon className="size-5" />
            </div>
          </div>
          {typeof trend === "number" ? (
            <div
              className={cn(
                "mt-4 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                trend >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              <TrendIcon className="size-3.5" />
              {percent(Math.abs(trend))} vs. periodo anterior
            </div>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}
