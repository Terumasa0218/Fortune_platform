import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import type { WesternReading } from "@/lib/astro/types";

export type Fortune = {
  id: string;
  uid: string;
  personId: string;
  western?: WesternReading;
  personality: string;
  talent: string;
  destiny: string;
  loveStyle: string;
  createdAt: Timestamp;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const fortunesCollection = collection(db, "fortunes");

export async function saveFortune(uid: string, personId: string, western: WesternReading): Promise<string> {
  const docRef = await addDoc(fortunesCollection, {
    uid,
    personId,
    western,
    personality: western.personality,
    talent: western.talent,
    destiny: western.destiny,
    loveStyle: western.loveStyle,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function listFortunes(uid: string, personId: string): Promise<Fortune[]> {
  const q = query(
    fortunesCollection,
    where("uid", "==", uid),
    where("personId", "==", personId),
    orderBy("createdAt", "desc"),
    limit(20),
  );

  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      uid: String(data.uid ?? ""),
      personId: String(data.personId ?? ""),
      western: data.western as WesternReading | undefined,
      personality: String(data.personality ?? ""),
      talent: String(data.talent ?? ""),
      destiny: String(data.destiny ?? ""),
      loveStyle: String(data.loveStyle ?? ""),
      createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    };
  });
}

export async function getFortune(id: string): Promise<Fortune | null> {
  const snap = await getDoc(doc(db, "fortunes", id));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    uid: String(data.uid ?? ""),
    personId: String(data.personId ?? ""),
    western: data.western as WesternReading | undefined,
    personality: String(data.personality ?? ""),
    talent: String(data.talent ?? ""),
    destiny: String(data.destiny ?? ""),
    loveStyle: String(data.loveStyle ?? ""),
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
  };
}
