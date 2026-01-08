import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { CheckCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  userID?: string;
}

interface AssignAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: () => void;
  agents: Agent[];
  selectedAgentId: string;
  onAgentSelect: (value: string) => void;
  isEditingAgent: boolean;
  validationError?: string;
  isLoading?: boolean;
  assignmentType?: string;
  onAssignmentTypeChange?: (value: string) => void;
  showInHouseOption?: boolean;
}

const AssignAgentDialog = ({
  isOpen,
  onOpenChange,
  onAssign,
  agents,
  selectedAgentId,
  onAgentSelect,
  isEditingAgent,
  validationError,
  isLoading = false,
  assignmentType: externalAssignmentType,
  onAssignmentTypeChange,
  showInHouseOption = true
}: AssignAgentDialogProps) => {
  const [internalAssignmentType, setInternalAssignmentType] = useState<string>(externalAssignmentType || "assign_to_agent");

  const assignmentType = externalAssignmentType || internalAssignmentType;

  return (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        onAgentSelect("");
        if (!externalAssignmentType) {
          setInternalAssignmentType("assign_to_agent");
        }
      }
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditingAgent ? 'Re-assign Agent' : 'Assign to Agent'}
        </DialogTitle>
        <DialogDescription>
          {isEditingAgent
            ? 'Select a new agent to assign to this project'
            : 'Select an agent to assign to this project'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {showInHouseOption && (
          <div>
            <Label htmlFor="assignment-type">Assignment Type *</Label>
            <Select
              value={assignmentType}
              onValueChange={(value) => {
                if (onAssignmentTypeChange) {
                  onAssignmentTypeChange(value);
                } else {
                  setInternalAssignmentType(value);
                }
                onAgentSelect(""); // Clear agent selection when type changes
              }}
              disabled={isLoading}
            >
              <SelectTrigger
                id="assignment-type"
                className="mt-2"
              >
                <SelectValue placeholder="Choose assignment type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign_to_agent">
                  Assign to Agent
                </SelectItem>
                <SelectItem value="move_to_in_house">
                  Move to In House
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(assignmentType === "assign_to_agent" || !showInHouseOption) && (
          <div>
            <Label htmlFor="agent-select">Select Agent *</Label>
            <Select
              value={selectedAgentId}
              onValueChange={onAgentSelect}
              disabled={isLoading}
            >
              <SelectTrigger
                id="agent-select"
                className={`mt-2 ${validationError ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder={isLoading ? "Loading agents..." : "Choose an agent..."} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading agents...
                  </SelectItem>
                ) : agents.length === 0 ? (
                  <SelectItem value="no-agents" disabled>
                    No agents available
                  </SelectItem>
                ) : (
                  agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.userID || 'N/A'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationError && (
              <p className="text-sm text-red-500 mt-1">{validationError}</p>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(false);
            onAgentSelect("");
            if (!externalAssignmentType) {
              setInternalAssignmentType("assign_to_agent");
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onAssign}
          disabled={((assignmentType === "assign_to_agent" || !showInHouseOption) && !selectedAgentId) || isLoading}
        >
          <CheckCircle className="size-4 mr-2" />
          {(!showInHouseOption || assignmentType === "assign_to_agent") 
            ? (isEditingAgent ? 'Re-assign Agent' : 'Assign Agent')
            : 'Move to In House'
          }
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

export default AssignAgentDialog;
