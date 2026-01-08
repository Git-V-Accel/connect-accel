import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CompleteConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  meetingNotes: string;
  onMeetingNotesChange: (value: string) => void;
  outcome: string;
  onOutcomeChange: (value: string) => void;
  actionItems: string;
  onActionItemsChange: (value: string) => void;
  isLoading?: boolean;
}

// Dialog components (can be moved to a shared UI library)
const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600">{children}</p>
);

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end gap-2 mt-6">{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">{children}</label>
);

const Textarea = ({ placeholder, value, onChange, rows, className }: { 
  placeholder?: string; 
  value: string; 
  onChange: (value: string) => void; 
  rows?: number; 
  className?: string;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
    rows={rows}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className || ''}`}
  />
);

const Button = ({ children, onClick, variant, className, disabled }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'outline' | 'default'; 
  className?: string; 
  disabled?: boolean;
}) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variantClass = variant === 'outline' 
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
    : "bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default function CompleteConsultationDialog({
  open,
  onOpenChange,
  onComplete,
  meetingNotes,
  onMeetingNotesChange,
  outcome,
  onOutcomeChange,
  actionItems,
  onActionItemsChange,
  isLoading = false
}: CompleteConsultationDialogProps) {
  const handleComplete = () => {
    if (!outcome.trim()) {
      return; // Parent component should handle validation
    }
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Consultation</DialogTitle>
          <DialogDescription>
            Add meeting notes and outcomes
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Meeting Notes</Label>
            <Textarea
              placeholder="What was discussed..."
              value={meetingNotes}
              onChange={onMeetingNotesChange}
              rows={4}
            />
          </div>

          <div>
            <Label>Outcome *</Label>
            <Textarea
              placeholder="What was decided or agreed upon..."
              value={outcome}
              onChange={onOutcomeChange}
              rows={3}
            />
          </div>

          <div>
            <Label>Action Items</Label>
            <Textarea
              placeholder="Next steps and follow-ups..."
              value={actionItems}
              onChange={onActionItemsChange}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleComplete} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading || !outcome.trim()}
          >
            <CheckCircle className="size-4 mr-2" />
            {isLoading ? 'Completing...' : 'Mark Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
