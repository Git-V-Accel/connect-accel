import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';

interface ApproveProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
}

const ApproveProjectDialog = ({
  isOpen,
  onOpenChange,
  onApprove
}: ApproveProjectDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Approve Project</DialogTitle>
        <DialogDescription>
          This will approve the project and change its status to In Progress.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={onApprove}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="size-4 mr-2" />
          Approve Project
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ApproveProjectDialog;
