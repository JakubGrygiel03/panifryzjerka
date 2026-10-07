import { ReviewsForm } from "@/components/admin/reviews-form";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function ReviewsPage() {
  const content = await getSalonContent();
  return <ReviewsForm reviews={content.reviews} />;
}
