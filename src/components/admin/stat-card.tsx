import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-ui uppercase tracking-widest text-steel">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${accent ? "text-lime" : "text-steel"}`} />}
      </div>
      <p className="font-heading font-black text-3xl text-white">{value}</p>
      {sub && <p className="text-xs text-steel font-ui mt-1">{sub}</p>}
    </div>
  );
}
