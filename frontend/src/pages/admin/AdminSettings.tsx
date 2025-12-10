import React, { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PasswordInput, RichTextEditor, RichTextViewer } from '../../components/common';
import { Switch } from '../../components/ui/switch';
import { toast } from '../../utils/toast';
import { User, Bell, Monitor, Shield, Save, Edit, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type TabId = 'profile' | 'notifications' | 'appearance' | 'security';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: 'Admin',
    bio: '',
  });

  const [isBioEditing, setIsBioEditing] = useState(false);
  const [bioEditValue, setBioEditValue] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email_incidents: true,
    email_reports: true,
    push_escalations: true,
    push_system: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }
    toast.success('Profile updated');
  };

  const handleSaveNotifications = () => toast.success('Notification settings saved');
  const handleSaveAppearance = () => toast.success('Appearance saved');
  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
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
            <div>
              <h2 className="text-xl mb-1">Profile</h2>
              <p className="text-sm text-gray-600">Update admin details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1"
                  placeholder="Jane Admin"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-1"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="mt-1"
                  placeholder="Administrator"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bio">Admin Notes / Bio</Label>
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
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isBioEditing ? (
                <div className="space-y-2">
                  <RichTextEditor
                    value={bioEditValue}
                    onChange={setBioEditValue}
                    placeholder="Team notes, responsibilities, etc."
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
                      <Save className="w-4 h-4 mr-2" />
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
                      <X className="w-4 h-4 mr-2" />
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
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
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
              <p className="text-sm text-gray-600">Change password</p>
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
              <Button onClick={handleChangePassword}>
                <Shield className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

