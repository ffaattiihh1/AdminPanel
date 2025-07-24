import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "@/components/ui/data-table";
import NotificationModal from "@/components/modals/notification-modal";
import UserDetailModal from "@/components/modals/user-detail-modal";
import { Users, FileText, Bell, Eye, Timer, Filter } from "lucide-react";

export default function UsersPage() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    gender: "",
    ageRange: "",
    status: ""
  });
  
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const users = usersData?.users || [];

  const filteredUsers = users.filter((user: any) => {
    if (filters.search && !user.name?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.city && filters.city !== "all" && user.city !== filters.city) return false;
    if (filters.gender && filters.gender !== "all" && user.gender !== filters.gender) return false;
    if (filters.status === "active" && !user.isActive) return false;
    if (filters.status === "inactive" && user.isActive) return false;
    if (filters.ageRange && filters.ageRange !== "all") {
      const [min, max] = filters.ageRange.split('-').map(Number);
      if (user.age < min || user.age > max) return false;
    }
    return true;
  });

  const columns = [
    { header: "Kullanıcı", accessor: "name" },
    { header: "Demografik", accessor: "demographic" },
    { header: "Konum", accessor: "location" },
    { header: "Aktivite", accessor: "activity" },
    { header: "Kazanç", accessor: "totalEarnings" },
    { header: "Durum", accessor: "isActive" },
    { header: "İşlemler", accessor: "actions" }
  ];

  const handleUserDetail = (user: any) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/users');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kullanicilar.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="text-primary-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <p className="text-sm text-slate-500">Tüm kullanıcıları görüntüleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Kullanıcıları İndir
              </Button>
              <Button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Bildirim Gönder
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Input
                placeholder="Kullanıcı ara..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Şehir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="İstanbul">İstanbul</SelectItem>
                  <SelectItem value="Ankara">Ankara</SelectItem>
                  <SelectItem value="İzmir">İzmir</SelectItem>
                  <SelectItem value="Bursa">Bursa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Erkek">Erkek</SelectItem>
                  <SelectItem value="Kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.ageRange} onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Yaş Aralığı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-60">46-60</SelectItem>
                  <SelectItem value="60-99">60+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">İnaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            renderCell={(item, column) => {
              if (column.accessor === "name") {
                const initials = item.name ? item.name.split(' ').map((n: string) => n[0]).join('') : '??';
                const colors = [
                  'from-primary-400 to-primary-600',
                  'from-pink-400 to-pink-600',
                  'from-emerald-400 to-emerald-600',
                  'from-amber-400 to-amber-600',
                  'from-purple-400 to-purple-600',
                ];
                const colorClass = colors[item.id % colors.length];
                
                return (
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
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
                const lastLogin = item.lastLoginAt ? new Date(item.lastLoginAt) : null;
                const timeAgo = lastLogin ? getTimeAgo(lastLogin) : 'Hiç girmemiş';
                
                return (
                  <div className="text-sm">
                    <p className="text-slate-900">{item.completedSurveys} anket tamamlandı</p>
                    <p className="text-slate-500">Son giriş: {timeAgo}</p>
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
              if (column.accessor === "actions") {
                return (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserDetail(item)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                );
              }
              return item[column.accessor];
            }}
          />
        </CardContent>
      </Card>

      {showNotificationModal && (
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {showUserDetail && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
}
