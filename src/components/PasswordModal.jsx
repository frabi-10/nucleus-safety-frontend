import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { Modal, Input, Button } from '@components/ui';

export const PasswordModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = login(password);
    if (success) {
      setPassword('');
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Authentication Required" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-center text-gray-600 mb-6">
            This section requires authentication. Please enter the password to continue.
          </p>

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            error={error}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!password}>
            Login
          </Button>
        </div>
      </form>
    </Modal>
  );
};
