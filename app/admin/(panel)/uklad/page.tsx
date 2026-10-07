import { LayoutEditor } from "@/components/admin/layout-editor";
import { getHomeSections } from "@/lib/cms/sections";
import { listMedia } from "@/lib/media/library";

export default async function LayoutPage() {
  const media = await listMedia();
  return <LayoutEditor initial={getHomeSections()} media={media} />;
}
