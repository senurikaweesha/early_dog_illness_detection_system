import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
// Pages
import { HomePage } from "./pages/HomePage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { HistoryPage } from "./pages/HistoryPage";
import { DogsPage } from "./pages/DogsPage";
import { AddDogPage } from "./pages/AddDogPage";
import { VetDashboardPage } from "./pages/VetDashboardPage";
export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* Protected Routes (All authenticated users) */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="analyze"
                element={
                  <ProtectedRoute>
                    <AnalyzePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="dogs"
                element={
                  <ProtectedRoute>
                    <DogsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="add-dog"
                element={
                  <ProtectedRoute>
                    <AddDogPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="edit-dog/:id"
                element={
                  <ProtectedRoute>
                    <AddDogPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes (Vet only) */}
              <Route
                path="vet-dashboard"
                element={
                  <ProtectedRoute requiredRole="vet">
                    <VetDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};
