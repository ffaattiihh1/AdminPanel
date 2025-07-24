import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/ui/stats-card";
import PerformanceChart from "@/components/charts/performance-chart";
import DataTable from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  CheckCircle, 
  Coins,
  Vote,
  UserPlus,
  Camera,
  TriangleAlert,
  FileText,
  Timer,
  Eye,
  Bell
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  completedSurveys: number;
  totalEarnings: string;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: surveys } = useQuery({
    queryKey: ["/api/surveys"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Real-time updates via WebSocket
  useWebSocket();

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  const statsCards = [
    {
      title: "Toplam Kullanıcı",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: "+12% bu ay",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600"
    },
    {
      title: "Aktif Kullanıcı", 
      value: stats?.activeUsers?.toLocaleString() || "0",
      change: "+8% bu hafta",
      changeType: "positive" as const,
      icon: UserCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      title: "Tamamlanan Anket",
      value: stats?.completedSurveys?.toLocaleString() || "0", 
      change: "-3% bu ay",
      changeType: "negative" as const,
      icon: CheckCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      title: "Toplam Kazanç",
      value: `₺${Number(stats?.totalEarnings || 0).toLocaleString()}`,
      change: "+18% bu ay",
      changeType: "positive" as const,
      icon: Coins,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    }
  ];

  const recentActivities = [
    {
      icon: Vote,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      title: "Yeni anket tamamlandı",
      description: 'Ahmet Yılmaz tarafından "Marka Tercihleri" anketi',
      time: "2 dakika önce"
    },
    {
      icon: UserPlus,
      iconBg: "bg-emerald-100", 
      iconColor: "text-emerald-600",
      title: "Yeni kullanıcı kaydı",
      description: "Zeynep Kaya sisteme katıldı",
      time: "5 dakika önce"
    },
    {
      icon: Camera,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600", 
      title: "Hikaye paylaşıldı",
      description: "Yeni ürün tanıtım hikayesi",
      time: "15 dakika önce"
    },
    {
      icon: TriangleAlert,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Anket yarıda kesildi", 
      description: 'Mehmet Demir - "Alışveriş Deneyimi"',
      time: "32 dakika önce"
    }
  ];

  const surveyColumns = [
    { header: "Anket Adı", accessor: "title" },
    { header: "Tür", accessor: "type" },
    { header: "Durum", accessor: "status" },
    { header: "Katılımcı", accessor: "currentParticipants" },
    { header: "Tamamlanan", accessor: "completedCount" },
    { header: "Başarı Oranı", accessor: "successRate" },
    { header: "Ödeme", accessor: "reward" }
  ];

  const userColumns = [
    { header: "Kullanıcı", accessor: "name" },
    { header: "Demografik", accessor: "demographic" },
    { header: "Konum", accessor: "location" },
    { header: "Aktivite", accessor: "activity" },
    { header: "Kazanç", accessor: "totalEarnings" },
    { header: "Durum", accessor: "isActive" }
  ];

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anket Performansı</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-primary-100 text-primary-700 border-primary-200">
                    7 Gün
                  </Button>
                  <Button variant="ghost" size="sm">
                    30 Gün
                  </Button>
                  <Button variant="ghost" size="sm">
                    90 Gün
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`${activity.iconColor} w-4 h-4`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.description}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary-600 hover:text-primary-700">
              Tümünü Görüntüle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Survey Management */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Anket Yönetimi</CardTitle>
            <div className="flex space-x-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Excel İndir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={surveyColumns}
            data={surveys?.surveys || []}
            renderCell={(item, column) => {
              if (column.accessor === "type") {
                const typeConfig = {
                  "link": { label: "Linkli", color: "bg-blue-100 text-blue-800", icon: "fas fa-link" },
                  "map": { label: "Haritalı", color: "bg-orange-100 text-orange-800", icon: "fas fa-map-marker-alt" },
                  "in-app": { label: "Uygulama İçi", color: "bg-purple-100 text-purple-800", icon: "fas fa-mobile-alt" }
                };
                const config = typeConfig[item[column.accessor] as keyof typeof typeConfig];
                return config ? (
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "status") {
                const statusConfig = {
                  "active": { label: "Aktif", color: "bg-green-100 text-green-800" },
                  "completed": { label: "Tamamlandı", color: "bg-gray-100 text-gray-800" },
                  "draft": { label: "Taslak", color: "bg-yellow-100 text-yellow-800" }
                };
                const config = statusConfig[item[column.accessor] as keyof typeof statusConfig];
                return config ? (
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "successRate") {
                const rate = Math.round((item.completedCount / item.currentParticipants) * 100) || 0;
                return (
                  <div className="flex items-center">
                    <Progress value={rate} className="w-16 mr-2" />
                    <span className="text-sm text-slate-600">{rate}%</span>
                  </div>
                );
              }
              if (column.accessor === "reward") {
                return `₺${Number(item[column.accessor] || 0).toLocaleString()}`;
              }
              return item[column.accessor];
            }}
          />
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kullanıcı Yönetimi</CardTitle>
            <div className="flex space-x-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Kullanıcıları İndir
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Bell className="w-4 h-4 mr-2" />
                Bildirim Gönder
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={users?.users || []}
            renderCell={(item, column) => {
              if (column.accessor === "name") {
                const initials = item.name ? item.name.split(' ').map((n: string) => n[0]).join('') : '??';
                return (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.email}</p>
                    </div>
                  </div>
                );
              }
              if (column.accessor === "demographic") {
                return (
                  <div className="text-sm">
                    <p className="text-slate-900">{item.age} yaş, {item.gender}</p>
                    <p className="text-slate-500">{item.city}</p>
                  </div>
                );
              }
              if (column.accessor === "location") {
                return (
                  <div className="text-sm">
                    <p className="text-slate-900">{item.latitude}° K, {item.longitude}° D</p>
                    <p className="text-slate-500">IP: {item.ipAddress}</p>
                  </div>
                );
              }
              if (column.accessor === "activity") {
                return (
                  <div className="text-sm">
                    <p className="text-slate-900">{item.completedSurveys} anket tamamlandı</p>
                    <p className="text-slate-500">Son giriş: {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
                  </div>
                );
              }
              if (column.accessor === "totalEarnings") {
                return `₺${Number(item[column.accessor] || 0).toLocaleString()}`;
              }
              if (column.accessor === "isActive") {
                return (
                  <Badge className={item[column.accessor] ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {item[column.accessor] ? "Aktif" : "İnaktif"}
                  </Badge>
                );
              }
              return item[column.accessor];
            }}
            actions={(item) => [
              { icon: Eye, label: "Detayları Görüntüle", color: "text-primary-600" },
              { icon: Bell, label: "Bildirim Gönder", color: "text-amber-600" },
              { icon: Timer, label: "Kullanıcıyı Sil", color: "text-red-600" }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
