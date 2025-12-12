import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  confirmDisabled?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
};

export default function DeleteWithReasonDialog({
  open,
  onOpenChange,
  title = 'Delete',
  description = 'Provide a reason for deletion. This will be tracked in audit logs.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter the reason...',
  reasonRequired = true,
  confirmDisabled = false,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason('');
      setSubmitting(false);
    }
  }, [open]);

  const isValid = useMemo(() => {
    if (!reasonRequired) return true;
    return reason.trim().length > 0;
  }, [reason, reasonRequired]);

  const handleConfirm = async () => {
    if (!isValid) return;
    try {
      setSubmitting(true);
      await onConfirm(reason.trim());
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{reasonLabel}{reasonRequired ? ' *' : ''}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={4}
          />
          <div className="text-xs text-gray-500">{reason.trim().length}/500</div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || confirmDisabled || !isValid}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? 'Deleting...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


