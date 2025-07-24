import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";
import AdminUserModal from "@/components/modals/admin-user-modal";
import { Shield, Plus, Edit, Trash2, Key, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminManagementPage() {
  const { toast } = useToast();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  const { data: adminUsersData, isLoading } = useQuery({
    queryKey: ["/api/admin-users"],
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin-users/${id}`),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Admin kullanıcı silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-users"] });
    },
  });

  const adminUsers = adminUsersData || [];

  const adminColumns = [
    { header: "Kullanıcı", accessor: "name" },
    { header: "E-posta", accessor: "email" },
    { header: "Rol", accessor: "role" },
    { header: "Yetkiler", accessor: "permissions" },
    { header: "Durum", accessor: "isActive" },
    { header: "Son Giriş", accessor: "lastLogin" },
    { header: "İşlemler", accessor: "actions" }
  ];

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = (id: number) => {
    if (confirm('Bu admin kullanıcıyı silmek istediğinizden emin misiniz?')) {
      deleteAdminMutation.mutate(id);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "customer_rep":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Tam Yönetici";
      case "customer_rep":
        return "Müşteri Temsilcisi";
      default:
        return role;
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
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Admin Yönetimi</CardTitle>
                <p className="text-sm text-slate-500">Panel yöneticilerini ve yetkilerini yönetin</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setEditingAdmin(null);
                setShowAdminModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Admin Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {adminUsers && adminUsers.length > 0 ? (
            <DataTable
              columns={adminColumns}
              data={adminUsers}
              renderCell={(item, column) => {
                if (column.accessor === "name") {
                  return (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                        <Shield className="text-white w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">ID: {item.id}</p>
                      </div>
                    </div>
                  );
                }
                if (column.accessor === "role") {
                  return (
                    <Badge className={getRoleColor(item.role)}>
                      {getRoleText(item.role)}
                    </Badge>
                  );
                }
                if (column.accessor === "permissions") {
                  const permissions = Array.isArray(item.permissions) ? item.permissions : [];
                  return (
                    <div className="flex flex-wrap gap-1">
                      {permissions.slice(0, 3).map((permission: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{permissions.length - 3} daha
                        </Badge>
                      )}
                    </div>
                  );
                }
                if (column.accessor === "isActive") {
                  return (
                    <Badge className={item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {item.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  );
                }
                if (column.accessor === "lastLogin") {
                  return (
                    <div className="text-sm text-slate-600">
                      {item.lastLogin 
                        ? new Date(item.lastLogin).toLocaleDateString('tr-TR')
                        : "Hiç giriş yapmamış"
                      }
                    </div>
                  );
                }
                if (column.accessor === "actions") {
                  return (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAdmin(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAdmin(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                }
                return item[column.accessor];
              }}
            />
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz admin kullanıcı yok</h3>
              <p className="text-slate-500 mb-6">İlk admin kullanıcınızı ekleyerek başlayın</p>
              <Button 
                onClick={() => {
                  setEditingAdmin(null);
                  setShowAdminModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk Admin'i Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rol Açıklamaları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-red-600" />
              <span>Tam Yönetici</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Tüm sayfalara erişim</li>
              <li>• Kullanıcı ekleme/düzenleme/silme</li>
              <li>• Anket oluşturma ve yönetimi</li>
              <li>• Mağaza ve ürün yönetimi</li>
              <li>• Admin kullanıcı yönetimi</li>
              <li>• Sistem ayarları</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Müşteri Temsilcisi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Sadece istatistik sayfalarına erişim</li>
              <li>• Anket sonuçlarını görüntüleme</li>
              <li>• Demografik analiz verilerine erişim</li>
              <li>• SPSS benzeri rapor alma</li>
              <li>• Yaş, cinsiyet, şehir dağılımları</li>
              <li>• Veri düzenleme yetkisi YOK</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {showAdminModal && (
        <AdminUserModal
          isOpen={showAdminModal}
          onClose={() => {
            setShowAdminModal(false);
            setEditingAdmin(null);
          }}
          adminUser={editingAdmin}
        />
      )}
    </div>
  );
}