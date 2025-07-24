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

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    targetUserId: "",
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Başarılı",
        description: "Bildirim başarıyla oluşturuldu",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Bildirim oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      targetUserId: formData.targetUserId ? parseInt(formData.targetUserId) : null,
    };
    createNotificationMutation.mutate(data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Bildirim Gönder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Bildirim Başlığı</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Bildirim başlığını girin"
              required
            />
          </div>
          
          <div>
            <Label>Mesaj</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Bildirim mesajını girin"
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Bildirim Türü</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="survey">Anket</SelectItem>
                <SelectItem value="reward">Ödül</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hedef Kullanıcı ID (Boş bırakın = Tüm kullanıcılar)</Label>
            <Input
              type="number"
              value={formData.targetUserId}
              onChange={(e) => handleChange("targetUserId", e.target.value)}
              placeholder="Kullanıcı ID"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={createNotificationMutation.isPending}>
              Gönder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
