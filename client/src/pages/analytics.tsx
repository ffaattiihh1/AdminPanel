import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileDown, Users, TrendingUp, MapPin, Calendar } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage() {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");
  
  const { data: surveysData } = useQuery({
    queryKey: ["/api/surveys"],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/survey-analytics", selectedSurvey],
    enabled: !!selectedSurvey,
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
  });

  const surveys = surveysData?.surveys || [];
  const analytics = analyticsData || [];
  const users = usersData?.users || [];

  // Demografik veriler
  const genderDistribution = users.reduce((acc: any, user: any) => {
    const gender = user.gender || "Belirtilmemiş";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const ageDistribution = users.reduce((acc: any, user: any) => {
    if (user.age) {
      const ageGroup = user.age < 25 ? "18-24" : 
                     user.age < 35 ? "25-34" :
                     user.age < 45 ? "35-44" :
                     user.age < 55 ? "45-54" : "55+";
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    }
    return acc;
  }, {});

  const cityDistribution = users.reduce((acc: any, user: any) => {
    const city = user.city || "Belirtilmemiş";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Chart verileri
  const genderChartData = {
    labels: Object.keys(genderDistribution),
    datasets: [{
      data: Object.values(genderDistribution),
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981'],
    }]
  };

  const ageChartData = {
    labels: Object.keys(ageDistribution),
    datasets: [{
      label: 'Kullanıcı Sayısı',
      data: Object.values(ageDistribution),
      backgroundColor: '#3B82F6',
    }]
  };

  const topCities = Object.entries(cityDistribution)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10);

  const cityChartData = {
    labels: topCities.map(([city]) => city),
    datasets: [{
      label: 'Kullanıcı Sayısı',
      data: topCities.map(([, count]) => count),
      backgroundColor: '#10B981',
    }]
  };

  const handleExportAnalytics = async () => {
    if (!selectedSurvey) {
      alert("Lütfen bir anket seçin");
      return;
    }
    
    try {
      const response = await fetch(`/api/export/survey-analytics/${selectedSurvey}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anket_${selectedSurvey}_istatistik.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <CardTitle>Anket İstatistikleri</CardTitle>
                <p className="text-sm text-slate-500">SPSS benzeri demografik analiz ve anket sonuçları</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Anket seçin" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((survey: any) => (
                    <SelectItem key={survey.id} value={survey.id.toString()}>
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportAnalytics}
                disabled={!selectedSurvey}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                SPSS Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{surveys.length}</p>
                <p className="text-sm text-slate-500">Toplam Anket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {surveys.reduce((sum: number, s: any) => sum + (s.completedCount || 0), 0)}
                </p>
                <p className="text-sm text-slate-500">Tamamlanan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.keys(cityDistribution).length}
                </p>
                <p className="text-sm text-slate-500">Farklı Şehir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demografik Analizler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cinsiyet Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Cinsiyet Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie 
                data={genderChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Yaş Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Yaş Grupları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar 
                data={ageChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Şehir Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Kullanıcıya Sahip Şehirler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar 
              data={cityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seçili Anket Detayları */}
      {selectedSurvey && analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anket Cevap Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{item.questionText}</h4>
                    <Badge variant="outline">{item.questionType}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Toplam Cevap: {item.totalResponses}
                  </p>
                  <div className="text-xs text-slate-500">
                    Son Güncelleme: {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yetki Uyarısı */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-amber-800">
            <Calendar className="w-5 h-5" />
            <p className="text-sm">
              Bu sayfa sadece görüntüleme amaçlıdır. Veri düzenleme yetkiniz bulunmamaktadır.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}