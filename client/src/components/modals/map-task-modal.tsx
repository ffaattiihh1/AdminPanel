import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapTaskModalProps {
  task?: any;
  onClose: () => void;
  isOpen?: boolean;
}

function LocationPicker({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return <Marker position={[lat, lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />;
}

export default function MapTaskModal({ task, onClose, isOpen = true }: MapTaskModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    latitude: task?.latitude || "",
    longitude: task?.longitude || "",
    radius: task?.radius || 100,
    reward: task?.reward || "10.00",
    status: task?.status || "active",
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/map-tasks", "POST", data),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Harita görevi oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/map-tasks"] });
      onClose();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/map-tasks/${task.id}`, "PUT", data),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Harita görevi güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/map-tasks"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      reward: parseFloat(formData.reward),
      radius: parseInt(formData.radius),
    };
    if (task) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Harita Görevini Düzenle" : "Yeni Harita Görevi"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Görev Adı</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Görev adını girin"
              required
            />
          </div>

          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Görev açıklaması"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Harita Konumu</Label>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-blue-200 rounded-lg overflow-hidden h-64 relative">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Enlem</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="41.0082"
                  required
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
                  required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ödül (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.reward}
                onChange={(e) => handleChange("reward", e.target.value)}
                placeholder="10.00"
              />
            </div>
            <div>
              <Label>Durum</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="paused">Duraklatıldı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {task ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}