import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  action?: { label: string; to: string };
  children?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-2 md:mb-14 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-light tracking-tight md:text-4xl">{title}</h2>
        {children && <p className="mt-3 max-w-lg text-sm text-muted-foreground">{children}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] hover:text-muted-foreground transition-colors"
        >
          {action.label}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
