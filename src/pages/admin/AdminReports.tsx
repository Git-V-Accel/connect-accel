import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useData } from '../../contexts/DataContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Target,
  Award,
} from 'lucide-react';

export default function AdminReports() {
  const { projects, consultations, disputes, bids } = useData();
  const [timeRange, setTimeRange] = useState('30');

  // Calculate metrics
  const totalRevenue = projects.reduce((sum, p) => sum + (p.margin || 0), 0);
  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const totalProjects = projects.length;

  // Revenue by category
  const revenueByCategory = projects.reduce((acc: any, project) => {
    if (!acc[project.category]) {
      acc[project.category] = 0;
    }
    acc[project.category] += project.margin || 0;
    return acc;
  }, {});

  // Average margin percentage
  const avgMarginPercentage =
    projects.filter((p) => p.margin_percentage).length > 0
      ? projects.reduce((sum, p) => sum + (p.margin_percentage || 0), 0) /
        projects.filter((p) => p.margin_percentage).length
      : 0;

  // Project status distribution
  const statusDistribution = projects.reduce((acc: any, project) => {
    if (!acc[project.status]) {
      acc[project.status] = 0;
    }
    acc[project.status]++;
    return acc;
  }, {});

  // Top performing categories
  const categoryPerformance = Object.entries(revenueByCategory)
    .map(([category, revenue]) => ({
      category,
      revenue: revenue as number,
      projectCount: projects.filter((p) => p.category === category).length,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Monthly trends (mock data - would calculate from actual dates)
  const monthlyData = [
    { month: 'Jan', revenue: 125000, projects: 8, margin: 18500 },
    { month: 'Feb', revenue: 145000, projects: 12, margin: 21750 },
    { month: 'Mar', revenue: 168000, projects: 15, margin: 25200 },
    { month: 'Apr', revenue: 192000, projects: 18, margin: 28800 },
    { month: 'May', revenue: 215000, projects: 22, margin: 32250 },
    { month: 'Jun', revenue: totalRevenue, projects: totalProjects, margin: totalRevenue },
  ];

  // Calculate growth
  const revenueGrowth = monthlyData.length >= 2
    ? ((monthlyData[monthlyData.length - 1].revenue - monthlyData[monthlyData.length - 2].revenue) /
        monthlyData[monthlyData.length - 2].revenue) * 100
    : 0;

  const projectGrowth = monthlyData.length >= 2
    ? ((monthlyData[monthlyData.length - 1].projects - monthlyData[monthlyData.length - 2].projects) /
        monthlyData[monthlyData.length - 2].projects) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">
              Track performance, revenue, and platform insights
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
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
            <Button>
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="size-5 text-purple-600" />
              </div>
              {revenueGrowth > 0 ? (
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUp className="size-3 mr-1" />
                  {revenueGrowth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <ArrowDown className="size-3 mr-1" />
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl mt-1">₹{totalRevenue.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="size-5 text-blue-600" />
              </div>
              {projectGrowth > 0 ? (
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUp className="size-3 mr-1" />
                  {projectGrowth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <ArrowDown className="size-3 mr-1" />
                  {Math.abs(projectGrowth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">Total Projects</p>
            <p className="text-2xl mt-1">{totalProjects}</p>
          </Card>

          <Card className="p-6">
            <div className="bg-green-100 p-3 rounded-lg mb-2">
              <Target className="size-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Margin %</p>
            <p className="text-2xl mt-1">{avgMarginPercentage.toFixed(1)}%</p>
          </Card>

          <Card className="p-6">
            <div className="bg-orange-100 p-3 rounded-lg mb-2">
              <Award className="size-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl mt-1">
              {totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(0) : 0}%
            </p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="size-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="size-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="size-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="size-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Monthly Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
              <div className="space-y-3">
                {monthlyData.map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-gray-600">
                        {month.projects} projects • ₹{month.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(month.revenue / Math.max(...monthlyData.map((m) => m.revenue))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Project Status</h3>
                <div className="space-y-3">
                  {Object.entries(statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{status.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((count as number) / totalProjects) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Activity Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-gray-600" />
                      <span className="text-sm">Consultations</span>
                    </div>
                    <span className="font-medium">{consultations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-gray-600" />
                      <span className="text-sm">Total Bids</span>
                    </div>
                    <span className="font-medium">{bids.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="size-4 text-gray-600" />
                      <span className="text-sm">Disputes</span>
                    </div>
                    <span className="font-medium">{disputes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="size-4 text-gray-600" />
                      <span className="text-sm">Completed Projects</span>
                    </div>
                    <span className="font-medium">{completedProjects}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Revenue by Category</h3>
                <div className="space-y-3">
                  {categoryPerformance.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{cat.category}</span>
                        <span className="font-medium">₹{cat.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(cat.revenue / Math.max(...categoryPerformance.map((c) => c.revenue))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Margin Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Margin Earned</div>
                    <div className="text-3xl mt-1">₹{totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Avg Margin %</div>
                      <div className="text-2xl mt-1">{avgMarginPercentage.toFixed(1)}%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Projects with Margin</div>
                      <div className="text-2xl mt-1">
                        {projects.filter((p) => p.margin).length}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Revenue Projects */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Top Revenue Projects</h3>
              <div className="space-y-3">
                {projects
                  .filter((p) => p.margin)
                  .sort((a, b) => (b.margin || 0) - (a.margin || 0))
                  .slice(0, 5)
                  .map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-600">{project.client_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-purple-600">
                          ₹{(project.margin || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {project.margin_percentage}% margin
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-medium mb-4">By Category</h3>
                <div className="space-y-3">
                  {categoryPerformance.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <span>{cat.category}</span>
                      <Badge variant="outline">{cat.projectCount}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">By Status</h3>
                <div className="space-y-3">
                  {Object.entries(statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Projects</span>
                    <span className="font-medium">{totalProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Active</span>
                    <span className="font-medium">{activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">{completedProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">
                      {totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Platform Health</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Project Success Rate</span>
                      <span className="font-medium">
                        {totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Dispute Rate</span>
                      <span className="font-medium">
                        {totalProjects > 0 ? ((disputes.length / totalProjects) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${totalProjects > 0 ? (disputes.length / totalProjects) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Avg Bids per Project</span>
                      <span className="font-medium">
                        {totalProjects > 0 ? (bids.length / totalProjects).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((totalProjects > 0 ? (bids.length / totalProjects) * 10 : 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Engagement Metrics</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Total Consultations</span>
                    <span className="font-medium">{consultations.length}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Total Bids</span>
                    <span className="font-medium">{bids.length}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Active Disputes</span>
                    <span className="font-medium">
                      {disputes.filter((d) => d.status !== 'resolved').length}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Resolved Disputes</span>
                    <span className="font-medium">
                      {disputes.filter((d) => d.status === 'resolved').length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
