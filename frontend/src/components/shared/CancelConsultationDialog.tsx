import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { XCircle } from 'lucide-react';

interface CancelConsultationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => void;
  isLoading?: boolean;
  consultationTitle?: string;
}

const CancelConsultationDialog: React.FC<CancelConsultationDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  isLoading = false,
  consultationTitle = 'this consultation'
}) => {
  const [cancellationReason, setCancellationReason] = React.useState('');

  const handleConfirm = () => {
    onCancel(cancellationReason || 'Cancelled by admin');
    setCancellationReason('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setCancellationReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Cancel Consultation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel {consultationTitle}? This action can be undone later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Cancellation Reason</Label>
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Back
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-red-600 hover:bg-red-700" 
            disabled={isLoading}
          >
            <XCircle className="size-4 mr-2" />
            Cancel Consultation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelConsultationDialog;
