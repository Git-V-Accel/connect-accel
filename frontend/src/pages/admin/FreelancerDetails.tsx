import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  UserPlus,
} from 'lucide-react';

export default function FreelancerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { freelancers, projects } = useData();

  const selectedFreelancer = id ? freelancers.find(f => f.id === id) : null;

  if (!selectedFreelancer) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/freelancers-management')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Directory
          </Button>
          <Card className="p-12 text-center">
            <h3 className="text-xl mb-2">Freelancer not found</h3>
            <p className="text-gray-600">The freelancer you're looking for doesn't exist.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleAssignToProject = () => {
    navigate(`/admin/freelancers/${id}/assign`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/freelancers')}
          className="mb-4"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Directory
        </Button>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 size-20 rounded-full flex items-center justify-center">
                <span className="text-3xl">
                  {selectedFreelancer.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl">{selectedFreelancer.name}</h2>
                  {selectedFreelancer.verified && (
                    <CheckCircle className="size-6 text-blue-600" />
                  )}
                </div>
                <p className="text-gray-600">{selectedFreelancer.specialization}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={selectedFreelancer.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {selectedFreelancer.available ? 'Available' : 'Busy'}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    {selectedFreelancer.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Completed Projects</div>
                <div className="text-2xl mt-1">{selectedFreelancer.completedProjects}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-2xl mt-1">{selectedFreelancer.successRate}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Earnings</div>
                <div className="text-2xl mt-1">₹{(selectedFreelancer.totalEarnings / 100000).toFixed(1)}L</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Bio</h4>
              <p className="text-gray-700">{selectedFreelancer.bio}</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFreelancer.skills.map((skill: string) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-600" />
                  <span>{selectedFreelancer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-gray-600" />
                  <span>{selectedFreelancer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-gray-600" />
                  <span>{selectedFreelancer.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Work Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="ml-2 font-medium">₹{selectedFreelancer.hourlyRate}/hr</span>
                </div>
                <div>
                  <span className="text-gray-600">Response Time:</span>
                  <span className="ml-2 font-medium">{selectedFreelancer.responseTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Active Projects:</span>
                  <span className="ml-2 font-medium">{selectedFreelancer.activeProjects}</span>
                </div>
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedFreelancer.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/admin/freelancers')}>
                Close
              </Button>
              <Button
                onClick={handleAssignToProject}
                disabled={!selectedFreelancer.available}
              >
                <UserPlus className="size-4 mr-2" />
                Assign to Project
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

