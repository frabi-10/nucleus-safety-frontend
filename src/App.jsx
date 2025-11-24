import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { useToast } from '@hooks/useToast';
import { ToastContainer } from '@components/ui';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { SubmitReportPage } from './features/submit-report/SubmitReportPage';
import { SubmitJHAPage } from './features/submit-jha/SubmitJHAPage';
import { SubmitKaizenPage } from './features/submit-kaizen/SubmitKaizenPage';
import { ViewReportsPage } from './features/view-reports/ViewReportsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { AssignedReportsPage } from './features/assigned-reports/AssignedReportsPage';
import { QRCodesPage } from './features/qr-codes/QRCodesPage';

function App() {
  const toast = useToast();

  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/submit" replace />} />
          <Route path="/submit" element={<SubmitReportPage toast={toast} />} />
          <Route path="/submit-jha" element={<SubmitJHAPage toast={toast} />} />
          <Route path="/submit-kaizen" element={<SubmitKaizenPage toast={toast} />} />
          <Route
            path="/view"
            element={
              <ProtectedRoute>
                <ViewReportsPage toast={toast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assigned"
            element={
              <ProtectedRoute>
                <AssignedReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr-codes"
            element={
              <ProtectedRoute>
                <QRCodesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </AuthProvider>
  );
}

export default App;
