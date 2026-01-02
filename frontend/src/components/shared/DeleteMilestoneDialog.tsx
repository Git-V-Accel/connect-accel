import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface Milestone {
  title: string;
  amount?: number;
  due_date: string;
}

interface DeleteMilestoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  milestone?: Milestone;
}

const DeleteMilestoneDialog = ({
  isOpen,
  onOpenChange,
  onDelete,
  milestone
}: DeleteMilestoneDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Milestone</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this milestone? This action
          cannot be undone.
        </DialogDescription>
      </DialogHeader>
      {milestone && (
        <div className="py-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">
              {milestone.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Amount: ₹{milestone.amount?.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-gray-600">
              Due:{" "}
              {new Date(milestone.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4 mr-2" />
          Delete Milestone
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteMilestoneDialog;
