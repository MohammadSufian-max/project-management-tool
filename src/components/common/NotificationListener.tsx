
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { listenForForegroundMessages } from "../../services/notificationService";

export default function NotificationListener() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const setupListener = async () => {
      const cleanup = await listenForForegroundMessages((title, body) => {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/favicon.ico",
          });
        }
      });

      if (cancelled) {
        cleanup?.();
      } else {
        unsubscribe = cleanup;
      }
    };

    setupListener();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id]);

  return null;
}
