
import path from "path";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getMessaging } from "firebase-admin/messaging";

const serviceAccountPath = path.resolve(
  __dirname,
  "../../firebase/serviceAccountKey.json"
);

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccountPath),
      });

export const firebaseMessaging = getMessaging(firebaseApp);
