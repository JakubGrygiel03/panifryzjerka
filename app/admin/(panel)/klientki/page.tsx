import { ClientsView } from "@/components/admin/clients-view";
import { clientCards } from "@/lib/salon/report";

export default async function ClientsPage() {
  return <ClientsView clients={await clientCards()} />;
}
