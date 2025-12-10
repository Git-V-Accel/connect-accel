import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft,
  Star,
  TrendingUp,
  Clock,
  Percent,
} from 'lucide-react';

export default function ViewProposal() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const { bids, projects, freelancers, getProjectsByUser } = useData();

  const bid = bids.find(b => b.id === bidId);
  const project = bid ? projects.find(p => p.id === bid.project_id) : null;
  const freelancer = bid ? freelancers.find(f => f.id === bid.freelancer_id) : null;
  
  // Calculate freelancer stats from projects
  const freelancerProjects = freelancer ? getProjectsByUser(freelancer.id, 'freelancer') : [];
  const completedProjectsCount = freelancerProjects.filter(p => p.status === 'completed').length;
  const totalProjectsCount = freelancerProjects.length;

  if (!bid || !project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl mb-2">Proposal Not Found</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4 mr-2" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate metrics
  const clientBudget = project.client_budget || 0;
  const bidAmount = bid.amount || 0;
  const platformMargin = clientBudget - bidAmount;
  const marginRate = clientBudget > 0 ? ((platformMargin / clientBudget) * 100).toFixed(1) : '0';
  const matchingRate = clientBudget > 0 ? ((bidAmount / clientBudget) * 100).toFixed(1) : '0';

  // Timeline management
  const projectTimeline = (project as any).timeline || (project as any).expected_duration || '';
  const bidDuration = bid.estimated_duration || (bid.duration_weeks ? `${bid.duration_weeks} weeks` : '');
  
  // Extract weeks from timeline strings for comparison
  const extractWeeks = (timeline: string): number | null => {
    if (!timeline) return null;
    const match = timeline.match(/(\d+)\s*(?:week|weeks?)/i);
    return match ? parseInt(match[1]) : null;
  };

  const projectWeeks = extractWeeks(projectTimeline);
  const bidWeeks = extractWeeks(bidDuration) || bid.duration_weeks;
  
  let timelineStatus = 'N/A';
  let timelineColor = 'bg-gray-100 text-gray-700';
  
  if (projectWeeks && bidWeeks) {
    if (bidWeeks <= projectWeeks) {
      timelineStatus = 'On Time';
      timelineColor = 'bg-green-100 text-green-700';
    } else if (bidWeeks <= projectWeeks * 1.2) {
      timelineStatus = 'Slightly Over';
      timelineColor = 'bg-yellow-100 text-yellow-700';
    } else {
      timelineStatus = 'Over Timeline';
      timelineColor = 'bg-red-100 text-red-700';
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            
          </Button>
          <div>
            <h1 className="text-3xl">Full Proposal</h1>
            <p className="text-gray-600 mt-1">Complete bid details and freelancer information</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Freelancer Info */}
            {freelancer && (
              <div>
                <h4 className="font-medium mb-3">Freelancer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span>{freelancer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      {freelancer.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Projects</span>
                    <span>{completedProjectsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span>
                      {totalProjectsCount > 0 
                        ? `${((completedProjectsCount / totalProjectsCount) * 100).toFixed(0)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bid Details */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Bid Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Bid Amount</Label>
                  <p className="text-2xl">₹{bid.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Delivery Time</Label>
                  <p className="text-2xl">
                    {bid.estimated_duration || 
                     (bid.duration_weeks ? `${bid.duration_weeks} weeks` : 'N/A')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Matching Rate */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Percent className="size-5" />
                    <Label className="text-sm font-medium">Matching Rate</Label>
                  </div>
                  <p className="text-2xl font-semibold">{matchingRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {matchingRate}% of client budget
                  </p>
                </div>

                {/* Margin Rate */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <TrendingUp className="size-5" />
                    <Label className="text-sm font-medium">Margin Rate</Label>
                  </div>
                  <p className="text-2xl font-semibold">{marginRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    ₹{platformMargin.toLocaleString()} margin
                  </p>
                </div>

                {/* Timeline Management */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Clock className="size-5" />
                    <Label className="text-sm font-medium">Timeline Status</Label>
                  </div>
                  <Badge className={timelineColor}>
                    {timelineStatus}
                  </Badge>
                  {projectWeeks && bidWeeks && (
                    <p className="text-xs text-gray-600 mt-2">
                      Project: {projectWeeks} weeks | Bid: {bidWeeks} weeks
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Proposal */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Cover Letter</h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {bid.proposal || bid.cover_letter || 'No proposal provided.'}
              </p>
            </div>

            {/* Submitted Date */}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                Submitted on {new Date(bid.submitted_at || bid.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

