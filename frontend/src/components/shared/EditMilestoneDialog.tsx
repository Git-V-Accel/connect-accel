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
import { Input } from '../ui/input';
import { RichTextEditor } from '../common/RichTextEditor';
import { CheckCircle } from 'lucide-react';

interface Project {
  client_budget?: number;
}

interface EditMilestoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  project?: Project;
  title: string;
  onTitleChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  amountPercent: string;
  onAmountPercentChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  validationErrors: {
    editMilestoneTitle?: string;
    editMilestoneStartDate?: string;
    editMilestoneEndDate?: string;
    editMilestoneAmountPercent?: string;
    editMilestoneAmount?: string;
    editMilestoneDescription?: string;
  };
}

const EditMilestoneDialog = ({
  isOpen,
  onOpenChange,
  onUpdate,
  project,
  title,
  onTitleChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  amountPercent,
  onAmountPercentChange,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  validationErrors
}: EditMilestoneDialogProps) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        onTitleChange("");
        onStartDateChange("");
        onEndDateChange("");
        onAmountPercentChange("");
        onAmountChange("");
        onDescriptionChange("");
      }
    }}
  >
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit Milestone</DialogTitle>
        <DialogDescription>Update milestone details</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-milestone-title">Milestone Title *</Label>
          <Input
            id="edit-milestone-title"
            placeholder="e.g., Design Phase, Development Phase, Testing"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={validationErrors.editMilestoneTitle ? "border-red-500" : ""}
          />
          {validationErrors.editMilestoneTitle && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneTitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-milestone-start-date">Start Date</Label>
            <Input
              id="edit-milestone-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={validationErrors.editMilestoneStartDate ? "border-red-500" : ""}
            />
            {validationErrors.editMilestoneStartDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneStartDate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-milestone-end-date">End Date *</Label>
            <Input
              id="edit-milestone-end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
              className={validationErrors.editMilestoneEndDate ? "border-red-500" : ""}
            />
            {validationErrors.editMilestoneEndDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneEndDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-milestone-amount-percent">
              Amount Percentage (%)
            </Label>
            <Input
              id="edit-milestone-amount-percent"
              type="number"
              placeholder="e.g., 25"
              min="0"
              max="100"
              step="0.01"
              value={amountPercent}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                  onAmountPercentChange(value);
                  if (value && project) {
                    onAmountChange("");
                  }
                }
              }}
              className={validationErrors.editMilestoneAmountPercent ? "border-red-500" : ""}
            />
            {validationErrors.editMilestoneAmountPercent && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneAmountPercent}</p>
            )}
            {amountPercent && project && !validationErrors.editMilestoneAmountPercent && (
              <p className="text-sm text-gray-500 mt-1">
                Amount: ₹
                {(
                  ((project.client_budget || 0) * parseFloat(amountPercent)) / 100
                ).toLocaleString()}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Range: 0% - 100%</p>
          </div>
          <div>
            <Label htmlFor="edit-milestone-amount">Amount (₹)</Label>
            <Input
              id="edit-milestone-amount"
              type="number"
              placeholder="e.g., 50000"
              min="0"
              max={project?.client_budget || 0}
              step="0.01"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (parseFloat(value) >= 0 && (!project || parseFloat(value) <= project.client_budget))) {
                  onAmountChange(value);
                  if (value) {
                    onAmountPercentChange("");
                  }
                }
              }}
              className={validationErrors.editMilestoneAmount ? "border-red-500" : ""}
            />
            {validationErrors.editMilestoneAmount && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneAmount}</p>
            )}
            {amount && project && !validationErrors.editMilestoneAmount && (
              <p className="text-sm text-gray-500 mt-1">
                {((parseFloat(amount) / (project.client_budget || 1)) * 100).toFixed(1)}% of budget
              </p>
            )}
            {project && (
              <p className="text-xs text-gray-400 mt-1">
                Max: ₹{(project.client_budget || 0).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="edit-milestone-description">
            Description *
          </Label>
          <RichTextEditor
            value={description}
            onChange={onDescriptionChange}
            placeholder="Describe what needs to be completed in this milestone..."
            className={`mt-1 ${validationErrors.editMilestoneDescription ? "border-red-500" : ""}`}
            minHeight="150px"
          />
          {validationErrors.editMilestoneDescription && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.editMilestoneDescription}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(false);
            onTitleChange("");
            onStartDateChange("");
            onEndDateChange("");
            onAmountPercentChange("");
            onAmountChange("");
            onDescriptionChange("");
          }}
        >
          Cancel
        </Button>
        <Button onClick={onUpdate}>
          <CheckCircle className="size-4 mr-2" />
          Update Milestone
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EditMilestoneDialog;
