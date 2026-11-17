
import path from "path";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getMessaging } from "firebase-admin/messaging";

const getFirebaseCredential = () => {
  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson));
  }

  // Local development fallback
  const serviceAccountPath = path.resolve(
    __dirname,
    "../../firebase/serviceAccountKey.json"
  );

  return cert(serviceAccountPath);
};

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: getFirebaseCredential(),
      });

export const firebaseMessaging = getMessaging(firebaseApp);
