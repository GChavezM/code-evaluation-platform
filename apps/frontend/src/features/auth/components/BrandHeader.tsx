import { ShieldCheck } from 'lucide-react';

export function BrandHeader() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="size-6" />
      </div>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          G-Shield Code
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Secure code evaluation platform</p>
      </div>
    </div>
  );
}
