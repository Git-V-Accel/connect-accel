
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export default function DashboardSkeleton() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Banner Skeleton (Optional placeholder) */}
                <Skeleton className="h-48 w-full rounded-xl" />

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Active Projects Skeleton */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-40" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-2 w-full rouded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Activity Skeleton */}
                    <Card className="p-6">
                        <div className="mb-6">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
