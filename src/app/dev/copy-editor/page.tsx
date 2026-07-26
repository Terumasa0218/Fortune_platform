import { notFound } from "next/navigation";
import { CopyEditorWorkbench } from "@/components/CopyEditorWorkbench";
import { baziTalentCopyPack } from "@/lib/readings/bazi-talent-copy";

export default function CopyEditorPage() {
  if (process.env.NODE_ENV === "production" && process.env.COPY_REVIEW_ENABLED !== "true") {
    notFound();
  }

  return <CopyEditorWorkbench initialPack={baziTalentCopyPack} />;
}
