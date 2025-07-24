import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";
import NotificationModal from "@/components/modals/notification-modal";
import { Bell, Plus, Send, Trash2 } from "lucide-react";

export default function Notifications() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const columns = [
    { header: "Başlık", accessor: "title" },
    { header: "Mesaj", accessor: "message" },
    { header: "Tür", accessor: "type" },
    { header: "Hedef Kullanıcı", accessor: "targetUserId" },
    { header: "Durum", accessor: "isSent" },
    { header: "Oluşturulma", accessor: "createdAt" }
  ];

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="text-amber-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Bildirim Yönetimi</CardTitle>
                <p className="text-sm text-slate-500">Kullanıcılara bildirim gönderin ve yönetin</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Bildirim
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={notifications || []}
            renderCell={(item, column) => {
              if (column.accessor === "type") {
                const typeConfig = {
                  "general": { label: "Genel", color: "bg-blue-100 text-blue-800" },
                  "survey": { label: "Anket", color: "bg-green-100 text-green-800" },
                  "reward": { label: "Ödül", color: "bg-yellow-100 text-yellow-800" }
                };
                const config = typeConfig[item[column.accessor] as keyof typeof typeConfig];
                return config ? (
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "isSent") {
                return (
                  <Badge className={item[column.accessor] ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {item[column.accessor] ? "Gönderildi" : "Beklemede"}
                  </Badge>
                );
              }
              if (column.accessor === "message") {
                return (
                  <p className="max-w-xs truncate">{item[column.accessor]}</p>
                );
              }
              if (column.accessor === "createdAt") {
                return new Date(item[column.accessor]).toLocaleDateString('tr-TR');
              }
              if (column.accessor === "targetUserId") {
                return item[column.accessor] ? `Kullanıcı #${item[column.accessor]}` : "Tüm kullanıcılar";
              }
              return item[column.accessor];
            }}
            actions={(item) => [
              ...(item.isSent ? [] : [{ icon: Send, label: "Gönder", color: "text-green-600" }]),
              { icon: Trash2, label: "Sil", color: "text-red-600" }
            ]}
          />
        </CardContent>
      </Card>

      {showCreateModal && (
        <NotificationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
