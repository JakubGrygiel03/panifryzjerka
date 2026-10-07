import { WaitlistView } from "@/components/admin/waitlist-view";
import { listWait } from "@/lib/salon/desk";

export default async function WaitlistPage() {
  return <WaitlistView rows={await listWait()} />;
}
