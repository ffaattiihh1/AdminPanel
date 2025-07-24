import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Edit, Save, X } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  name: string;
  age?: number;
  gender?: string;
  city?: string;
  total_earnings?: number;
  completed_surveys?: number;
  last_login_at?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini al
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        username: parsedUser.username || "",
      });
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        toast({
          title: "Profil Güncellendi",
          description: "Bilgileriniz başarıyla güncellendi.",
        });
      } else {
        throw new Error("Güncelleme başarısız");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">Kullanıcı bilgileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profil Başlığı */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        )}
      </div>

      {/* Ana Profil Kartı - Mavi Alan */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-white/20 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/80">İsim Soyisim</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="İsim Soyisim"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-white/80">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="Kullanıcı adı"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email" className="text-white/80">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="E-posta adresi"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">{user.name}</h2>
                  <div className="flex items-center space-x-4 text-white/80">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      @{user.username}
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {user.email}
                    </div>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSave} variant="secondary" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <X className="mr-2 h-4 w-4" />
                    İptal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Kazanç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{user.total_earnings?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tamamlanan Anketler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {user.completed_surveys || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Üyelik Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Aktif
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Hesap Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Bilgileri</CardTitle>
          <CardDescription>
            Hesabınızla ilgili detaylı bilgiler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Kullanıcı ID</Label>
              <p className="text-sm text-gray-900">#{user.id}</p>
            </div>
            {user.city && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Şehir</Label>
                <p className="text-sm text-gray-900">{user.city}</p>
              </div>
            )}
            {user.age && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Yaş</Label>
                <p className="text-sm text-gray-900">{user.age}</p>
              </div>
            )}
            {user.gender && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Cinsiyet</Label>
                <p className="text-sm text-gray-900">{user.gender}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Kayıt Tarihi</Label>
              <p className="text-sm text-gray-900">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Son Giriş</Label>
              <p className="text-sm text-gray-900">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
