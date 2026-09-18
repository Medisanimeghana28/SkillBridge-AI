import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { cn } from "@/utils/cn";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell({ className }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = async () => {
    if (!user) return;
    try {
      const [list, count] = await Promise.all([
        notificationService.list(user.id),
        notificationService.unreadCount(user.id),
      ]);
      setItems(list);
      setUnread(count);
    } catch {
      // Non-fatal: bell stays quiet.
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [user]);

  const openPanel = async () => {
    const next = !open;
    setOpen(next);
    if (next) refresh();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllRead(user.id);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        aria-label="Notifications"
        className={cn(
          "p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800",
          className
        )}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h4>
              {unread > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || "#"}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      !n.read && "bg-primary-50/50 dark:bg-primary-900/10"
                    )}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                    {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
