import type { SegmentConfig } from "@system/entry/auxiliary/auxiliary";
import { SEGMENT_ID } from "./identity";
import { View } from "./View";

export const config = {
  id: SEGMENT_ID,
  view: View,
  name: "backlink",
} satisfies SegmentConfig;
