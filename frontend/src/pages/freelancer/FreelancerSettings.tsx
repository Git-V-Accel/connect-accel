import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from '../../utils/toast';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';

export default function FreelancerSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security'>('profile');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: '',
    location: '',
    bio: '',
  });

  const [isBioEditing, setIsBioEditing] = useState(false);
  const [bioEditValue, setBioEditValue] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email_job_matches: true,
    email_project_updates: true,
    email_messages: true,
    push_invites: true,
    push_deadlines: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  const handleSaveAppearance = () => {
    toast.success('Appearance settings saved');
  };

  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (!isPasswordValid) {
      toast.error('New password does not meet the requirements');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (passwordData.new_password === passwordData.current_password) {
      toast.error('New password must be different from current password');
      return;
    }
    toast.success('Password changed successfully!');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
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
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab.id
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
            <div>
              <h2 className="text-xl mb-1">Profile Settings</h2>
              <p className="text-sm text-gray-600">Update your freelancer profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1"
                  placeholder="Alex Smith"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-1"
                  placeholder="alex@example.com"
                />
              </div>

              <div>
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="mt-1"
                  placeholder="Full-stack Developer"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="mt-1"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bio">Bio</Label>
                {!isBioEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBioEditValue(profileData.bio);
                      setIsBioEditing(true);
                    }}
                  >
                    <Edit className="size-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isBioEditing ? (
                <div className="space-y-2">
                  <RichTextEditor
                    value={bioEditValue}
                    onChange={setBioEditValue}
                    placeholder="Highlight your expertise, skills, and experience..."
                    className="mt-1"
                    minHeight="150px"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setProfileData({ ...profileData, bio: bioEditValue });
                        setIsBioEditing(false);
                        toast.success('Bio updated successfully');
                      }}
                    >
                      <Save className="size-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBioEditValue(profileData.bio);
                        setIsBioEditing(false);
                      }}
                    >
                      <X className="size-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
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

            <Button onClick={handleSaveProfile}>
              <Save className="size-4 mr-2" />
              Save Changes
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
                  { key: 'email_job_matches', label: 'New job matches and invitations' },
                  { key: 'email_project_updates', label: 'Project updates & milestones' },
                  { key: 'email_messages', label: 'Messages from clients' },
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
                  { key: 'push_invites', label: 'Project invites and bid updates' },
                  { key: 'push_deadlines', label: 'Deadline and meeting reminders' },
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

              <Button onClick={handleSaveNotifications}>
                <Save className="size-4 mr-2" />
                Save Preferences
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

              <Button onClick={handleSaveAppearance}>
                <Save className="size-4 mr-2" />
                Save Appearance
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
              <Button onClick={handleChangePassword}>
                <Shield className="size-4 mr-2" />
                Update Password
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
