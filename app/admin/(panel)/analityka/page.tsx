import { AnalyticsView } from "@/components/admin/analytics-view";
import { summarizeAnalytics } from "@/lib/analytics/store";
import { bookingReport } from "@/lib/salon/report";

export default async function AnalyticsPage() {
  const [report, traffic] = await Promise.all([bookingReport(), Promise.resolve(summarizeAnalytics())]);
  return <AnalyticsView {...report} views30={traffic.views30} />;
}
