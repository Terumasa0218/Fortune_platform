import type { BaziTalentCopyPack, ReadingTone } from "./bazi-talent-copy";

export const BAZI_TALENT_CMS_STORAGE_KEY = "fortune-platform-copy-editor-bazi-talent-v1";

export type BaziTalentCmsSnapshot = {
  draft: BaziTalentCopyPack;
  published: BaziTalentCopyPack;
  draftTone: ReadingTone;
  publishedTone: ReadingTone;
  revision: number;
  updatedAt: string | null;
  publishedAt: string | null;
  history: Array<{
    revision: number;
    publishedAt: string;
    pack: BaziTalentCopyPack;
    tone: ReadingTone;
  }>;
};
