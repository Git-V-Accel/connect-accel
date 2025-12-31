
import { Skeleton } from '../../components/ui/skeleton';
import DashboardLayout from './DashboardLayout';

interface PageSkeletonProps {
    showStats?: boolean;
}

export default function PageSkeleton({ showStats = true }: PageSkeletonProps) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Stats Grid Skeleton */}
                {showStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-2" />
                                        <Skeleton className="h-8 w-12" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* List Skeleton */}
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-1/3" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-right">
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                    <Skeleton className="h-8 w-24 ml-auto" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
