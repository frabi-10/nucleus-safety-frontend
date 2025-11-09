import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { PasswordModal } from './PasswordModal';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Authentication required to view this page</p>
          </div>
        </div>
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            // Don't allow closing without authentication
            if (!isAuthenticated) {
              setShowPasswordModal(true);
            } else {
              setShowPasswordModal(false);
            }
          }}
        />
      </>
    );
  }

  return children;
};
