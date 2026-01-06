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
import { CheckCircle } from 'lucide-react';

interface AcceptBidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  selectedBid: any;
  project: any;
  adminNotes: string;
  onAdminNotesChange: (value: string) => void;
}

const AcceptBidDialog = ({
  isOpen,
  onOpenChange,
  onAccept,
  selectedBid,
  project,
  adminNotes,
  onAdminNotesChange
}: AcceptBidDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Accept Bid & Assign Freelancer</DialogTitle>
        <DialogDescription>
          This will assign the freelancer to the project and reject all other bids.
        </DialogDescription>
      </DialogHeader>
      
      {selectedBid && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Client Budget</span>
              <span className="font-medium">
                ₹{project.client_budget.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Freelancer Bid</span>
              <span className="font-medium">₹{selectedBid.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Platform Margin</span>
              <span className="font-medium text-purple-600">
                ₹{(project.client_budget - selectedBid.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Margin Percentage</span>
              <span>
                {(
                  ((project.client_budget - selectedBid.amount) / project.client_budget) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>

          <div>
            <Label>Admin Notes (Optional)</Label>
            <RichTextEditor
              value={adminNotes}
              onChange={onAdminNotesChange}
              placeholder="Add notes about why this bid was selected..."
              className="mt-1"
              minHeight="120px"
            />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="size-4 mr-2" />
          Accept & Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AcceptBidDialog;
