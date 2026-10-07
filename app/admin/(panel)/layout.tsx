import type { ReactNode } from "react";
import { assertAdmin } from "@/lib/cms/guard";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await assertAdmin();
  return children;
}
