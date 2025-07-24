import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    city: "",
    gender: "",
    age: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    console.log("Form gönderiliyor:", form);
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          name: form.name,
          surname: form.surname
        }),
      });
      
      console.log("Yanıt alındı:", response);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Sunucu hatası:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json().catch(error => {
        console.error("JSON parse hatası:", error);
        throw new Error("Geçersiz yanıt alındı");
      });
      
      console.log("İşlem başarılı:", data);
      
      if (data.success) {
        toast({
          title: "Kayıt Başarılı",
          description: "Giriş yapabilirsiniz.",
        });
        setLocation("/login");
      } else {
        throw new Error(data.message || "Kayıt başarısız");
      }
    } catch (error: unknown) {
      console.error("Kayıt hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Bağlantı hatası oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <span>Hesap Oluştur</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Ad</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="surname">Soyad</Label>
              <Input id="surname" name="surname" value={form.surname} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input id="username" name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="city">Şehir</Label>
              <Input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="gender">Cinsiyet</Label>
              <Input id="gender" name="gender" value={form.gender} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="age">Yaş</Label>
              <Input id="age" name="age" type="number" value={form.age} onChange={handleChange} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Kayıt Ol
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
