import { MediaLibrary } from "@/components/admin/media-library";
import { listMedia } from "@/lib/media/library";

export default async function MediaPage() {
  const items = await listMedia();
  return <MediaLibrary initial={items} />;
}
