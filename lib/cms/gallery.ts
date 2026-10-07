import { salonGallery, type SalonPhoto } from "@/lib/content/gallery";
import { readCms } from "@/lib/cms/store";

export function galleryCatalog(): SalonPhoto[] {
  return salonGallery.filter((photo) => photo.src !== "/salon/biz-05.jpg");
}

export function galleryPhotos(): SalonPhoto[] {
  const catalog = galleryCatalog();
  const saved = readCms().galleryOrder ?? [];
  const rank = new Map(saved.map((src, index) => [src, index]));
  return [...catalog].sort((left, right) => {
    const leftRank = rank.get(left.src);
    const rightRank = rank.get(right.src);
    if (leftRank == null && rightRank == null) return 0;
    if (leftRank == null) return 1;
    if (rightRank == null) return -1;
    return leftRank - rightRank;
  });
}
