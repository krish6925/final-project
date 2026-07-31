import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import QuarterlyCheckin from "./pages/QuarterlyCheckin";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute, { homeForRole } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homeForRole(user?.role)} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={homeForRole(user?.role)} replace /> : <Register />}
      />

      {/* Phase 1 — Employee Goal Creation Sheet */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Phase 2 — Quarterly Check-ins & Achievement Progress Tracking */}
      <Route
        path="/checkins"
        element={
          <ProtectedRoute roles={["employee", "manager", "admin"]}>
            <QuarterlyCheckin />
          </ProtectedRoute>
        }
      />

      {/* Phase 1 & 2 — L1 Manager Review & Check-in Dashboard */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={["manager", "admin"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Section 4 — HR / Admin Governance & Audit Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile Page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Root Redirection & Fallbacks */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? homeForRole(user?.role) : "/login"} replace />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
