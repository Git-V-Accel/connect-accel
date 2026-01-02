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
import { Target } from 'lucide-react';

interface Project {
  client_budget?: number;
}

interface AddMilestoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
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
    milestoneTitle?: string;
    milestoneStartDate?: string;
    milestoneEndDate?: string;
    milestoneAmountPercent?: string;
    milestoneAmount?: string;
    milestoneDescription?: string;
  };
}

const AddMilestoneDialog = ({
  isOpen,
  onOpenChange,
  onAdd,
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
}: AddMilestoneDialogProps) => (
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
        <DialogTitle>Add Milestone</DialogTitle>
        <DialogDescription>
          Create a new milestone for this project
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="milestone-title">Milestone Title *</Label>
          <Input
            id="milestone-title"
            placeholder="e.g., Design Phase, Development Phase, Testing"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={validationErrors.milestoneTitle ? "border-red-500" : ""}
          />
          {validationErrors.milestoneTitle && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneTitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="milestone-start-date">Start Date *</Label>
            <Input
              id="milestone-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={validationErrors.milestoneStartDate ? "border-red-500" : ""}
            />
            {validationErrors.milestoneStartDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneStartDate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="milestone-end-date">End Date *</Label>
            <Input
              id="milestone-end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
              className={validationErrors.milestoneEndDate ? "border-red-500" : ""}
            />
            {validationErrors.milestoneEndDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneEndDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="milestone-amount-percent">
              Amount Percentage (%)
            </Label>
            <Input
              id="milestone-amount-percent"
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
              className={validationErrors.milestoneAmountPercent ? "border-red-500" : ""}
            />
            {validationErrors.milestoneAmountPercent && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneAmountPercent}</p>
            )}
            {amountPercent && project && !validationErrors.milestoneAmountPercent && (
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
            <Label htmlFor="milestone-amount">Amount (₹)</Label>
            <Input
              id="milestone-amount"
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
              className={validationErrors.milestoneAmount ? "border-red-500" : ""}
            />
            {validationErrors.milestoneAmount && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneAmount}</p>
            )}
            {amount && project && !validationErrors.milestoneAmount && (
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
          <Label htmlFor="milestone-description">Description *</Label>
          <RichTextEditor
            value={description}
            onChange={onDescriptionChange}
            placeholder="Describe what needs to be completed in this milestone..."
            className={`mt-1 ${validationErrors.milestoneDescription ? "border-red-500" : ""}`}
            minHeight="150px"
          />
          {validationErrors.milestoneDescription && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.milestoneDescription}</p>
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
        <Button onClick={onAdd}>
          <Target className="size-4 mr-2" />
          Add Milestone
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddMilestoneDialog;
