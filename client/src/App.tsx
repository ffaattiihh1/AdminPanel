import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import Dashboard from "@/pages/dashboard";
import Surveys from "@/pages/surveys";
import Users from "@/pages/users";
import Stories from "@/pages/stories";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import MapTasks from "@/pages/map-tasks";
import StorePage from "@/pages/store";
import AdminManagementPage from "@/pages/admin-management";
import AnalyticsPage from "@/pages/analytics";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
<Route path="/register" component={RegisterPage} />
      <Route>
        <ProtectedRoute>
          <div className="min-h-screen flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-auto">
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/users" component={Users} />
                  <Route path="/surveys" component={Surveys} />
                  <Route path="/map-tasks" component={MapTasks} />
                  <Route path="/stories" component={Stories} />
                  <Route path="/notifications" component={Notifications} />
                  <Route path="/store" component={StorePage} />
                  <Route path="/admin-management" component={AdminManagementPage} />
                  <Route path="/analytics" component={AnalyticsPage} />
                  <Route path="/profile" component={ProfilePage} />
                  <Route path="/settings" component={Settings} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
