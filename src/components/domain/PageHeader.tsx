import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <div className="flex flex-col gap-4 border-b bg-background px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? (
        <Button onClick={action.onClick}>
          {ActionIcon ? <ActionIcon className="size-4" /> : null}
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
