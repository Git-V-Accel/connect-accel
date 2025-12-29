import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
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
  AuditLogResponse,
} from '../../services/auditLogService';
import {
  Shield,
  Search,
  Filter,
  User,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Clock,
  MapPin,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, actionFilter, severityFilter, startDate, endDate]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await getAllAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        action: actionFilter === 'all' ? undefined : actionFilter,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchTerm || undefined,
      });

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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleViewDetails = (log: AuditLogResponse) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return <User className="size-4" />;
    if (action.includes('UPDATED')) return <Activity className="size-4" />;
    if (action.includes('DELETED')) return <AlertCircle className="size-4" />;
    return <Shield className="size-4" />;
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
            <h1 className="text-3xl mb-2">Audit Logs</h1>
            <p className="text-gray-600">
              Track all user management activities and changes
            </p>
          </div>
          <Button>
            <Download className="size-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* <div className="md:col-span-2"> */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            {/* </div> */}

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="USER_CREATED">User Created</SelectItem>
                <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                <SelectItem value="USER_ROLE_UPDATED">Role Updated</SelectItem>
                <SelectItem value="USER_STATUS_UPDATED">Status Updated</SelectItem>
                <SelectItem value="USER_PROFILE_UPDATED">Profile Updated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-end">

              <Button onClick={handleSearch} className="w-full">
                <Filter className="size-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Audit Trail</h2>
            <p className="text-sm text-gray-600">
              Showing {auditLogs.length} of {totalLogs} logs
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.description}</span>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="size-3" />
                            <span>{log.performedByName}</span>
                            <span className="text-gray-400">({log.performedByRole})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                          {log.ipAddress && (
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              <span>{log.ipAddress}</span>
                            </div>
                          )}
                        </div>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Changes: </span>
                            <span className="text-gray-800">
                              {Object.keys(log.changes).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="size-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
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
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this audit log entry
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-6">
                {/* Action Info */}
                <div>
                  <h3 className="font-medium mb-3">Action Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Action Type</p>
                      <p className="font-medium">{formatActionName(selectedLog.action)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Severity</p>
                      <Badge className={getSeverityColor(selectedLog.severity)}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timestamp</p>
                      <p className="font-medium">
                        {format(new Date(selectedLog.createdAt), 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Log ID</p>
                      <p className="font-mono text-sm">{selectedLog._id}</p>
                    </div>
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
                      {selectedLog.performedBy.userID && (
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
                      {selectedLog.targetUser && selectedLog.targetUser.userID && (
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

                {/* Description */}
                <div>
                  <h3 className="font-medium mb-3">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedLog.description}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
