import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
  iconColor
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className={`text-sm font-medium ${
              changeType === "positive" ? "text-emerald-600" : "text-red-600"
            }`}>
              <i className={`fas fa-arrow-${changeType === "positive" ? "up" : "down"} mr-1`}></i>
              {change}
            </p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} w-6 h-6`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
