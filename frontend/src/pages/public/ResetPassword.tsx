import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../utils/toast';
import * as authService from '../../services/authService';

export default function ResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

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

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
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

        // The authService.resetPassword already stores token and user in localStorage
        // Reload the page to trigger AuthContext to read from localStorage
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
            <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
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
          <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
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
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter new password"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Confirm new password"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

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

