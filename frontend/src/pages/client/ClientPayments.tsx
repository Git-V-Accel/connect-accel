import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { IndianRupee, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ClientPayments() {
  const { user } = useAuth();
  const { getPaymentsByUser, getProjectsByUser } = useData();

  if (!user) return null;

  const payments = getPaymentsByUser(user.id).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const projects = getProjectsByUser(user.id, user.role);

  const totalSpent = payments
    .filter(p => p.from_user_id === user.id && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const escrowBalance = payments
    .filter(p => p.type === 'escrow' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const releasedPayments = payments
    .filter(p => p.type === 'milestone' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: IndianRupee, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'In Escrow', value: `₹${(escrowBalance - releasedPayments).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Released', value: `₹${releasedPayments.toLocaleString()}`, icon: TrendingDown, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'in_progress').length.toString(), icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Payments & Billing</h1>
            <p className="text-gray-600">Track all your transactions and escrow balance</p>
          </div>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="escrow">Escrow</TabsTrigger>
            <TabsTrigger value="milestone">Milestone Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Transaction History</h3>
              <div className="space-y-3">
                {payments.map(payment => {
                  const project = projects.find(p => p.id === payment.project_id);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-full flex items-center justify-center ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IndianRupee className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {payment.type.replace('_', ' ')} - {project?.title || 'Unknown Project'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                          {payment.status.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.completed_at 
                            ? new Date(payment.completed_at).toLocaleDateString()
                            : new Date(payment.created_at).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && (
                  <p className="text-center text-gray-600 py-8">No transactions yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="escrow" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Escrow Transactions</h3>
              <div className="space-y-3">
                {payments.filter(p => p.type === 'escrow').map(payment => {
                  const project = projects.find(p => p.id === payment.project_id);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 size-10 rounded-full flex items-center justify-center">
                          <IndianRupee className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{project?.title || 'Unknown Project'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge>{payment.status.toUpperCase()}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="milestone" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Milestone Payments</h3>
              <div className="space-y-3">
                {payments.filter(p => p.type === 'milestone').map(payment => {
                  const project = projects.find(p => p.id === payment.project_id);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 size-10 rounded-full flex items-center justify-center">
                          <IndianRupee className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{project?.title || 'Unknown Project'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge>{payment.status.toUpperCase()}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.completed_at ? new Date(payment.completed_at).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
