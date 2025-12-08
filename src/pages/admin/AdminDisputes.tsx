import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useData } from '../../contexts/DataContext';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  Eye,
  MessageSquare,
  DollarSign,
  Shield,
  Scale,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function AdminDisputes() {
  const { disputes, updateDispute, projects } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);

  // Form states
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

  const openDisputes = disputes.filter((d) => d.status === 'open');
  const inReviewDisputes = disputes.filter((d) => d.status === 'in_review');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');
  const escalatedDisputes = disputes.filter((d) => d.status === 'escalated');

  const filteredDisputes = disputes.filter((d) =>
    d.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    projects.find((p) => p.id === d.project_id)?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResolveDispute = () => {
    if (!selectedDispute || !resolution || !resolutionNotes) {
      toast.error('Please fill all required fields');
      return;
    }

    updateDispute(selectedDispute.id, {
      status: 'resolved',
      resolution,
      resolution_notes: resolutionNotes,
      refund_amount: refundAmount ? parseFloat(refundAmount) : undefined,
      resolved_at: new Date().toISOString(),
      resolved_by: 'ADMIN-1',
    });

    // Update project status if needed
    if (resolution === 'cancel_project') {
      const project = projects.find((p) => p.id === selectedDispute.project_id);
      if (project) {
        // Would update project status here
      }
    }

    toast.success('Dispute resolved successfully!');
    setIsResolveDialogOpen(false);
    setResolution('');
    setResolutionNotes('');
    setRefundAmount('');
  };

  const handleEscalateDispute = () => {
    if (!selectedDispute || !escalationReason) {
      toast.error('Please provide escalation reason');
      return;
    }

    updateDispute(selectedDispute.id, {
      status: 'escalated',
      escalation_reason: escalationReason,
      escalated_at: new Date().toISOString(),
    });

    toast.success('Dispute escalated to Super Admin');
    setIsEscalateDialogOpen(false);
    setEscalationReason('');
  };

  const handleMoveToReview = (disputeId: string) => {
    updateDispute(disputeId, {
      status: 'in_review',
      reviewed_at: new Date().toISOString(),
    });
    toast.success('Dispute moved to review');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_review':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'escalated':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-gray-100 text-gray-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const DisputeCard = ({ dispute }: { dispute: any }) => {
    const project = projects.find((p) => p.id === dispute.project_id);

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="size-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">{dispute.reason}</h3>
                  <p className="text-sm text-gray-600">{project?.title}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getSeverityColor(dispute.severity)}>
                {dispute.severity?.toUpperCase() || 'MEDIUM'}
              </Badge>
            </div>
          </div>

          <p className="text-gray-700 line-clamp-2">{dispute.description}</p>

          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div>
              <div className="text-sm text-gray-600">Filed By</div>
              <div className="flex items-center gap-1 mt-1">
                <User className="size-4" />
                <span className="capitalize">{dispute.filed_by}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Filed On</div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="size-4" />
                {new Date(dispute.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Amount at Stake</div>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="size-4" />
                ₹{project?.client_budget.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDispute(dispute);
                setIsViewDialogOpen(true);
              }}
            >
              <Eye className="size-4 mr-2" />
              View Details
            </Button>

            {dispute.status === 'open' && (
              <Button
                size="sm"
                onClick={() => handleMoveToReview(dispute.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="size-4 mr-2" />
                Start Review
              </Button>
            )}

            {dispute.status === 'in_review' && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setResolution('');
                    setResolutionNotes('');
                    setRefundAmount('');
                    setIsResolveDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setEscalationReason('');
                    setIsEscalateDialogOpen(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Shield className="size-4 mr-2" />
                  Escalate
                </Button>
              </>
            )}

            {dispute.status === 'resolved' && (
              <Link to={`/admin/projects/${dispute.project_id}/review`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="size-4 mr-2" />
                  View Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Dispute Resolution</h1>
          <p className="text-gray-600">
            Review and resolve disputes between clients and freelancers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl mt-1">{openDisputes.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="size-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl mt-1">{inReviewDisputes.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="size-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl mt-1">{resolvedDisputes.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escalated</p>
                <p className="text-2xl mt-1">{escalatedDisputes.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Shield className="size-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Disputes Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
            <TabsTrigger value="open">
              <AlertCircle className="size-4 mr-2" />
              Open ({openDisputes.length})
            </TabsTrigger>
            <TabsTrigger value="review">
              <FileText className="size-4 mr-2" />
              In Review ({inReviewDisputes.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              <CheckCircle className="size-4 mr-2" />
              Resolved ({resolvedDisputes.length})
            </TabsTrigger>
            <TabsTrigger value="escalated">
              <Shield className="size-4 mr-2" />
              Escalated ({escalatedDisputes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No disputes</h3>
                <p className="text-gray-600">All projects are running smoothly!</p>
              </Card>
            ) : (
              filteredDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {openDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All caught up!</h3>
                <p className="text-gray-600">No open disputes</p>
              </Card>
            ) : (
              openDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {inReviewDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No disputes in review</h3>
                <p className="text-gray-600">Disputes being reviewed will appear here</p>
              </Card>
            ) : (
              inReviewDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No resolved disputes</h3>
                <p className="text-gray-600">Resolved disputes will appear here</p>
              </Card>
            ) : (
              resolvedDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="escalated" className="space-y-4">
            {escalatedDisputes.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No escalated disputes</h3>
                <p className="text-gray-600">
                  Complex disputes requiring super admin attention will appear here
                </p>
              </Card>
            ) : (
              escalatedDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dispute Details</DialogTitle>
              <DialogDescription>Full information about this dispute</DialogDescription>
            </DialogHeader>

            {selectedDispute && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedDispute.status)}>
                    {selectedDispute.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getSeverityColor(selectedDispute.severity)}>
                    {selectedDispute.severity?.toUpperCase() || 'MEDIUM'}
                  </Badge>
                </div>

                {/* Dispute Info */}
                <div>
                  <h4 className="font-medium mb-3">Dispute Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason</span>
                      <span>{selectedDispute.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filed By</span>
                      <span className="capitalize">{selectedDispute.filed_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filed On</span>
                      <span>{new Date(selectedDispute.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedDispute.description}
                  </p>
                </div>

                {/* Evidence */}
                {selectedDispute.evidence && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Evidence</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedDispute.evidence}</p>
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {selectedDispute.resolution && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Resolution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Decision</span>
                        <span className="capitalize">{selectedDispute.resolution.replace('_', ' ')}</span>
                      </div>
                      {selectedDispute.refund_amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Refund Amount</span>
                          <span>₹{selectedDispute.refund_amount.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedDispute.resolution_notes && (
                        <div className="pt-2">
                          <span className="text-sm text-gray-600">Notes:</span>
                          <p className="text-sm mt-1">{selectedDispute.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resolve Dialog */}
        <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Provide your resolution and decision
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Resolution Decision *</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="favor_client">In Favor of Client</SelectItem>
                    <SelectItem value="favor_freelancer">In Favor of Freelancer</SelectItem>
                    <SelectItem value="partial_refund">Partial Refund</SelectItem>
                    <SelectItem value="full_refund">Full Refund</SelectItem>
                    <SelectItem value="cancel_project">Cancel Project</SelectItem>
                    <SelectItem value="continue_project">Continue Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(resolution === 'partial_refund' || resolution === 'full_refund') && (
                <div>
                  <Label>Refund Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter refund amount"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label>Resolution Notes *</Label>
                <Textarea
                  placeholder="Explain your decision and reasoning..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Resolution Guidelines</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Be fair and impartial in your decision</li>
                  <li>• Review all evidence and communications</li>
                  <li>• Clearly explain your reasoning</li>
                  <li>• Consider platform policies and best practices</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolveDispute} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="size-4 mr-2" />
                Resolve Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Escalate Dialog */}
        <Dialog open={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalate to Super Admin</DialogTitle>
              <DialogDescription>
                This dispute requires higher level review
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Escalation Reason *</Label>
                <Textarea
                  placeholder="Why does this dispute need to be escalated..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  This dispute will be transferred to Super Admin for final resolution.
                  You will no longer be able to make decisions on this case.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEscalateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEscalateDispute} className="bg-red-600 hover:bg-red-700">
                <Shield className="size-4 mr-2" />
                Escalate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}