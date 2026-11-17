
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";
import api from "./api";

export const requestNotificationPermission = async () => {
  try {
    alert("1. Notification registration started");

    if (!("Notification" in window)) {
      alert("ERROR: Browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("ERROR: Notification permission not granted");
      return null;
    }

    alert("2. Notification permission granted");

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      alert("ERROR: Firebase Messaging is not supported");
      return null;
    }

    alert("3. Firebase Messaging initialized");

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    alert("4. Service worker registered");

    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      alert("ERROR: FCM token not generated");
      return null;
    }

    alert("5. FCM token generated");

    await api.post("/notifications/register-token", {
      token: fcmToken,
    });

    alert("6. FCM token registered successfully");

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
