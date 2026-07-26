"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import type { BaziTalentCopyPack, ReadingTone } from "@/lib/readings/bazi-talent-copy";
import type { BaziTalentCmsSnapshot } from "@/lib/readings/copy-cms";
import { auth, db } from "./client";

const DOCUMENT_ID = "bazi-talent-ja";

type StoredCopyDocument = {
  pack?: BaziTalentCopyPack;
  revision?: number;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;
  tone?: ReadingTone;
};

function isoDate(value: Timestamp | undefined): string | null {
  return value?.toDate().toISOString() ?? null;
}

function requireAdminUser(): User {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    throw new Error("管理者としてログインしてください。");
  }
  return user;
}

export async function signInCopyCmsAdmin(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  const admin = await getDoc(doc(db, "cmsAdmins", credential.user.uid));
  if (!admin.exists()) {
    await signOut(auth);
    throw new Error("このGoogleアカウントには文章管理の権限がありません。");
  }
  return credential.user;
}

export async function loadBaziTalentCmsSnapshot(
  fallback: BaziTalentCmsSnapshot,
): Promise<BaziTalentCmsSnapshot> {
  requireAdminUser();
  const historyQuery = query(
    collection(db, "readingCopyHistory", DOCUMENT_ID, "versions"),
    orderBy("revision", "desc"),
    limit(20),
  );
  const [draftSnap, publishedSnap, historySnap] = await Promise.all([
    getDoc(doc(db, "readingCopyDrafts", DOCUMENT_ID)),
    getDoc(doc(db, "readingCopyPublished", DOCUMENT_ID)),
    getDocs(historyQuery),
  ]);
  const draft = draftSnap.data() as StoredCopyDocument | undefined;
  const published = publishedSnap.data() as StoredCopyDocument | undefined;

  return {
    draft: draft?.pack ?? published?.pack ?? fallback.draft,
    published: published?.pack ?? fallback.published,
    draftTone: draft?.tone ?? fallback.draftTone,
    publishedTone: published?.tone ?? fallback.publishedTone,
    revision: published?.revision ?? fallback.revision,
    updatedAt: isoDate(draft?.updatedAt) ?? fallback.updatedAt,
    publishedAt: isoDate(published?.publishedAt) ?? fallback.publishedAt,
    history: historySnap.docs.flatMap((snapshot) => {
      const data = snapshot.data() as StoredCopyDocument;
      if (!data.pack || !data.revision) return [];
      return [{
        revision: data.revision,
        publishedAt: isoDate(data.publishedAt) ?? "",
        pack: data.pack,
        tone: data.tone ?? "standard",
      }];
    }),
  };
}

export async function saveBaziTalentDraft(snapshot: BaziTalentCmsSnapshot): Promise<void> {
  const user = requireAdminUser();
  await setDoc(doc(db, "readingCopyDrafts", DOCUMENT_ID), {
    pack: snapshot.draft,
    tone: snapshot.draftTone,
    revision: snapshot.revision,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  });
}

export async function publishBaziTalentCopy(snapshot: BaziTalentCmsSnapshot): Promise<void> {
  const user = requireAdminUser();
  const batch = writeBatch(db);
  const payload = {
    pack: snapshot.published,
    tone: snapshot.publishedTone,
    revision: snapshot.revision,
    publishedAt: serverTimestamp(),
    publishedBy: user.uid,
  };
  batch.set(doc(db, "readingCopyPublished", DOCUMENT_ID), payload);
  batch.set(doc(db, "readingCopyDrafts", DOCUMENT_ID), {
    pack: snapshot.draft,
    tone: snapshot.draftTone,
    revision: snapshot.revision,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  });
  batch.set(
    doc(db, "readingCopyHistory", DOCUMENT_ID, "versions", String(snapshot.revision)),
    payload,
  );
  await batch.commit();
}

export async function loadPublishedBaziTalentCopy(): Promise<{
  pack: BaziTalentCopyPack;
  tone: ReadingTone;
} | null> {
  const snapshot = await getDoc(doc(db, "readingCopyPublished", DOCUMENT_ID));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as StoredCopyDocument;
  return data.pack ? { pack: data.pack, tone: data.tone ?? "standard" } : null;
}
