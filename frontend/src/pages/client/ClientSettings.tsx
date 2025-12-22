import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PasswordInput, PasswordField, RichTextEditor, RichTextViewer } from '../../components/common';
import {
  User,
  Mail,
  Bell,
  Shield,
  Monitor,
  Save,
  Edit,
  X,
  Plus,
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

export default function ClientSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [bioEditValue, setBioEditValue] = useState('');
  const [skillInput, setSkillInput] = useState('');

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

  const handleSaveProfile = async () => {
    if (!profileData.firstName || !profileData.email) {
      toast.error('First name and email are required');
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
      setIsEditing(false);
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
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Please fill all password fields');
      return;
    }
    if (!isPasswordValid) {
      toast.error('New password does not meet the requirements');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password === passwordData.current_password) {
      toast.error('New password must be different from current password');
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
      // Validate current password again when resending OTP
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
    { id: 'profile', label: 'Profile Settings', icon: <User className="size-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="size-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="size-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="size-4" /> },
  ];

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
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
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

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">Profile Settings</h2>
                <p className="text-sm text-gray-600">Update your basic information</p>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBioEditValue(profileData.bio);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="mt-1"
                  placeholder="Jane"
                  disabled={!isEditing || loading || settingsLoading}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="mt-1"
                  placeholder="Doe"
                  disabled={!isEditing || loading || settingsLoading}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profileData.role}
                  className="mt-1 bg-gray-50"
                  disabled={true}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  className="mt-1 bg-gray-50"
                  disabled={true}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="9876543210"
                  disabled={!isEditing || loading || settingsLoading}
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="mt-1"
                  placeholder="Company Name"
                  disabled={!isEditing || loading || settingsLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <RichTextEditor
                    value={bioEditValue}
                    onChange={setBioEditValue}
                    placeholder="Tell others about your business needs..."
                    className="mt-1"
                    minHeight="150px"
                  />
                </div>
              ) : (
                <div className="mt-1 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[150px]">
                  {profileData.bio ? (
                    <RichTextViewer content={profileData.bio} />
                  ) : (
                    <p className="text-gray-400 italic">No bio added yet. Click Edit to add one.</p>
                  )}
                </div>
              )}
            </div>


            <Button onClick={handleSaveProfile} disabled={loading || settingsLoading}>
              <Save className="size-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Notification Settings</h2>
              <p className="text-sm text-gray-600">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg">Email Notifications</h3>
                {[
                  { key: 'email_updates', label: 'Project updates & status changes' },
                  { key: 'email_promotions', label: 'Product news and promotions' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
              </div>

              <div className="space-y-3">
                <h3 className="text-lg">Push Notifications</h3>
                {[
                  { key: 'push_updates', label: 'Real-time updates on projects' },
                  { key: 'push_reminders', label: 'Reminders for deadlines and calls' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading || settingsLoading}>
                <Save className="size-4 mr-2" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Appearance</h2>
              <p className="text-sm text-gray-600">Theme and display preferences</p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <Label>Theme</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) => setAppearanceSettings({ theme: value })}
                >
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

              <Button onClick={handleSaveAppearance} disabled={loading || settingsLoading}>
                <Save className="size-4 mr-2" />
                {loading ? 'Saving...' : 'Save Appearance'}
              </Button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Change Password</h2>
              <p className="text-sm text-gray-600">Keep your account secure</p>
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
                placeholder="••••••••"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                onValidationChange={setIsPasswordValid}
                className="mt-1"
              />

              <PasswordField
                id="confirm_password"
                label="Confirm New Password"
                placeholder="••••••••"
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
      </div>
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
    </DashboardLayout>
  );
}
