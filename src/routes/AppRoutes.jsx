import { Routes, Route, Navigate } from "react-router-dom";
import Login          from "@/components/pages/Auth/Login";
import Signup         from "@/components/pages/Auth/Signup";
import Onboarding     from "@/components/pages/Auth/Onboarding";
import CheckEmail     from "@/components/pages/Auth/CheckEmail";
import ForgotPassword from "@/components/pages/Auth/ForgotPassword";
import ResetPassword  from "@/components/pages/Auth/ResetPassword";
import VerifyEmail    from "@/components/pages/Auth/VerifyEmail";
import Feed       from "@/components/Features/Feed/Feed";
import Network    from "@/components/Features/Network/Network";
import Profile    from "@/components/Features/Profile/Profile";
import Jobs       from "@/components/Features/jobs/Jobs";
import Messages   from "@/components/Features/Messages/Messages";
import ATS        from "@/components/Features/ATS/ATS";
import CRM        from "@/components/Features/CRM/CRM";
import HRMS       from "@/components/Features/HRMS/HRMS";
import Settings   from "@/components/Features/Settings/Settings";
import Analytics  from "@/components/Features/Analytics/Analytics";
import Projects   from "@/components/Features/Projects/Projects";
import Streaming   from "@/components/Features/Streaming/Streaming";
import HelpCenter  from "@/components/Features/HelpCenter/HelpCenter";
import Events        from "@/components/Features/Events/Events";
import PricingPage         from "@/components/Features/Premium/PricingPage";
import PremiumSuccess      from "@/components/Features/Premium/PremiumSuccess";
import NotificationsPage   from "@/components/Features/Notifications/NotificationsPage";
import useAuth    from "@/hooks/useAuth";

const AuthLoader = () => (
  <div style={{
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", background: "#0f172a"
  }}>
    <div style={{
      width: "40px", height: "40px",
      border: "3px solid #334155", borderTop: "3px solid #6366f1",
      borderRadius: "50%", animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<GuestRoute><Login/></GuestRoute>}/>
      <Route path="/login"      element={<GuestRoute><Login/></GuestRoute>}/>
      <Route path="/Login"      element={<GuestRoute><Login/></GuestRoute>}/>
      <Route path="/signup"     element={<GuestRoute><Signup/></GuestRoute>}/>
      <Route path="/Signup"     element={<GuestRoute><Signup/></GuestRoute>}/>
      <Route path="/onboarding"      element={<ProtectedRoute><Onboarding/></ProtectedRoute>}/>
      <Route path="/check-email"     element={<CheckEmail/>}/>
      <Route path="/verify-email"    element={<VerifyEmail/>}/>
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword/></GuestRoute>}/>
      <Route path="/reset-password"  element={<ResetPassword/>}/>

      <Route path="/feed"        element={<ProtectedRoute><Feed/></ProtectedRoute>}/>
      <Route path="/network"     element={<ProtectedRoute><Network/></ProtectedRoute>}/>
      <Route path="/profile/:id" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      <Route path="/profile"     element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      <Route path="/jobs"        element={<ProtectedRoute><Jobs/></ProtectedRoute>}/>
      <Route path="/messages"    element={<ProtectedRoute><Messages/></ProtectedRoute>}/>
      <Route path="/settings"    element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
      <Route path="/analytics"   element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
      <Route path="/projects"    element={<ProtectedRoute><Projects/></ProtectedRoute>}/>
      <Route path="/streaming"   element={<ProtectedRoute><Streaming/></ProtectedRoute>}/>
      <Route path="/events"          element={<ProtectedRoute><Events/></ProtectedRoute>}/>
      <Route path="/notifications"   element={<ProtectedRoute><NotificationsPage/></ProtectedRoute>}/>
      <Route path="/premium"         element={<ProtectedRoute><PricingPage/></ProtectedRoute>}/>
      <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess/></ProtectedRoute>}/>

      <Route path="/ats"  element={<ProtectedRoute><ATS/></ProtectedRoute>}/>
      <Route path="/crm"  element={<ProtectedRoute><CRM/></ProtectedRoute>}/>
      <Route path="/hrms" element={<ProtectedRoute><HRMS/></ProtectedRoute>}/>

      <Route path="/help" element={<ProtectedRoute><HelpCenter/></ProtectedRoute>}/>
      <Route path="*"   element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
