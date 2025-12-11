import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from '../../utils/toast';
import * as authService from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        setEmailSent(true);
        toast.success(response.message || 'Password reset email sent. Please check your inbox.');
      } else {
        toast.error(response.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to send reset email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="size-6 text-white" />
          </div>
          <span className="text-2xl">Connect-Accel</span>
        </Link>
        <h2 className="text-center text-3xl">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600 mt-2 px-6">
          Enter your email and we will send you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {emailSent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex items-center justify-center size-16 rounded-full bg-green-100">
                <Shield className="size-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Please check your inbox and click the link to reset your password. The link will expire in 10 minutes.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Send another email
                </Button>
                <Link to="/login" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

