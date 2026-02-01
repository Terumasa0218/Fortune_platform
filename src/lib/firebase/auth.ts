import { signInAnonymously } from "firebase/auth";
import { auth } from "./client";

export const ensureAnonAuth = async () => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  return auth.currentUser;
};
