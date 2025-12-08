import { ReactNode, isValidElement } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon | ReactNode;
  actionLink?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  actionLink,
  onAction,
  children,
  className = '',
}: PageHeaderProps) {
  const renderIcon = () => {
    if (!ActionIcon) return null;
    if (isValidElement(ActionIcon)) {
      return ActionIcon;
    }
    if (typeof ActionIcon === 'function') {
      const IconComponent = ActionIcon as LucideIcon;
      return <IconComponent className="size-5" />;
    }
    return null;
  };

  const actionButton = actionLabel && (
    <>
      {actionLink ? (
        <Link to={actionLink}>
          <Button size="lg">
            {ActionIcon && <span className="mr-2">{renderIcon()}</span>}
            {actionLabel}
          </Button>
        </Link>
      ) : onAction ? (
        <Button size="lg" onClick={onAction}>
          {ActionIcon && <span className="mr-2">{renderIcon()}</span>}
          {actionLabel}
        </Button>
      ) : null}
    </>
  );

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-3xl">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      {(actionButton || children) && (
        <div className="flex items-center gap-2">
          {actionButton}
          {children}
        </div>
      )}
    </div>
  );
}

