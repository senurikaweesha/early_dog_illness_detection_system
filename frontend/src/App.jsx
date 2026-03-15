import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { MainLayout } from "./src/layouts/MainLayout";
import { ProtectedRoute } from "./src/components/ProtectedRoute";
import { HomePage } from "./src/pages/HomePage";
import { SignupPage } from "./src/pages/SignupPage";
import { LoginPage } from "./src/pages/LoginPage";
import { DashboardPage } from "./src/pages/DashboardPage";
import { AnalyzePage } from "./src/pages/AnalyzePage";
import { HistoryPage } from "./src/pages/HistoryPage";
import { DogsPage } from "./src/pages/DogsPage";
import { AddDogPage } from "./src/pages/AddDogPage";
import { VetDashboardPage } from "./src/pages/VetDashboardPage";

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* Public Routes */}
                <Route index element={<HomePage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="login" element={<LoginPage />} />

                {/* Protected Routes */}
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

                {/* Dog Management Routes - UPDATED */}
                <Route
                  path="dogs/add"
                  element={
                    <ProtectedRoute>
                      <AddDogPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="dogs/edit/:id"
                  element={
                    <ProtectedRoute>
                      <AddDogPage />
                    </ProtectedRoute>
                  }
                />

                {/* Vet-only Route */}
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
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}