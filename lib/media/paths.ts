export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const LIBRARY_MAX_FILES = 80;
export const LIBRARY_MAX_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1600;

export type MediaKind = "catalog" | "upload";

export type MediaRef = {
  src: string;
  bytes: number;
  kind: MediaKind;
};

export function isSalonImagePath(value: string) {
  if (!value || value.length > 120) return false;
  if (value.includes("..") || value.includes("\\") || value.includes("%") || value.includes("\0")) return false;
  return (
    /^\/salon\/[a-z0-9][a-z0-9._-]{0,80}\.(?:jpe?g|png|webp)$/i.test(value) ||
    /^\/salon\/library\/[a-f0-9]{16}\.webp$/.test(value)
  );
}
