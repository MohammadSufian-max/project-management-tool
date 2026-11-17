
import {
  getToken,
  onMessage,
  deleteToken,
} from "firebase/messaging";

import { getFirebaseMessaging } from "../lib/firebase";
import api from "./api";

export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.error("Browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.error("Notification permission not granted");
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.error("Firebase Messaging is not supported");
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
      console.error("FCM token not generated");
      return null;
    }

    await api.post("/notifications/register-token", {
      token: fcmToken,
    });

    // Store this origin's FCM token for logout
    localStorage.setItem("pmt-fcm-token", fcmToken);

    return fcmToken;
  } catch (error) {
    console.error("Notification registration failed:", error);
    return null;
  }
};

// Unregister current browser's FCM token
export const unregisterNotificationToken = async () => {
  try {
    const messaging = await getFirebaseMessaging();

    if (!messaging) return;

    const registration =
      await navigator.serviceWorker.getRegistration("/");

    if (!registration) return;

    const fcmToken =
      localStorage.getItem("pmt-fcm-token") ||
      await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

    if (fcmToken) {
      // Remove token from backend before clearing authentication
      await api.delete("/notifications/unregister-token", {
        data: { token: fcmToken },
      });

      localStorage.removeItem("pmt-fcm-token");
    }

    // Remove token from Firebase
    await deleteToken(messaging);

    console.log("Notification token unregistered successfully");
  } catch (error) {
    console.error("Notification token unregistration failed:", error);
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
