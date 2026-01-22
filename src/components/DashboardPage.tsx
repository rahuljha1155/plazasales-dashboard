import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
import { Component } from "./ui/particles";

export default function DashboardPage() {
  return (
    <div className="space-y-4">

      <Component className="min-h-96 bg-black rounded-md overflow-hidden" speed={0.0002} />
      <AnalyticsDashboard />
    </div>
  );
}
