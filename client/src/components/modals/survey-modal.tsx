import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: any;
}

function LocationPicker({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return <Marker position={[lat, lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />;
}

export default function SurveyModal({ isOpen, onClose, survey }: SurveyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: survey?.title || "",
    description: survey?.description || "",
    type: survey?.type || "link",
    category: survey?.category || "",
    targetParticipants: survey?.targetParticipants || 1000,
    reward: survey?.reward || "5.00",
    duration: survey?.duration || 30,
    url: survey?.url || "",
    latitude: survey?.latitude || "",
    longitude: survey?.longitude || "",
    radius: survey?.radius || 100,
  });

  const createSurveyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/surveys", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Başarılı",
        description: "Anket başarıyla oluşturuldu",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Anket oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateSurveyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/surveys/${survey.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Başarılı",
        description: "Anket başarıyla güncellendi",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Anket güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers for validation
    const data = {
      ...formData,
      targetParticipants: parseInt(formData.targetParticipants.toString()) || 1000,
      reward: parseFloat(formData.reward.toString()) || 5.0,
      duration: parseInt(formData.duration.toString()) || 30,
      latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : undefined,
      radius: parseInt(formData.radius.toString()) || 100,
    };
    
    if (survey) {
      updateSurveyMutation.mutate(data);
    } else {
      createSurveyMutation.mutate(data);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{survey ? "Anket Düzenle" : "Yeni Anket Oluştur"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Anket Adı</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Anket adını girin"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Anket Türü</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Linkli Anket</SelectItem>
                  <SelectItem value="map">Haritalı Anket</SelectItem>
                  <SelectItem value="in-app">Uygulama İçi Anket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marka Araştırması">Marka Araştırması</SelectItem>
                  <SelectItem value="Ürün Testi">Ürün Testi</SelectItem>
                  <SelectItem value="Müşteri Memnuniyeti">Müşteri Memnuniyeti</SelectItem>
                  <SelectItem value="Pazar Araştırması">Pazar Araştırması</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Anket açıklamasını girin"
              rows={3}
            />
          </div>

          {formData.type === "link" && (
            <div>
              <Label>Anket URL'si</Label>
              <Input
                value={formData.url}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://example.com/survey"
                type="url"
              />
            </div>
          )}

          {formData.type === "map" && (
            <div className="space-y-4">
              <div>
                <Label>Harita Konumu</Label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden h-64 relative">
                  <MapContainer center={[parseFloat(formData.latitude) || 41.0082, parseFloat(formData.longitude) || 28.9784]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker
                      lat={parseFloat(formData.latitude) || 41.0082}
                      lng={parseFloat(formData.longitude) || 28.9784}
                      onChange={(lat, lng) => {
                        handleChange('latitude', lat.toString());
                        handleChange('longitude', lng.toString());
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Enlem</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    placeholder="41.0082"
                  />
                </div>
                <div>
                  <Label>Boylam</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    placeholder="28.9784"
                  />
                </div>
                <div>
                  <Label>Yarıçap (m)</Label>
                  <Input
                    type="number"
                    value={formData.radius}
                    onChange={(e) => handleChange("radius", parseInt(e.target.value))}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Hedef Katılımcı</Label>
              <Input
                type="number"
                value={formData.targetParticipants}
                onChange={(e) => handleChange("targetParticipants", parseInt(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label>Ödeme (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.reward}
                onChange={(e) => handleChange("reward", e.target.value)}
                placeholder="5.00"
              />
            </div>
            <div>
              <Label>Süre (Gün)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createSurveyMutation.isPending || updateSurveyMutation.isPending}
            >
              {survey ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
