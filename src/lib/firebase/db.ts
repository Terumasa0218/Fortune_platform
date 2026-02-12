import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";

export type FortunePayload = {
  type: string;
  result: string;
  version: number;
};

export type FortuneDoc = {
  id: string;
  type: string;
  result: string;
  createdAt: Timestamp | null;
};

const fortunesCollection = (uid: string) =>
  collection(db, "users", uid, "fortunes");

export async function addFortune(
  uid: string,
  payload: FortunePayload,
): Promise<void> {
  await addDoc(fortunesCollection(uid), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
