import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';
import OtpDialog from '../../components/common/OtpDialog';
import { PasswordField } from '../../components/common';
import { VALIDATION_MESSAGES, NAME_REGEX } from '../../constants/validationConstants';


export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signup, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = VALIDATION_MESSAGES.FIRST_NAME.REQUIRED;
    } else if (firstName.length < 3) {
      newErrors.firstName = VALIDATION_MESSAGES.FIRST_NAME.MIN_LENGTH;
    } else if (firstName.length > 30) {
      newErrors.firstName = VALIDATION_MESSAGES.FIRST_NAME.MAX_LENGTH;
    } else if (!NAME_REGEX.test(firstName)) {
      newErrors.firstName = VALIDATION_MESSAGES.FIRST_NAME.INVALID_CHARACTERS;
    }

    if (!lastName.trim()) {
      newErrors.lastName = VALIDATION_MESSAGES.LAST_NAME.REQUIRED;
    } else if (lastName.length < 1) {
      newErrors.lastName = VALIDATION_MESSAGES.LAST_NAME.MIN_LENGTH;
    } else if (lastName.length > 30) {
      newErrors.lastName = VALIDATION_MESSAGES.LAST_NAME.MAX_LENGTH;
    } else if (!NAME_REGEX.test(lastName)) {

      newErrors.lastName = VALIDATION_MESSAGES.LAST_NAME.INVALID_CHARACTERS;
    }

    if (!email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL.REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL.INVALID;
    }

    if (!phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.PHONE.REQUIRED;
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = VALIDATION_MESSAGES.PHONE.INVALID;
    }

    if (!isPasswordValid) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD.REQUIREMENTS;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.PASSWORD.MISMATCH;
    }

    if (!agreed) {
      newErrors.terms = VALIDATION_MESSAGES.TERMS.REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await signup(fullName, email, password, phone);



      if (result.requiresVerification) {
        setVerificationEmail(result.email);
        setShowOTPVerification(true);
        toast.success('OTP sent to your email! Please verify to complete registration.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);

    try {
      await verifyOTP(verificationEmail, otp);
      toast.success('Email verified successfully!');
      setShowOTPVerification(false);
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await resendOTP(verificationEmail);
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
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
        <h2 className="text-center text-3xl">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {!showOTPVerification && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors(prev => {
                        const { firstName, ...rest } = prev;
                        return rest;
                      });
                    }}
                    className="mt-1"
                    placeholder="John"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors(prev => {
                        const { lastName, ...rest } = prev;
                        return rest;
                      });
                    }}
                    className="mt-1"
                    placeholder="Doe"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => {
                      const { email, ...rest } = prev;
                      return rest;
                    });
                  }}
                  className="mt-1"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => {
                      const { phone, ...rest } = prev;
                      return rest;
                    });
                  }}
                  className="mt-1"
                  placeholder="9876543210"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>


              <PasswordField
                id="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onValidationChange={setIsPasswordValid}
                autoComplete="new-password"
              />

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showValidation={false}
                autoComplete="new-password"
              />

              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={loading || !agreed}>
                  {loading ? 'Creating account...' : 'Sign up'}
                </Button>
              </div>
            </form>
          )}

          {!showOTPVerification && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button type="button" variant="outline" className="w-full">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <OtpDialog
        open={showOTPVerification}
        onOpenChange={setShowOTPVerification}
        email={verificationEmail}
        title="Verify Your Email"
        description="Enter the 6-digit verification code sent to your email address to complete registration."
        otpLength={6}
        loading={loading}
        resendLoading={resendLoading}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </div>
  );
}