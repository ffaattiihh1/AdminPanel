import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Shield, Bell, Globe, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/settings", "PUT", data),
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Ayarlar güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const sections = [
    { id: "general", label: "Genel", icon: Settings },
    { id: "notifications", label: "Bildirimler", icon: Bell },
    { id: "security", label: "Güvenlik", icon: Shield },
    { id: "api", label: "API Ayarları", icon: Globe },
    { id: "email", label: "E-posta", icon: Mail },
  ];

  const handleSave = (sectionData: any) => {
    updateSettingsMutation.mutate({ section: activeSection, ...sectionData });
  };

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Ayarlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {sections.find(s => s.id === activeSection)?.label} Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSection === "general" && <GeneralSettings onSave={handleSave} />}
            {activeSection === "notifications" && <NotificationSettings onSave={handleSave} />}
            {activeSection === "security" && <SecuritySettings onSave={handleSave} />}
            {activeSection === "api" && <ApiSettings onSave={handleSave} />}
            {activeSection === "email" && <EmailSettings onSave={handleSave} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GeneralSettings({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    appName: "KazaniOn",
    appDescription: "Survey ve Görev Uygulaması",
    maintenanceMode: false,
    defaultLanguage: "tr",
    timeZone: "Europe/Istanbul"
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="appName">Uygulama Adı</Label>
          <Input
            id="appName"
            value={formData.appName}
            onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="appDescription">Uygulama Açıklaması</Label>
          <Textarea
            id="appDescription"
            value={formData.appDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, appDescription: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Bakım Modu</Label>
            <p className="text-sm text-gray-500">Uygulamayı geçici olarak kapat</p>
          </div>
          <Switch
            checked={formData.maintenanceMode}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, maintenanceMode: checked }))}
          />
        </div>
      </div>
      <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        Kaydet
      </Button>
    </div>
  );
}

function NotificationSettings({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    dailyReports: true
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Push Bildirimleri</Label>
            <p className="text-sm text-gray-500">Mobil cihazlara anında bildirim gönder</p>
          </div>
          <Switch
            checked={formData.pushNotifications}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>E-posta Bildirimleri</Label>
            <p className="text-sm text-gray-500">Önemli olaylar için e-posta gönder</p>
          </div>
          <Switch
            checked={formData.emailNotifications}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>SMS Bildirimleri</Label>
            <p className="text-sm text-gray-500">Kritik durumlar için SMS gönder</p>
          </div>
          <Switch
            checked={formData.smsNotifications}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
          />
        </div>
      </div>
      <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        Kaydet
      </Button>
    </div>
  );
}

function SecuritySettings({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    passwordMinLength: 8,
    requireTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="passwordMinLength">Minimum Şifre Uzunluğu</Label>
          <Input
            id="passwordMinLength"
            type="number"
            value={formData.passwordMinLength}
            onChange={(e) => setFormData(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>İki Faktörlü Kimlik Doğrulama</Label>
            <p className="text-sm text-gray-500">Admin girişi için zorunlu kıl</p>
          </div>
          <Switch
            checked={formData.requireTwoFactor}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireTwoFactor: checked }))}
          />
        </div>
        <div>
          <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (saat)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={formData.sessionTimeout}
            onChange={(e) => setFormData(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
          />
        </div>
      </div>
      <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        Kaydet
      </Button>
    </div>
  );
}

function ApiSettings({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    apiKey: "sk_test_...",
    webhookUrl: "",
    rateLimit: 1000,
    enableCors: true
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Anahtarı</Label>
          <Input
            id="apiKey"
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={formData.webhookUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://your-app.com/webhook"
          />
        </div>
        <div>
          <Label htmlFor="rateLimit">İstek Limiti (dakikada)</Label>
          <Input
            id="rateLimit"
            type="number"
            value={formData.rateLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
          />
        </div>
      </div>
      <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        Kaydet
      </Button>
    </div>
  );
}

function EmailSettings({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@kazanion.com",
    fromName: "KazaniOn"
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="smtpHost">SMTP Host</Label>
          <Input
            id="smtpHost"
            value={formData.smtpHost}
            onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <Label htmlFor="smtpPort">SMTP Port</Label>
          <Input
            id="smtpPort"
            type="number"
            value={formData.smtpPort}
            onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="fromEmail">Gönderen E-posta</Label>
          <Input
            id="fromEmail"
            type="email"
            value={formData.fromEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
          />
        </div>
      </div>
      <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        Kaydet
      </Button>
    </div>
  );
}