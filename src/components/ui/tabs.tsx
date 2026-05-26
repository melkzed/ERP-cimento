import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultValue?: string;
}

export function Tabs({ tabs, defaultValue }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue ?? tabs[0]?.value);
  const current = tabs.find((tab) => tab.value === active) ?? tabs[0];

  return (
    <div className="space-y-4">
      <div className="scrollbar-thin flex gap-1 overflow-x-auto rounded-md border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActive(tab.value)}
            className={cn(
              "h-9 shrink-0 rounded-sm px-3 text-sm font-medium text-muted-foreground transition",
              active === tab.value && "bg-background text-foreground shadow-sm"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
