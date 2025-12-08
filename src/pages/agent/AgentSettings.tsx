import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AgentSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    commission_rate: 15,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_new_project: true,
    email_bid_submitted: true,
    email_consultation_scheduled: true,
    email_project_completed: true,
    push_new_project: true,
    push_bid_submitted: true,
    push_consultation_reminder: true,
    push_payment_received: true,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [paymentData, setPaymentData] = useState({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_holder: '',
  });

  const handleSaveProfile = () => {
    // Validate
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }

    // Save profile logic here
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    toast.success('Notification preferences updated!');
  };

  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Change password logic here
    toast.success('Password changed successfully!');
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  const handleSavePayment = () => {
    if (!paymentData.bank_name || !paymentData.account_number) {
      toast.error('Please fill in all payment details');
      return;
    }

    // Save payment info logic here
    toast.success('Payment information updated!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="size-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="size-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="size-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="size-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                  {profileData.name.charAt(0)}
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1"
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
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+1 (555) 000-0000"
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

                <div>
                  <Label htmlFor="commission_rate">Default Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={profileData.commission_rate}
                    onChange={(e) => setProfileData({ ...profileData, commission_rate: parseFloat(e.target.value) })}
                    className="mt-1"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your standard margin on projects</p>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell clients about your expertise..."
                />
              </div>

              <Button onClick={handleSaveProfile}>
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'email_new_project', label: 'New project assigned' },
                    { key: 'email_bid_submitted', label: 'Freelancer submits a bid' },
                    { key: 'email_consultation_scheduled', label: 'Consultation scheduled' },
                    { key: 'email_project_completed', label: 'Project completed' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: e.target.checked
                        })}
                        className="size-5 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-4">Push Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'push_new_project', label: 'New project assigned' },
                    { key: 'push_bid_submitted', label: 'New bid submitted' },
                    { key: 'push_consultation_reminder', label: 'Consultation reminder' },
                    { key: 'push_payment_received', label: 'Payment received' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: e.target.checked
                        })}
                        className="size-5 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                <Save className="size-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="current_password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleChangePassword}>
                    <Shield className="size-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm">Current Session</div>
                      <div className="text-xs text-gray-500">Chrome on Windows • Active now</div>
                    </div>
                    <span className="text-xs text-green-600">Current</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Payment Information</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Your commission payments will be deposited to this account. All information is encrypted and secure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    value={paymentData.bank_name}
                    onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
                    className="mt-1"
                    placeholder="Bank of America"
                  />
                </div>

                <div>
                  <Label htmlFor="account_holder">Account Holder Name *</Label>
                  <Input
                    id="account_holder"
                    value={paymentData.account_holder}
                    onChange={(e) => setPaymentData({ ...paymentData, account_holder: e.target.value })}
                    className="mt-1"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={paymentData.account_number}
                    onChange={(e) => setPaymentData({ ...paymentData, account_number: e.target.value })}
                    className="mt-1"
                    placeholder="****1234"
                  />
                </div>

                <div>
                  <Label htmlFor="routing_number">Routing Number *</Label>
                  <Input
                    id="routing_number"
                    value={paymentData.routing_number}
                    onChange={(e) => setPaymentData({ ...paymentData, routing_number: e.target.value })}
                    className="mt-1"
                    placeholder="021000021"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSavePayment}>
                  <Save className="size-4 mr-2" />
                  Save Payment Info
                </Button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4">Payment History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm">Commission Payment</div>
                      <div className="text-xs text-gray-500">December 1, 2024</div>
                    </div>
                    <div className="text-sm">$3,450.00</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm">Commission Payment</div>
                      <div className="text-xs text-gray-500">November 1, 2024</div>
                    </div>
                    <div className="text-sm">$2,890.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
