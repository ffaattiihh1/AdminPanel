import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface StoreModalProps {
  store?: any;
  onClose: () => void;
}

export default function StoreModal({ store, onClose }: StoreModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: store?.name || "",
    description: store?.description || "",
    isActive: store?.isActive ?? true,
  });

  const createStoreMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/stores", "POST", data),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Mağaza oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      onClose();
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/stores/${store.id}`, "PUT", data),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Mağaza güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store) {
      updateStoreMutation.mutate(formData);
    } else {
      createStoreMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{store ? "Mağazayı Düzenle" : "Yeni Mağaza"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Mağaza Adı</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Mağaza adını girin"
              required
            />
          </div>

          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mağaza açıklaması"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Aktif Durum</Label>
              <p className="text-sm text-gray-500">Mağazanın aktif olup olmadığını belirler</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {store ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}