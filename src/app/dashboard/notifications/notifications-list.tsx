"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "../actions";

export type NotifRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationsList({ items }: { items: NotifRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasUnread = items.some((i) => !i.read);

  function open(n: NotifRow) {
    startTransition(async () => {
      if (!n.read) await markNotificationRead(n.id);
      if (n.link) router.push(n.link);
      else router.refresh();
    });
  }

  function clearAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <p className="font-heading font-black text-white uppercase mb-1">All caught up</p>
        <p className="text-white/50 font-body text-sm">You have no notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={clearAll}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-ui text-white/70 hover:text-lime disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => open(n)}
            disabled={pending}
            className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/5 transition-colors disabled:opacity-60"
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-steel" : "bg-lime"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-ui ${n.read ? "text-white/70" : "text-white"}`}>{n.title}</p>
              {n.body && <p className="text-xs text-steel font-ui mt-0.5">{n.body}</p>}
            </div>
            <span className="text-[11px] text-steel font-ui whitespace-nowrap">
              {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
