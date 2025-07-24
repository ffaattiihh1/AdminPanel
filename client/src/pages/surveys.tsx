import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DataTable from "@/components/ui/data-table";
import SurveyModal from "@/components/modals/survey-modal";
import { Vote, Plus, FileText, Edit, BarChart3, Trash2 } from "lucide-react";

export default function Surveys() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: surveysData, isLoading } = useQuery({
    queryKey: ["/api/surveys"],
  });

  const surveys = surveysData?.surveys || [];

  const columns = [
    { header: "Anket Adı", accessor: "title" },
    { header: "Tür", accessor: "type" },
    { header: "Durum", accessor: "status" },
    { header: "Katılımcı", accessor: "currentParticipants" },
    { header: "Tamamlanan", accessor: "completedCount" },
    { header: "Başarı Oranı", accessor: "successRate" },
    { header: "Ödeme", accessor: "reward" }
  ];

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/surveys');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anketler.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export failed:', error);
    }
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
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Vote className="text-primary-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Anket Yönetimi</CardTitle>
                <p className="text-sm text-slate-500">Tüm anketleri görüntüleyin ve yönetin</p>
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
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Anket
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={surveys}
            renderCell={(item, column) => {
              if (column.accessor === "title") {
                const typeIcons = {
                  "map": "fas fa-map-marker-alt",
                  "link": "fas fa-link", 
                  "in-app": "fas fa-mobile-alt"
                };
                const typeIcon = typeIcons[item.type as keyof typeof typeIcons] || "fas fa-poll";
                
                return (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <i className={`${typeIcon} text-primary-600`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                );
              }
              if (column.accessor === "type") {
                const typeConfig = {
                  "link": { label: "Linkli", color: "bg-blue-100 text-blue-800", icon: "fas fa-link" },
                  "map": { label: "Haritalı", color: "bg-orange-100 text-orange-800", icon: "fas fa-map-marker-alt" },
                  "in-app": { label: "Uygulama İçi", color: "bg-purple-100 text-purple-800", icon: "fas fa-mobile-alt" }
                };
                const config = typeConfig[item[column.accessor] as keyof typeof typeConfig];
                return config ? (
                  <Badge className={config.color}>
                    <i className={`${config.icon} mr-1`}></i>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "status") {
                const statusConfig = {
                  "active": { label: "Aktif", color: "bg-green-100 text-green-800" },
                  "completed": { label: "Tamamlandı", color: "bg-gray-100 text-gray-800" },
                  "draft": { label: "Taslak", color: "bg-yellow-100 text-yellow-800" }
                };
                const config = statusConfig[item[column.accessor] as keyof typeof statusConfig];
                return config ? (
                  <Badge className={config.color}>
                    <i className="fas fa-circle mr-1 text-xs"></i>
                    {config.label}
                  </Badge>
                ) : item[column.accessor];
              }
              if (column.accessor === "successRate") {
                const rate = Math.round((item.completedCount / (item.currentParticipants || 1)) * 100) || 0;
                return (
                  <div className="flex items-center">
                    <Progress value={rate} className="w-16 mr-2" />
                    <span className="text-sm text-slate-600">{rate}%</span>
                  </div>
                );
              }
              if (column.accessor === "reward") {
                return `₺${Number(item[column.accessor] || 0).toLocaleString()}`;
              }
              return item[column.accessor];
            }}
            actions={() => [
              { icon: Edit, label: "Düzenle", color: "text-primary-600" },
              { icon: BarChart3, label: "Raporlar", color: "text-emerald-600" },
              { icon: Trash2, label: "Sil", color: "text-red-600" }
            ]}
          />
        </CardContent>
      </Card>

      {showCreateModal && (
        <SurveyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
