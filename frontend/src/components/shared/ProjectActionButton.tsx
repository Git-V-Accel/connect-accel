import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

interface ProjectActionButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

// Reusable action button component for project review actions
const ProjectActionButton = ({ 
  to, 
  onClick, 
  children, 
  variant = "default", 
  className = "" 
}: ProjectActionButtonProps) => {
  if (to) {
    return (
      <Button 
        size="sm" 
        variant={variant} 
        className={`flex-1 ${className}`}
        asChild
      >
        <Link to={to}>
          {children}
        </Link>
      </Button>
    );
  }
  
  return (
    <Button 
      size="sm" 
      variant={variant} 
      className={`flex-1 ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default ProjectActionButton;
