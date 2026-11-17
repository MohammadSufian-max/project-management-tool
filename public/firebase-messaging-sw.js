
importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAsapNu297Ri7xk-tGh4IpLwzuR8OU22_0",
  authDomain: "projectflow-16b6f.firebaseapp.com",
  projectId: "projectflow-16b6f",
  storageBucket: "projectflow-16b6f.firebasestorage.app",
  messagingSenderId: "1063998497528",
  appId: "1:1063998497528:web:90ed728e79ebd214e4510d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || "ProjectFlow";

  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification.",
    icon: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/dashboard")
  );
});
