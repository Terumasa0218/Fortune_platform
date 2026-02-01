"use client";

import { signInAnonymously, type User } from "firebase/auth";
import { auth } from "./client";

export async function ensureAnonAuth(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;

  const cred = await signInAnonymously(auth);
  return cred.user;
}
