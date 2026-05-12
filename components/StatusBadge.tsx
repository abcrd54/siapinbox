import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-700",
  blocked: "bg-rose-100 text-rose-700",
  unread: "bg-amber-100 text-amber-700",
  read: "bg-slate-200 text-slate-700",
  archived: "bg-zinc-200 text-zinc-700",
  spam: "bg-rose-100 text-rose-700",
  follow_up: "bg-sky-100 text-sky-700",
  done: "bg-emerald-100 text-emerald-700",
  revoked: "bg-rose-100 text-rose-700"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        variants[value] || "bg-slate-100 text-slate-700"
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
