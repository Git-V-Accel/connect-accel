import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../contexts/DataContext';
import {
    Briefcase,
    Clock,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { statusColors, statusLabels } from '../../constants/projectConstants';

export default function AdminDashboard() {
    const { projects, consultations, bids } = useData();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const pendingProjects = projects.filter(p => p.status === 'pending_review' || p.status === 'pending' || p.status === 'active');
    const biddingProjects = projects.filter(p => p.status === 'in_bidding');
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'assigned' || p.status === 'hold');
    const pendingConsultations = consultations.filter(c => c.status === 'requested');
    const pendingBids = bids.filter(b => b.status === 'pending');

    const stats = [
        { label: 'Pending Review', value: pendingProjects.length.toString(), icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', link: '/admin/projects' },
        { label: 'In Bidding', value: biddingProjects.length.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/admin/projects' },
        { label: 'Active Projects', value: activeProjects.length.toString(), icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', link: '/admin/projects' },
    ];

    const recentProjects = projects.slice(0, 5).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );


    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Admin Dashboard"
                    description="Manage projects, freelancers, and platform operations"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            bgColor={stat.bgColor}
                            link={stat.link}
                        />
                    ))}
                </div>

                {pendingProjects.length > 0 && (
                    <Card className="p-6 bg-yellow-50 border-yellow-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-lg mb-2">Action Required</h3>
                                <p className="text-gray-700">
                                    {pendingProjects.length} project{pendingProjects.length !== 1 ? 's' : ''} waiting for review
                                </p>
                            </div>
                            <Link to="/admin/projects">
                                <Button>Review Now</Button>
                            </Link>
                        </div>
                    </Card>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Recent Projects</h3>
                            <Link to="/admin/projects">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="size-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentProjects.map(project => (
                                <Link key={project.id} to={`/admin/projects/${project.id}/review`}>
                                    <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{project.title}</h4>
                                                <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                                            </div>
                                            <Badge className={(statusColors as any)[project.status] || 'bg-gray-100 text-gray-700'}>
                                                {(statusLabels as any)[project.status] || project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>₹{project.client_budget.toLocaleString()}</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Pending Actions</h3>
                        </div>
                        <div className="space-y-3">
                            {pendingConsultations.length > 0 && (
                                <Link to="/admin/consultations">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Schedule Consultations</p>
                                                <p className="text-sm text-gray-600">{pendingConsultations.length} pending</p>
                                            </div>
                                            <ArrowRight className="size-5 text-blue-600" />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {pendingBids.length > 0 && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Review Bids</p>
                                            <p className="text-sm text-gray-600">{pendingBids.length} new bids</p>
                                        </div>
                                        <ArrowRight className="size-5 text-purple-600" />
                                    </div>
                                </div>
                            )}

                            {pendingConsultations.length === 0 && pendingBids.length === 0 && (
                                <div className="p-8 text-center text-gray-600">
                                    <p>No pending actions</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-600">Total Projects</p>
                            <p className="text-2xl font-medium mt-1">{projects.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-medium mt-1">
                                ₹{projects.reduce((sum, p) => sum + (p.budget || p.client_budget || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Consultations</p>
                            <p className="text-2xl font-medium mt-1">{consultations.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Bids</p>
                            <p className="text-2xl font-medium mt-1">{bids.length}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
