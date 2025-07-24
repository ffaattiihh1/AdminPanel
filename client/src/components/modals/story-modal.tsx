import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, Image, Video, FileX, Palette, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: any;
}

const backgroundColors = [
  { name: 'Mavi', value: '#4ECDC4' },
  { name: 'Pembe', value: '#FF6B6B' },
  { name: 'Mor', value: '#9B59B6' },
  { name: 'Turuncu', value: '#E67E22' },
  { name: 'Yeşil', value: '#2ECC71' },
  { name: 'Kırmızı', value: '#E74C3C' },
  { name: 'Lacivert', value: '#3498DB' },
  { name: 'Sarı', value: '#F1C40F' },
];

export default function StoryModal({ isOpen, onClose, story }: StoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: story?.title || "",
    content: story?.content || "",
    media_url: story?.media_url || "",
    media_type: story?.media_type || "image",
    is_active: story?.is_active ?? true,
  });
  
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(story?.media_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createStoryMutation = useMutation({
    mutationFn: (data: any) => {
      if (story) {
        return apiRequest("PUT", `/api/admin/stories/${story.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/stories", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stories"] });
      toast({
        title: "Başarılı",
        description: story ? "Hikaye başarıyla güncellendi" : "Hikaye başarıyla oluşturuldu",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: story ? "Hikaye güncellenirken hata oluştu" : "Hikaye oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Hata",
        description: "Hikaye başlığı boş olamaz",
        variant: "destructive",
      });
      return;
    }
    if (!formData.media_url) {
      toast({
        title: "Hata",
        description: "Medya (resim veya video) eklemelisiniz",
        variant: "destructive",
      });
      return;
    }
    createStoryMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // File type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Hata",
        description: "Desteklenmeyen dosya türü. JPEG, PNG, GIF, MP4 veya WebM desteklenir.",
        variant: "destructive",
      });
      return;
    }

    // File size validation (5MB max for demo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 5MB'dan büyük olamaz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Convert file to data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          media_url: dataUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'image'
        }));
        setPreviewUrl(dataUrl);
        
        toast({
          title: "Başarılı",
          description: "Medya başarıyla yüklendi",
        });
        setUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Hata",
          description: "Dosya okunurken hata oluştu",
          variant: "destructive",
        });
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Hata",
        description: "Medya yüklenirken hata oluştu",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearMedia = () => {
    setFormData(prev => ({ ...prev, media_url: "" }));
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Image className="w-4 h-4 text-white" />
            </div>
            {story ? "Hikaye Düzenle" : "Yeni Hikaye Oluştur"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <Label className="text-sm font-medium">Hikaye Başlığı *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Örn: Yeni Özellikler"
              required
                className="mt-1"
            />
          </div>
          
          <div>
              <Label className="text-sm font-medium">Hikaye Metni</Label>
            <Textarea
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Hikayede görünecek metin (opsiyonel)"
              rows={3}
                className="mt-1"
            />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label className="text-sm">Aktif</Label>
            </div>

            <div>
              <Label className="text-sm font-medium">Medya</Label>
              <div className="space-y-3 mt-2">
              {/* Upload Button */}
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Yükleniyor..." : "Dosya Seç"}</span>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <span className="text-sm text-gray-500">veya</span>
                
                <Input
                  value={formData.media_url}
                    onChange={(e) => {
                      handleChange("media_url", e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  className="flex-1"
                />
              </div>

                {/* Upload Guidelines */}
                <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
                  <p>• Desteklenen formatlar: JPEG, PNG, GIF, MP4, WebM</p>
                  <p>• Maksimum dosya boyutu: 50MB</p>
                  <p>• Önerilen boyut: 1080x1920 (9:16 hikaye formatı)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={createStoryMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {createStoryMutation.isPending ? "Kaydediliyor..." : (story ? "Güncelle" : "Oluştur")}
              </Button>
            </div>
          </form>

          {/* Preview */}
          <div className="lg:border-l lg:pl-6">
            <Label className="text-sm font-medium">Önizleme</Label>
            <div className="mt-2">
              <div 
                className="w-full max-w-[200px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-blue-500 to-purple-600"
              >
                {/* Story Preview Content */}
                {(previewUrl || formData.media_url) ? (
                  <div
                    className="w-full h-full bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `url(${previewUrl || formData.media_url})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Clear media button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                    onClick={clearMedia}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-white/70 mx-auto mb-2" />
                      <p className="text-white/70 text-xs">Medya Yok</p>
                    </div>
                  </div>
                )}

                {/* Story header */}
                <div className="absolute top-3 left-3 right-3 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Image className="w-3 h-3 text-white" />
                  </div>
                  <div className="ml-2 flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {formData.title || "Hikaye Başlığı"}
                    </p>
                    <p className="text-white/80 text-[10px]">Az önce</p>
                  </div>
                </div>

                {/* Story text */}
                {formData.text && (
                  <div className="absolute bottom-8 left-3 right-3">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-white text-xs font-medium line-clamp-3">
                        {formData.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration indicator */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                    <Clock className="w-2 h-2 text-white mr-1" />
                    <span className="text-white text-[10px]">{formData.duration}s</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <Badge 
                  variant={formData.isActive ? "default" : "secondary"}
                  className={formData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                >
                  {formData.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
