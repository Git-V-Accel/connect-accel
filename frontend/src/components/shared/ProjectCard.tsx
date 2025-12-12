import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
// Progress bar will be inline for simplicity
import { Calendar, IndianRupee, User, Clock } from 'lucide-react';
import { statusColors as defaultStatusColors, statusLabels as defaultStatusLabels } from '../../constants/projectConstants';

export interface ProjectCardData {
  id: string;
  title: string;
  description?: string;
  status: string;
  category?: string;
  client_name?: string;
  freelancer_name?: string;
  client_budget?: number;
  freelancer_budget?: number;
  created_at?: string;
  due_date?: string;
  progress?: number;
  skills_required?: string[];
  priority?: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  linkTo?: string;
  showProgress?: boolean;
  showSkills?: boolean;
  showBudget?: boolean;
  showDates?: boolean;
  statusColors?: Record<string, string>;
  statusLabels?: Record<string, string>;
  variant?: 'default' | 'compact';
}

export function ProjectCard({
  project,
  linkTo,
  showProgress = false,
  showSkills = false,
  showBudget = true,
  showDates = true,
  statusColors = defaultStatusColors,
  statusLabels = defaultStatusLabels,
  variant = 'default',
}: ProjectCardProps) {
  const statusColor = statusColors[project.status] || 'bg-gray-100 text-gray-700';
  const statusLabel = statusLabels[project.status] || project.status.replace('_', ' ');

  const cardContent = (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-medium`}>
              {project.title}
            </h3>
            <Badge className={statusColor}>
              {statusLabel}
            </Badge>
          </div>
          {project.description && variant === 'default' && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
          )}
          
          {showSkills && project.skills_required && project.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.skills_required.slice(0, 6).map((skill, idx) => (
                <Badge key={idx} variant="secondary">{skill}</Badge>
              ))}
              {project.skills_required.length > 6 && (
                <Badge variant="secondary">+{project.skills_required.length - 6} more</Badge>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {project.client_name && (
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {project.client_name}
              </span>
            )}
            {project.freelancer_name && (
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {project.freelancer_name}
              </span>
            )}
            {showDates && project.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            )}
            {showDates && project.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                Due: {new Date(project.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {showBudget && (project.client_budget || project.freelancer_budget) && (
        <div className="flex items-center gap-1 text-sm font-medium mb-3">
          <IndianRupee className="size-4" />
          <span>₹{(project.client_budget || project.freelancer_budget || 0).toLocaleString()}</span>
        </div>
      )}

      {showProgress && project.progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      {project.category && (
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline">{project.category}</Badge>
          {project.priority && (
            <Badge variant="outline" className="capitalize">
              {project.priority} Priority
            </Badge>
          )}
        </div>
      )}
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo}>{cardContent}</Link>;
  }

  return cardContent;
}

