import { SettingsForm } from "@/components/admin/settings-form";
import { getSalonContent } from "@/lib/content/get-salon-content";

export default async function SettingsPage() {
  const { settings } = await getSalonContent();
  return (
    <SettingsForm
      phone={settings.phone}
      noticeText={settings.noticeText}
      noticeTextRu={settings.noticeTextRu}
      noticeEnabled={settings.noticeEnabled}
      googleRating={settings.googleRating}
      googleReviewCount={settings.googleReviewCount}
      openingHours={settings.openingHours}
    />
  );
}
