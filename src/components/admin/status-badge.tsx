const MAP: Record<string, string> = {
  // booking statuses
  pending: "bg-yellow-400/10 text-yellow-300",
  confirmed: "bg-lime/10 text-lime",
  completed: "bg-green-400/10 text-green-300",
  cancelled: "bg-red-400/10 text-red-300",
  refunded: "bg-white/10 text-white/60",
  // lead statuses
  new: "bg-blue-400/10 text-blue-300",
  contacted: "bg-yellow-400/10 text-yellow-300",
  qualified: "bg-lime/10 text-lime",
  converted: "bg-green-400/10 text-green-300",
  lost: "bg-red-400/10 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? "bg-white/10 text-white/60";
  return (
    <span
      className={`inline-block text-xs font-ui uppercase tracking-wide px-2 py-0.5 rounded ${cls}`}
    >
      {status}
    </span>
  );
}
