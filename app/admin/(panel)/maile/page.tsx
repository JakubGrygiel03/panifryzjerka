import { MailForm } from "@/components/admin/mail-form";
import { mailTemplates } from "@/lib/booking/mail-copy";
import { readCms } from "@/lib/cms/store";

export default function MailAdminPage() {
  return <MailForm initial={mailTemplates(readCms().settings)} />;
}
