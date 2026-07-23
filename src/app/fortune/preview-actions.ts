"use server";

import { calcAllFortunes, type MultiFortuneResult } from "@/lib/engines";
import type { BirthProfileInput } from "@/lib/engines/types";

export async function calculateFortunePreview(
  input: BirthProfileInput,
): Promise<MultiFortuneResult> {
  return calcAllFortunes(input);
}
