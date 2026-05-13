import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
  unread: "border-amber-200 bg-amber-50 text-amber-700",
  read: "border-slate-200 bg-slate-50 text-slate-700",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-700",
  spam: "border-rose-200 bg-rose-50 text-rose-700",
  follow_up: "border-sky-200 bg-sky-50 text-sky-700",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  revoked: "border-rose-200 bg-rose-50 text-rose-700"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize",
        variants[value] || "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
