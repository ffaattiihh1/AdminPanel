import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "Giyim",
    price: product?.price || "",
    rewardPoints: product?.rewardPoints || "",
    stock: product?.stock || "",
    imageUrl: product?.imageUrl || "",
    isActive: product?.isActive !== undefined ? product.isActive : true,
  });
  
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || "");
  const [variants, setVariants] = useState(product?.variants || [{ size: '', color: '', stock: 0 }]);

  const createProductMutation = useMutation({
    mutationFn: (data: any) => product 
      ? apiRequest("PUT", `/api/products/${product.id}`, data)
      : apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Başarılı",
        description: product ? "Ürün güncellendi" : "Ürün oluşturuldu",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: product ? "Ürün güncellenirken hata oluştu" : "Ürün oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      rewardPoints: parseInt(formData.rewardPoints) || 0,
      stock: parseInt(formData.stock) || 0,
      variants,
      isActive: formData.isActive,
    };
    createProductMutation.mutate(data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Hata",
        description: "Sadece JPEG, PNG ve GIF formatları desteklenir.",
        variant: "destructive",
      });
      return;
    }

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
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      setPreviewUrl(result.url);
      
      toast({
        title: "Başarılı",
        description: "Görsel başarıyla yüklendi",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Hata",
        description: "Görsel yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ürün Adı</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ürün adını girin"
                required
              />
            </div>
            
            <div>
              <Label>Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Giyim">Giyim</SelectItem>
                  <SelectItem value="Hediye Kartı">Hediye Kartı</SelectItem>
                  <SelectItem value="Aksesuar">Aksesuar</SelectItem>
                  <SelectItem value="Dijital">Dijital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Ürün açıklamasını girin"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Fiyat (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label>Ödül Puanı</Label>
              <Input
                type="number"
                value={formData.rewardPoints}
                onChange={(e) => handleChange("rewardPoints", e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Stok Adedi</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label>Varyantlar (Beden/Renk/Stok)</Label>
            {variants.map((variant, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  placeholder="Beden (örn: S, M, L)"
                  value={variant.size}
                  onChange={e => handleVariantChange(i, 'size', e.target.value)}
                  className="w-1/4"
                />
                <Input
                  placeholder="Renk (örn: Siyah)"
                  value={variant.color}
                  onChange={e => handleVariantChange(i, 'color', e.target.value)}
                  className="w-1/4"
                />
                <Input
                  placeholder="Stok"
                  type="number"
                  value={variant.stock}
                  onChange={e => handleVariantChange(i, 'stock', parseInt(e.target.value) || 0)}
                  className="w-1/4"
                />
                <Button type="button" variant="destructive" onClick={() => removeVariant(i)}>-</Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addVariant}>+ Varyant Ekle</Button>
          </div>

          <div>
            <Label>Ürün Görseli</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Yükleniyor..." : "Görsel Seç"}</span>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <span className="text-sm text-gray-500">veya</span>
                
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  className="flex-1"
                />
              </div>

              {(previewUrl || formData.imageUrl) && (
                <div className="relative">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-48">
                    <img 
                      src={previewUrl || formData.imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-40 rounded object-contain"
                      onError={() => {
                        // If image fails to load, show placeholder
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Desteklenen formatlar: JPEG, PNG, GIF</p>
                <p>• Maksimum dosya boyutu: 5MB</p>
                <p>• Önerilen boyut: 800x800 piksel</p>
              </div>
            </div>
          </div>

          <div>
            <Label>Durum</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label className="text-sm">Aktif</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createProductMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createProductMutation.isPending 
                ? (product ? "Güncelleniyor..." : "Oluşturuluyor...") 
                : (product ? "Güncelle" : "Oluştur")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}