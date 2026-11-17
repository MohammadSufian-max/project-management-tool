
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";
import api from "./api";

export const requestNotificationPermission = async () => {
  try {

    if (!("Notification" in window)) {
      alert("ERROR: Browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("ERROR: Notification permission not granted");
      return null;
    }

    

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      alert("ERROR: Firebase Messaging is not supported");
      return null;
    }

    

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    

    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      alert("ERROR: FCM token not generated");
      return null;
    }

    

    await api.post("/notifications/register-token", {
      token: fcmToken,
    });

    

    return fcmToken;
  } catch (error) {
    console.error("Notification registration failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    alert("NOTIFICATION ERROR: " + message);

    return null;
  }
};

export const listenForForegroundMessages = async (
  callback: (title: string, body: string) => void
) => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    callback(
      payload.notification?.title || "ProjectFlow",
      payload.notification?.body || "You have a new notification."
    );
  });
};
