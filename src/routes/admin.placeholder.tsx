// Placeholder pages for admin routes that will be built out post-MVP.
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <AdminShell title={title}>
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{description}</p>
        <p className="mt-4 text-xs uppercase tracking-widest text-neutral-400">Em breve</p>
      </div>
    </AdminShell>
  );
}

// This file itself is not a route — silence tanstack by exporting a dummy Route
// only if imported by the generator. It won't be, because filename lacks matching.
export const Route = createFileRoute as unknown as never;
