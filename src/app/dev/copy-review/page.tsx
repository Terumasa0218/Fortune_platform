import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyReviewWorkbench } from "@/components/CopyReviewWorkbench";
import { calcAllFortunes, type BirthProfileInput } from "@/lib/engines";
import { buildCopyReviewRecords } from "@/lib/readings/copy-review";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "鑑定文の確認 | Fortune Platform",
  robots: { index: false, follow: false },
};

const TARGET_DATE = "2026-07-26";

const SAMPLES: Array<{ id: string; label: string; input: BirthProfileInput }> = [
  {
    id: "tajimi-2004-male",
    label: "2004/2/18 男性・多治見・時刻あり",
    input: {
      birthDate: "2004-02-18",
      birthTime: "13:03",
      gender: "male",
      birthPlace: "岐阜県多治見市",
      latitude: 35.3328,
      longitude: 137.132,
      timezone: "Asia/Tokyo",
      confidence: { time: "exact", place: "city" },
    },
  },
  {
    id: "tokyo-1991-female",
    label: "1991/9/24 女性・東京・時刻あり",
    input: {
      birthDate: "1991-09-24",
      birthTime: "06:40",
      gender: "female",
      birthPlace: "東京都新宿区",
      latitude: 35.6938,
      longitude: 139.7034,
      timezone: "Asia/Tokyo",
      confidence: { time: "exact", place: "city" },
    },
  },
  {
    id: "date-only-1988",
    label: "1988/11/3 生年月日のみ",
    input: {
      birthDate: "1988-11-03",
      timezone: "Asia/Tokyo",
      confidence: { time: "unknown", place: "unknown" },
    },
  },
];

export default function CopyReviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.COPY_REVIEW_ENABLED !== "true") {
    notFound();
  }

  const records = SAMPLES.flatMap((sample) =>
    buildCopyReviewRecords(
      sample.id,
      sample.label,
      calcAllFortunes(sample.input, TARGET_DATE),
    ),
  );

  return <CopyReviewWorkbench records={records} />;
}
