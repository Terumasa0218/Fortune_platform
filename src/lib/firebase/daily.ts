import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type TarotCard = {
  id: number;
  name: string;
  reversed: boolean;
};

export type OmikujiResult =
  | "大吉"
  | "中吉"
  | "小吉"
  | "吉"
  | "末吉"
  | "凶"
  | "大凶";

export type DailyFortune = {
  id: string;
  uid: string;
  date: string;
  tarot?: TarotCard;
  horoscope?: string;
  omikuji?: OmikujiResult;
  createdAt: Timestamp;
};

const dailyFortunesCollection = collection(db, "dailyFortunes");

function toDocId(uid: string, date: string): string {
  return `${uid}__${date}`;
}

function mapDailyFortune(id: string, data: Record<string, unknown>): DailyFortune {
  return {
    id,
    uid: String(data.uid ?? ""),
    date: String(data.date ?? ""),
    tarot:
      typeof data.tarot === "object" && data.tarot !== null
        ? {
            id: Number((data.tarot as { id?: unknown }).id ?? 0),
            name: String((data.tarot as { name?: unknown }).name ?? ""),
            reversed: Boolean((data.tarot as { reversed?: unknown }).reversed),
          }
        : undefined,
    horoscope: typeof data.horoscope === "string" ? data.horoscope : undefined,
    omikuji: typeof data.omikuji === "string" ? (data.omikuji as OmikujiResult) : undefined,
    createdAt: (data.createdAt as Timestamp | undefined) ?? Timestamp.now(),
  };
}

export async function getDailyFortune(
  uid: string,
  date: string,
): Promise<DailyFortune | null> {
  const dailyDocRef = doc(db, "dailyFortunes", toDocId(uid, date));
  const snapshot = await getDoc(dailyDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapDailyFortune(snapshot.id, snapshot.data());
}

export async function saveDailyFortune(
  uid: string,
  date: string,
  data: Partial<Pick<DailyFortune, "tarot" | "horoscope" | "omikuji">>,
): Promise<void> {
  const dailyDocRef = doc(db, "dailyFortunes", toDocId(uid, date));
  const existing = await getDoc(dailyDocRef);

  await setDoc(
    dailyDocRef,
    {
      uid,
      date,
      ...data,
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function listDailyFortunes(uid: string): Promise<DailyFortune[]> {
  const dailyQuery = query(
    dailyFortunesCollection,
    where("uid", "==", uid),
    orderBy("date", "desc"),
    limit(30),
  );

  const snapshot = await getDocs(dailyQuery);
  return snapshot.docs.map((docSnap) =>
    mapDailyFortune(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}
