import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Search, Calendar, IndianRupee, Clock, Send, Filter, Eye, FileText } from 'lucide-react';
import * as bidService from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { toast } from '../../utils/toast';

export default function BrowseProjects() {
  const { user } = useAuth();
  const { projects } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availableBids, setAvailableBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [myBiddingIds, setMyBiddingIds] = useState<string[]>([]);
  const [myBiddingMap, setMyBiddingMap] = useState<Map<string, string>>(new Map()); // Map of adminBidId -> biddingId

  useEffect(() => {
    const loadBids = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch all available admin bids (not filtering by status to show all bids)
        const response = await bidService.getAvailableAdminBids({});
        setAvailableBids(response.bids || []);
        
        // Fetch freelancer's existing biddings to track which bids they've already submitted proposals for
        try {
          const biddingResponse = await apiClient.get(API_CONFIG.BIDDING.GET_BY_FREELANCER(user.id));
          if (biddingResponse.data.success && biddingResponse.data.data) {
            const biddings = Array.isArray(biddingResponse.data.data) ? biddingResponse.data.data : [];
            const biddingIds: string[] = [];
            const biddingMap = new Map<string, string>();
            
            biddings.forEach((b: any) => {
              const adminBidId = b.adminBidId?._id?.toString() || b.adminBidId?.toString() || b.adminBidId;
              const biddingId = b._id?.toString() || b.id?.toString();
              if (adminBidId) {
                biddingIds.push(adminBidId);
                if (biddingId) {
                  biddingMap.set(adminBidId, biddingId);
                }
              }
            });
            
            setMyBiddingIds(biddingIds);
            setMyBiddingMap(biddingMap);
          }
        } catch (error) {
          console.error('Failed to load my biddings:', error);
        }
      } catch (error: any) {
        console.error('Failed to load bids:', error);
        toast.error('Failed to load available bids');
      } finally {
        setLoading(false);
      }
    };
    loadBids();
  }, [user]);

  if (!user) return null;

  // Show all bids, but we'll hide the Submit Proposal button for bids where user already submitted
  const filteredProjects = availableBids.filter(bid => {
    const matchesSearch = !searchQuery || 
      bid.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category if selected
    const matchesCategory = categoryFilter === 'all' || 
      bid.project?.category === categoryFilter ||
      (bid.projectId && projects.find(p => p.id === bid.projectId)?.category === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  // Extract categories from bids' projects
  const categories = [...new Set(
    availableBids
      .map(bid => bid.project?.category)
      .filter((cat): cat is string => !!cat)
      .concat(projects.map(p => p.category).filter(Boolean))
  )].filter(Boolean);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Browse Projects</h1>
          <p className="text-gray-600">Find and bid on projects that match your skills</p>
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${filteredProjects.length} ${filteredProjects.length === 1 ? 'bid' : 'bids'} available`}
          </p>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Loading available bids...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map(bid => (
              <Card key={bid.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{bid.projectTitle}</h3>
                      <Badge variant="outline">Posted by {bid.bidder?.role === 'agent' ? 'Agent' : bid.bidder?.role === 'admin' ? 'Admin' : 'Superadmin'}</Badge>
                    </div>
                    <div className="text-gray-600 mb-4 line-clamp-2">
                      <RichTextViewer content={bid.description || ''} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="size-4 text-gray-400" />
                        <span className="text-gray-600">₹{bid.bidAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-gray-400" />
                        <span className="text-gray-600">{bid.timeline || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant={bid.status === 'pending' ? 'default' : 'secondary'}>
                          {bid.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Posted:</span>
                        <span className="text-gray-600">
                          {bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Posted by {bid.bidderName || 'Admin/Superadmin/Agent'} on {bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      asChild
                    >
                      <Link to={`/freelancer/bids/${bid.id}/view`}>
                        <Eye className="size-4 mr-2" />
                        View Bid
                      </Link>
                    </Button>
                    {/* Show View Your Proposal if already submitted, otherwise Show Submit Proposal */}
                    {(() => {
                      const hasSubmitted = myBiddingIds.some(biddingId => 
                        biddingId === bid.id || 
                        biddingId === String(bid.id) ||
                        String(biddingId) === String(bid.id)
                      );
                      const biddingId = myBiddingMap.get(bid.id) || myBiddingMap.get(String(bid.id));
                      
                      if (hasSubmitted && biddingId) {
                        return (
                          <Button 
                            variant="outline"
                            asChild
                          >
                            <Link to={`/admin/bids/${bid.id}/proposal?biddingId=${biddingId}`}>
                              <FileText className="size-4 mr-2" />
                              View Your Proposal
                            </Link>
                          </Button>
                        );
                      } else if (!hasSubmitted) {
                        return (
                          <Button 
                            asChild
                          >
                            <Link to={`/freelancer/bids/${bid.id}/submit-proposal`}>
                              <Send className="size-4 mr-2" />
                              Submit Proposal
                            </Link>
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </Card>
            ))}

            {filteredProjects.length === 0 && (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No bids available</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Check back soon for new opportunities posted by admin/superadmin/agent'
                  }
                </p>
              </Card>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}