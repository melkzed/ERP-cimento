import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex min-h-56 items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      Carregando dados...
    </div>
  );
}
