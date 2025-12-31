import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PasswordInput, PasswordField } from '../../components/common';
import {
  User,
  Bell,
  Shield,
  Monitor,
  Save,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../utils/toast';
import OtpDialog from '../../components/common/OtpDialog';
import * as authService from '../../services/authService';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import * as settingsService from '../../services/settingsService';
import * as userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { validateFirstName, validateLastName, validatePhone, validatePassword, validateRequired, VALIDATION_MESSAGES } from '../../constants/validationConstants';
import { getMyAuditLogs, AuditLogResponse } from '../../services/auditLogService';

export default function ClientSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'audit'>('profile');
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [bioEditValue, setBioEditValue] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email_updates: true,
    email_promotions: false,
    push_updates: true,
    push_reminders: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [otpOpen, setOtpOpen] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasErrors = Object.keys(errors).length > 0;

  // Load settings and user profile data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setSettingsLoading(true);

        // Fetch both user profile and settings in parallel
        const [userProfile, settings] = await Promise.all([
          userService.getCurrentUser().catch(() => null), // Fallback to null if fails
          settingsService.getSettings()
        ]);

        // Populate profile data - prioritize user profile data, then settings
        if (userProfile || settings.profile) {
          // Split name into firstName and lastName if needed
          const fullName = userProfile?.name || settings.profile?.name || user?.name || '';
          const nameParts = fullName.trim().split(' ');
          const firstName = settings.profile?.firstName || nameParts[0] || '';
          const lastName = settings.profile?.lastName || nameParts.slice(1).join(' ') || '';

          setProfileData({
            firstName: firstName,
            lastName: lastName,
            role: userProfile?.role || settings.profile?.role || user?.role || '',
            email: userProfile?.email || settings.profile?.email || user?.email || '',
            phone: userProfile?.phone || settings.profile?.phone || '',
            company: settings.profile?.company || userProfile?.company || '',
            bio: settings.profile?.bio || '',
          });
          setBioEditValue(settings.profile?.bio || '');
        }

        // Populate notification settings
        if (settings.notifications) {
          setNotificationSettings({
            email_updates: settings.notifications.email?.updates ?? true,
            email_promotions: settings.notifications.email?.promotions ?? false,
            push_updates: settings.notifications.push?.updates ?? true,
            push_reminders: settings.notifications.push?.reminders ?? true,
          });
        }

        // Populate appearance settings
        if (settings.appearance) {
          setAppearanceSettings({
            theme: settings.appearance.theme || 'light',
          });
        }
      } catch (error: any) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');

        // Fallback to user data from AuthContext if API fails
        if (user) {
          const nameParts = (user.name || '').trim().split(' ');
          setProfileData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            role: user.role || '',
            email: user.email || '',
            phone: user.phone || '',
            company: '',
            bio: '',
          });
        }
      } finally {
        setSettingsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const loadMyAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await getMyAuditLogs({ page: 1, limit: 30 });
      setAuditLogs(res.auditLogs || []);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    const firstNameResult = validateFirstName(profileData.firstName);
    if (!firstNameResult.isValid) {
      newErrors.firstName = firstNameResult.error || VALIDATION_MESSAGES.FIRST_NAME.REQUIRED;
    }

    // Validate email (required but read-only, so just check if exists)
    if (!profileData.email || !profileData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL.REQUIRED;
    }

    // Validate phone if provided
    if (profileData.phone && profileData.phone.trim()) {
      const phoneResult = validatePhone(profileData.phone, false);
      if (!phoneResult.isValid) {
        newErrors.phone = phoneResult.error || VALIDATION_MESSAGES.PHONE.INVALID;
      }
    }

    // Validate last name if provided
    if (profileData.lastName && profileData.lastName.trim()) {
      const lastNameResult = validateLastName(profileData.lastName);
      if (!lastNameResult.isValid) {
        newErrors.lastName = lastNameResult.error || '';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      // Combine firstName and lastName for the name field
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      await settingsService.updateSettingsSection('profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: fullName,
        phone: profileData.phone,
        company: profileData.company,
        bio: bioEditValue || profileData.bio,
      });
      toast.success('Profile updated successfully!');
      setProfileData({ ...profileData, bio: bioEditValue });
      setErrors({});
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await settingsService.updateSettingsSection('notifications', {
        email: {
          updates: notificationSettings.email_updates,
          promotions: notificationSettings.email_promotions,
        },
        push: {
          updates: notificationSettings.push_updates,
          reminders: notificationSettings.push_reminders,
        },
      });
      toast.success('Notification preferences updated!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update notifications';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setLoading(true);
    try {
      await settingsService.updateSettingsSection('appearance', {
        theme: appearanceSettings.theme,
      });
      toast.success('Appearance settings saved');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to update appearance';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const newErrors: Record<string, string> = {};

    // Validate current password
    const currentPasswordResult = validateRequired(passwordData.current_password);
    if (!currentPasswordResult.isValid) {
      newErrors.current_password = VALIDATION_MESSAGES.CURRENT_PASSWORD.REQUIRED;
    }

    // Validate new password
    const newPasswordResult = validatePassword(passwordData.new_password, false);
    if (!newPasswordResult.isValid) {
      newErrors.new_password = newPasswordResult.error || VALIDATION_MESSAGES.PASSWORD.REQUIRED;
    } else if (!isPasswordValid) {
      newErrors.new_password = VALIDATION_MESSAGES.PASSWORD.REQUIREMENTS;
    }

    // Validate confirm password
    const confirmPasswordResult = validateRequired(passwordData.confirm_password);
    if (!confirmPasswordResult.isValid) {
      newErrors.confirm_password = VALIDATION_MESSAGES.CONFIRM_PASSWORD.REQUIRED;
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = VALIDATION_MESSAGES.PASSWORD.MISMATCH;
    }

    // Check if new password is same as current
    if (passwordData.new_password && passwordData.current_password && passwordData.new_password === passwordData.current_password) {
      newErrors.new_password = VALIDATION_MESSAGES.PASSWORD.SAME_AS_CURRENT;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setOtpLoading(true);
    try {
      // First validate current password, then send OTP
      await authService.sendPasswordChangeOTP(passwordData.current_password);
      setOtpOpen(true);
      toast.success('OTP sent to your email');
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyChangePassword = async (otpCode: string) => {
    setOtpLoading(true);
    try {
      // Current password was already validated when OTP was sent
      await authService.changePassword(
        passwordData.new_password,
        otpCode
      );
      toast.success('Password updated successfully');
      setOtpOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!passwordData.current_password) {
      toast.error('Please enter your current password first');
      return;
    }
    setOtpResendLoading(true);
    try {
      await authService.sendPasswordChangeOTP(passwordData.current_password);
      toast.success('OTP resent to your email');
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setOtpResendLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="size-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="size-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="size-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="size-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <Shield className="size-4" /> },
  ];

  if (settingsLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile, notifications, theme, and security</p>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Profile</h2>
              <p className="text-sm text-gray-600">Update your basic information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData.email} className="mt-1" disabled />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={loading || hasErrors}>
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Notifications</h2>
              <p className="text-sm text-gray-600">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'email_updates', label: 'Email updates' },
                { key: 'email_promotions', label: 'Email promotions' },
                { key: 'push_updates', label: 'Push updates' },
                { key: 'push_reminders', label: 'Push reminders' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <Switch
                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [item.key]: checked,
                      })
                    }
                  />
                </label>
              ))}

              <Button onClick={handleSaveNotifications} disabled={loading}>
                <Save className="size-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Appearance</h2>
              <p className="text-sm text-gray-600">Theme and display preferences</p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={appearanceSettings.theme} onValueChange={(v) => setAppearanceSettings({ theme: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveAppearance} disabled={loading}>
                <Save className="size-4 mr-2" />
                Save Appearance
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Security</h2>
              <p className="text-sm text-gray-600">Change password using OTP verification</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <PasswordInput
                  id="current_password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="mt-1"
                />
              </div>

              <PasswordField
                id="new_password"
                label="New Password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                onValidationChange={setIsPasswordValid}
                className="mt-1"
              />

              <PasswordField
                id="confirm_password"
                label="Confirm New Password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                showValidation={false}
                className="mt-1"
              />

              <Button onClick={handleSendOtp} disabled={otpLoading}>
                <Shield className="size-4 mr-2" />
                {otpLoading ? 'Sending OTP...' : 'Send OTP to Change Password'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">Audit Logs</h2>
                <p className="text-sm text-gray-600">Activity relevant to your account</p>
              </div>
              <Button variant="outline" onClick={loadMyAuditLogs} disabled={auditLoading}>
                Refresh
              </Button>
            </div>

            {auditLoading ? (
              <div className="text-center py-8 text-gray-600">Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No audit logs found</div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 15).map((log) => (
                  <div key={log._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge
                        className={
                          log.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : log.severity === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : log.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }
                      >
                        {log.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <OtpDialog
          open={otpOpen}
          onOpenChange={setOtpOpen}
          title="Verify Your Email"
          description="Enter the 6-digit verification code sent to your email to change your password."
          otpLength={6}
          loading={otpLoading}
          resendLoading={otpResendLoading}
          onVerify={handleVerifyChangePassword}
          onResend={handleResendOtp}
        />
      </div>
    </DashboardLayout>
  );
}
