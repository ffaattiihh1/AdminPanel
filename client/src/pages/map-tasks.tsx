import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/ui/data-table";
import MapTaskModal from "@/components/modals/map-task-modal";
import { MapPin, Plus, FileText, Edit, Trash2, Navigation } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MapTasks() {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const { data: mapTasksData, isLoading } = useQuery({
    queryKey: ["/api/map-tasks"],
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/map-tasks/${id}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Harita görevi silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/map-tasks"] });
    },
  });

  const mapTasks = mapTasksData || [];

  const columns = [
    { header: "Görev Adı", accessor: "title" },
    { header: "Konum", accessor: "location" },
    { header: "Durum", accessor: "status" },
    { header: "Yarıçap", accessor: "radius" },
    { header: "Ödül", accessor: "reward" },
    { header: "Tamamlanan", accessor: "completedCount" },
    { header: "İşlemler", accessor: "actions" }
  ];

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/map-tasks');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'harita-gorevleri.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu harita görevini silmek istediğinizden emin misiniz?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  const openInMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-orange-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Harita Görevleri</CardTitle>
                <p className="text-sm text-slate-500">Konum bazlı görevleri yönetin</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Excel İndir
              </Button>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Görev
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={mapTasks}
            renderCell={(item, column) => {
              if (column.accessor === "title") {
                return (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="text-orange-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                );
              }
              if (column.accessor === "location") {
                return (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInMaps(item.latitude, item.longitude)}
                    >
                      <Navigation className="w-3 h-3" />
                    </Button>
                  </div>
                );
              }
              if (column.accessor === "status") {
                const statusConfig = {
                  "active": { label: "Aktif", color: "bg-green-100 text-green-800" },
                  "completed": { label: "Tamamlandı", color: "bg-gray-100 text-gray-800" },
                  "paused": { label: "Duraklatıldı", color: "bg-yellow-100 text-yellow-800" }
                };
                const config = statusConfig[item[column.accessor] as keyof typeof statusConfig];
                return config ? (
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "radius") {
                return <span>{item.radius} m</span>;
              }
              if (column.accessor === "reward") {
                return <span>{item.reward} ₺</span>;
              }
              if (column.accessor === "actions") {
                return (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              }
              return item[column.accessor];
            }}
          />
        </CardContent>
      </Card>

      <MapTaskModal
        isOpen={showCreateModal}
        task={editingTask}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}