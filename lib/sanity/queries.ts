export const salonContentQuery = `{
  "settings": *[_type == "salonSettings"][0]{
    phone,
    address,
    city,
    postalCode,
    mapsUrl,
    noticeEnabled,
    noticeText,
    openingHours[]{ day, hours },
    googleRating,
    googleReviewCount,
    googleReviewsUrl
  },
  "services": *[_type == "serviceItem"] | order(name asc) {
    "id": bookingGroupId,
    name,
    category,
    highlight,
    staffIds,
    variants[]{
      "id": bookingServiceId,
      hairLength,
      label,
      durationMinutes,
      priceCents,
      bufferMinutes
    }
  },
  "transformations": *[_type == "transformation"] | order(_createdAt desc) {
    "id": _id,
    title,
    category,
    tag,
    "before": before.asset->url,
    "after": after.asset->url
  },
  "team": *[_type == "teamMember"] | order(order asc) {
    "id": _id,
    name,
    role,
    bio,
    specialties,
    "photo": photo.asset->url
  }
}`;
