import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PasswordInput } from '../../components/common';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '../../utils/toast';
import * as authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function FirstTimePasswordChange() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user has token (from login) but redirect if already active
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('connect_accel_user');
    
    if (!token) {
      // No token means user didn't login, redirect to login
      navigate('/login', { replace: true });
      return;
    }

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (!userData.isFirstLogin) {
        // User is not in first login state, redirect to dashboard
        const getRoleBasedRoute = (role: string): string => {
          const routes: Record<string, string> = {
            client: '/client/dashboard',
            freelancer: '/freelancer/dashboard',
            admin: '/admin/dashboard',
            superadmin: '/superadmin/dashboard',
            agent: '/agent/dashboard',
          };
          return routes[role] || '/';
        };
        navigate(getRoleBasedRoute(userData.role), { replace: true });
      }
    }
  }, [navigate]);

  const getRoleBasedRoute = (role: string): string => {
    const routes: Record<string, string> = {
      client: '/client/dashboard',
      freelancer: '/freelancer/dashboard',
      admin: '/admin/dashboard',
      superadmin: '/superadmin/dashboard',
      agent: '/agent/dashboard',
    };
    return routes[role] || '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!password || !confirmPassword) {
      toast.error('Please enter and confirm your new password.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.firstLoginChangePassword(password, confirmPassword);
      
      if (response.success && response.user) {
        setSuccess(true);
        toast.success(response.message || 'Password changed successfully! Your account has been activated.');
        
        // Update user in context
        if (setUser) {
          setUser({
            ...user!,
            isFirstLogin: false,
            status: 'active',
          });
        }

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          const route = getRoleBasedRoute(response.user!.role);
          navigate(route, { replace: true });
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to change password.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'An error occurred during password change.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Password Changed Successfully!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been activated. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="size-6 text-white" />
          </div>
          <span className="text-2xl">Connect-Accel</span>
        </div>
        <h2 className="text-center text-3xl">Set Your Password</h2>
        <p className="text-center text-sm text-gray-600 mt-2">
          Welcome! Please set a new password to activate your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">First Time Login</p>
                <p>Your account was created by an administrator. Please set a secure password to activate your account and access the platform.</p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="password">New Password</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your new password"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                placeholder="Confirm your new password"
                disabled={loading}
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Setting Password...' : 'Set Password & Activate Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

