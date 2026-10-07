import { FaqForm } from "@/components/admin/faq-form";
import { getFaqItems } from "@/lib/cms/store";

export default function FaqAdminPage() {
  return <FaqForm items={getFaqItems()} />;
}
