import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, Mail, Calendar, Phone, Award, Activity, Clock, DollarSign } from "lucide-react";

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : '??';
  
  const getTimeAgo = (date: string | Date) => {
    if (!date) return 'Hiç girmemiş';
    const now = new Date();
    const loginDate = new Date(date);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} gün önce`;
    if (diffHours > 0) return `${diffHours} saat önce`;
    return 'Az önce';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kullanıcı Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
                  <p className="text-gray-500 mb-2">{user.email}</p>
                  <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {user.isActive ? "Aktif" : "İnaktif"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Demografik Bilgiler</p>
                      <p className="text-sm text-gray-500">{user.age} yaş, {user.gender}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Konum</p>
                      <p className="text-sm text-gray-500">{user.city}</p>
                      <p className="text-xs text-gray-400">{user.latitude}°, {user.longitude}°</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Kayıt Tarihi</p>
                      <p className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Son Giriş</p>
                      <p className="text-sm text-gray-500">{getTimeAgo(user.lastLoginAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Award className="w-4 h-4 mr-2 text-blue-600" />
                    Toplam Kazanç
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ₺{Number(user.totalEarnings || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-green-600" />
                    Tamamlanan Anketler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {user.completedSurveys || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivite Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hesap oluşturuldu</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Son giriş</p>
                          <p className="text-xs text-gray-500">
                            {new Date(user.lastLoginAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.completedSurveys > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.completedSurveys} anket tamamlandı</p>
                          <p className="text-xs text-gray-500">
                            ₺{Number(user.totalEarnings || 0).toLocaleString()} kazanıldı
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Teknik Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">IP Adresi</p>
                    <p className="text-sm text-gray-500">{user.ipAddress || 'Bilinmiyor'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kullanıcı ID</p>
                    <p className="text-sm text-gray-500">#{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Konum Koordinatları</p>
                    <p className="text-sm text-gray-500">
                      {user.latitude && user.longitude ? 
                        `${parseFloat(user.latitude).toFixed(4)}, ${parseFloat(user.longitude).toFixed(4)}` : 
                        'Belirlenmemiş'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hesap Durumu</p>
                    <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {user.isActive ? "Aktif" : "İnaktif"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Bildirim Gönder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}