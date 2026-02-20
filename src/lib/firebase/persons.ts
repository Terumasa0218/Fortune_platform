import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type Person = {
  id: string;
  uid: string;
  name: string;
  gender?: "male" | "female" | "other";

  birthDate: string;
  birthTime?: string;

  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;

  mbti?: string;
  enneagram?: number;
  loveType?: string;

  confidence: {
    time: "unknown" | "approximate" | "exact";
    place: "unknown" | "city" | "exact";
  };

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type PersonPayload = Omit<Person, "id" | "createdAt" | "updatedAt">;

const personsCollection = (uid: string) => collection(db, "users", uid, "persons");

export async function addPerson(uid: string, payload: PersonPayload): Promise<string> {
  const docRef = await addDoc(personsCollection(uid), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribePersons(
  uid: string,
  callback: (persons: Person[]) => void,
): () => void {
  const personsQuery = query(personsCollection(uid), orderBy("createdAt", "desc"));

  return onSnapshot(personsQuery, (snapshot) => {
    const persons: Person[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: String(data.uid ?? uid),
        name: String(data.name ?? ""),
        gender: data.gender as Person["gender"],
        birthDate: String(data.birthDate ?? ""),
        birthTime: typeof data.birthTime === "string" ? data.birthTime : undefined,
        birthPlace: typeof data.birthPlace === "string" ? data.birthPlace : undefined,
        latitude: typeof data.latitude === "number" ? data.latitude : undefined,
        longitude: typeof data.longitude === "number" ? data.longitude : undefined,
        timezone: typeof data.timezone === "string" ? data.timezone : undefined,
        mbti: typeof data.mbti === "string" ? data.mbti : undefined,
        enneagram: typeof data.enneagram === "number" ? data.enneagram : undefined,
        loveType: typeof data.loveType === "string" ? data.loveType : undefined,
        confidence: {
          time:
            data.confidence?.time === "approximate" || data.confidence?.time === "exact"
              ? data.confidence.time
              : "unknown",
          place:
            data.confidence?.place === "city" || data.confidence?.place === "exact"
              ? data.confidence.place
              : "unknown",
        },
        createdAt: (data.createdAt as Timestamp | null) ?? null,
        updatedAt: (data.updatedAt as Timestamp | null) ?? null,
      };
    });

    callback(persons);
  });
}
