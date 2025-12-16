import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PasswordInput, RichTextEditor, RichTextViewer } from '../../components/common';
import OtpDialog from '../../components/common/OtpDialog';
import * as authService from '../../services/authService';
import * as settingsService from '../../services/settingsService';
import * as userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../utils/toast';
import { User, Bell, Monitor, Shield, Save, Edit, X, Plus } from 'lucide-react';
import { commonSkills } from '../../constants/projectConstants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type TabId = 'profile' | 'notifications' | 'appearance' | 'security';

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    skills: [] as string[],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [bioEditValue, setBioEditValue] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email_incidents: true,
    email_reports: true,
    push_escalations: true,
    push_system: true,
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
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendLoading, setOtpResendLoading] = useState(false);

  // Load settings and user profile data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setSettingsLoading(true);
        
        // Fetch both user profile and settings in parallel
        const [userProfile, settings] = await Promise.all([
          userService.getCurrentUser().catch(() => null),
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
            skills: settings.profile?.skills || userProfile?.skills || [],
          });
          setBioEditValue(settings.profile?.bio || '');
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
            skills: [],
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
        skills: profileData.skills,
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

  const handleSaveNotifications = () => toast.success('Notification settings saved');
  const handleSaveAppearance = () => toast.success('Appearance saved');
  const handleSendOtp = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
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
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage admin profile, notifications, theme, and security
          </p>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
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
            <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl mb-1">Profile</h2>
              <p className="text-sm text-gray-600">Update admin details</p>
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
                  <Edit className="w-4 h-4 mr-2" />
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
                  placeholder="Admin"
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
                <Label htmlFor="email">Email *</Label>
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
                  placeholder="+1 (555) 000-0000"
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
                <Label htmlFor="bio">Admin Notes / Bio</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <RichTextEditor
                    value={bioEditValue}
                    onChange={setBioEditValue}
                    placeholder="Team notes, responsibilities, etc."
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

            {isEditing && (
              <div>
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2 mb-3 mt-1">
                  <Input
                    id="skills"
                    placeholder="Enter a skill (e.g., React, Node.js)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmedSkill = skillInput.trim();
                        if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
                          setProfileData({
                            ...profileData,
                            skills: [...profileData.skills, trimmedSkill]
                          });
                          setSkillInput('');
                        }
                      }
                    }}
                    disabled={loading || settingsLoading}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const trimmedSkill = skillInput.trim();
                      if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
                        setProfileData({
                          ...profileData,
                          skills: [...profileData.skills, trimmedSkill]
                        });
                        setSkillInput('');
                      }
                    }}
                    disabled={loading || settingsLoading || !skillInput.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {profileData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 flex items-center gap-1"
                        onClick={() => {
                          if (!loading && !settingsLoading) {
                            setProfileData({
                              ...profileData,
                              skills: profileData.skills.filter(s => s !== skill)
                            });
                          }
                        }}
                      >
                        {skill}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-2">Select from common skills:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => {
                    const isSelected = profileData.skills.includes(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          if (!loading && !settingsLoading) {
                            if (isSelected) {
                              setProfileData({
                                ...profileData,
                                skills: profileData.skills.filter(s => s !== skill)
                              });
                            } else {
                              setProfileData({
                                ...profileData,
                                skills: [...profileData.skills, skill]
                              });
                            }
                          }
                        }}
                      >
                        {skill}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {profileData.skills.length > 0 && !isEditing && (
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={loading || settingsLoading}>
              <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reload data to reset changes
                    const loadData = async () => {
                      try {
                        setSettingsLoading(true);
                        const [userProfile, settings] = await Promise.all([
                          userService.getCurrentUser().catch(() => null),
                          settingsService.getSettings()
                        ]);
                        if (userProfile || settings.profile) {
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
                            skills: settings.profile?.skills || userProfile?.skills || [],
                          });
                          setBioEditValue(settings.profile?.bio || '');
                        }
                      } catch (error) {
                        console.error('Failed to reload settings:', error);
                      } finally {
                        setSettingsLoading(false);
                      }
                    };
                    loadData();
                  }}
                  disabled={loading || settingsLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
            </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Notifications</h2>
              <p className="text-sm text-gray-600">Control admin alerts</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'email_incidents', label: 'Incident & escalation emails' },
                { key: 'email_reports', label: 'Scheduled reports' },
                { key: 'push_escalations', label: 'Push: escalations & approvals' },
                { key: 'push_system', label: 'Push: system status updates' },
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
            </div>

            <Button onClick={handleSaveNotifications}>
              <Save className="w-4 h-4 mr-2" />
              Save Notifications
            </Button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Appearance</h2>
              <p className="text-sm text-gray-600">Theme preferences</p>
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
              <Button onClick={handleSaveAppearance}>
                <Save className="w-4 h-4 mr-2" />
                Save Appearance
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-1">Security</h2>
              <p className="text-sm text-gray-600">Change password (OTP required)</p>
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
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <PasswordInput
                  id="new_password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <PasswordInput
                  id="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSendOtp} disabled={otpLoading}>
                <Shield className="w-4 h-4 mr-2" />
                {otpLoading ? 'Sending OTP...' : 'Send OTP to Change Password'}
              </Button>
            </div>
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

