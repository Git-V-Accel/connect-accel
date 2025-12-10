import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function EarningsPage() {
  const { user } = useAuth();
  const { getPaymentsByUser, getProjectsByUser, createPayment } = useData();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  if (!user) return null;

  const payments = getPaymentsByUser(user.id);
  const projects = getProjectsByUser(user.id, user.role);

  // Calculate earnings
  const completedPayments = payments.filter(p => 
    p.to_user_id === user.id && p.status === 'completed'
  );
  const pendingPayments = payments.filter(p => 
    p.to_user_id === user.id && p.status === 'pending'
  );
  
  const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingEarnings = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const withdrawals = payments.filter(p => 
    p.from_user_id === user.id && p.type === 'withdrawal'
  );
  const totalWithdrawn = withdrawals.reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn;

  // Filter by period
  const filterByPeriod = (payment: any) => {
    if (filterPeriod === 'all') return true;
    
    const paymentDate = new Date(payment.created_at);
    const now = new Date();
    
    switch (filterPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return paymentDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return paymentDate >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return paymentDate >= quarterAgo;
      default:
        return true;
    }
  };

  const filteredEarnings = completedPayments.filter(filterByPeriod);
  const filteredWithdrawals = withdrawals.filter(filterByPeriod);

  // Monthly earnings for chart
  const getMonthlyEarnings = () => {
    const monthlyData: { [key: string]: number } = {};
    completedPayments.forEach(payment => {
      const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    });
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  };

  const monthlyEarnings = getMonthlyEarnings();

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || !withdrawMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    createPayment({
      project_id: 'withdrawal',
      from_user_id: user.id,
      to_user_id: user.id,
      amount,
      type: 'withdrawal',
      status: 'processing'
    });

    toast.success('Withdrawal request submitted! Funds will be processed in 2-3 business days.');
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
    setWithdrawMethod('');
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Earnings & Payments</h1>
            <p className="text-gray-600">Track your income and manage withdrawals</p>
          </div>
          <Button 
            size="lg"
            onClick={() => setShowWithdrawDialog(true)}
            disabled={availableBalance <= 0}
          >
            <Wallet className="size-5 mr-2" />
            Withdraw Funds
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <DollarSign className="size-6" />
              </div>
              <ArrowUpRight className="size-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-3xl mb-1">₹{totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-green-600">All time</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Wallet className="size-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className="text-3xl mb-1">₹{availableBalance.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Ready to withdraw</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Clock className="size-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl mb-1">₹{pendingEarnings.toLocaleString()}</div>
            <div className="text-xs text-orange-600">{pendingPayments.length} payments</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <ArrowDownRight className="size-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Withdrawn</div>
            <div className="text-3xl mb-1">₹{totalWithdrawn.toLocaleString()}</div>
            <div className="text-xs text-gray-600">{withdrawals.length} transactions</div>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl">Earnings Overview</h3>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-40">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {monthlyEarnings.length > 0 ? (
            <div className="space-y-4">
              {monthlyEarnings.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-end px-3 text-white text-sm font-medium"
                          style={{ width: `${(item.amount / Math.max(...monthlyEarnings.map(m => m.amount))) * 100}%` }}
                        >
                          {item.amount > 0 && `₹${item.amount.toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              No earnings data available
            </div>
          )}
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="earnings">Earnings ({filteredEarnings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({filteredWithdrawals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="mt-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg">Completed Payments</h3>
                  <Button variant="outline" size="sm">
                    <Download className="size-4 mr-2" />
                    Export
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEarnings.length > 0 ? (
                      filteredEarnings.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="size-4 text-gray-400" />
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getProjectName(payment.project_id)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payment.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            +₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">
                              <CheckCircle className="size-3 mr-1" />
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-gray-600">
                          No earnings yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg mb-6">Pending Payments</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.length > 0 ? (
                      pendingPayments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="size-4 text-gray-400" />
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getProjectName(payment.project_id)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payment.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-orange-600">
                            ₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              <Clock className="size-3 mr-1" />
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-gray-600">
                          No pending payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg mb-6">Withdrawal History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.length > 0 ? (
                      filteredWithdrawals.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="size-4 text-gray-400" />
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="size-4 text-gray-400" />
                              Bank Transfer
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            -₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payment.completed_at 
                              ? new Date(payment.completed_at).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-gray-600">
                          No withdrawals yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Withdraw Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Transfer your earnings to your bank account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                <div className="text-2xl font-medium">₹{availableBalance.toLocaleString()}</div>
              </div>
              <div>
                <Label htmlFor="withdrawAmount">Withdrawal Amount (₹)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="withdrawMethod">Withdrawal Method</Label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                <strong>Note:</strong> Withdrawals are processed in 2-3 business days. 
                A 2% processing fee will be deducted.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdraw}>
                <Wallet className="size-4 mr-2" />
                Withdraw ₹{withdrawAmount || '0'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
