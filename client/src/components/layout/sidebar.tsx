import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home,
  Vote, 
  Users, 
  Camera, 
  MapPin, 
  Bell, 
  FileText, 
  Store,
  Settings,
  Shield,
  BarChart3
} from "lucide-react";

const navigationItems = [
  { path: "/", label: "Ana Sayfa", icon: Home },
  { path: "/users", label: "Kullanıcılar", icon: Users },
  { path: "/surveys", label: "Anketler", icon: FileText },
  { path: "/map-tasks", label: "Keşfet", icon: MapPin },
  { path: "/stories", label: "Hikayeler", icon: Camera },
  { path: "/notifications", label: "Bildirimler", icon: Bell },
  { path: "/store", label: "Sıralama", icon: Store },
  { path: "/admin-management", label: "Admin Yönetimi", icon: Shield },
  { path: "/analytics", label: "İstatistikler", icon: BarChart3 },
  { path: "/settings", label: "Ayarlar", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-800 text-white flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Vote className="text-primary-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-300">KazaniOn Ops Panel</h1>
            <p className="text-blue-200 text-sm">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                isActive
                  ? "bg-slate-700 text-white"
                  : "hover:bg-slate-600 text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
