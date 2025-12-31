import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import {
  Search,
  Star,
  Briefcase,
  IndianRupee,
  Award,
  Eye,
  UserPlus,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function AgentFreelancers() {
  const { freelancers, projects, bids } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  // Get all unique skills
  const allSkills = Array.from(new Set(freelancers.flatMap(f => f.skills)));

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === 'all' || freelancer.skills.includes(skillFilter);
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '4+' && freelancer.rating >= 4) ||
      (ratingFilter === '3+' && freelancer.rating >= 3);
    return matchesSearch && matchesSkill && matchesRating;
  });

  const getFreelancerBids = (freelancerId: string) => {
    return bids.filter(b => b.freelancer_id === freelancerId);
  };

  const getFreelancerProjects = (freelancerId: string) => {
    const freelancerBidIds = bids
      .filter(b => b.freelancer_id === freelancerId && b.status === 'accepted')
      .map(b => b.project_id);
    return projects.filter(p => freelancerBidIds.includes(p.id));
  };

  const stats = [
    {
      label: 'Total Freelancers',
      value: freelancers.length,
      icon: <UserPlus className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Top Rated (4+)',
      value: freelancers.filter(f => f.rating >= 4).length,
      icon: <Star className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Available Skills',
      value: allSkills.length,
      icon: <Award className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Active Now',
      value: freelancers.filter(f => f.availability === 'available').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Freelancer Directory</h1>
            <p className="text-gray-600 mt-1">Curate and invite top freelancers to your projects</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <Input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="4+">4+ Stars</option>
                <option value="3+">3+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
              <UserPlus className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No freelancers found</h3>
              <p className="text-gray-600">Try adjusting your filters.</p>
            </div>
          ) : (
            filteredFreelancers.map((freelancer) => {
              const completedProjects = getFreelancerProjects(freelancer.id).filter(p => p.status === 'completed');

              return (
                <div key={freelancer.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                        {freelancer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg">{freelancer.name}</h3>
                        <p className="text-sm text-gray-600">{freelancer.title}</p>
                      </div>
                    </div>
                    {freelancer.availability === 'available' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      <span>{freelancer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="size-4 text-gray-500" />
                      <span>{completedProjects.length} projects</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="size-4 text-gray-500" />
                      <span>${freelancer.hourly_rate}/hr</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{freelancer.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/agent/freelancers/${freelancer.id}`}>
                        <Eye className="size-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/agent/bids`}>
                        <FileText className="size-4 mr-2" />
                        View Bids
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
