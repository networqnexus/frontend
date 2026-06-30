import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const Login          = lazy(() => import("@/components/pages/Auth/Login"));
const Signup         = lazy(() => import("@/components/pages/Auth/Signup"));
const Onboarding     = lazy(() => import("@/components/pages/Auth/Onboarding"));
const CheckEmail     = lazy(() => import("@/components/pages/Auth/CheckEmail"));
const ForgotPassword = lazy(() => import("@/components/pages/Auth/ForgotPassword"));
const ResetPassword  = lazy(() => import("@/components/pages/Auth/ResetPassword"));
const VerifyEmail    = lazy(() => import("@/components/pages/Auth/VerifyEmail"));

const Feed             = lazy(() => import("@/components/Features/Feed/Feed"));
const PostDetailPage   = lazy(() => import("@/components/Features/Feed/PostDetailPage"));
const Network          = lazy(() => import("@/components/Features/Network/Network"));
const Profile          = lazy(() => import("@/components/Features/Profile/Profile"));
const Jobs             = lazy(() => import("@/components/Features/jobs/Jobs"));
const Messages         = lazy(() => import("@/components/Features/Messages/Messages"));
const ATS              = lazy(() => import("@/components/Features/ATS/ATS"));
const CRM              = lazy(() => import("@/components/Features/CRM/CRM"));
const HRMS             = lazy(() => import("@/components/Features/HRMS/HRMS"));
const Settings         = lazy(() => import("@/components/Features/Settings/Settings"));
const Analytics        = lazy(() => import("@/components/Features/Analytics/Analytics"));
const Projects         = lazy(() => import("@/components/Features/Projects/Projects"));
const Streaming        = lazy(() => import("@/components/Features/Streaming/Streaming"));
const OrganizationPage = lazy(() => import("@/components/Features/Organization/OrganizationPage"));
const OrgWorkspace     = lazy(() => import("@/components/Features/Organization/OrgWorkspace"));
const OrgSettings      = lazy(() => import("@/components/Features/Organization/OrgSettings"));
const InviteAcceptPage = lazy(() => import("@/components/Features/Organization/InviteAcceptPage"));
const HelpCenter       = lazy(() => import("@/components/Features/HelpCenter/HelpCenter"));
const Events           = lazy(() => import("@/components/Features/Events/Events"));
const PricingPage      = lazy(() => import("@/components/Features/Premium/PricingPage"));
const PremiumSuccess   = lazy(() => import("@/components/Features/Premium/PremiumSuccess"));
const NotificationsPage = lazy(() => import("@/components/Features/Notifications/NotificationsPage"));

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
    <Suspense fallback={<AuthLoader />}>
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
        <Route path="/post/:id"    element={<ProtectedRoute><PostDetailPage/></ProtectedRoute>}/>
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

        <Route path="/org/:slug"           element={<ProtectedRoute><OrganizationPage/></ProtectedRoute>}/>
        <Route path="/org/:slug/workspace" element={<ProtectedRoute><OrgWorkspace/></ProtectedRoute>}/>
        <Route path="/org/:slug/settings"  element={<ProtectedRoute><OrgSettings/></ProtectedRoute>}/>
        <Route path="/invite/:token"       element={<InviteAcceptPage/>}/>

        <Route path="*"   element={<Navigate to="/" replace/>}/>
      </Routes>
    </Suspense>
  );
}
