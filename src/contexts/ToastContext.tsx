import * as React from "react";
import { CheckCircle2, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success";
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((nextToast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...nextToast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-lg border bg-card p-4 text-sm shadow-soft",
              item.variant === "success" && "border-emerald-200"
            )}
          >
            <div className="flex items-start gap-3">
              {item.variant === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              ) : (
                <Info className="mt-0.5 size-4 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() =>
                  setToasts((current) => current.filter((toast) => toast.id !== item.id))
                }
                aria-label="Fechar notificacao"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
