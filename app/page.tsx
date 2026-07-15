import { Dashboard } from "@/components/Dashboard";
import { buildMockDashboard } from "@/lib/mock-data";

export default function Home() {
  const initialData = buildMockDashboard();
  return <Dashboard initialData={initialData} />;
}
