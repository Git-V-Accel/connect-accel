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

interface RejectBidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: () => void;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  adminNotes: string;
  onAdminNotesChange: (value: string) => void;
  validationError?: string;
}

const RejectBidDialog = ({
  isOpen,
  onOpenChange,
  onReject,
  rejectionReason,
  onRejectionReasonChange,
  adminNotes,
  onAdminNotesChange,
  validationError
}: RejectBidDialogProps) => (
  <Dialog 
    open={isOpen} 
    onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        onRejectionReasonChange("");
        onAdminNotesChange("");
      }
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject Bid</DialogTitle>
        <DialogDescription>
          Please provide a reason for rejecting this bid.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label>Rejection Reason *</Label>
          <RichTextEditor
            value={rejectionReason}
            onChange={onRejectionReasonChange}
            placeholder="Explain why this bid is being rejected..."
            className={`mt-1 ${validationError ? "border-red-500" : ""}`}
            minHeight="150px"
          />
          {validationError && (
            <p className="text-sm text-red-500 mt-1">{validationError}</p>
          )}
        </div>
        <div>
          <Label>Admin Notes (Optional)</Label>
          <RichTextEditor
            value={adminNotes}
            onChange={onAdminNotesChange}
            placeholder="Internal notes..."
            className="mt-1"
            minHeight="100px"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onReject} className="bg-red-600 hover:bg-red-700">
          <XCircle className="size-4 mr-2" />
          Reject Bid
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RejectBidDialog;
