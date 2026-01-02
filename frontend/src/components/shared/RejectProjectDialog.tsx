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
import { RichTextEditor } from '../common/RichTextEditor';
import { XCircle } from 'lucide-react';

interface RejectProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: () => void;
  rejectionReason: string;
  onReasonChange: (value: string) => void;
  validationError?: string;
}

const RejectProjectDialog = ({
  isOpen,
  onOpenChange,
  onReject,
  rejectionReason,
  onReasonChange,
  validationError
}: RejectProjectDialogProps) => (
  <Dialog 
    open={isOpen} 
    onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        onReasonChange("");
      }
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject Project</DialogTitle>
        <DialogDescription>
          Please provide a reason for rejecting this project.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Rejection Reason *</Label>
          <RichTextEditor
            value={rejectionReason}
            onChange={onReasonChange}
            placeholder="Explain why this project is being rejected..."
            className={`mt-1 ${validationError ? "border-red-500" : ""}`}
            minHeight="150px"
          />
          {validationError && (
            <p className="text-sm text-red-500 mt-1">{validationError}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(false);
            onReasonChange("");
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onReject}
          className="bg-red-600 hover:bg-red-700"
        >
          <XCircle className="size-4 mr-2" />
          Reject Project
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RejectProjectDialog;
