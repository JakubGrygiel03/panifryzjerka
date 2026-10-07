import { GalleryOrder } from "@/components/admin/gallery-order";
import { MediaLibrary } from "@/components/admin/media-library";
import { galleryPhotos } from "@/lib/cms/gallery";
import { listMedia } from "@/lib/media/library";

export default async function MediaPage() {
  const items = await listMedia();
  const photos = galleryPhotos().map((photo) => ({ src: photo.src, alt: photo.alt }));
  return (
    <>
      <GalleryOrder photos={photos} />
      <MediaLibrary initial={items} />
    </>
  );
}
