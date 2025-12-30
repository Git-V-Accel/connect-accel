import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from '../../utils/toast';
import * as authService from '../../services/authService';
import { PasswordField } from '../../components/common';

export default function ResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      toast.error('Invalid reset token');
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet the requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!resetToken) {
      toast.error('Invalid reset token');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(resetToken, password);
      if (response.success) {
        setPasswordReset(true);
        toast.success(response.message || 'Password reset successfully!');

        // The authService.resetPassword already stores token and user in sessionStorage
        // Reload the page to trigger AuthContext to read from sessionStorage
        // Navigate to appropriate dashboard after a short delay
        setTimeout(() => {
          if (response.user) {
            const roleBasedRoute: Record<string, string> = {
              client: '/client/dashboard',
              freelancer: '/freelancer/dashboard',
              admin: '/admin/dashboard',
              superadmin: '/superadmin/dashboard',
              agent: '/agent/dashboard',
            };
            const route = roleBasedRoute[response.user.role] || '/';
            // Reload to refresh auth context
            window.location.href = route;
          } else {
            // If no user data, redirect to login
            window.location.href = '/login';
          }
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to reset password';
      toast.error(message);

      // If token is invalid or expired, redirect to forgot password
      if (err?.response?.status === 400) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
              <Shield className="size-6 text-white" />
            </div>
            <span className="text-2xl">Connect-Accel</span>
          </Link>
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center size-16 rounded-full bg-green-100 mb-4">
              <Shield className="size-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your password has been reset successfully. Redirecting you now...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
            <Shield className="size-6 text-white" />
          </div>
          <span className="text-2xl">Connect-Accel</span>
        </Link>
        <h2 className="text-center text-3xl">Reset Password</h2>
        <p className="text-center text-sm text-gray-600 mt-2 px-6">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <PasswordField
              id="password"
              name="password"
              label="New Password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onValidationChange={setIsPasswordValid}
              autoComplete="new-password"
              disabled={loading}
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showValidation={false}
              autoComplete="new-password"
              disabled={loading}
            />

            <div>
              <Button type="submit" className="w-full" disabled={loading || !password.trim() || !confirmPassword.trim()}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

