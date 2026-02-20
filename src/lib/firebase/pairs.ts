import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { MbtiCompatibility } from "@/lib/mbti/types";
import { db } from "@/lib/firebase/client";

export type Pair = {
  id: string;
  uid: string;
  personAId: string;
  personBId: string;
  compatibility: {
    mbti?: MbtiCompatibility;
  };
  aggregatedScore?: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type PairPayload = Omit<Pair, "id" | "createdAt" | "updatedAt">;

const pairsCollection = (uid: string) => collection(db, "users", uid, "pairs");

export async function addPair(uid: string, payload: PairPayload): Promise<string> {
  const docRef = await addDoc(pairsCollection(uid), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribePairs(
  uid: string,
  callback: (pairs: Pair[]) => void,
): () => void {
  const pairsQuery = query(pairsCollection(uid), orderBy("createdAt", "desc"));

  return onSnapshot(pairsQuery, (snapshot) => {
    const pairs: Pair[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        uid: String(data.uid ?? uid),
        personAId: String(data.personAId ?? ""),
        personBId: String(data.personBId ?? ""),
        compatibility: {
          mbti: data.compatibility?.mbti as MbtiCompatibility | undefined,
        },
        aggregatedScore:
          typeof data.aggregatedScore === "number" ? data.aggregatedScore : undefined,
        createdAt: (data.createdAt as Timestamp | null) ?? null,
        updatedAt: (data.updatedAt as Timestamp | null) ?? null,
      };
    });

    callback(pairs);
  });
}
