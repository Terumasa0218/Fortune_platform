import {
  addDoc,
  collection,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type FieldValue,
} from "firebase/firestore";
import { db } from "./client";

export type ReadingPayload = {
  summary: string;
  createdAt?: FieldValue;
};

export type ReadingDoc = {
  id: string;
  summary: string;
  createdAt: Timestamp | null;
};

const readingsCollection = (uid: string) =>
  collection(db, "users", uid, "readings");

export const addReading = async (uid: string, payload: ReadingPayload) => {
  const data = {
    ...payload,
    createdAt: payload.createdAt ?? serverTimestamp(),
  };

  const docRef = await addDoc(readingsCollection(uid), data);

  return docRef.id;
};

export const listReadings = async (uid: string, max = 10) => {
  const q = query(
    readingsCollection(uid),
    orderBy("createdAt", "desc"),
    limitQuery(max),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<ReadingDoc, "id">;
    return {
      id: doc.id,
      summary: data.summary,
      createdAt: data.createdAt ?? null,
    };
  });
};
