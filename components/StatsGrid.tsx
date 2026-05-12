import { Card } from "@/components/ui";

export function StatsGrid({
  items
}: {
  items: Array<{ label: string; value: string | number; hint?: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="space-y-2">
          <div className="text-sm text-slate-500">{item.label}</div>
          <div className="text-3xl font-semibold">{item.value}</div>
          {item.hint ? <div className="text-xs text-slate-500">{item.hint}</div> : null}
        </Card>
      ))}
    </div>
  );
}
