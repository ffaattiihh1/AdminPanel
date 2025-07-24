import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Eye, EyeOff } from "lucide-react";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser?: any;
}

const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Kullanıcı Yönetimi" },
  { id: "surveys", label: "Anket Yönetimi" },
  { id: "stories", label: "Story Yönetimi" },
  { id: "map-tasks", label: "Harita Görevleri" },
  { id: "notifications", label: "Bildirimler" },
  { id: "store", label: "Mağaza Yönetimi" },
  { id: "analytics", label: "İstatistikler" },
  { id: "settings", label: "Ayarlar" },
  { id: "admin-management", label: "Admin Yönetimi" },
];

export default function AdminUserModal({ isOpen, onClose, adminUser }: AdminUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: adminUser?.name || "",
    email: adminUser?.email || "",
    password: "",
    role: adminUser?.role || "customer_rep",
    permissions: adminUser?.permissions || [],
    isActive: adminUser?.isActive !== undefined ? adminUser.isActive : true,
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => adminUser 
      ? apiRequest("PUT", `/api/admin-users/${adminUser.id}`, data)
      : apiRequest("POST", "/api/admin-users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-users"] });
      toast({
        title: "Başarılı",
        description: adminUser ? "Admin kullanıcı güncellendi" : "Admin kullanıcı oluşturuldu",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: adminUser ? "Admin kullanıcı güncellenirken hata oluştu" : "Admin kullanıcı oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Şifre validasyonu
    if (!adminUser && !formData.password) {
      toast({
        title: "Hata",
        description: "Şifre alanı zorunludur",
        variant: "destructive",
      });
      return;
    }

    const data = { ...formData };
    
    // Güncelleme durumunda şifre boşsa kaldır
    if (adminUser && !formData.password) {
      delete data.password;
    }

    createAdminMutation.mutate(data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p: string) => p !== permission)
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Rol değiştiğinde varsayılan yetkileri ayarla
      permissions: role === "admin" 
        ? availablePermissions.map(p => p.id)
        : ["analytics"]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{adminUser ? "Admin Düzenle" : "Yeni Admin Ekle"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ad soyad girin"
                required
              />
            </div>
            
            <div>
              <Label>E-posta</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label>Şifre {adminUser && "(Boş bırakırsanız değişmez)"}</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={adminUser ? "Yeni şifre (opsiyonel)" : "Şifre girin"}
                required={!adminUser}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label>Rol</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Tam Yönetici</SelectItem>
                <SelectItem value="customer_rep">Müşteri Temsilcisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Yetkiler</Label>
            <div className="grid grid-cols-2 gap-3 mt-2 p-4 border rounded-lg">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                    disabled={formData.role === "customer_rep" && permission.id !== "analytics"}
                  />
                  <Label 
                    htmlFor={permission.id} 
                    className={`text-sm ${
                      formData.role === "customer_rep" && permission.id !== "analytics" 
                        ? "text-gray-400" 
                        : ""
                    }`}
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.role === "customer_rep" && (
              <p className="text-xs text-amber-600 mt-2">
                Müşteri temsilcileri sadece istatistik sayfalarına erişebilir
              </p>
            )}
          </div>

          <div>
            <Label>Durum</Label>
            <Select 
              value={formData.isActive ? "active" : "inactive"} 
              onValueChange={(value) => handleChange("isActive", value === "active")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createAdminMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {createAdminMutation.isPending 
                ? (adminUser ? "Güncelleniyor..." : "Oluşturuluyor...") 
                : (adminUser ? "Güncelle" : "Oluştur")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}