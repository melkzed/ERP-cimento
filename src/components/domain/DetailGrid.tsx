import type * as React from "react";

interface DetailGridProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
  }>;
}

export function DetailGrid({ items }: DetailGridProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border bg-background p-3">
          <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
