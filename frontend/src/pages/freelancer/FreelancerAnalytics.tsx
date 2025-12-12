import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Briefcase, 
  Star,
  Target,
  Award,
  CheckCircle,
  Clock,
  ThumbsUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

export default function FreelancerAnalytics() {
  const { user } = useAuth();
  const { getProjectsByUser, getBidsByFreelancer, getPaymentsByUser } = useData();
  const [timeframe, setTimeframe] = useState('30');

  if (!user) return null;

  const projects = getProjectsByUser(user.id, user.role);
  const bids = getBidsByFreelancer(user.id);
  const payments = getPaymentsByUser(user.id);

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBids = bids.length;
  const acceptedBids = bids.filter(b => b.status === 'accepted').length;
  const winRate = totalBids > 0 ? ((acceptedBids / totalBids) * 100).toFixed(1) : 0;
  
  const totalEarnings = payments
    .filter(p => p.to_user_id === user.id && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const avgProjectValue = completedProjects > 0 
    ? totalEarnings / completedProjects 
    : 0;

  // Calculate trends (mock data for demonstration)
  const earningsTrend = 12.5;
  const projectsTrend = -5.2;
  const winRateTrend = 8.3;

  // Performance by category
  const projectsByCategory = projects.reduce((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(projectsByCategory).map(([category, count]) => ({
    category,
    count,
    percentage: (count / totalProjects) * 100
  }));

  // Monthly earnings data
  const monthlyEarnings = [
    { month: 'Jan', amount: 45000, projects: 2 },
    { month: 'Feb', amount: 62000, projects: 3 },
    { month: 'Mar', amount: 58000, projects: 2 },
    { month: 'Apr', amount: 75000, projects: 4 },
    { month: 'May', amount: 81000, projects: 3 },
    { month: 'Jun', amount: 92000, projects: 5 }
  ];

  const maxEarning = Math.max(...monthlyEarnings.map(m => m.amount));

  // Client satisfaction (mock)
  const satisfaction = {
    excellent: 75,
    good: 20,
    average: 5,
    poor: 0
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Performance Analytics</h1>
            <p className="text-gray-600">Track your freelance performance and growth</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <IndianRupee className="size-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${earningsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {earningsTrend > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {Math.abs(earningsTrend)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-3xl font-medium">₹{totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Last {timeframe} days</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Briefcase className="size-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${projectsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {projectsTrend > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {Math.abs(projectsTrend)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Completed Projects</div>
            <div className="text-3xl font-medium">{completedProjects}</div>
            <div className="text-xs text-gray-500 mt-1">{activeProjects} currently active</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <Target className="size-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${winRateTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {winRateTrend > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {Math.abs(winRateTrend)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Bid Win Rate</div>
            <div className="text-3xl font-medium">{winRate}%</div>
            <div className="text-xs text-gray-500 mt-1">{acceptedBids} of {totalBids} bids won</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Star className="size-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Avg Project Value</div>
            <div className="text-3xl font-medium">₹{Math.round(avgProjectValue).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Per completed project</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-6">Monthly Earnings Trend</h3>
              <div className="space-y-4">
                {monthlyEarnings.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-12">{data.month}</span>
                      <span className="text-gray-600">{data.projects} projects</span>
                      <span className="font-medium">₹{data.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                        style={{ width: `${(data.amount / maxEarning) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="size-5 text-green-600" />
                      <span>Completed Projects</span>
                    </div>
                    <span className="font-medium">₹{totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-orange-600" />
                      <span>Pending Payments</span>
                    </div>
                    <span className="font-medium">₹35,000</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-5 text-blue-600" />
                      <span>In Progress</span>
                    </div>
                    <span className="font-medium">₹62,000</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl mb-4">Payment Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-600">On-time Payments</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-600">Avg Payment Time</span>
                      <span className="font-medium">3.2 days</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-600">Milestone Completion</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-6">Projects by Category</h3>
              <div className="space-y-4">
                {categoryData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.category}</span>
                      <span className="text-gray-600">{data.count} projects ({data.percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="size-8" />
                </div>
                <div className="text-3xl font-medium mb-1">{totalProjects}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="size-8" />
                </div>
                <div className="text-3xl font-medium mb-1">{activeProjects}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-8" />
                </div>
                <div className="text-3xl font-medium mb-1">{completedProjects}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-6">Client Satisfaction</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">Excellent (5 stars)</span>
                    </div>
                    <span className="text-sm font-medium">{satisfaction.excellent}%</span>
                  </div>
                  <Progress value={satisfaction.excellent} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 fill-green-400 text-green-400" />
                      <span className="text-sm">Good (4 stars)</span>
                    </div>
                    <span className="text-sm font-medium">{satisfaction.good}%</span>
                  </div>
                  <Progress value={satisfaction.good} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 fill-orange-400 text-orange-400" />
                      <span className="text-sm">Average (3 stars)</span>
                    </div>
                    <span className="text-sm font-medium">{satisfaction.average}%</span>
                  </div>
                  <Progress value={satisfaction.average} className="h-2" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl mb-4">Response Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span>Avg Response Time</span>
                    <span className="font-medium">2.3 hours</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span>Communication Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span>Messages Sent</span>
                    <span className="font-medium">342</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl mb-4">Delivery Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span>On-time Delivery</span>
                    <span className="font-medium">93%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <span>Avg Delivery Time</span>
                    <span className="font-medium">12 days</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span>Quality Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.9</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-6">Monthly Goals</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Revenue Goal</h4>
                      <p className="text-sm text-gray-600">₹{totalEarnings.toLocaleString()} / ₹100,000</p>
                    </div>
                    <Badge className="bg-green-500">{Math.min(100, (totalEarnings / 100000) * 100).toFixed(0)}%</Badge>
                  </div>
                  <Progress value={Math.min(100, (totalEarnings / 100000) * 100)} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Projects Completed</h4>
                      <p className="text-sm text-gray-600">{completedProjects} / 8 projects</p>
                    </div>
                    <Badge className="bg-blue-500">{Math.min(100, (completedProjects / 8) * 100).toFixed(0)}%</Badge>
                  </div>
                  <Progress value={Math.min(100, (completedProjects / 8) * 100)} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Client Satisfaction</h4>
                      <p className="text-sm text-gray-600">4.8 / 5.0 rating</p>
                    </div>
                    <Badge className="bg-purple-500">96%</Badge>
                  </div>
                  <Progress value={96} className="h-3" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                    <Award className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">Top Rated</h4>
                    <p className="text-sm text-gray-600">Achieve 95% satisfaction</p>
                  </div>
                </div>
                <Progress value={96} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">Almost there! Keep up the great work</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                    <ThumbsUp className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">Rising Star</h4>
                    <p className="text-sm text-gray-600">Complete 10 projects</p>
                  </div>
                </div>
                <Progress value={(completedProjects / 10) * 100} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">{10 - completedProjects} more to go!</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
