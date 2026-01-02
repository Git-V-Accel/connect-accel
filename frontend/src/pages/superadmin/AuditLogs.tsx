import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  getAllAuditLogs,
  getAuditLogStats,
  AuditLogResponse,
  AuditLogStats,
} from '../../services/auditLogService';
import {
  Database,
  Activity,
  AlertCircle,
  AlertTriangle,
  Search,
  Download,
  Eye,
  Info,
  User,
  CreditCard,
  FolderKanban,
  Lock,
  Clock,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [currentPage, categoryFilter, severityFilter, dateFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchAuditLogs();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let searchQuery = searchTerm || undefined;

      // If category filter is applied, modify the search to include action patterns
      if (categoryFilter !== 'all') {
        const actionPatterns = {
          'user': 'USER',
          'bid': 'BID',
          'payment': 'PAYMENT',
          'security': 'LOGIN,AUTH',
          'project': 'PROJECT',
        };
        const categorySearch = actionPatterns[categoryFilter as keyof typeof actionPatterns];
        if (categorySearch) {
          searchQuery = searchQuery ? `${searchQuery} ${categorySearch}` : categorySearch;
        }
      }

      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        search: searchQuery,
        startDate: getDateRange(dateFilter).startDate,
        endDate: getDateRange(dateFilter).endDate,
      };

      const response = await getAllAuditLogs(filters);
      setAuditLogs(response.auditLogs);
      setTotalPages(response.pages);
      setTotalLogs(response.total);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const dateRange = getDateRange(dateFilter);
      const response = await getAuditLogStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setStats(response.stats);
    } catch (error: any) {
      console.error('Error fetching audit stats:', error);
    }
  };

  const getDateRange = (filter: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (filter) {
      case 'today':
        startDate = format(now, 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case '7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = format(sevenDaysAgo, 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case '30days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case '90days':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        startDate = format(ninetyDaysAgo, 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      default:
        break;
    }

    return { startDate, endDate };
  };

  // Stats data from API
  const statsData = [
    { 
      label: 'Total Logs', 
      value: stats?.totalLogs?.toLocaleString() || '0', 
      icon: Database, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: "Today's Activity", 
      value: stats?.byAction?.reduce((sum, item) => sum + item.count, 0)?.toLocaleString() || '0', 
      icon: Activity, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50' 
    },
    { 
      label: 'Critical Events', 
      value: stats?.bySeverity?.find(s => s._id === 'critical')?.count?.toString() || '0', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50' 
    },
    { 
      label: 'Warnings', 
      value: stats?.bySeverity?.find(s => s._id === 'high')?.count?.toString() || '0', 
      icon: AlertTriangle, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50' 
    },
  ];

  const getCategoryFromAction = (action: string) => {
    if (action.includes('USER')) return 'user';
    if (action.includes('BID')) return 'bid';
    if (action.includes('PAYMENT')) return 'payment';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'security';
    if (action.includes('PROJECT')) return 'project';
    return 'system';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'bg-purple-100 text-purple-700';
      case 'bid': return 'bg-orange-100 text-orange-700';
      case 'payment': return 'bg-green-100 text-green-700';
      case 'security': return 'bg-red-100 text-red-700';
      case 'project': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="size-3" />;
      case 'high': return <AlertTriangle className="size-3" />;
      case 'medium': return <AlertTriangle className="size-3" />;
      case 'low': return <Info className="size-3" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return <User className="size-3" />;
      case 'bid': return <FolderKanban className="size-3" />;
      case 'payment': return <CreditCard className="size-3" />;
      case 'security': return <Lock className="size-3" />;
      case 'project': return <FolderKanban className="size-3" />;
      default: return null;
    }
  };

  const handleViewDetails = (log: AuditLogResponse) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting logs...');
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
            <p className="text-gray-600">Complete audit trail of all system activities.</p>
          </div>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="size-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="bid">Bid</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Last 7 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Recent Activity Table */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const category = getCategoryFromAction(log.action);
                    return (
                      <tr key={log._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{format(new Date(log.createdAt), 'dd MMM yyyy, h:mm a')}</td>
                        <td className="py-3 px-4 text-sm">{log.performedByName} ({log.performedByRole})</td>
                        <td className="py-3 px-4 text-sm font-mono">{log.action}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${getCategoryColor(category)} flex items-center gap-1 w-fit`}>
                            {getCategoryIcon(category)}
                            {category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getSeverityColor(log.severity)} flex items-center gap-1 w-fit`}>
                            {getSeverityIcon(log.severity)}
                            {log.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{log.description}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            className="p-2"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalLogs} total logs)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this audit log entry
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Timestamp</p>
                    <p className="font-medium">{format(new Date(selectedLog.createdAt), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User</p>
                    <p className="font-medium">{selectedLog.performedByName} ({selectedLog.performedByRole})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Action</p>
                    <p className="font-mono text-sm">{formatActionName(selectedLog.action)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge className={`${getCategoryColor(getCategoryFromAction(selectedLog.action))} flex items-center gap-1 w-fit`}>
                      {getCategoryIcon(getCategoryFromAction(selectedLog.action))}
                      {getCategoryFromAction(selectedLog.action)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <Badge className={`${getSeverityColor(selectedLog.severity)} flex items-center gap-1 w-fit`}>
                      {getSeverityIcon(selectedLog.severity)}
                      {selectedLog.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium">{selectedLog.description}</p>
                  </div>
                </div>

                {/* Performer Info */}
                <div>
                  <h3 className="font-medium mb-3">Performed By</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedLog.performedByName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedLog.performedByEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <Badge>{selectedLog.performedByRole}</Badge>
                      </div>
                      {selectedLog.performedBy?.userID && (
                        <div>
                          <p className="text-sm text-gray-600">User ID</p>
                          <p className="font-mono text-sm">{selectedLog.performedBy.userID}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target User Info */}
                <div>
                  <h3 className="font-medium mb-3">Target User</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedLog.targetUserName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedLog.targetUserEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <Badge>{selectedLog.targetUserRole}</Badge>
                      </div>
                      {selectedLog.targetUser?.userID && (
                        <div>
                          <p className="text-sm text-gray-600">User ID</p>
                          <p className="font-mono text-sm">{selectedLog.targetUser.userID}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Changes */}
                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Changes Made</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedLog.changes).map(([field, change]: [string, any]) => (
                        <div key={field} className="border rounded-lg p-4">
                          <p className="font-medium mb-2 capitalize">{field.replace(/_/g, ' ')}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Previous Value</p>
                              <div className="bg-red-50 p-2 rounded text-sm">
                                {typeof change.from === 'object'
                                  ? JSON.stringify(change.from, null, 2)
                                  : String(change.from || 'N/A')}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">New Value</p>
                              <div className="bg-green-50 p-2 rounded text-sm">
                                {typeof change.to === 'object'
                                  ? JSON.stringify(change.to, null, 2)
                                  : String(change.to || 'N/A')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div>
                  <h3 className="font-medium mb-3">Technical Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedLog.ipAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-gray-600" />
                        <span className="text-sm text-gray-600">IP Address:</span>
                        <span className="font-mono text-sm">{selectedLog.ipAddress}</span>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div className="flex items-start gap-2">
                        <Monitor className="size-4 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">User Agent:</span>
                          <p className="font-mono text-xs mt-1 break-all">{selectedLog.userAgent}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Additional Metadata</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
