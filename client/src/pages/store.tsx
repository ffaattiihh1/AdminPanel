import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";
import ProductModal from "@/components/modals/product-modal";
import { Package, Plus, FileText, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StorePage() {
  const { toast } = useToast();
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Ürün silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const products = productsData || [];

  const productColumns = [
    { header: "Ürün", accessor: "name" },
    { header: "Kategori", accessor: "category" },
    { header: "Fiyat", accessor: "price" },
    { header: "Stok", accessor: "stock" },
    { header: "Durum", accessor: "isActive" },
    { header: "İşlemler", accessor: "actions" }
  ];

  const handleExportProducts = async () => {
    try {
      const response = await fetch('/api/export/products');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'urunler.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export failed:', error);
      toast({ title: "Hata", description: "Excel dosyası indirilemedi", variant: "destructive" });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      deleteProductMutation.mutate(id);
    }
  };

  if (productsLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="text-purple-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Mağaza Ürünleri</CardTitle>
                <p className="text-sm text-slate-500">T-shirt, hediye kartı ve diğer ürünleri yönetin</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleExportProducts}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Excel İndir
              </Button>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <DataTable
              columns={productColumns}
              data={products}
              renderCell={(item, column) => {
                if (column.accessor === "name") {
                  return (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="text-white w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  );
                }
                if (column.accessor === "price") {
                  return (
                    <div className="text-sm">
                      <p className="font-semibold text-green-600">₺{Number(item.price || 0).toLocaleString()}</p>
                      <p className="text-slate-500">{item.rewardPoints || 0} puan</p>
                    </div>
                  );
                }
                if (column.accessor === "stock") {
                  const stockLevel = item.stock || 0;
                  const stockColor = stockLevel > 50 ? "text-green-600" : stockLevel > 10 ? "text-amber-600" : "text-red-600";
                  const variants = item.variants || [];
                  return (
                    <div className="text-sm">
                      <p className={`font-medium ${stockColor}`}>{stockLevel} adet</p>
                      <p className="text-slate-500">
                        {stockLevel > 50 ? "Stokta" : stockLevel > 10 ? "Az kaldı" : "Tükeniyor"}
                      </p>
                      {variants.length > 0 && (
                        <details className="mt-1 cursor-pointer select-none">
                          <summary className="text-xs text-slate-400 hover:text-slate-600">Varyant Detayları</summary>
                          <ul className="pl-2 mt-1 space-y-1">
                            {variants.map((v, i) => (
                              <li key={i} className="text-xs text-slate-600">
                                <span className="font-semibold">{v.size}</span> / <span>{v.color}</span>: <span className="font-mono">{v.stock} adet</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  );
                }
                if (column.accessor === "category") {
                  const categoryColors: any = {
                    "Giyim": "bg-blue-100 text-blue-800",
                    "Hediye Kartı": "bg-green-100 text-green-800",
                    "Aksesuar": "bg-purple-100 text-purple-800",
                    "Dijital": "bg-orange-100 text-orange-800"
                  };
                  return (
                    <Badge className={categoryColors[item.category] || "bg-gray-100 text-gray-800"}>
                      {item.category}
                    </Badge>
                  );
                }
                if (column.accessor === "isActive") {
                  return (
                    <Badge className={item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {item.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  );
                }
                if (column.accessor === "actions") {
                  return (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(item.id)}
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
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz ürün yok</h3>
              <p className="text-slate-500 mb-6">İlk ürününüzü ekleyerek başlayın</p>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk Ürünü Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
        />
      )}
    </div>
  );
}