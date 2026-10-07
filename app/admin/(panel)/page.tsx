import { AdminHome } from "@/components/admin/admin-home";
import { getFaqItems } from "@/lib/cms/store";
import { getSalonContent } from "@/lib/content/get-salon-content";
import { homePulse } from "@/lib/salon/report";

export default async function AdminHomePage() {
  const [content, pulse] = await Promise.all([getSalonContent(), homePulse()]);
  return (
    <AdminHome
      services={content.services.length}
      reviews={content.reviews.length}
      questions={getFaqItems().length}
      today={pulse.today}
      waiting={pulse.waiting}
    />
  );
}
